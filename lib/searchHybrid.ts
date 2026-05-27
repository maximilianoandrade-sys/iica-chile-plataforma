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
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { embedText, toPgVector } from '@/lib/ingestion/embeddings';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('HybridSearch');

type SortMode = 'date_asc' | 'amount_desc' | 'newest' | 'relevance';

export interface HybridSearchOptions {
  query: string;
  scope?: string;
  role?: string;
  ambito?: string;
  selectedInstitutions?: string[];
  selectedRegions?: string[];
  estado?: string;
  minAmount?: number;
  maxAmount?: number;
  includeUnverified?: boolean;
  sort?: SortMode;
  offset?: number;
  limit?: number;
}

export interface HybridSearchResult {
  projects: Awaited<ReturnType<typeof prisma.project.findMany>>;
  mode: 'hybrid' | 'lexical_only' | 'all';
  total: number;
  rankings?: Map<number, { rrf: number; lex: number; sem: number }>;
}

interface HybridQueryFilters {
  ambito?: string;
  selectedInstitutions: string[];
  selectedRegions: string[];
  estado?: string;
  minAmount: number;
  maxAmount: number;
  includeUnverified: boolean;
}

function normalizeSort(sort: HybridSearchOptions['sort']): SortMode {
  if (sort === 'amount_desc' || sort === 'newest' || sort === 'relevance') return sort;
  return 'date_asc';
}

function buildHybridFilters(opts: HybridSearchOptions): HybridQueryFilters {
  return {
    ambito: opts.ambito,
    selectedInstitutions: opts.selectedInstitutions ?? [],
    selectedRegions: opts.selectedRegions ?? [],
    estado: opts.estado,
    minAmount: Number.isFinite(opts.minAmount) ? Math.max(0, opts.minAmount as number) : 0,
    maxAmount: Number.isFinite(opts.maxAmount) ? (opts.maxAmount as number) : Number.POSITIVE_INFINITY,
    includeUnverified: opts.includeUnverified !== false,
  };
}

function buildProjectWhere(filters: HybridQueryFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  if (filters.ambito && filters.ambito !== 'all') {
    where.ambito = filters.ambito;
  }

  if (!filters.includeUnverified) {
    where.needsReview = false;
  }

  if (filters.estado) {
    where.estadoPostulacion = filters.estado;
  }

  if (filters.selectedInstitutions.length > 0) {
    where.institucion = { in: filters.selectedInstitutions };
  }

  if (filters.selectedRegions.length > 0) {
    where.OR = [
      { regiones: { hasSome: filters.selectedRegions } },
      { region: { in: filters.selectedRegions } },
    ];
  }

  const amountFilterActive = filters.minAmount > 0 || Number.isFinite(filters.maxAmount);
  if (amountFilterActive) {
    const amountFilter: Prisma.FloatFilter = {};
    if (filters.minAmount > 0) amountFilter.gte = filters.minAmount;
    if (Number.isFinite(filters.maxAmount)) amountFilter.lte = filters.maxAmount;
    where.monto = amountFilter;
  }

  return where;
}

function getOrderBy(sort: SortMode): Prisma.ProjectOrderByWithRelationInput[] {
  switch (sort) {
    case 'amount_desc':
      return [{ monto: 'desc' }, { fecha_cierre: 'asc' }];
    case 'newest':
      return [{ id: 'desc' }];
    case 'relevance':
      return [{ fecha_cierre: 'asc' }];
    case 'date_asc':
    default:
      return [{ estadoPostulacion: 'asc' }, { fecha_cierre: 'asc' }];
  }
}

function sortProjectsByMode<T extends { fecha_cierre: Date; monto: number; id: number }>(projects: T[], sort: SortMode): T[] {
  if (sort === 'relevance') return projects;

  return [...projects].sort((a, b) => {
    if (sort === 'amount_desc') {
      if (b.monto !== a.monto) return b.monto - a.monto;
      return a.fecha_cierre.getTime() - b.fecha_cierre.getTime();
    }

    if (sort === 'newest') {
      return b.id - a.id;
    }

    const aDeadline = a.fecha_cierre.getTime();
    const bDeadline = b.fecha_cierre.getTime();
    if (aDeadline !== bDeadline) return aDeadline - bDeadline;
    return b.id - a.id;
  });
}

/**
 * Búsqueda híbrida full-text + semántica.
 * Si query está vacío, devuelve los más recientes.
 */
