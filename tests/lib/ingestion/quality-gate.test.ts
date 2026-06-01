import type { RawProject } from '@/lib/ingestion/types';
import { evaluateIngestionQuality } from '@/lib/ingestion/quality-gate';

function makeRaw(overrides: Partial<RawProject>): RawProject {
  return {
    title: overrides.title ?? 'Convocatoria de riego para Chile',
    institution: overrides.institution ?? 'INDAP',
    url: overrides.url ?? 'https://www.indap.gob.cl/convocatoria',
    description: overrides.description ?? 'Apoyo para productores agrícolas chilenos.',
    ambito: overrides.ambito ?? 'Nacional',
    ...overrides,
  };
}

describe('evaluateIngestionQuality', () => {
  it('marks national opportunities as eligible and publishable', () => {
    const quality = evaluateIngestionQuality(makeRaw({ ambito: 'Nacional' }));

    expect(quality.chileEligibility).toBe('eligible');
    expect(quality.publishable).toBe(true);
    expect(quality.qualityFlags).not.toContain('chile_relevance_ineligible');
  });

  it('marks international without Chile signal as ineligible and hidden', () => {
    const quality = evaluateIngestionQuality(
      makeRaw({
        title: 'Audio devices procurement Tanzania',
        institution: 'UNGM',
        url: 'https://ungm.org/tanzania/audio',
        description: 'Public procurement for audio equipment in Tanzania.',
        ambito: 'Internacional',
      }),
    );

    expect(quality.chileEligibility).toBe('ineligible');
    expect(quality.publishable).toBe(false);
    expect(quality.qualityFlags).toContain('chile_relevance_ineligible');
  });

  it('keeps international opportunities with explicit Chile signal', () => {
    const quality = evaluateIngestionQuality(
      makeRaw({
        title: 'Programa agrícola para Chile y Perú',
        institution: 'IICA',
        description: 'Cooperación técnica orientada a productores de Chile.',
        ambito: 'Internacional',
      }),
    );

    expect(quality.chileEligibility).toBe('eligible');
    expect(quality.publishable).toBe(true);
  });

  it('flags mojibake characters in source text', () => {
    const quality = evaluateIngestionQuality(
      makeRaw({
        title: 'DISE�AR Y EJECUTAR DOS EVENTOS',
      }),
    );

    expect(quality.qualityFlags).toContain('text_encoding_mojibake');
    expect(quality.qualityScore).toBeLessThan(100);
  });
});
