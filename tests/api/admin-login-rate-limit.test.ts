/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

function makeRequest(password: string, ip: string): NextRequest {
  return new NextRequest('http://localhost/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify({ password }),
  });
}

describe('/api/admin/login rate limit', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_PASSWORD: 'correct-password',
      ADMIN_SESSION_SECRET: 'secret12345678',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('blocks repeated failed attempts with 429', async () => {
    const { POST } = await import('@/app/api/admin/login/route');
    const ip = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;

    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest('wrong-password', ip));
      expect(res.status).toBe(401);
    }

    const blocked = await POST(makeRequest('wrong-password', ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });
});
