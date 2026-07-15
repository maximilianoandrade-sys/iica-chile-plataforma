// ============================================================
// app/api/search-projects/route.ts
//
// Endpoint de búsqueda IICA Chile — versión híbrida.
//
// Búsqueda híbrida (cuando hay query):
//   • Full-text search en español (Postgres tsvector + GIN)
//   • Semantic search (pgvector + Gemini embeddings)
//   • Fusión vía Reciprocal Rank Fusion (RRF) en SQL
//
// Sin query: devuelve los más recientes ordenados por fecha de cierre.
//
// Siempre suma Mercado Público live (API del día).
//
// Migración requerida: scripts/sql/2026-05-11-hybrid-search.sql
//
// Body:
//   { query?, scope?, role?, ambito?, includeUnverified? }
// Response:
//   { results: Project[], meta: { total, mode, hybrid_count, mp_count, ... } }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { hybridSearch } from "@/lib/searchHybrid";
import { fetchMercadoPublicoLive } from "@/lib/ingestion/scrapers/mercado-publico";
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getLogger } from '@/lib/utils/logger';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';
import { SearchProjectsRequestSchema, formatZodError } from '@/lib/utils/validation';
import { runExternalSearch } from '@/lib/search/external/orchestrator';
import { LinkedInPublicProvider } from '@/lib/search/external/providers/linkedinPublic';
import type { ExternalSearchResult } from '@/lib/search/external/types';
import type { ExternalProviderId } from '@/lib/search/contracts';
import { getEnv } from '@/lib/utils/env';
import { applyRelevanceAndAmbitoPolicy } from '@/lib/search/relevance';
const logger = getLogger('SearchProjects');

function calcDaysLeft(deadline: Date | string | null): number | null {
  if (!deadline) return null;
  const parsed = deadline instanceof Date ? deadline : new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return null;
  const diff = parsed.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 86400000));
}

function createProviders(providerIds: ExternalProviderId[]) {
  const providers = [];
  if (providerIds.includes('linkedin_public')) {
    providers.push(new LinkedInPublicProvider());
  }
  return providers;
}

function parseDisabledProviders(raw: string | undefined): Set<ExternalProviderId> {
  if (!raw) return new Set<ExternalProviderId>();
  const values = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean) as ExternalProviderId[];
  return new Set<ExternalProviderId>(values);
}

function normalizeSourceMode(
  requestedMode: 'internal' | 'external' | 'mixed' | undefined,
  envDefaultMode: 'internal' | 'external' | 'mixed' | undefined
): 'internal' | 'external' | 'mixed' {
  if (requestedMode) return requestedMode;
  return envDefaultMode ?? 'internal';
}

