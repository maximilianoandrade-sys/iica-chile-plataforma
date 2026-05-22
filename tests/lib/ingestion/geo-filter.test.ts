import { isAmericasCountry, IICA_COUNTRIES, IICA_COUNTRY_CODES } from '@/lib/ingestion/geo-filter'

describe('geo-filter', () => {
  describe('isAmericasCountry', () => {
    it.each(['Chile', 'Argentina', 'Brazil', 'Mexico', 'Jamaica', 'Haiti'])(
      'returns true for IICA country: %s',
      (country) => {
        expect(isAmericasCountry(country)).toBe(true)
      },
    )

    it.each(['China', 'Kyrgyzstan', 'Madagascar', 'France', 'India'])(
      'returns false for non-IICA country: %s',
      (country) => {
        expect(isAmericasCountry(country)).toBe(false)
      },
    )

    it('handles case insensitivity', () => {
      expect(isAmericasCountry('CHILE')).toBe(true)
      expect(isAmericasCountry('cHiLe')).toBe(true)
      expect(isAmericasCountry('chile')).toBe(true)
    })

    it('handles common variations', () => {
      expect(isAmericasCountry('Venezuela, RB')).toBe(true)
      expect(isAmericasCountry('Bolivia, Plurinational State of')).toBe(true)
      expect(isAmericasCountry('República Dominicana')).toBe(true)
      expect(isAmericasCountry('United States of America')).toBe(true)
      expect(isAmericasCountry('USA')).toBe(true)
      expect(isAmericasCountry('Brasil')).toBe(true)
    })

    it('returns false for empty string', () => {
      expect(isAmericasCountry('')).toBe(false)
    })

    it('returns false for null/undefined', () => {
      expect(isAmericasCountry(null)).toBe(false)
      expect(isAmericasCountry(undefined)).toBe(false)
    })
  })

  describe('IICA_COUNTRY_CODES', () => {
    it('contains 34 unique country codes', () => {
      expect(IICA_COUNTRY_CODES).toHaveLength(34)
    })

    it('contains expected codes', () => {
      expect(IICA_COUNTRY_CODES).toContain('CL')
      expect(IICA_COUNTRY_CODES).toContain('US')
      expect(IICA_COUNTRY_CODES).toContain('BR')
    })
  })
})
