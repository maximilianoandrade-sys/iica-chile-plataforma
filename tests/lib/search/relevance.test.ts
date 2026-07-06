import { applyRelevanceAndAmbitoPolicy, isChileStrictEligible } from '@/lib/search/relevance';

describe('search relevance policy', () => {
  it('marks international without Chile signal as ineligible in chile_strict', () => {
    const record = {
      nombre: 'Audio devices tender Tanzania',
      institucion: 'UNGM',
      ambito: 'Internacional',
      url_bases: 'https://ungm.org/tanzania/audio',
    };

    expect(isChileStrictEligible(record)).toBe(false);
  });

  it('keeps international opportunities when Chile signal is explicit', () => {
    const record = {
      nombre: 'Programa agrícola para Chile y Perú',
      institucion: 'IICA',
      ambito: 'Internacional',
      objetivo: 'Convocatoria de cooperación técnica para Chile.',
    };

    expect(isChileStrictEligible(record)).toBe(true);
  });

  it('applies relevance and ambito filters with visibility counters', () => {
    const records = [
      {
        nombre: 'Nacional CNR',
        institucion: 'CNR',
        ambito: 'Nacional',
      },
      {
        nombre: 'Procurement kit for Nepal',
        institucion: 'UNGM',
        ambito: 'Internacional',
      },
      {
        nombre: 'GEF support for Chile',
        institucion: 'GEF',
        ambito: 'Internacional',
        descripcionIICA: 'Incluye implementación en Chile.',
      },
    ];

    const strict = applyRelevanceAndAmbitoPolicy(records, {
      relevanceMode: 'chile_strict',
      ambito: 'all',
    });

    expect(strict.results).toHaveLength(2);
    expect(strict.hiddenByRelevance).toBe(1);
    expect(strict.hiddenByAmbito).toBe(0);

    const strictInternational = applyRelevanceAndAmbitoPolicy(records, {
      relevanceMode: 'chile_strict',
      ambito: 'Internacional',
    });

    expect(strictInternational.results).toHaveLength(1);
    expect(strictInternational.results[0]).toMatchObject({ nombre: 'GEF support for Chile' });
    expect(strictInternational.hiddenByRelevance).toBe(1);
    expect(strictInternational.hiddenByAmbito).toBe(1);

    const allMode = applyRelevanceAndAmbitoPolicy(records, {
      relevanceMode: 'all',
      ambito: 'all',
    });

    expect(allMode.results).toHaveLength(3);
    expect(allMode.hiddenByRelevance).toBe(0);
    expect(allMode.hiddenByAmbito).toBe(0);
  });
});
