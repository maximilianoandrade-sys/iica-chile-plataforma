import {
  dedupeExternalProjects,
  runExternalSearch,
  type ExternalProvider,
} from '@/lib/search/external/orchestrator';

describe('dedupeExternalProjects', () => {
  it('deduplicates by url and normalized title/institution', () => {
    const result = dedupeExternalProjects([
      {
        id: 1,
        sourceId: 'linkedin_public:1',
        nombre: 'Convocatoria Riego',
        institucion: 'INDAP',
        monto: 0,
        fecha_cierre: '2099-12-31',
        estado: 'Activa',
        categoria: 'Convocatoria',
        url_bases: 'https://a.cl',
      },
      {
        id: 2,
        sourceId: 'linkedin_public:2',
        nombre: 'Convocatoria Riego',
        institucion: 'INDAP',
        monto: 0,
        fecha_cierre: '2099-12-31',
        estado: 'Activa',
        categoria: 'Convocatoria',
        url_bases: 'https://a.cl',
      },
      {
        id: 3,
        sourceId: 'linkedin_public:3',
        nombre: 'Convocatoria Riego',
        institucion: 'INDAP',
        monto: 0,
        fecha_cierre: '2099-12-31',
        estado: 'Activa',
        categoria: 'Convocatoria',
        url_bases: 'https://b.cl',
      },
    ]);

    expect(result).toHaveLength(2);
  });
});

describe('runExternalSearch', () => {
  it('returns degraded true when one provider fails', async () => {
    const okProvider: ExternalProvider = {
      id: 'linkedin_public',
      async search() {
        return [
          {
            id: 1,
            sourceId: 'linkedin_public:ok-1',
            nombre: 'A',
            institucion: 'B',
            monto: 0,
            fecha_cierre: '2099-12-31',
            estado: 'Activa',
            categoria: 'Convocatoria',
            url_bases: 'https://a.cl',
          },
        ];
      },
    };

    const badProvider: ExternalProvider = {
      id: 'linkedin_public',
      async search() {
        throw new Error('timeout');
      },
    };

    const result = await runExternalSearch([okProvider, badProvider], { query: 'riego' });
    expect(result.degraded).toBe(true);
    expect(result.projects.length).toBeGreaterThan(0);
  });
});
