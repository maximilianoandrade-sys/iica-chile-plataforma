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
// Migración requerida: prisma/migrations/manual/2026-05-11-hybrid-search.sql
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
import type { ExternalProviderId } from '@/lib/search/contracts';
import { getEnv } from '@/lib/utils/env';

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
    const includeUnverified = requestBody.includeUnverified !== false;
    const includeMercadoPublico = requestBody.includeMercadoPublico !== false;
    const page = requestBody.page ?? 1;
    const pageSize = requestBody.pageSize ?? 50;
    const safePageSize = Math.max(1, Math.min(pageSize, 100));
    const offset = (page - 1) * safePageSize;
    const selectedInstitutions = parseCsvParam(requestBody.institution);
    const selectedRegions = parseCsvParam(requestBody.region);
    const minAmount = requestBody.minAmount ?? 0;
    const maxAmount = requestBody.maxAmount ?? Number.POSITIVE_INFINITY;
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

    if (requestedExternal && (!externalEnabled || enabledProviderIds.length === 0)) {
      const degradedReason = !externalEnabled
        ? 'SEARCH_EXTERNAL_ENABLED=false'
        : 'All requested providers are disabled';

      const [hybrid, mpDocs] = await Promise.all([
        hybridSearch({
          query,
          ambito,
          includeUnverified,
          selectedInstitutions,
          selectedRegions,
          estado: requestBody.estado,
          minAmount,
          maxAmount,
          sort,
          offset,
          limit: safePageSize,
        }),
        runMercadoPublico ? fetchMercadoPublicoLive(ticket, query) : Promise.resolve([]),
      ]);

      const enriched = hybrid.projects.map((p) => ({
        ...p,
        days_left: calcDaysLeft(p.fecha_cierre),
      }));
      const hybridTotal = resolveHybridTotal(hybrid);

      return createSuccessResponse({
        results: [...enriched, ...mpDocs],
        meta: {
          total: hybridTotal + mpDocs.length,
          filtered_total: hybridTotal,
          hybrid_count: enriched.length,
          external_count: 0,
          mercado_publico_count: mpDocs.length,
          mode: hybrid.mode,
          degraded: true,
          degraded_reason: degradedReason,
          page,
          page_size: safePageSize,
          has_next: offset + enriched.length < hybridTotal,
          providers: enabledProviderIds,
          provider_stats: [],
          query,
          searched_at: new Date().toISOString(),
        },
      });
    }

    if (sourceMode === 'external') {
      const externalResult = await runExternalSearch(
        createProviders(enabledProviderIds),
        requestBody
      );

      const enrichedExternal = externalResult.projects.map((p) => ({
        ...p,
        days_left: calcDaysLeft(p.fecha_cierre),
      }));

      return createSuccessResponse({
        results: enrichedExternal,
        meta: {
          total: enrichedExternal.length,
          external_count: enrichedExternal.length,
          mercado_publico_count: 0,
          hybrid_count: 0,
          mode: 'external',
          providers: externalResult.providers,
          provider_stats: externalResult.providerStats,
          degraded: externalResult.degraded,
          query,
          searched_at: new Date().toISOString(),
        },
      });
    }

    if (sourceMode === 'mixed') {
      const [hybrid, externalResult, mpDocs] = await Promise.all([
        hybridSearch({
          query,
          ambito,
          includeUnverified,
          selectedInstitutions,
          selectedRegions,
          estado: requestBody.estado,
          minAmount,
          maxAmount,
          sort,
          offset,
          limit: safePageSize,
        }),
        runExternalSearch(createProviders(enabledProviderIds), requestBody),
        runMercadoPublico ? fetchMercadoPublicoLive(ticket, query) : Promise.resolve([]),
      ]);

      const enrichedHybrid = hybrid.projects.map((p) => ({
        ...p,
        days_left: calcDaysLeft(p.fecha_cierre),
      }));
      const hybridTotal = resolveHybridTotal(hybrid);

      const enrichedExternal = externalResult.projects.map((p) => ({
        ...p,
        days_left: calcDaysLeft(p.fecha_cierre),
      }));

      return createSuccessResponse({
        results: [...enrichedHybrid, ...enrichedExternal, ...mpDocs],
        meta: {
          total: hybridTotal + enrichedExternal.length + mpDocs.length,
          filtered_total: hybridTotal,
          hybrid_count: enrichedHybrid.length,
          external_count: enrichedExternal.length,
          mercado_publico_count: mpDocs.length,
          mode: 'mixed',
          page,
          page_size: safePageSize,
          has_next: offset + enrichedHybrid.length < hybridTotal,
          providers: externalResult.providers,
          provider_stats: externalResult.providerStats,
          degraded: externalResult.degraded,
          query,
          searched_at: new Date().toISOString(),
        },
      });
    }

    const [hybrid, mpDocs] = await Promise.all([
      hybridSearch({
        query,
        ambito,
        includeUnverified,
        selectedInstitutions,
        selectedRegions,
        estado: requestBody.estado,
        minAmount,
        maxAmount,
        sort,
        offset,
        limit: safePageSize,
      }),
      runMercadoPublico ? fetchMercadoPublicoLive(ticket, query) : Promise.resolve([]),
    ]);

    const enriched = hybrid.projects.map((p) => ({
      ...p,
      days_left: calcDaysLeft(p.fecha_cierre),
    }));
    const hybridTotal = resolveHybridTotal(hybrid);

    return createSuccessResponse({
      results: [...enriched, ...mpDocs],
      meta: {
        total: hybridTotal + mpDocs.length,
        filtered_total: hybridTotal,
        hybrid_count: enriched.length,
        external_count: 0,
        mercado_publico_count: mpDocs.length,
        mode: hybrid.mode, // "hybrid" | "lexical_only" | "all"
        page,
        page_size: safePageSize,
        has_next: offset + enriched.length < hybridTotal,
        provider_stats: [],
        query,
        searched_at: new Date().toISOString(),
      },
    });
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
