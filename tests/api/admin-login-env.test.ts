/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { _resetEnvCache } from '@/lib/utils/env';

function makeRequest(password: string): NextRequest {
  return new NextRequest('http://localhost/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '203.0.113.100',
    },
    body: JSON.stringify({ password }),
  });
}

describe('/api/admin/login env validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://localhost:5432/test',
      ADMIN_PASSWORD: 'correct-password',
      ADMIN_SESSION_SECRET: 'secret12345678',
      NODE_ENV: 'test',
    };
    _resetEnvCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    _resetEnvCache();
    jest.resetModules();
  });

  it('rechaza login cuando falta DATABASE_URL en la configuración validada', async () => {
    delete process.env.DATABASE_URL;
    _resetEnvCache();

    const { POST } = await import('@/app/api/admin/login/route');

    const res = await POST(makeRequest('whatever'));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(String(json.error)).toContain('server config error');
  });

  it('rechaza login cuando falta ADMIN_PASSWORD', async () => {
    delete process.env.ADMIN_PASSWORD;
    _resetEnvCache();
    const { POST } = await import('@/app/api/admin/login/route');

    const res = await POST(makeRequest('whatever'));
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(String(json.error)).toContain('no autorizado');
  });
});
