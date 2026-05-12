/**
 * Búsqueda híbrida: combina full-text (tsvector + GIN) con búsqueda
 * semántica (pgvector + Gemini embeddings) usando Reciprocal Rank Fusion.
 *
 * Llama a la SQL function `match_projects_hybrid()` que vive en la BD.
 * Si no hay GEMINI_API_KEY o el embedding falla, hace fallback a sólo
 * full-text con tsvector (que ya está indexado y es muy rápido).
 *
 * Ver migration: prisma/migrations/manual/2026-05-11-hybrid-search.sql
 */
import prisma from "@/lib/prisma";
import { embedText, toPgVector } from "@/lib/ingestion/embeddings";

export interface HybridSearchOptions {
  query: string;
  scope?: string;
  role?: string;
  ambito?: string;
  includeUnverified?: boolean;
  limit?: number;
}

export interface HybridSearchResult {
  projects: any[];
  mode: "hybrid" | "lexical_only" | "all";
  rankings?: Map<number, { rrf: number; lex: number; sem: number }>;
}

/**
 * Búsqueda híbrida full-text + semántica.
 * Si query está vacío, devuelve los más recientes.
 */
export async function hybridSearch(opts: HybridSearchOptions): Promise<HybridSearchResult> {
  const {
    query,
    ambito,
    includeUnverified = true,
    limit = 50,
  } = opts;

  // ── Caso sin query: top N más recientes ─────────────────────────────────
  if (!query || !query.trim()) {
    const where: any = {};
    if (ambito && ambito !== "all") where.ambito = ambito;
    if (!includeUnverified) where.needsReview = false;

    const projects = await prisma.project.findMany({
      where,
      include: { source: { select: { slug: true, name: true } } },
      orderBy: [{ estadoPostulacion: "asc" }, { fecha_cierre: "asc" }],
      take: limit,
    });
    return { projects, mode: "all" };
  }

  // ── Caso con query: intentar híbrida ────────────────────────────────────
  let queryEmbedding: number[] | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      queryEmbedding = await embedText(query.trim());
    }
  } catch (err) {
    console.warn("[hybridSearch] embedding falló, fallback a lexical:", (err as Error).message);
  }

  // Si tenemos embedding: hybrid. Si no: solo full-text.
  if (queryEmbedding) {
    return await runFullHybrid(query, queryEmbedding, ambito, includeUnverified, limit);
  } else {
    return await runLexicalOnly(query, ambito, includeUnverified, limit);
  }
}

async function runFullHybrid(
  query: string,
  embedding: number[],
  ambito: string | undefined,
  includeUnverified: boolean,
  limit: number
): Promise<HybridSearchResult> {
  const vec = toPgVector(embedding);

  // Llamar a la SQL function que vive en BD
  const rankings = await prisma.$queryRawUnsafe<
    Array<{ id: number; rrf_score: number; lexical_rank: number; semantic_rank: number }>
  >(
    `SELECT id, rrf_score, lexical_rank, semantic_rank
     FROM match_projects_hybrid($1::text, $2::vector, $3::int, $4::boolean)`,
    query,
    vec,
    limit,
    includeUnverified
  );

  if (rankings.length === 0) {
    return { projects: [], mode: "hybrid" };
  }

  const ids = rankings.map((r) => r.id);
  const where: any = { id: { in: ids } };
  if (ambito && ambito !== "all") where.ambito = ambito;

  const projectsRaw = await prisma.project.findMany({
    where,
    include: { source: { select: { slug: true, name: true } } },
  });

  // Preservar el orden de rankings + adjuntar scores
  const projMap = new Map(projectsRaw.map((p) => [p.id, p]));
  const rankMap = new Map(
    rankings.map((r) => [
      r.id,
      { rrf: Number(r.rrf_score), lex: Number(r.lexical_rank), sem: Number(r.semantic_rank) },
    ])
  );

  const projects = ids
    .map((id) => projMap.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ ...p, _scores: rankMap.get(p.id) }));

  return { projects, mode: "hybrid", rankings: rankMap };
}

async function runLexicalOnly(
  query: string,
  ambito: string | undefined,
  includeUnverified: boolean,
  limit: number
): Promise<HybridSearchResult> {
  // Solo full-text con tsvector — sigue siendo mucho mejor que ILIKE %x%
  const ambitoClause = ambito && ambito !== "all" ? `AND ambito = '${ambito.replace(/'/g, "''")}'` : "";
  const unverifiedClause = !includeUnverified ? `AND "needsReview" = FALSE` : "";

  const rows = await prisma.$queryRawUnsafe<Array<{ id: number; rank: number }>>(
    `SELECT id, ts_rank(search_vector, plainto_tsquery('spanish', $1)) AS rank
     FROM "Project"
     WHERE search_vector @@ plainto_tsquery('spanish', $1) ${ambitoClause} ${unverifiedClause}
     ORDER BY rank DESC
     LIMIT $2`,
    query,
    limit
  );

  if (rows.length === 0) return { projects: [], mode: "lexical_only" };

  const ids = rows.map((r) => r.id);
  const projectsRaw = await prisma.project.findMany({
    where: { id: { in: ids } },
    include: { source: { select: { slug: true, name: true } } },
  });

  const projMap = new Map(projectsRaw.map((p) => [p.id, p]));
  const projects = ids.map((id) => projMap.get(id)).filter(Boolean);

  return { projects, mode: "lexical_only" };
}
