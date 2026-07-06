export const SEARCH_SOURCE_MODES = ['internal', 'external', 'mixed'] as const;
export type SearchSourceMode = (typeof SEARCH_SOURCE_MODES)[number];

export const SEARCH_RELEVANCE_MODES = ['chile_strict', 'all'] as const;
export type SearchRelevanceMode = (typeof SEARCH_RELEVANCE_MODES)[number];

export const EXTERNAL_PROVIDER_IDS = ['linkedin_public'] as const;
export type ExternalProviderId = (typeof EXTERNAL_PROVIDER_IDS)[number];

export type SearchEstado = 'Abierta' | 'Próxima' | 'Cerrada';
export type SearchAmbito = 'all' | 'Nacional' | 'Regional' | 'Internacional';

export interface SearchRequest {
  query?: string;
  scope?: string;
  role?: string;
  ambito?: SearchAmbito;
  institution?: string;
  region?: string;
  estado?: SearchEstado;
  minAmount?: number;
  maxAmount?: number;
  includeUnverified?: boolean;
  sourceMode?: SearchSourceMode;
  providers?: ExternalProviderId[];
  relevanceMode?: SearchRelevanceMode;
}

export interface SearchResultMeta {
  total: number;
  hybrid_count?: number;
  mercado_publico_count?: number;
  external_count?: number;
  relevance_mode?: SearchRelevanceMode;
  hidden_by_relevance?: number;
  hidden_by_ambito?: number;
  hidden_by_quality?: number;
  hidden_duplicates?: number;
  mode: 'hybrid' | 'lexical_only' | 'all' | 'internal' | 'external' | 'mixed';
  query: string;
  searched_at: string;
  providers?: ExternalProviderId[];
  degraded?: boolean;
}

export function isSearchSourceMode(value: string): value is SearchSourceMode {
  return SEARCH_SOURCE_MODES.includes(value as SearchSourceMode);
}

export function isSearchRelevanceMode(value: string): value is SearchRelevanceMode {
  return SEARCH_RELEVANCE_MODES.includes(value as SearchRelevanceMode);
}

export function isExternalProviderId(value: string): value is ExternalProviderId {
  return EXTERNAL_PROVIDER_IDS.includes(value as ExternalProviderId);
}