function parseCsvParam(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveHybridTotal(result: { total?: number; projects: Array<unknown> }): number {
  if (typeof result.total === 'number' && Number.isFinite(result.total)) {
    return result.total;
  }
  return result.projects.length;
}

function countBySourcePrefix(projects: Record<string, unknown>[], sourcePrefix: string): number {
  return projects.filter((project) => {
    const sourceId = project.sourceId;
    return typeof sourceId === 'string' && sourceId.startsWith(`${sourcePrefix}:`);
  }).length;
}

function normalizeMercadoPublicoDocs(docs: Record<string, unknown>[]): Record<string, unknown>[] {
  return docs.map((doc, index) => {
    const codigoExterno = doc.codigoExterno;
    const sourceSuffix = typeof codigoExterno === 'string' && codigoExterno.trim().length > 0
      ? codigoExterno.trim()
      : String(index);
    return {
      ...doc,
      sourceId: `mercado_publico:${sourceSuffix}`,
    };
  });
}

function applyPublishableFilter(projects: Record<string, unknown>[]): { visible: Record<string, unknown>[]; hidden: number } {
  let hidden = 0;
  const visible = projects.filter((project) => {
    const publishable = project.publishable;
    if (publishable === false) {
      hidden += 1;
      return false;
    }
    return true;
  });
  return { visible, hidden };
}

function enrichDaysLeft<T extends { fecha_cierre: Date | string | null }>(
  projects: T[]
): Array<T & { days_left: number | null }> {
  return projects.map((p) => ({ ...p, days_left: calcDaysLeft(p.fecha_cierre) }));
}

function publishableOf(
  projects: Record<string, unknown>[],
  strictQualityEnabled: boolean
): { visible: Record<string, unknown>[]; hidden: number } {
  return strictQualityEnabled
    ? applyPublishableFilter(projects)
    : { visible: projects, hidden: 0 };
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`search-projects:${ip}`, { maxRequests: 30, windowSizeSeconds: 60 });
  if (!rateLimit.allowed) {
    return createErrorResponse('Demasiadas solicitudes. Intente nuevamente más tarde.', 429, { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON body", 400);
    }
    const parsed = SearchProjectsRequestSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(formatZodError(parsed.error), 400);
    }
    const requestBody = parsed.data;
    const env = getEnv();
    const query = requestBody.query?.trim() || "";
    const ambito = requestBody.ambito || requestBody.scope || "all";
    const strictQualityEnabled = env.SEARCH_QUALITY_STRICT_ENABLED !== 'false';
    const requestedRelevanceMode = requestBody.relevanceMode ?? 'chile_strict';
    const relevanceMode = strictQualityEnabled ? requestedRelevanceMode : 'all';
    const includeUnverified = requestBody.includeUnverified !== false;
    const includeMercadoPublico = requestBody.includeMercadoPublico !== false;
    const page = requestBody.page ?? 1;
    const pageSize = requestBody.pageSize ?? 50;
    const safePageSize = Math.max(1, Math.min(pageSize, 100));
    const offset = (page - 1) * safePageSize;
    const selectedInstitutions = parseCsvParam(requestBody.institution);
    const selectedRegions = parseCsvParam(requestBody.region);
    const selectedCategories = parseCsvParam(requestBody.category);
    const minAmount = requestBody.minAmount ?? 0;
    const maxAmount = requestBody.maxAmount ?? Number.POSITIVE_INFINITY;
    const postedFrom = requestBody.postedFrom;
    const postedTill = requestBody.postedTill;
    const sort = requestBody.sort ?? 'relevance';
    const sourceMode = normalizeSourceMode(
      requestBody.sourceMode,
      env.SEARCH_SOURCE_MODE_DEFAULT
    );
    const providerIds = requestBody.providers?.length
      ? requestBody.providers
      : (['linkedin_public'] as ExternalProviderId[]);

    const externalEnabled = env.SEARCH_EXTERNAL_ENABLED !== 'false';
    const disabledProviders = parseDisabledProviders(env.SEARCH_EXTERNAL_DISABLED_PROVIDERS);
    const enabledProviderIds = providerIds.filter((providerId) => !disabledProviders.has(providerId));
    const requestedExternal = sourceMode === 'external' || sourceMode === 'mixed';

    const ticket = env.MERCADO_PUBLICO_TICKET || "";

    const runMercadoPublico = includeMercadoPublico && Boolean(ticket);

    const externalAvailable = externalEnabled && enabledProviderIds.length > 0;

    // Pure external mode runs no internal pipeline.
    if (sourceMode === 'external' && externalAvailable) {
      const externalResult = await runExternalSearch(
        createProviders(enabledProviderIds),
        requestBody
      );

      const enrichedExternal = enrichDaysLeft(
        externalResult.projects as Array<{ fecha_cierre: Date | string | null }>
      );
      const { visible: publishableExternal, hidden: hiddenByQuality } = publishableOf(
        enrichedExternal as unknown as Record<string, unknown>[],
        strictQualityEnabled
      );
      const policy = applyRelevanceAndAmbitoPolicy(
        publishableExternal as Record<string, unknown>[],
        { relevanceMode, ambito }
      );

      return createSuccessResponse({
        results: policy.results,
        meta: {
          total: policy.results.length,
          external_count: policy.results.length,
          mercado_publico_count: 0,
          hybrid_count: 0,
          mode: 'external',
          relevance_mode: relevanceMode,
          hidden_by_relevance: policy.hiddenByRelevance,
          hidden_by_ambito: policy.hiddenByAmbito,
          hidden_by_quality: hiddenByQuality,
          providers: externalResult.providers,
          provider_stats: externalResult.providerStats,
          degraded: externalResult.degraded,
          query,
          searched_at: new Date().toISOString(),
        },
      });
    }

    // Default, mixed, and degraded (external requested but unavailable) share the same
    // internal + Mercado Público pipeline; only whether external search runs and the meta differ.
    const externalRunsInHybrid = sourceMode === 'mixed' && externalAvailable;
    const emptyExternal: ExternalSearchResult = {
      projects: [],
      providers: [],
      providerStats: [],
      degraded: false,
    };

    const [hybrid, externalResult, mpDocs] = await Promise.all([
      hybridSearch({
        query,
        ambito,
        includeUnverified,
        selectedInstitutions,
        selectedRegions,
        selectedCategories,
        estado: requestBody.estado,
        minAmount,
        maxAmount,
        postedFrom,
        postedTill,
        sort,
        offset,
        limit: safePageSize,
      }),
      externalRunsInHybrid
        ? runExternalSearch(createProviders(enabledProviderIds), requestBody)
        : Promise.resolve(emptyExternal),
      runMercadoPublico ? fetchMercadoPublicoLive(ticket, query) : Promise.resolve([]),
    ]);

    const enrichedHybrid = enrichDaysLeft(
      hybrid.projects as Array<{ fecha_cierre: Date | string | null }>
    );
    const { visible: publishableHybrid, hidden: hiddenHybridByQuality } = publishableOf(
      enrichedHybrid as unknown as Record<string, unknown>[],
      strictQualityEnabled
    );
    const hybridTotal = resolveHybridTotal(hybrid);

    let publishableExternal: Record<string, unknown>[] = [];
    let hiddenExternalByQuality = 0;
    if (externalRunsInHybrid) {
      const enrichedExternal = enrichDaysLeft(
        externalResult.projects as Array<{ fecha_cierre: Date | string | null }>
      );
      const result = publishableOf(
        enrichedExternal as unknown as Record<string, unknown>[],
        strictQualityEnabled
      );
      publishableExternal = result.visible;
      hiddenExternalByQuality = result.hidden;
    }

    const normalizedMpDocs = normalizeMercadoPublicoDocs(mpDocs as unknown as Record<string, unknown>[]);
    const merged = [...publishableHybrid, ...publishableExternal, ...normalizedMpDocs] as Record<string, unknown>[];
    const policy = applyRelevanceAndAmbitoPolicy(merged, { relevanceMode, ambito });

    const mercadoPublicoCount = countBySourcePrefix(policy.results, 'mercado_publico');
    const externalCount = countBySourcePrefix(policy.results, 'linkedin_public');
    const hybridCount = policy.results.length - externalCount - mercadoPublicoCount;

    const isDegraded = requestedExternal && !externalAvailable;

    const meta: Record<string, unknown> = {
      total: policy.results.length,
      filtered_total: hybridTotal,
      hybrid_count: hybridCount,
      external_count: externalCount,
      mercado_publico_count: mercadoPublicoCount,
      mode: externalRunsInHybrid ? 'mixed' : hybrid.mode,
      relevance_mode: relevanceMode,
      hidden_by_relevance: policy.hiddenByRelevance,
      hidden_by_ambito: policy.hiddenByAmbito,
      hidden_by_quality: hiddenHybridByQuality + hiddenExternalByQuality,
      page,
      page_size: safePageSize,
      has_next: offset + enrichedHybrid.length < hybridTotal,
      query,
      searched_at: new Date().toISOString(),
    };

    if (isDegraded) {
      meta.degraded = true;
      meta.degraded_reason = !externalEnabled
        ? 'SEARCH_EXTERNAL_ENABLED=false'
        : 'All requested providers are disabled';
      meta.providers = enabledProviderIds;
      meta.provider_stats = [];
    } else if (externalRunsInHybrid) {
      meta.degraded = externalResult.degraded;
      meta.providers = externalResult.providers;
      meta.provider_stats = externalResult.providerStats;
    } else {
      meta.provider_stats = [];
    }

    return createSuccessResponse({ results: policy.results, meta });
  } catch (error) {
    logger.error('Search projects error', error as Error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "IICA Chile — Búsqueda híbrida",
    capabilities: [
      "Full-text search (Postgres tsvector + GIN)",
      "Semantic search (pgvector + Gemini text-embedding-001)",
      "Hybrid ranking via Reciprocal Rank Fusion",
      "Live Mercado Público overlay",
    ],
  });
}
