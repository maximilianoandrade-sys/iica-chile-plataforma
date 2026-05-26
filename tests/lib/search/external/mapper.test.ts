import { mapSearchRequestToLinkedInQuery } from '@/lib/search/external/mapper';

describe('mapSearchRequestToLinkedInQuery', () => {
  it('builds a scoped query from search params', () => {
    const mapped = mapSearchRequestToLinkedInQuery({
      query: 'riego tecnificado',
      ambito: 'Regional',
      institution: 'INDAP',
      region: 'Maule',
      estado: 'Abierta',
      minAmount: 100000,
      maxAmount: 900000,
    });

    expect(mapped.query).toContain('site:linkedin.com');
    expect(mapped.query).toContain('riego tecnificado');
    expect(mapped.query).toContain('INDAP');
    expect(mapped.query).toContain('Maule');
    expect(mapped.query).toContain('convocatoria');
    expect(mapped.unsupportedFilters).toEqual(expect.arrayContaining(['minAmount', 'maxAmount']));
  });

  it('uses safe defaults when optional filters are missing', () => {
    const mapped = mapSearchRequestToLinkedInQuery({ query: 'agricultura' });
    expect(mapped.limit).toBe(20);
    expect(mapped.query).toContain('agricultura');
  });
});
