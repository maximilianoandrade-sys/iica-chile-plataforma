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

function hasMojibake(text: string): boolean {
  return text.includes('�') || /Ã[\x80-\xBF]/.test(text);
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

  if (!eligible) {
    qualityFlags.push('chile_relevance_ineligible');
    qualityReasons.push('La oportunidad internacional no contiene señal explícita de elegibilidad para Chile.');
    qualityScore -= 60;
  }

  const title = raw.title || '';
  const description = raw.description || '';
  if (hasMojibake(title) || hasMojibake(description)) {
    qualityFlags.push('text_encoding_mojibake');
    qualityReasons.push('Se detectaron caracteres de codificación inválidos en título o descripción.');
    qualityScore -= 20;
  }

  if (!hasChileSignal(sourceProjection) && (raw.ambito === 'Internacional')) {
    qualityFlags.push('chile_signal_missing');
    qualityReasons.push('Falta evidencia textual explícita de vínculo con Chile.');
    qualityScore -= 10;
  }

  const normalizedScore = Math.max(0, Math.min(100, qualityScore));

  return {
    chileEligibility: eligible ? 'eligible' : 'ineligible',
    publishable: eligible,
    qualityScore: normalizedScore,
    qualityFlags,
    qualityReasons,
    qualityUpdatedAt: new Date(),
  };
}
