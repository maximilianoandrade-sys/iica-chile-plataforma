import type { ExternalProviderId, SearchRequest } from '@/lib/search/contracts';

export interface ExternalProjectRecord {
  id: number;
  sourceId: string;
  nombre: string;
  institucion: string;
  monto: number;
  montoTexto?: string | null;
  fecha_cierre: string;
  estado: string;
  categoria: string;
  url_bases: string;
  ambito?: 'Nacional' | 'Regional' | 'Internacional';
  estadoPostulacion?: 'Abierta' | 'Próxima' | 'Cerrada';
  region?: string;
  regiones?: string[];
  objetivo?: string;
  descripcionIICA?: string;
}

export interface ExternalProvider {
  id: ExternalProviderId;
  search(request: SearchRequest): Promise<ExternalProjectRecord[]>;
}

export interface ExternalProviderStat {
  provider: ExternalProviderId;
  success: boolean;
  resultCount: number;
  durationMs: number;
  error?: string;
}

export interface ExternalSearchResult {
  projects: ExternalProjectRecord[];
  providers: ExternalProviderId[];
  providerStats: ExternalProviderStat[];
  degraded: boolean;
}
