/**
 * @jest-environment node
 */
import { GET } from '@/app/api/cron/check-updates/route';
import { NextRequest } from 'next/server';
import { _resetEnvCache } from '@/lib/utils/env';

// Mock heavy dependencies so GET doesn't do real work after auth passes
jest.mock('@/lib/data', () => ({ getProjects: jest.fn().mockResolvedValue([]) }));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {} }));
jest.mock('@/lib/ingestion/embeddings', () => ({
  embedText: jest.fn(),
  projectToEmbeddingText: jest.fn(),
  toPgVector: jest.fn(),
}));
jest.mock('@/lib/kvStore', () => ({ getKVStore: jest.fn().mockResolvedValue({ get: jest.fn(), set: jest.fn() }) }));
jest.mock('@/lib/email', () => ({ sendEmail: jest.fn() }));

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/cron/check-updates', {
    method: 'GET',
    headers,
  });
}

describe('Auth del cron', () => {
  const REAL_SECRET = 'test-cron-secret-xyz';

  beforeAll(() => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/test';
    process.env.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'test-session-secret';
    process.env.CRON_SECRET = REAL_SECRET;
    _resetEnvCache();
  });

  afterAll(() => {
    _resetEnvCache();
  });

  it('rechaza requests sin autenticación', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('rechaza requests con header x-vercel-cron pero sin secreto válido', async () => {
    const res = await GET(makeRequest({ 'x-vercel-cron': '1' }));
    expect(res.status).toBe(401);
  });

  it('acepta requests con Bearer token válido', async () => {
    const res = await GET(makeRequest({ authorization: `Bearer ${REAL_SECRET}` }));
    expect(res.status).not.toBe(401);
  });

  it('rechaza requests con Bearer token incorrecto', async () => {
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-secret' }));
    expect(res.status).toBe(401);
  });
});
