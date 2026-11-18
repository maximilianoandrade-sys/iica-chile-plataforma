import type { RawProject } from '@/lib/ingestion/types';
import { hasChileSignal, isChileStrictEligible } from '@/lib/search/relevance';

export type ChileEligibility = 'eligible' | 'ineligible';

export interface IngestionQuality {
  chileEligibility: ChileEligibility;
  publishable: boolean;
  qualityScore: number;
  qualityFlags: string[];
  qualityReasons: string[];
  qualityUpdatedAt: Date;
}

export const NON_AGRO_KEYWORDS = [
  'aire acondicionado',
  'lavandería',
  'lavanderia',
  'aseo y mantención',
  'aseo y mantencion',
  'aseo de oficina',
  'servicio de café',
  'servicio de cafe',
  'arriendo de inmueble',
  'mantenimiento de ascensores',
  'seguridad privada de edificio',
  'catering corporativo',
  'adquisicion de vehiculos de pasajeros',
];

function hasMojibake(text: string): boolean {
  return text.includes('') || /Ã[\x80-\xBF]/.test(text);
}

function hasNonAgroNoise(text: string): boolean {
  const lower = text.toLowerCase();
  return NON_AGRO_KEYWORDS.some((kw) => lower.includes(kw));
}

export function evaluateIngestionQuality(raw: RawProject): IngestionQuality {
  const sourceProjection = {
    nombre: raw.title,
    institucion: raw.institution,
    objetivo: raw.description,
    ambito: raw.ambito,
    url_bases: raw.url,
    regiones: raw.region ? [raw.region] : [],
  } as Record<string, unknown>;

  const eligible = isChileStrictEligible(sourceProjection);

  const qualityFlags: string[] = [];
  const qualityReasons: string[] = [];
  let qualityScore = 100;
  let publishable = eligible;

  const title = raw.title || '';
  const description = raw.description || '';
  const combinedText = `${title} ${description}`;

  // 1. Detección de ruido y adquisiciones no agrícolas (lavandería, aire acondicionado, aseo)
  if (hasNonAgroNoise(combinedText)) {
    qualityFlags.push('non_agricultural_noise');
    qualityReasons.push('La oportunidad contiene términos de adquisiciones generales o servicios no relacionados al agro.');
    qualityScore -= 70;
    publishable = false;
  }

  // 2. Elegibilidad Chile
  if (!eligible) {
    qualityFlags.push('chile_relevance_ineligible');
    qualityReasons.push('La oportunidad internacional no contiene señal explícita de elegibilidad para Chile.');
    qualityScore -= 60;
    publishable = false;
  }

  // 3. Detección de mojibake y codificación rota
  if (hasMojibake(title) || hasMojibake(description)) {
    qualityFlags.push('text_encoding_mojibake');
    qualityReasons.push('Se detectaron caracteres de codificación inválidos en título o descripción.');
    qualityScore -= 20;
  }

  // 4. Señal de Chile faltante en convocatorias internacionales
  if (!hasChileSignal(sourceProjection) && raw.ambito === 'Internacional') {
    qualityFlags.push('chile_signal_missing');
    qualityReasons.push('Falta evidencia textual explícita de vínculo con Chile.');
    qualityScore -= 10;
  }

  const normalizedScore = Math.max(0, Math.min(100, qualityScore));

  return {
    chileEligibility: eligible ? 'eligible' : 'ineligible',
    publishable,
    qualityScore: normalizedScore,
    qualityFlags,
    qualityReasons,
    qualityUpdatedAt: new Date(),
  };
}
