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

    if (requestedExternal && (!externalEnabled || enabledProviderIds.length === 0)) {
      const degradedReason = !externalEnabled
        ? 'SEARCH_EXTERNAL_ENABLED=false'
        : 'All requested providers are disabled';

      const [hybrid, mpDocs] = await Promise.all([
        hybridSearch({ query, ambito, includeUnverified, limit: 50 }),
        fetchMercadoPublicoLive(ticket, query),
      ]);

      const enriched = hybrid.projects.map((p) => ({
        ...p,
        days_left: calcDaysLeft(p.fecha_cierre),
      }));
      const { visible: publishableHybrid, hidden: hiddenByQuality } = strictQualityEnabled
        ? applyPublishableFilter(enriched as Record<string, unknown>[])
        : { visible: enriched as unknown as Record<string, unknown>[], hidden: 0 };

      const normalizedMpDocs = normalizeMercadoPublicoDocs(mpDocs as unknown as Record<string, unknown>[]);
      const merged = [...publishableHybrid, ...normalizedMpDocs] as Record<string, unknown>[];
      const policy = applyRelevanceAndAmbitoPolicy(merged, { relevanceMode, ambito });

      return createSuccessResponse({
        results: policy.results,
        meta: {
          total: policy.results.length,
          hybrid_count: policy.results.length - countBySourcePrefix(policy.results, 'mercado_publico'),
          external_count: 0,
          mercado_publico_count: countBySourcePrefix(policy.results, 'mercado_publico'),
          mode: hybrid.mode,
          relevance_mode: relevanceMode,
          hidden_by_relevance: policy.hiddenByRelevance,
          hidden_by_ambito: policy.hiddenByAmbito,
          hidden_by_quality: hiddenByQuality,
          degraded: true,
          degraded_reason: degradedReason,
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

      const { visible: publishableExternal, hidden: hiddenByQuality } = strictQualityEnabled
        ? applyPublishableFilter(enrichedExternal as Record<string, unknown>[])
        : { visible: enrichedExternal as unknown as Record<string, unknown>[], hidden: 0 };
      const policy = applyRelevanceAndAmbitoPolicy(publishableExternal as Record<string, unknown>[], { relevanceMode, ambito });

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

    if (sourceMode === 'mixed') {
      const [hybrid, externalResult, mpDocs] = await Promise.all([
        hybridSearch({ query, ambito, includeUnverified, limit: 50 }),
        runExternalSearch(createProviders(enabledProviderIds), requestBody),
        fetchMercadoPublicoLive(ticket, query),
      ]);

      const enrichedHybrid = hybrid.projects.map((p) => ({
        ...p,
        days_left: calcDaysLeft(p.fecha_cierre),
      }));
      const { visible: publishableHybrid, hidden: hiddenHybridByQuality } = strictQualityEnabled
        ? applyPublishableFilter(enrichedHybrid as Record<string, unknown>[])
        : { visible: enrichedHybrid as unknown as Record<string, unknown>[], hidden: 0 };

      const enrichedExternal = externalResult.projects.map((p) => ({
        ...p,
        days_left: calcDaysLeft(p.fecha_cierre),
      }));
      const { visible: publishableExternal, hidden: hiddenExternalByQuality } = strictQualityEnabled
        ? applyPublishableFilter(enrichedExternal as Record<string, unknown>[])
        : { visible: enrichedExternal as unknown as Record<string, unknown>[], hidden: 0 };

      const normalizedMpDocs = normalizeMercadoPublicoDocs(mpDocs as unknown as Record<string, unknown>[]);
      const merged = [...publishableHybrid, ...publishableExternal, ...normalizedMpDocs] as Record<string, unknown>[];
      const policy = applyRelevanceAndAmbitoPolicy(merged, { relevanceMode, ambito });

      return createSuccessResponse({
        results: policy.results,
        meta: {
          total: policy.results.length,
          hybrid_count: policy.results.length
            - countBySourcePrefix(policy.results, 'linkedin_public')
            - countBySourcePrefix(policy.results, 'mercado_publico'),
          external_count: countBySourcePrefix(policy.results, 'linkedin_public'),
          mercado_publico_count: countBySourcePrefix(policy.results, 'mercado_publico'),
          mode: 'mixed',
          relevance_mode: relevanceMode,
          hidden_by_relevance: policy.hiddenByRelevance,
          hidden_by_ambito: policy.hiddenByAmbito,
          hidden_by_quality: hiddenHybridByQuality + hiddenExternalByQuality,
          providers: externalResult.providers,
          provider_stats: externalResult.providerStats,
          degraded: externalResult.degraded,
          query,
          searched_at: new Date().toISOString(),
        },
      });
    }

    const [hybrid, mpDocs] = await Promise.all([
      hybridSearch({ query, ambito, includeUnverified, limit: 50 }),
      fetchMercadoPublicoLive(ticket, query),
    ]);

    const enriched = hybrid.projects.map((p) => ({
      ...p,
      days_left: calcDaysLeft(p.fecha_cierre),
    }));
    const { visible: publishableHybrid, hidden: hiddenByQuality } = strictQualityEnabled
      ? applyPublishableFilter(enriched as Record<string, unknown>[])
      : { visible: enriched as unknown as Record<string, unknown>[], hidden: 0 };

    const normalizedMpDocs = normalizeMercadoPublicoDocs(mpDocs as unknown as Record<string, unknown>[]);
    const merged = [...publishableHybrid, ...normalizedMpDocs] as Record<string, unknown>[];
    const policy = applyRelevanceAndAmbitoPolicy(merged, { relevanceMode, ambito });

    return createSuccessResponse({
      results: policy.results,
      meta: {
        total: policy.results.length,
        hybrid_count: policy.results.length - countBySourcePrefix(policy.results, 'mercado_publico'),
        external_count: 0,
        mercado_publico_count: countBySourcePrefix(policy.results, 'mercado_publico'),
        mode: hybrid.mode, // "hybrid" | "lexical_only" | "all"
        relevance_mode: relevanceMode,
        hidden_by_relevance: policy.hiddenByRelevance,
        hidden_by_ambito: policy.hiddenByAmbito,
        hidden_by_quality: hiddenByQuality,
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
