/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockLookup = jest.fn();

jest.mock('dns/promises', () => ({
  lookup: (...args: unknown[]) => mockLookup(...args),
}));

describe('/api/check-link response envelope', () => {
  beforeEach(() => {
    mockLookup.mockReset();
  });

  it('returns wrapped error when url query param is missing', async () => {
    const { GET } = await import('@/app/api/check-link/route');
    const req = new NextRequest('http://localhost/api/check-link');

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(String(json.error)).toContain('URL parameter is required');
  });

  it('returns wrapped error for disallowed localhost target', async () => {
    const { GET } = await import('@/app/api/check-link/route');
    const req = new NextRequest('http://localhost/api/check-link?url=http://localhost/test');

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(String(json.error)).toContain('URL not allowed');
  });

  it('returns wrapped success payload for valid reachable url', async () => {
    mockLookup.mockResolvedValue({ address: '93.184.216.34' });

    const originalFetch = global.fetch;
    const fetchMock = jest
      .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
      .mockResolvedValue(new Response('', { status: 200, statusText: 'OK' }));
    global.fetch = fetchMock as unknown as typeof fetch;

    try {
      const { GET } = await import('@/app/api/check-link/route');
      const req = new NextRequest('http://localhost/api/check-link?url=https://example.com/notice/123');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(typeof json.data.isValid).toBe('boolean');
      expect(json.data.url).toBe('https://example.com/notice/123');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('returns wrapped error when network fetch fails', async () => {
    mockLookup.mockResolvedValue({ address: '93.184.216.34' });

    const originalFetch = global.fetch;
    const fetchMock = jest
      .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
      .mockRejectedValue(new Error('socket hang up'));
    global.fetch = fetchMock as unknown as typeof fetch;

    try {
      const { GET } = await import('@/app/api/check-link/route');
      const req = new NextRequest('http://localhost/api/check-link?url=https://example.com/notice/999');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(502);
      expect(json.ok).toBe(false);
      expect(String(json.error)).toContain('Error de red verificando enlace');
      expect(json.data?.isValid).toBe(false);
      expect(json.data?.reason).toBe('network_error');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
