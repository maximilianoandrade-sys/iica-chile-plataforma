import { getLogger } from '@/lib/utils/logger';
import prisma from "../prisma";

const logger = getLogger('Persistence');
import { cleanText, normalizeMojibake, normalizeUrl, parseAmount } from "./utils";
import { validateUrl } from "./validateUrl";
import { embedText, projectToEmbeddingText, toPgVector } from "./embeddings";
import type { RawProject } from "./types";
import { evaluateIngestionQuality } from "./quality-gate";

const STALE_DAYS = 7;

function normalizeDedupeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeSameInstitution(a: string, b: string): boolean {
  return normalizeDedupeToken(a) === normalizeDedupeToken(b);
}

interface MarkStaleOptions {
  skipSourceSlugs?: string[];
}

export async function upsertProject(
  raw: RawProject,
  sourceSlug: string
): Promise<{ skipped?: boolean; reason?: string }> {
  const validation = await validateUrl(raw.url);
  if (!validation.ok) {
    return { skipped: true, reason: validation.reason };
  }
  // canonicalKey permite a scrapers usar una llave única distinta a la URL
  // que se muestra al usuario (ej. CNR apunta múltiples concursos al mismo
  // listing URL pero los distingue por código de concurso).
  const canonicalUrl = normalizeUrl(raw.canonicalKey || raw.url);
  if (!canonicalUrl) {
    return { skipped: true, reason: "URL no normalizable" };
  }

  const source = await prisma.source.findUnique({ where: { slug: sourceSlug } });
  if (!source) {
    return { skipped: true, reason: `Source '${sourceSlug}' no existe` };
  }

  const now = new Date();
  const quality = evaluateIngestionQuality(raw);
  const baseFields = {
    nombre: cleanText(raw.title),
    institucion: cleanText(raw.institution),
    url_bases: raw.url,
    fecha_cierre: raw.deadline ?? new Date("2099-12-31"),
    monto: parseAmount(raw.budget || "") ?? 0,
    // Guardamos el monto tal cual viene de la fuente (con unidad: "8.500 UF",
    // "USD 50,000", "$100M") para que el UI pueda mostrarlo sin perder la
    // unidad. El campo numérico `monto` se conserva para filtros y orden.
    montoTexto: raw.budget ? cleanText(raw.budget) : null,
    estado: "Abierto",
    categoria: raw.opportunityType ? cleanText(raw.opportunityType) : cleanText(raw.tags?.[0] || 'General'),
    objetivo: cleanText(raw.description ?? ""),
    ambito: raw.ambito ?? "Nacional",
    idioma: raw.idioma ?? "es",
    region: raw.region ? cleanText(normalizeMojibake(raw.region)) : null,
    publishable: quality.publishable,
    chileEligibility: quality.chileEligibility,
    qualityScore: quality.qualityScore,
    qualityFlags: quality.qualityFlags,
    qualityReasons: quality.qualityReasons,
    qualityUpdatedAt: quality.qualityUpdatedAt,
    lastSeenAt: now,
  };

  const textualDuplicate = await prisma.project.findFirst({
    where: {
      sourceRefId: source.id,
      canonicalUrl: { not: canonicalUrl },
      nombre: { equals: baseFields.nombre, mode: 'insensitive' },
      institucion: { equals: baseFields.institucion, mode: 'insensitive' },
    },
    select: {
      id: true,
      qualityFlags: true,
      qualityReasons: true,
    },
  });

  if (textualDuplicate) {
    await prisma.project.update({
      where: { id: textualDuplicate.id },
      data: {
        ...baseFields,
        qualityFlags: Array.from(new Set([...(textualDuplicate.qualityFlags || []), ...baseFields.qualityFlags, 'dedupe_textual_merged'])),
        qualityReasons: Array.from(new Set([
          ...(textualDuplicate.qualityReasons || []),
          ...baseFields.qualityReasons,
          `Merged duplicate textual match from ${sourceSlug}`,
        ])),
      },
    });
    return { skipped: true, reason: `duplicate_textual:${textualDuplicate.id}` };
  }

  if (process.env.GEMINI_API_KEY) {
    const semanticText = projectToEmbeddingText({
      nombre: baseFields.nombre,
      institucion: baseFields.institucion,
      objetivo: baseFields.objetivo,
      categoria: baseFields.categoria,
    });

    try {
      const semanticCandidates = await findSemanticDuplicates(semanticText, 0.06);
      const semanticDuplicate = semanticCandidates.find((candidate) => {
        if (!candidate.canonicalUrl || candidate.canonicalUrl === canonicalUrl) return false;
        if (!looksLikeSameInstitution(candidate.institucion, baseFields.institucion)) return false;
        return candidate.distance <= 0.045;
      });

      if (semanticDuplicate) {
        await prisma.project.update({
          where: { id: Number(semanticDuplicate.id) },
          data: {
            ...baseFields,
            qualityFlags: Array.from(new Set([...baseFields.qualityFlags, 'dedupe_semantic_merged'])),
            qualityReasons: Array.from(new Set([
              ...baseFields.qualityReasons,
              `Merged semantic duplicate (${semanticDuplicate.id}) from ${sourceSlug}`,
            ])),
          },
        });
        return { skipped: true, reason: `duplicate_semantic:${semanticDuplicate.id}` };
      }
    } catch (err) {
      logger.warn('Semantic duplicate lookup failed', {
        canonicalUrl,
        error: (err as Error).message,
      });
    }
  }

  const upserted = await prisma.project.upsert({
    where: { canonicalUrl },
    update: baseFields,
    create: {
      ...baseFields,
      canonicalUrl,
      firstSeenAt: now,
      discoveredBy: "scraper",
      needsReview: true,
      sourceRefId: source.id,
      estadoPostulacion: "Abierta",
      regiones: [],
      beneficiarios: [],
      checklist: [],
      tipos_solicitante: [],
      requisitos: [],
      fortalezas: [],
      debilidades: [],
    },
  });

  // Auto-embed (best-effort)
  if (process.env.GEMINI_API_KEY) {
    try {
      const text = projectToEmbeddingText({
        nombre: baseFields.nombre,
        institucion: baseFields.institucion,
        objetivo: baseFields.objetivo,
        categoria: baseFields.categoria,
      });
      const embedding = await embedText(text);
      if (embedding) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Project" SET embedding = $1::vector WHERE id = $2`,
          toPgVector(embedding),
          upserted.id
        );
      }
    } catch (err) {
      logger.warn('Embedding failed', { canonicalUrl, error: err });
    }
  }

  return {};
}

