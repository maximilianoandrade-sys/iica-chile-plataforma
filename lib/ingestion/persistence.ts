import { getLogger } from '@/lib/utils/logger';
import prisma from "../prisma";

const logger = getLogger('Persistence');
import { normalizeUrl, parseAmount } from "./utils";
import { validateUrl } from "./validateUrl";
import { embedText, projectToEmbeddingText, toPgVector } from "./embeddings";
import type { RawProject } from "./types";

const STALE_DAYS = 7;

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
  const baseFields = {
    nombre: raw.title,
    institucion: raw.institution,
    url_bases: raw.url,
    fecha_cierre: raw.deadline ?? new Date("2099-12-31"),
    monto: parseAmount(raw.budget || "") ?? 0,
    // Guardamos el monto tal cual viene de la fuente (con unidad: "8.500 UF",
    // "USD 50,000", "$100M") para que el UI pueda mostrarlo sin perder la
    // unidad. El campo numérico `monto` se conserva para filtros y orden.
    montoTexto: raw.budget?.trim() || null,
    estado: "Abierto",
    categoria: raw.tags?.[0] ?? "General",
    objetivo: raw.description ?? "",
    ambito: raw.ambito ?? "Nacional",
    region: raw.region ?? null,
    lastSeenAt: now,
  };

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
): Promise<{ id: string; nombre: string; canonicalUrl: string }[]> {
  const embedding = await embedText(text);
  if (!embedding) return [];

  const rows = await prisma.$queryRawUnsafe<
    { id: string; nombre: string; canonicalUrl: string }[]
  >(
    `SELECT id, nombre, "canonicalUrl" FROM "Project" WHERE embedding <=> $1::vector < $2 LIMIT 5`,
    toPgVector(embedding),
    threshold
  );

  return rows;
}

export async function markStale(): Promise<{ markedByLastSeen: number; markedByDeadline: number }> {
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

  const byLastSeen = await prisma.project.updateMany({
    where: {
      lastSeenAt: { lt: staleCutoff },
      estadoPostulacion: "Abierta",
      discoveredBy: { not: "manual" },
    },
    data: { estadoPostulacion: "Cerrada" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const byDeadline = await prisma.project.updateMany({
    where: {
      fecha_cierre: { lt: today },
      estadoPostulacion: "Abierta",
    },
    data: { estadoPostulacion: "Cerrada" },
  });

  return { markedByLastSeen: byLastSeen.count, markedByDeadline: byDeadline.count };
}

export async function updateSourceStatus(
  slug: string,
  status: "success" | "error" | "partial",
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
