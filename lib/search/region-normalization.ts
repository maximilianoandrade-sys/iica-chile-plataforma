const CHILE_REGIONS_ORDER = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
] as const;

type ChileRegionCanonical = (typeof CHILE_REGIONS_ORDER)[number];

const REGION_ALIASES: Record<ChileRegionCanonical, string[]> = {
  'Arica y Parinacota': ['arica y parinacota', 'arica', 'parinacota'],
  'Tarapacá': ['tarapaca'],
  Antofagasta: ['antofagasta'],
  Atacama: ['atacama'],
  Coquimbo: ['coquimbo'],
  'Valparaíso': ['valparaiso'],
  Metropolitana: ['metropolitana', 'metropolitana de santiago', 'region metropolitana'],
  "O'Higgins": ['ohiggins', "o'higgins", 'o higgins', 'bernardo ohiggins', "bernardo o'higgins"],
  Maule: ['maule'],
  'Ñuble': ['nuble', 'nuble'],
  'Biobío': ['biobio', 'bio bio', 'bio-bio', 'biobo'],
  'La Araucanía': ['la araucania', 'araucania'],
  'Los Ríos': ['los rios'],
  'Los Lagos': ['los lagos'],
  'Aysén': ['aysen', 'aysen'],
  Magallanes: ['magallanes', 'antartica chilena'],
};

const SPECIAL_COVERAGE_ORDER = [
  'Nacional',
  'Todas las regiones',
  'Macrozona Norte',
  'Macrozona Centro',
  'Macrozona Sur',
  'Macrozona',
  'Chile',
  'Internacional',
  'América Latina y el Caribe',
] as const;

const NORMALIZED_ALIAS_TO_REGION = new Map<string, ChileRegionCanonical>();

function normalizeForMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9']+/g, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

for (const region of CHILE_REGIONS_ORDER) {
  NORMALIZED_ALIAS_TO_REGION.set(normalizeForMatch(region), region);
  for (const alias of REGION_ALIASES[region]) {
    NORMALIZED_ALIAS_TO_REGION.set(normalizeForMatch(alias), region);
  }
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function classifySpecialCoverage(normalized: string): string | null {
  if (/\bnacional\b/.test(normalized)) return 'Nacional';
  if (/\btodas?\b(?:\s+las)?\s+regiones?\b/.test(normalized) || normalized === 'todas') {
    return 'Todas las regiones';
  }
  if (/\bmacrozona\b/.test(normalized)) {
    if (/\bnorte\b/.test(normalized)) return 'Macrozona Norte';
    if (/\bcentro\b/.test(normalized)) return 'Macrozona Centro';
    if (/\bsur\b/.test(normalized)) return 'Macrozona Sur';
    return 'Macrozona';
  }
  if (/\bchile\b/.test(normalized)) return 'Chile';
  if (/\binternacional\b/.test(normalized)) return 'Internacional';
  if (/\b(america latina|latinoamerica|latam|caribe)\b/.test(normalized)) {
    return 'América Latina y el Caribe';
  }
  return null;
}

function isLikelyNoise(rawValue: string, normalized: string): boolean {
  if (!/[a-zA-Z]/.test(normalized)) return true;
  if (/^\$?\d[\d\s.,]*$/.test(rawValue.trim())) return true;
  if (/^(usd|clp|uf)\s*\d/i.test(rawValue.trim())) return true;
  return false;
}

function extractChileRegionsFromSegment(segment: string): string[] {
  const normalizedSegment = normalizeForMatch(segment);
  const matches: string[] = [];

  for (const region of CHILE_REGIONS_ORDER) {
    const aliases = [region, ...REGION_ALIASES[region]];
    const hasAlias = aliases.some((alias) => {
      const normalizedAlias = normalizeForMatch(alias);
      return ` ${normalizedSegment} `.includes(` ${normalizedAlias} `);
    });

    if (hasAlias) {
      matches.push(region);
    }
  }

  return matches;
}

function normalizeRegionSegment(segment: string): string[] {
  const trimmed = segment.trim();
  if (!trimmed) return [];

  const regionMatches = extractChileRegionsFromSegment(trimmed);
  if (regionMatches.length > 0) return regionMatches;

  const normalized = normalizeForMatch(trimmed);
  if (!normalized) return [];

  const special = classifySpecialCoverage(normalized);
  if (special) return [special];

  if (isLikelyNoise(trimmed, normalized)) return [];
  return [trimmed.replace(/\s+/g, ' ')];
}

export function normalizeRegionTerm(value: string): string {
  return normalizeForMatch(value);
}

export function sortRegionLabels(labels: string[]): string[] {
  const unique = dedupe(labels);

  const chileOrder = new Map<string, number>();
  CHILE_REGIONS_ORDER.forEach((label, index) => {
    chileOrder.set(label, index);
  });

  const specialOrder = new Map<string, number>();
  SPECIAL_COVERAGE_ORDER.forEach((label, index) => {
    specialOrder.set(label, index);
  });

  return [...unique].sort((a, b) => {
    const aChile = chileOrder.get(a);
    const bChile = chileOrder.get(b);
    if (aChile != null && bChile != null) return aChile - bChile;
    if (aChile != null) return -1;
    if (bChile != null) return 1;

    const aSpecial = specialOrder.get(a);
    const bSpecial = specialOrder.get(b);
    if (aSpecial != null && bSpecial != null) return aSpecial - bSpecial;
    if (aSpecial != null) return -1;
    if (bSpecial != null) return 1;

    return a.localeCompare(b, 'es');
  });
}

export function extractRegionsFromText(rawValue: string): string[] {
  const trimmed = rawValue.trim();
  if (!trimmed) return [];

  const segments = trimmed
    .split(/[,;|/\n]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const candidates = segments.length > 1 ? segments : [trimmed];
  const extracted = candidates.flatMap((segment) => normalizeRegionSegment(segment));

  return sortRegionLabels(extracted);
}

export function getRegionSearchTerms(label: string): string[] {
  const normalizedLabel = normalizeForMatch(label);
  const canonical = NORMALIZED_ALIAS_TO_REGION.get(normalizedLabel);

  if (canonical) {
    return dedupe([canonical, ...REGION_ALIASES[canonical], normalizeForMatch(canonical)]);
  }

  return dedupe([label, normalizeForMatch(label)]);
}