/**
 * Find projects semantically similar to the given text.
 * Uses pgvector cosine distance (<=>). Lower = more similar.
 */
export async function findSemanticDuplicates(
  text: string,
  threshold = 0.15
): Promise<{ id: string; nombre: string; institucion: string; canonicalUrl: string; distance: number }[]> {
  const embedding = await embedText(text);
  if (!embedding) return [];

  const rows = await prisma.$queryRawUnsafe<
    { id: string; nombre: string; institucion: string; canonicalUrl: string; distance: number }[]
  >(
    `SELECT id, nombre, institucion, "canonicalUrl", (embedding <=> $1::vector) AS distance
     FROM "Project"
     WHERE embedding <=> $1::vector < $2
     ORDER BY distance ASC
     LIMIT 5`,
    toPgVector(embedding),
    threshold
  );

  return rows;
}

export async function markStale(
  options: MarkStaleOptions = {}
): Promise<{ markedByLastSeen: number; markedByDeadline: number }> {
  const { skipSourceSlugs = [] } = options;
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

  let protectedSourceIds: number[] = [];
  if (skipSourceSlugs.length > 0) {
    const protectedSources = await prisma.source.findMany({
      where: { slug: { in: skipSourceSlugs } },
      select: { id: true, slug: true },
    });
    protectedSourceIds = protectedSources.map((source) => source.id);
  }

  const lastSeenWhere = {
    lastSeenAt: { lt: staleCutoff },
    estadoPostulacion: "Abierta",
    discoveredBy: { not: "manual" },
    ...(protectedSourceIds.length > 0
      ? {
          OR: [
            { sourceRefId: null },
            { sourceRefId: { notIn: protectedSourceIds } },
          ],
        }
      : {}),
  };

  const byLastSeen = await prisma.project.updateMany({
    where: lastSeenWhere,
    data: { estadoPostulacion: "Cerrada" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const byDeadline = await prisma.project.updateMany({
    where: {
      fecha_cierre: { lt: today },
      estadoPostulacion: { in: ["Abierta", "Próxima"] },
    },
    data: { estadoPostulacion: "Cerrada" },
  });

  return { markedByLastSeen: byLastSeen.count, markedByDeadline: byDeadline.count };
}

export async function updateSourceStatus(
  slug: string,
  status: "success" | "error" | "partial" | "empty",
  count: number,
  errorMsg?: string
): Promise<void> {
  await prisma.source.update({
    where: { slug },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: status,
      lastRunError: errorMsg ?? null,
      projectsCount: count,
    },
  });
}