export async function hybridSearch(opts: HybridSearchOptions): Promise<HybridSearchResult> {
  const { query, limit = 50, offset = 0, sort } = opts;
  const normalizedSort = normalizeSort(sort);
  const filters = buildHybridFilters(opts);
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const safeOffset = Math.max(0, offset);

  if (!query || !query.trim()) {
    const where = buildProjectWhere(filters);

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        include: { source: { select: { slug: true, name: true } } },
        orderBy: getOrderBy(normalizedSort),
        skip: safeOffset,
        take: safeLimit,
      }),
    ]);

    return { projects, mode: 'all', total };
  }

  let queryEmbedding: number[] | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      queryEmbedding = await embedText(query.trim());
    }
  } catch (err) {
    logger.warn('Embedding failed, falling back to lexical search', { error: (err as Error).message });
  }

  const candidateLimit = Math.max(200, safeLimit + safeOffset + 80);

  if (queryEmbedding) {
    return runFullHybrid(
      query,
      queryEmbedding,
      filters,
      normalizedSort,
      safeLimit,
      safeOffset,
      candidateLimit
    );
  }

  return runLexicalOnly(
    query,
    filters,
    normalizedSort,
    safeLimit,
    safeOffset,
    candidateLimit
  );
}

async function runFullHybrid(
  query: string,
  embedding: number[],
  filters: HybridQueryFilters,
  sort: SortMode,
  limit: number,
  offset: number,
  candidateLimit: number
): Promise<HybridSearchResult> {
  const vec = toPgVector(embedding);

  const rankings = await prisma.$queryRawUnsafe<
    Array<{ id: number; rrf_score: number; lexical_rank: number; semantic_rank: number }>
  >(
    `SELECT id, rrf_score, lexical_rank, semantic_rank
     FROM match_projects_hybrid($1::text, $2::vector, $3::int, $4::boolean)`,
    query,
    vec,
    candidateLimit,
    filters.includeUnverified
  );

  if (rankings.length === 0) {
    return { projects: [], mode: 'hybrid', total: 0 };
  }

  const ids = rankings.map((ranking) => ranking.id);
  const where: Prisma.ProjectWhereInput = {
    ...buildProjectWhere(filters),
    id: { in: ids },
  };

  const projectsRaw = await prisma.project.findMany({
    where,
    include: { source: { select: { slug: true, name: true } } },
  });

  const projectMap = new Map(projectsRaw.map((project) => [project.id, project]));
  const rankMap = new Map(
    rankings.map((ranking) => [
      ranking.id,
      {
        rrf: Number(ranking.rrf_score),
        lex: Number(ranking.lexical_rank),
        sem: Number(ranking.semantic_rank),
      },
    ])
  );

  const orderedByRelevance = ids
    .map((id) => projectMap.get(id))
    .filter((project): project is NonNullable<typeof project> => Boolean(project))
    .map((project) => ({ ...project, _scores: rankMap.get(project.id) }));

  const ordered = sort === 'relevance' ? orderedByRelevance : sortProjectsByMode(orderedByRelevance, sort);
  const total = ordered.length;
  const projects = ordered.slice(offset, offset + limit);

  return { projects, mode: 'hybrid', total, rankings: rankMap };
}

async function runLexicalOnly(
  query: string,
  filters: HybridQueryFilters,
  sort: SortMode,
  limit: number,
  offset: number,
  candidateLimit: number
): Promise<HybridSearchResult> {
  const sql = `SELECT id, ts_rank(search_vector, plainto_tsquery('spanish', $1)) AS rank
      FROM "Project"
      WHERE search_vector @@ plainto_tsquery('spanish', $1)
      ORDER BY rank DESC
      LIMIT $2`;

  const rows = await prisma.$queryRawUnsafe<Array<{ id: number; rank: number }>>(sql, query, candidateLimit);

  if (rows.length === 0) {
    return { projects: [], mode: 'lexical_only', total: 0 };
  }

  const ids = rows.map((row) => row.id);
  const where: Prisma.ProjectWhereInput = {
    ...buildProjectWhere(filters),
    id: { in: ids },
  };

  const projectsRaw = await prisma.project.findMany({
    where,
    include: { source: { select: { slug: true, name: true } } },
  });

  const projectMap = new Map(projectsRaw.map((project) => [project.id, project]));
  const orderedByRelevance = ids
    .map((id) => projectMap.get(id))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  const ordered = sort === 'relevance' ? orderedByRelevance : sortProjectsByMode(orderedByRelevance, sort);
  const total = ordered.length;
  const projects = ordered.slice(offset, offset + limit);

  return { projects, mode: 'lexical_only', total };
}
