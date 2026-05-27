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
        estado: 'Abierta',
        minAmount: 100,
        maxAmount: 200,
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
        estado: 'Abierta',
        minAmount: 100,
        maxAmount: 200,
      })
    );
    expect(mockFetchMercadoPublicoLive).not.toHaveBeenCalled();
  });
});
