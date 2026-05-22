import { getLogger } from '@/lib/utils/logger'

const logger = getLogger('GeoFilter')

/**
 * Map from country name variations (lowercase) to ISO 3166-1 alpha-2 codes
 * for all 34 IICA member states.
 */
export const IICA_COUNTRIES: Map<string, string> = new Map([
  // North America
  ['canada', 'CA'],
  ['united states', 'US'],
  ['united states of america', 'US'],
  ['usa', 'US'],
  ['mexico', 'MX'],
  ['méxico', 'MX'],

  // Central America
  ['belize', 'BZ'],
  ['costa rica', 'CR'],
  ['el salvador', 'SV'],
  ['guatemala', 'GT'],
  ['honduras', 'HN'],
  ['nicaragua', 'NI'],
  ['panama', 'PA'],
  ['panamá', 'PA'],

  // Caribbean
  ['antigua and barbuda', 'AG'],
  ['bahamas', 'BS'],
  ['the bahamas', 'BS'],
  ['barbados', 'BB'],
  ['dominica', 'DM'],
  ['dominican republic', 'DO'],
  ['república dominicana', 'DO'],
  ['republica dominicana', 'DO'],
  ['grenada', 'GD'],
  ['guyana', 'GY'],
  ['haiti', 'HT'],
  ['haití', 'HT'],
  ['jamaica', 'JM'],
  ['saint kitts and nevis', 'KN'],
  ['st. kitts and nevis', 'KN'],
  ['saint lucia', 'LC'],
  ['st. lucia', 'LC'],
  ['saint vincent and the grenadines', 'VC'],
  ['st. vincent and the grenadines', 'VC'],
  ['suriname', 'SR'],
  ['trinidad and tobago', 'TT'],

  // South America
  ['argentina', 'AR'],
  ['bolivia', 'BO'],
  ['bolivia, plurinational state', 'BO'],
  ['bolivia, plurinational state of', 'BO'],
  ['estado plurinacional de bolivia', 'BO'],
  ['brazil', 'BR'],
  ['brasil', 'BR'],
  ['chile', 'CL'],
  ['colombia', 'CO'],
  ['ecuador', 'EC'],
  ['paraguay', 'PY'],
  ['peru', 'PE'],
  ['perú', 'PE'],
  ['uruguay', 'UY'],
  ['venezuela', 'VE'],
  ['venezuela, rb', 'VE'],
  ['venezuela, bolivarian republic of', 'VE'],
  ['república bolivariana de venezuela', 'VE'],
])

/** All 34 IICA member state ISO 2-letter codes */
const countryCodeMap: Record<string, true> = {}
IICA_COUNTRIES.forEach((code) => {
  countryCodeMap[code] = true
})
export const IICA_COUNTRY_CODES: string[] = Object.keys(countryCodeMap)

/**
 * Returns true if the given country name matches an IICA Americas member state.
 * Case-insensitive with support for common naming variations.
 */
export function isAmericasCountry(countryName: string | null | undefined): boolean {
  if (!countryName || typeof countryName !== 'string') {
    return false
  }

  const normalized = countryName.trim().toLowerCase()
  if (!normalized) {
    return false
  }

  if (IICA_COUNTRIES.has(normalized)) {
    return true
  }

  logger.debug('Country not matched', { countryName })
  return false
}
