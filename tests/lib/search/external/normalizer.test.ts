import {
  normalizeLinkedInPublicRecord,
  parseMontoFromText,
} from '@/lib/search/external/normalizer';

describe('parseMontoFromText', () => {
  it('parses CLP-like amounts from text', () => {
    expect(parseMontoFromText('Monto estimado: $1.250.000 CLP')).toBe(1250000);
  });

  it('returns 0 when amount is unknown', () => {
    expect(parseMontoFromText('Consultar bases')).toBe(0);
  });
});

describe('normalizeLinkedInPublicRecord', () => {
  it('normalizes valid external records to project-like shape', () => {
    const item = normalizeLinkedInPublicRecord(
      {
        id: 'ln-1',
        title: 'Convocatoria de riego para cooperativas',
        organization: 'INDAP',
        url: 'https://www.linkedin.com/posts/example-post',
        snippet: 'Fondo regional de apoyo agrícola con cierre el 2026-12-31.',
        postedAt: '2026-05-20',
        deadlineText: '2026-12-31',
        amountText: '$500000',
        regionText: 'Maule',
      },
      10001
    );

    expect(item).not.toBeNull();
    expect(item?.nombre).toContain('Convocatoria');
    expect(item?.institucion).toBe('INDAP');
    expect(item?.ambito).toBe('Regional');
    expect(item?.region).toBe('Maule');
    expect(item?.sourceId).toBe('linkedin_public:ln-1');
    expect(item?.url_bases).toContain('linkedin.com');
  });

  it('drops invalid url records', () => {
    const item = normalizeLinkedInPublicRecord(
      {
        id: 'ln-2',
        title: 'Convocatoria',
        organization: 'INDAP',
        url: 'notaurl',
        snippet: 'x',
        postedAt: '2026-05-20',
      },
      10001
    );

    expect(item).toBeNull();
  });
});
