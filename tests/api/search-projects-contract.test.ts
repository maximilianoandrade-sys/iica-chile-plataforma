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
  beforeEach(() => {
    mockHybridSearch.mockResolvedValue({ projects: [], mode: 'all' });
    mockFetchMercadoPublicoLive.mockResolvedValue([]);
    mockRunExternalSearch.mockResolvedValue({
      projects: [],
      providers: ['linkedin_public'],
      providerStats: [],
      degraded: false,
    });
  });

  afterEach(() => {
    jest.resetModules();
    mockHybridSearch.mockReset();
    mockFetchMercadoPublicoLive.mockReset();
    mockRunExternalSearch.mockReset();
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
      providerStats: [],
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
      providerStats: [],
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
    expect(json.data.results).toHaveLength(3);
  });
});
