import { getAiEnv } from '@/lib/utils/env';
/**
 * Búsqueda híbrida: combina full-text (tsvector + GIN) con búsqueda
 * semántica (pgvector + Gemini embeddings) usando Reciprocal Rank Fusion.
 *
 * Llama a la SQL function `match_projects_hybrid()` que vive en la BD.
 * Si no hay GEMINI_API_KEY o el embedding falla, hace fallback a sólo
 * full-text con tsvector (que ya está indexado y es muy rápido).
 *
 * Ver migration: scripts/sql/2026-05-11-hybrid-search.sql
 */
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { embedText, toPgVector } from '@/lib/ingestion/embeddings';
import { getLogger } from '@/lib/utils/logger';
import { getStaticProjects } from '@/lib/data';

const logger = getLogger('HybridSearch');

type SortMode = 'date_asc' | 'amount_desc' | 'newest' | 'relevance';

export interface HybridSearchOptions {
  query: string;
  scope?: string;
  role?: string;
  ambito?: string;
  tipo?: 'fondo' | 'licitacion' | 'all';
  selectedInstitutions?: string[];
  selectedRegions?: string[];
  selectedCategories?: string[];
  estado?: string;
  minAmount?: number;
  maxAmount?: number;
  postedFrom?: string;
  postedTill?: string;
  closingWithinDays?: number;
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
  tipo?: 'fondo' | 'licitacion' | 'all';
  selectedInstitutions: string[];
  selectedRegions: string[];
  selectedCategories: string[];
  estado?: string;
  minAmount: number;
  maxAmount: number;
  postedFrom?: string;
  postedTill?: string;
  closingWithinDays?: number;
  includeUnverified: boolean;
}

function normalizeSort(sort: HybridSearchOptions['sort']): SortMode {
  if (sort === 'amount_desc' || sort === 'newest' || sort === 'relevance') return sort;
  return 'date_asc';
}

function buildHybridFilters(opts: HybridSearchOptions): HybridQueryFilters {
  return {
    ambito: opts.ambito,
    tipo: opts.tipo,
    selectedInstitutions: opts.selectedInstitutions ?? [],
    selectedRegions: opts.selectedRegions ?? [],
    selectedCategories: opts.selectedCategories ?? [],
    estado: opts.estado,
    minAmount: Number.isFinite(opts.minAmount) ? Math.max(0, opts.minAmount as number) : 0,
    maxAmount: Number.isFinite(opts.maxAmount) ? (opts.maxAmount as number) : Number.POSITIVE_INFINITY,
    postedFrom: opts.postedFrom,
    postedTill: opts.postedTill,
    closingWithinDays: opts.closingWithinDays,
    includeUnverified: opts.includeUnverified !== false,
  };
}

const LICITACION_CATEGORIES = ['Licitación', 'Procurement', 'Adquisiciones', 'UNGM', 'FAO'];
const LICITACION_INSTITUTIONS = ['FAO (UN)', 'FAO', 'UNGM', 'WORLD BANK', 'Mercado Público'];

