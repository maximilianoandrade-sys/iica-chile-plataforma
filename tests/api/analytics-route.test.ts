/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockCheckRateLimit = jest.fn();
const mockGetClientIp = jest.fn();

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIp: (...args: unknown[]) => mockGetClientIp(...args),
}));

describe('/api/analytics route', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockGetClientIp.mockReturnValue('127.0.0.1');
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 59,
      resetAt: Date.now() + 60_000,
    });
  });

  it('GET returns standardized success envelope', async () => {
    const { GET } = await import('@/app/api/analytics/route');

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data.route).toBe('/api/analytics');
    expect(Array.isArray(payload.data.allowedEvents)).toBe(true);
  });

  it('POST accepts allowed events with standardized success envelope', async () => {
    const { POST } = await import('@/app/api/analytics/route');
    const request = new NextRequest('http://localhost/api/analytics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'search', properties: { query: 'riego' } }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
  });

  it('POST rejects unknown events with standardized error envelope', async () => {
    const { POST } = await import('@/app/api/analytics/route');
    const request = new NextRequest('http://localhost/api/analytics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'unknown_event' }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain('Unknown event type');
  });
});
