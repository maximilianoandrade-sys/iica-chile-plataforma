import type { FilterCounts } from '@/lib/data';
import {
  extractRegionsFromText,
  getRegionSearchTerms,
  normalizeRegionTerm,
  sortRegionLabels,
} from '@/lib/search/region-normalization';

// ---------------------------------------------------------------------------
// Institution normalization — deduplicates aliases into canonical short names
// ---------------------------------------------------------------------------

export const INSTITUTION_ALIASES: Record<string, string> = {
  'Comisión Nacional de Riego (CNR)': 'CNR',
  'Comisión Nacional de Riego': 'CNR',
  'Instituto de Desarrollo Agropecuario (INDAP)': 'INDAP',
  'Instituto de Desarrollo Agropecuario': 'INDAP',
  'Fundación para la Innovación Agraria (FIA)': 'FIA',
  'Fundación para la Innovación Agraria': 'FIA',
  'Corporación de Fomento de la Producción (CORFO)': 'CORFO',
  'Corporación de Fomento de la Producción': 'CORFO',
  'Fondo Regional de Tecnología Agropecuaria (FONTAGRO)': 'FONTAGRO',
  'Fondo Regional de Tecnología Agropecuaria': 'FONTAGRO',
  'Organización de las Naciones Unidas para la Alimentación y la Agricultura (FAO)': 'FAO',
  'Organización de las Naciones Unidas para la Alimentación y la Agricultura': 'FAO',
  'Servicio Agrícola y Ganadero (SAG)': 'SAG',
  'Servicio Agrícola y Ganadero': 'SAG',
  'Banco Interamericano de Desarrollo (BID)': 'BID',
  'Banco Interamericano de Desarrollo': 'BID',
  'Inter-American Development Bank': 'BID',
  'IADB': 'BID',
  'Programa de las Naciones Unidas para el Desarrollo (PNUD)': 'PNUD',
  'Programa de las Naciones Unidas para el Desarrollo': 'PNUD',
  'Fondo Internacional de Desarrollo Agrícola (FIDA)': 'FIDA',
  'Fondo Internacional de Desarrollo Agrícola': 'FIDA',
  'IFAD': 'FIDA',
  'International Fund for Agricultural Development': 'FIDA',
  'WORLD BANK': 'Banco Mundial',
  'World Bank': 'Banco Mundial',
  'Ministerio de Agricultura (MINAGRI)': 'MINAGRI',
  'Ministerio de Agricultura': 'MINAGRI',
};

/**
 * Normalizes an institution name using the aliases map.
 * Returns the canonical short name if found, otherwise the original trimmed name.
 */
export function normalizeInstitution(name: string): string {
  const trimmed = name.trim();
  if (INSTITUTION_ALIASES[trimmed]) return INSTITUTION_ALIASES[trimmed];
  // Check case-insensitive match
  const upper = trimmed.toUpperCase();
  for (const [alias, canonical] of Object.entries(INSTITUTION_ALIASES)) {
    if (alias.toUpperCase() === upper) return canonical;
  }
  return trimmed;
}

export interface SearchProjectLike {
  institucion: string;
  monto: number;
  fecha_cierre: string | Date;
  categoria?: string | null;
  estadoPostulacion?: 'Abierta' | 'Próxima' | 'Cerrada' | null;
  regiones?: string[];
  region?: string | null;
  ambito?: string | null;
}

export interface FacetFilters {
  selectedEstado: string;
  selectedInstitutions: string[];
  selectedRegions: string[];
  selectedCategories?: string[];
  selectedAmbito: string;
  minAmount: number;
  maxAmount: number;
}

export function inferEstado(project: SearchProjectLike, now = new Date()): string {
  if (project.estadoPostulacion) return project.estadoPostulacion;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const close = new Date(project.fecha_cierre);
  const daysLeft = Math.ceil((close.getTime() - today.getTime()) / 86_400_000);
  if (daysLeft < 0) return 'Cerrada';
  if (daysLeft <= 30) return 'Próxima';
  return 'Abierta';
}

export function getProjectRegions(project: SearchProjectLike): string[] {
  if (project.regiones && project.regiones.length > 0) {
    const normalized = project.regiones.flatMap((region) => extractRegionsFromText(region));
    if (normalized.length > 0) return sortRegionLabels(normalized);
  }

  if (project.region) {
    return extractRegionsFromText(project.region);
  }

  return [];
}

export function buildFilterCounts<T extends SearchProjectLike>(
  projects: T[],
  now = new Date()
): FilterCounts {
  return {
    estado: projects.reduce((acc, p) => {
      const estado = inferEstado(p, now);
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    institucion: projects.reduce((acc, p) => {
      acc[p.institucion] = (acc[p.institucion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    categoria: projects.reduce((acc, p) => {
      if (p.categoria) acc[p.categoria] = (acc[p.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    region: projects.reduce((acc, p) => {
      getProjectRegions(p).forEach((r) => {
        acc[r] = (acc[r] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    ambito: projects.reduce((acc, p) => {
      if (p.ambito) acc[p.ambito] = (acc[p.ambito] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

export function filterProjectsByFacets<T extends SearchProjectLike>(
  projects: T[],
  filters: FacetFilters,
  now = new Date()
): T[] {
  const {
    selectedEstado,
    selectedInstitutions,
    selectedRegions,
    selectedCategories = [],
    selectedAmbito,
    minAmount,
    maxAmount,
  } = filters;

  return projects.filter((project) => {
    const matchesEstado = !selectedEstado || inferEstado(project, now) === selectedEstado;
    const matchesInstitution =
      selectedInstitutions.length === 0 || selectedInstitutions.includes(project.institucion);
    const projectRegions = getProjectRegions(project);
    const selectedRegionTerms = selectedRegions.flatMap((region) => getRegionSearchTerms(region));
    const projectRegionTerms = projectRegions.map((region) => normalizeRegionTerm(region));
    const matchesRegion =
      selectedRegions.length === 0 || projectRegionTerms.some((region) => selectedRegionTerms.includes(region));
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(project.categoria ?? '');
    const matchesAmbito = !selectedAmbito || project.ambito === selectedAmbito;

    const filterActive = minAmount > 0 || maxAmount < Infinity;
    const matchesAmount =
      !filterActive || (project.monto >= minAmount && project.monto <= maxAmount);

    return (
      matchesEstado &&
      matchesInstitution &&
      matchesRegion &&
      matchesCategory &&
      matchesAmbito &&
      matchesAmount
    );
  });
}
