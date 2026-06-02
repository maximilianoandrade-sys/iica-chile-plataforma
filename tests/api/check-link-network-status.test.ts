/**
 * @jest-environment node
 */

jest.mock('dns/promises', () => ({
  lookup: jest.fn().mockResolvedValue({ address: '93.184.216.34', family: 4 }),
}));

import { NextRequest } from 'next/server';

describe('/api/check-link network errors', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  it('returns non-200 status when network request fails', async () => {
    const { GET } = await import('@/app/api/check-link/route');
    const req = new NextRequest('http://localhost/api/check-link?url=https://example.com/path/test');

    const res = await GET(req);
    const json = await res.json();
    const payload = json?.data ?? json;

    expect(res.status).toBe(502);
    expect(payload.isValid).toBe(false);
    expect(typeof payload.error).toBe('string');
  });
});
