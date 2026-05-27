import type { SearchRelevanceMode } from '@/lib/search/contracts';

export type SearchResultRecord = Record<string, unknown>;

const CHILE_SIGNAL_REGEX = /\b(chile|chileno|chilena|chilenas|chilenos)\b/i;

function getStringField(record: SearchResultRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function getArrayStringField(record: SearchResultRecord, keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
  }
  return [];
}

export function inferRecordAmbito(record: SearchResultRecord): string {
  return getStringField(record, ['ambito']);
}

export function hasChileSignal(record: SearchResultRecord): boolean {
  const textParts = [
    getStringField(record, ['nombre', 'title']),
    getStringField(record, ['institucion', 'institution']),
    getStringField(record, ['objetivo', 'description']),
    getStringField(record, ['descripcionIICA']),
    getStringField(record, ['url_bases', 'url']),
    ...getArrayStringField(record, ['regiones', 'tags']),
  ].filter(Boolean);

  const normalized = textParts.join(' ').toLowerCase();
  if (CHILE_SIGNAL_REGEX.test(normalized)) return true;

  return /\.cl\b/i.test(normalized);
}

export function isChileStrictEligible(record: SearchResultRecord): boolean {
  const ambito = inferRecordAmbito(record);
  if (ambito !== 'Internacional') return true;
  return hasChileSignal(record);
}

export function applyRelevanceAndAmbitoPolicy(
  input: SearchResultRecord[],
  options: { relevanceMode: SearchRelevanceMode; ambito: string }
): { results: SearchResultRecord[]; hiddenByRelevance: number; hiddenByAmbito: number } {
  const { relevanceMode, ambito } = options;

  let hiddenByRelevance = 0;
  let hiddenByAmbito = 0;

  const relevanceFiltered = input.filter((record) => {
    if (relevanceMode !== 'chile_strict') return true;
    const keep = isChileStrictEligible(record);
    if (!keep) hiddenByRelevance += 1;
    return keep;
  });

  const ambitoFiltered = relevanceFiltered.filter((record) => {
    if (!ambito || ambito === 'all') return true;
    const keep = inferRecordAmbito(record) === ambito;
    if (!keep) hiddenByAmbito += 1;
    return keep;
  });

  return {
    results: ambitoFiltered,
    hiddenByRelevance,
    hiddenByAmbito,
  };
}