function buildProjectWhere(filters: HybridQueryFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = { AND: [] };

  // Default: exclude expired projects (fecha_cierre must be today or later)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  where.fecha_cierre = { gte: today };

  if (filters.ambito && filters.ambito !== 'all') {
    if (filters.ambito === 'chile' || filters.ambito === 'Nacional') {
      where.ambito = { not: 'Internacional' };
    } else {
      where.ambito = filters.ambito;
    }
  }

  if (filters.tipo === 'licitacion') {
    (where.AND as Prisma.ProjectWhereInput[]).push({
      OR: [
        { categoria: { in: LICITACION_CATEGORIES } },
        { institucion: { in: LICITACION_INSTITUTIONS } }
      ]
    });
  } else if (filters.tipo === 'fondo') {
    (where.AND as Prisma.ProjectWhereInput[]).push({
      categoria: { notIn: LICITACION_CATEGORIES },
      institucion: { notIn: LICITACION_INSTITUTIONS }
    });
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

  if (filters.selectedCategories.length > 0) {
    where.categoria = { in: filters.selectedCategories };
  }

  const amountFilterActive = filters.minAmount > 0 || Number.isFinite(filters.maxAmount);
  if (amountFilterActive) {
    const amountFilter: Prisma.FloatFilter = {};
    if (filters.minAmount > 0) amountFilter.gte = filters.minAmount;
    if (Number.isFinite(filters.maxAmount)) amountFilter.lte = filters.maxAmount;
    where.monto = amountFilter;
  }

  if (filters.postedFrom || filters.postedTill) {
    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (filters.postedFrom) {
      const parsed = new Date(`${filters.postedFrom}T00:00:00.000Z`);
      if (!Number.isNaN(parsed.getTime())) createdAtFilter.gte = parsed;
    }
    if (filters.postedTill) {
      const parsed = new Date(`${filters.postedTill}T23:59:59.999Z`);
      if (!Number.isNaN(parsed.getTime())) createdAtFilter.lte = parsed;
    }
    if (Object.keys(createdAtFilter).length > 0) {
      where.createdAt = createdAtFilter;
    }
  }

  if (filters.closingWithinDays != null && filters.closingWithinDays > 0) {
    const closingToday = new Date();
    closingToday.setHours(0, 0, 0, 0);
    const maxDate = new Date(closingToday);
    maxDate.setDate(maxDate.getDate() + filters.closingWithinDays);
    maxDate.setHours(23, 59, 59, 999);
    // Override the default fecha_cierre filter with a narrower window
    where.fecha_cierre = { gte: closingToday, lte: maxDate };
  }

  if (Array.isArray(where.AND) && where.AND.length === 0) {
    delete where.AND;
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

function deduplicateProjects<T extends { id: number; url_bases?: string }>(projects: T[]): T[] {
  const seen = new Map<string, T>();
  for (const p of projects) {
    const key = p.url_bases?.toLowerCase().trim();
    if (!key) {
      seen.set(`__no_url_${p.id}`, p);
    } else if (!seen.has(key)) {
      seen.set(key, p);
    }
  }
  return Array.from(seen.values());
}

function getFilteredStaticProjects(filters: HybridQueryFilters, query?: string): any[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const staticList = getStaticProjects(today);
  const q = query ? query.toLowerCase().trim() : '';

  return staticList.filter(p => {
    // Ambito
    if (filters.ambito && filters.ambito !== 'all') {
      if (filters.ambito === 'chile' || filters.ambito === 'Nacional') {
        if (p.ambito === 'Internacional') return false;
      } else if (filters.ambito === 'Internacional') {
        if (p.ambito !== 'Internacional') return false;
      }
    }

    // Tipo
    if (filters.tipo === 'licitacion') {
      const isLicitacion = LICITACION_CATEGORIES.includes(p.categoria) || LICITACION_INSTITUTIONS.includes(p.institucion);
      if (!isLicitacion) return false;
    } else if (filters.tipo === 'fondo') {
      const isLicitacion = LICITACION_CATEGORIES.includes(p.categoria) || LICITACION_INSTITUTIONS.includes(p.institucion);
      if (isLicitacion) return false;
    }

    // Estado
    if (filters.estado && p.estadoPostulacion !== filters.estado) {
      return false;
    }

    // Institutions
    if (filters.selectedInstitutions.length > 0) {
      if (!filters.selectedInstitutions.includes(p.institucion)) return false;
    }

    // Regions
    if (filters.selectedRegions.length > 0) {
      const pRegs = p.regiones || (p.region ? [p.region] : []);
      const matchesReg = filters.selectedRegions.some(r => pRegs.includes(r));
      if (!matchesReg) return false;
    }

    // Categories
    if (filters.selectedCategories.length > 0) {
      if (!filters.selectedCategories.includes(p.categoria)) return false;
    }

    // Amounts
    if (filters.minAmount > 0 && p.monto && p.monto < filters.minAmount) return false;
    if (filters.maxAmount < Number.POSITIVE_INFINITY && p.monto && p.monto > filters.maxAmount) return false;

    // Search query
    if (q) {
      const blob = `${p.nombre || ''} ${p.institucion || ''} ${p.objetivo || ''} ${p.categoria || ''} ${p.descripcionIICA || ''}`.toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      if (!words.every(w => blob.includes(w))) return false;
    }

    return true;
  }).map(p => ({
    ...p,
    fecha_cierre: new Date(p.fecha_cierre || '2099-12-31T12:00:00Z'),
    created_at: new Date(),
    updated_at: new Date(),
    source: { slug: (p.institucion || '').toLowerCase(), name: p.institucion || '' },
  }));
}

/**
 * Búsqueda híbrida full-text + semántica.
 * Si query está vacío, devuelve los más recientes combinando DB y catálogo sincronizado.
 */
export async function hybridSearch(opts: HybridSearchOptions): Promise<HybridSearchResult> {
  const { query, limit = 50, offset = 0, sort } = opts;
  const normalizedSort = normalizeSort(sort);
  const filters = buildHybridFilters(opts);
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const safeOffset = Math.max(0, offset);

  if (!query || !query.trim()) {
    const where = buildProjectWhere(filters);

    let dbProjects: any[] = [];
    try {
      dbProjects = await prisma.project.findMany({
        where,
        include: { source: { select: { slug: true, name: true } } },
        orderBy: getOrderBy(normalizedSort),
      });
    } catch (err) {
      logger.error('hybridSearch prisma findMany failed, fallback to static', err as Error);
    }

    const staticMatched = getFilteredStaticProjects(filters);
    const combined = deduplicateProjects([...dbProjects, ...staticMatched]);
    const sorted = sortProjectsByMode(combined, normalizedSort);
    const total = sorted.length;
    const projects = sorted.slice(safeOffset, safeOffset + safeLimit);

    return { projects: projects as any, mode: 'all', total };
  }

  let queryEmbedding: number[] | null = null;
  try {
    if (getAiEnv().GEMINI_API_KEY) {
      queryEmbedding = await embedText(query.trim());
    }
  } catch (err) {
    logger.warn('Embedding failed, falling back to lexical search', { error: (err as Error).message });
  }

  const candidateLimit = Math.max(200, safeLimit + safeOffset + 80);
  const staticMatched = getFilteredStaticProjects(filters, query);

  let dbResult: HybridSearchResult = { projects: [], mode: 'lexical_only', total: 0 };
  try {
    dbResult = queryEmbedding
      ? await runFullHybrid(
          query,
          queryEmbedding,
          filters,
          normalizedSort,
          candidateLimit,
          0,
          candidateLimit
        )
      : await runLexicalOnly(
          query,
          filters,
          normalizedSort,
          candidateLimit,
          0,
          candidateLimit
        );
  } catch (err) {
    logger.error('DB search failed, relying on static search', err as Error);
  }

  const combined = deduplicateProjects([...dbResult.projects, ...staticMatched]);
  const sorted = sortProjectsByMode(combined, normalizedSort);
  const total = sorted.length;
  const projects = sorted.slice(safeOffset, safeOffset + safeLimit);

  return { projects: projects as any, mode: dbResult.mode, total };
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
