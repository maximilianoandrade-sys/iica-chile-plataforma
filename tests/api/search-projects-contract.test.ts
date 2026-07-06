/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockHybridSearch = jest.fn();
const mockFetchMercadoPublicoLive = jest.fn();
const mockRunExternalSearch = jest.fn();

jest.mock('@/lib/searchHybrid', () => ({
  hybridSearch: (...args: unknown[]) => mockHybridSearch(...args),
}));

jest.mock('@/lib/ingestion/scrapers/mercado-publico', () => ({
  fetchMercadoPublicoLive: (...args: unknown[]) => mockFetchMercadoPublicoLive(...args),
}));

jest.mock('@/lib/search/external/orchestrator', () => ({
  runExternalSearch: (...args: unknown[]) => mockRunExternalSearch(...args),
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/search-projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/search-projects request contract', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: originalEnv.DATABASE_URL || 'postgresql://localhost/test',
      ADMIN_SESSION_SECRET: originalEnv.ADMIN_SESSION_SECRET || 'secret12345678',
      MERCADO_PUBLICO_TICKET: 'test-ticket',
      SEARCH_EXTERNAL_ENABLED: 'true',
    };

    mockHybridSearch.mockResolvedValue({ projects: [], mode: 'all' });
    mockFetchMercadoPublicoLive.mockResolvedValue([]);
    mockRunExternalSearch.mockResolvedValue({
      projects: [],
      providers: ['linkedin_public'],
      providerStats: [
        {
          provider: 'linkedin_public',
          success: true,
          resultCount: 0,
          durationMs: 20,
        },
      ],
      degraded: false,
    });
  });

  afterEach(() => {
    jest.resetModules();
    mockHybridSearch.mockReset();
    mockFetchMercadoPublicoLive.mockReset();
    mockRunExternalSearch.mockReset();
    process.env = originalEnv;
  });

  it('accepts legacy payload and returns wrapped success response', async () => {
    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(makeRequest({ query: 'riego', ambito: 'all' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.data.results)).toBe(true);
    expect(typeof json.data.meta.mode).toBe('string');
    expect(mockHybridSearch).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'riego', ambito: 'all', limit: 50 })
    );
  });

  it('rejects invalid sourceMode with 400', async () => {
    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(makeRequest({ query: 'riego', sourceMode: 'foo' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(String(json.error)).toContain('internal');
  });

  it('supports sourceMode=external with providers and metadata', async () => {
    mockRunExternalSearch.mockResolvedValue({
      projects: [
        {
          id: 1001,
          sourceId: 'linkedin_public:x-1',
          nombre: 'Convocatoria externa',
          institucion: 'INDAP',
          monto: 0,
          fecha_cierre: '2099-12-31',
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://linkedin.com/posts/1',
          ambito: 'Nacional',
        },
      ],
      providers: ['linkedin_public'],
      providerStats: [
        {
          provider: 'linkedin_public',
          success: true,
          resultCount: 1,
          durationMs: 33,
        },
      ],
      degraded: true,
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(
      makeRequest({
        query: 'riego',
        sourceMode: 'external',
        providers: ['linkedin_public'],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.meta.mode).toBe('external');
    expect(json.data.meta.external_count).toBe(1);
    expect(json.data.meta.providers).toEqual(['linkedin_public']);
    expect(json.data.meta.provider_stats).toEqual([
      {
        provider: 'linkedin_public',
        success: true,
        resultCount: 1,
        durationMs: 33,
      },
    ]);
    expect(json.data.meta.degraded).toBe(true);
    expect(mockHybridSearch).not.toHaveBeenCalled();
    expect(mockRunExternalSearch).toHaveBeenCalled();
  });

  it('supports sourceMode=mixed by merging internal + external + mercado publico', async () => {
    mockHybridSearch.mockResolvedValue({
      mode: 'hybrid',
      projects: [
        {
          id: 1,
          nombre: 'Interno',
          institucion: 'CORFO',
          monto: 200000,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://example.com/internal',
        },
      ],
    });

    mockRunExternalSearch.mockResolvedValue({
      projects: [
        {
          id: 1002,
          sourceId: 'linkedin_public:x-2',
          nombre: 'Externo',
          institucion: 'INDAP',
          monto: 0,
          fecha_cierre: '2099-12-31',
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://linkedin.com/posts/2',
        },
      ],
      providers: ['linkedin_public'],
      providerStats: [
        {
          provider: 'linkedin_public',
          success: true,
          resultCount: 1,
          durationMs: 40,
        },
      ],
      degraded: false,
    });

    mockFetchMercadoPublicoLive.mockResolvedValue([
      {
        codigoExterno: '123',
        title: 'MP',
        institution: 'Gobierno',
        url: 'https://mercadopublico.cl/x',
        deadline: null,
        isLive: true,
      },
    ]);

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(
      makeRequest({ query: 'riego', sourceMode: 'mixed', providers: ['linkedin_public'] })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.meta.mode).toBe('mixed');
    expect(json.data.meta.hybrid_count).toBe(1);
    expect(json.data.meta.external_count).toBe(1);
    expect(json.data.meta.mercado_publico_count).toBe(1);
    expect(json.data.meta.provider_stats).toEqual([
      {
        provider: 'linkedin_public',
        success: true,
        resultCount: 1,
        durationMs: 40,
      },
    ]);
    expect(json.data.results).toHaveLength(3);
  });

  it('uses env default source mode when request omits sourceMode', async () => {
    process.env.SEARCH_SOURCE_MODE_DEFAULT = 'mixed';

    mockHybridSearch.mockResolvedValue({
      mode: 'hybrid',
      projects: [],
    });
    mockRunExternalSearch.mockResolvedValue({
      projects: [],
      providers: ['linkedin_public'],
      providerStats: [
        {
          provider: 'linkedin_public',
          success: true,
          resultCount: 0,
          durationMs: 10,
        },
      ],
      degraded: false,
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(makeRequest({ query: 'riego' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.meta.mode).toBe('mixed');
    expect(json.data.meta.provider_stats).toEqual([
      {
        provider: 'linkedin_public',
        success: true,
        resultCount: 0,
        durationMs: 10,
      },
    ]);
    expect(mockRunExternalSearch).toHaveBeenCalled();
  });

  it('falls back to internal when external search is disabled by feature flag', async () => {
    process.env.SEARCH_EXTERNAL_ENABLED = 'false';

    mockHybridSearch.mockResolvedValue({
      mode: 'all',
      projects: [
        {
          id: 7,
          nombre: 'Solo interno',
          institucion: 'FIA',
          monto: 120000,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://example.com/internal-only',
        },
      ],
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(
      makeRequest({ query: 'riego', sourceMode: 'external', providers: ['linkedin_public'] })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.meta.mode).toBe('all');
    expect(json.data.meta.degraded).toBe(true);
    expect(json.data.meta.degraded_reason).toContain('SEARCH_EXTERNAL_ENABLED');
    expect(json.data.meta.provider_stats).toEqual([]);
    expect(mockRunExternalSearch).not.toHaveBeenCalled();
  });

  it('falls back to internal when provider is disabled by kill-switch', async () => {
    process.env.SEARCH_EXTERNAL_DISABLED_PROVIDERS = 'linkedin_public';

    mockHybridSearch.mockResolvedValue({ mode: 'all', projects: [] });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(
      makeRequest({ query: 'riego', sourceMode: 'external', providers: ['linkedin_public'] })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.meta.mode).toBe('all');
    expect(json.data.meta.degraded).toBe(true);
    expect(json.data.meta.degraded_reason).toContain('disabled');
    expect(json.data.meta.provider_stats).toEqual([]);
    expect(mockRunExternalSearch).not.toHaveBeenCalled();
  });

  it('defaults to chile_strict and hides non-Chile international opportunities', async () => {
    mockHybridSearch.mockResolvedValue({
      mode: 'hybrid',
      projects: [
        {
          id: 11,
          nombre: 'Fondo de riego Maule',
          institucion: 'INDAP',
          monto: 300000,
          publishable: true,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://example.com/chile',
          ambito: 'Nacional',
        },
        {
          id: 12,
          nombre: 'Audio devices tender Tanzania',
          institucion: 'UNGM',
          monto: 0,
          publishable: true,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Licitación',
          url_bases: 'https://example.com/tanzania',
          ambito: 'Internacional',
        },
      ],
    });

    mockRunExternalSearch.mockResolvedValue({
      projects: [
        {
          id: 1003,
          sourceId: 'linkedin_public:x-3',
          nombre: 'Programa agrícola para Chile y Perú',
          institucion: 'IICA',
          monto: 0,
          publishable: true,
          fecha_cierre: '2099-12-31',
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://linkedin.com/posts/3',
          ambito: 'Internacional',
        },
        {
          id: 1004,
          sourceId: 'linkedin_public:x-4',
          nombre: 'Procurement kit for Nepal',
          institucion: 'UNGM',
          monto: 0,
          publishable: true,
          fecha_cierre: '2099-12-31',
          estado: 'Activa',
          categoria: 'Licitación',
          url_bases: 'https://linkedin.com/posts/4',
          ambito: 'Internacional',
        },
      ],
      providers: ['linkedin_public'],
      providerStats: [
        {
          provider: 'linkedin_public',
          success: true,
          resultCount: 2,
          durationMs: 50,
        },
      ],
      degraded: false,
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(makeRequest({ query: 'riego', sourceMode: 'mixed' }));
    const json = await res.json();
    const payload = json.data;

    expect(res.status).toBe(200);
    expect(payload.meta.relevance_mode).toBe('chile_strict');
    expect(payload.results.map((r: { nombre: string }) => r.nombre)).toEqual(
      expect.arrayContaining(['Fondo de riego Maule', 'Programa agrícola para Chile y Perú'])
    );
    expect(payload.results.map((r: { nombre: string }) => r.nombre)).not.toEqual(
      expect.arrayContaining(['Audio devices tender Tanzania', 'Procurement kit for Nepal'])
    );
    expect(payload.meta.hidden_by_relevance).toBeGreaterThanOrEqual(2);
  });

  it('supports relevanceMode=all to include international opportunities', async () => {
    mockHybridSearch.mockResolvedValue({
      mode: 'hybrid',
      projects: [
        {
          id: 21,
          nombre: 'Procurement kit for Nepal',
          institucion: 'UNGM',
          monto: 0,
          publishable: true,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Licitación',
          url_bases: 'https://example.com/nepal',
          ambito: 'Internacional',
        },
      ],
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(makeRequest({ query: 'riego', relevanceMode: 'all' }));
    const json = await res.json();
    const payload = json.data;

    expect(res.status).toBe(200);
    expect(payload.meta.relevance_mode).toBe('all');
    expect(payload.results).toHaveLength(1);
    expect(payload.results[0].nombre).toBe('Procurement kit for Nepal');
    expect(payload.meta.hidden_by_relevance).toBe(0);
  });

  it('applies ambito filter after mixed merge for all sources', async () => {
    mockHybridSearch.mockResolvedValue({
      mode: 'hybrid',
      projects: [
        {
          id: 31,
          nombre: 'Nacional CORFO',
          institucion: 'CORFO',
          monto: 150000,
          publishable: true,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://example.com/corfo',
          ambito: 'Nacional',
        },
        {
          id: 32,
          nombre: 'Internacional Chile GEF',
          institucion: 'GEF',
          monto: 0,
          publishable: true,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://example.com/gef',
          ambito: 'Internacional',
        },
      ],
    });

    mockRunExternalSearch.mockResolvedValue({
      projects: [
        {
          id: 1005,
          sourceId: 'linkedin_public:x-5',
          nombre: 'Externo nacional',
          institucion: 'INDAP',
          monto: 0,
          publishable: true,
          fecha_cierre: '2099-12-31',
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://linkedin.com/posts/5',
          ambito: 'Nacional',
        },
        {
          id: 1006,
          sourceId: 'linkedin_public:x-6',
          nombre: 'Externo internacional para Chile',
          institucion: 'IICA',
          monto: 0,
          publishable: true,
          fecha_cierre: '2099-12-31',
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://linkedin.com/posts/6',
          ambito: 'Internacional',
        },
      ],
      providers: ['linkedin_public'],
      providerStats: [
        {
          provider: 'linkedin_public',
          success: true,
          resultCount: 2,
          durationMs: 40,
        },
      ],
      degraded: false,
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(makeRequest({ query: 'riego', sourceMode: 'mixed', ambito: 'Internacional' }));
    const json = await res.json();
    const payload = json.data;

    expect(res.status).toBe(200);
    expect(payload.results).toHaveLength(2);
    expect(payload.results.every((r: { ambito?: string }) => r.ambito === 'Internacional')).toBe(true);
  });

  it('hides non-publishable internal records and reports hidden_by_quality', async () => {
    mockHybridSearch.mockResolvedValue({
      mode: 'hybrid',
      projects: [
        {
          id: 41,
          nombre: 'Convocatoria elegible Chile',
          institucion: 'INDAP',
          monto: 120000,
          publishable: true,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://example.com/eligible',
          ambito: 'Nacional',
        },
        {
          id: 42,
          nombre: 'Compra de audio Tanzania',
          institucion: 'UNGM',
          monto: 0,
          publishable: false,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Licitación',
          url_bases: 'https://example.com/tanzania-audio',
          ambito: 'Internacional',
        },
      ],
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(makeRequest({ query: 'riego' }));
    const json = await res.json();
    const payload = json.data;

    expect(res.status).toBe(200);
    expect(payload.results).toHaveLength(1);
    expect(payload.results[0].nombre).toBe('Convocatoria elegible Chile');
    expect(payload.meta.hidden_by_quality).toBe(1);
  });

  it('disables quality hiding when SEARCH_QUALITY_STRICT_ENABLED=false', async () => {
    process.env.SEARCH_QUALITY_STRICT_ENABLED = 'false';

    mockHybridSearch.mockResolvedValue({
      mode: 'hybrid',
      projects: [
        {
          id: 51,
          nombre: 'Convocatoria elegible Chile',
          institucion: 'INDAP',
          monto: 120000,
          publishable: true,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Convocatoria',
          url_bases: 'https://example.com/eligible',
          ambito: 'Nacional',
        },
        {
          id: 52,
          nombre: 'No publishable record',
          institucion: 'UNGM',
          monto: 0,
          publishable: false,
          fecha_cierre: new Date('2099-12-31T00:00:00.000Z'),
          estado: 'Activa',
          categoria: 'Licitación',
          url_bases: 'https://example.com/non-publishable',
          ambito: 'Internacional',
        },
      ],
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(makeRequest({ query: 'riego', relevanceMode: 'all' }));
    const json = await res.json();
    const payload = json.data;

    expect(res.status).toBe(200);
    expect(payload.results).toHaveLength(2);
    expect(payload.meta.hidden_by_quality).toBe(0);
    expect(payload.meta.relevance_mode).toBe('all');
  });

  it('applies pagination and filters in internal mode', async () => {
    mockHybridSearch.mockResolvedValue({
      mode: 'hybrid',
      total: 87,
      projects: [],
    });

    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(
      makeRequest({
        query: 'riego',
        sourceMode: 'internal',
        page: 2,
        pageSize: 20,
        sort: 'amount_desc',
        institution: 'CORFO,FIA',
        region: 'Biobío,Metropolitana',
        category: 'Riego,Innovacion',
        estado: 'Abierta',
        minAmount: 100,
        maxAmount: 200,
        postedFrom: '2026-01-01',
        postedTill: '2026-12-31',
        includeMercadoPublico: false,
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.meta.page).toBe(2);
    expect(json.data.meta.page_size).toBe(20);
    expect(json.data.meta.filtered_total).toBe(87);

    expect(mockHybridSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'riego',
        offset: 20,
        limit: 20,
        sort: 'amount_desc',
        selectedInstitutions: ['CORFO', 'FIA'],
        selectedRegions: ['Biobío', 'Metropolitana'],
        selectedCategories: ['Riego', 'Innovacion'],
        estado: 'Abierta',
        minAmount: 100,
        maxAmount: 200,
        postedFrom: '2026-01-01',
        postedTill: '2026-12-31',
      })
    );
    expect(mockFetchMercadoPublicoLive).not.toHaveBeenCalled();
  });

  it('rejects invalid posted date range with 400', async () => {
    const { POST } = await import('@/app/api/search-projects/route');
    const res = await POST(
      makeRequest({
        query: 'riego',
        postedFrom: '2026-12-31',
        postedTill: '2026-01-01',
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(String(json.error)).toContain('postedTill');
  });
});
