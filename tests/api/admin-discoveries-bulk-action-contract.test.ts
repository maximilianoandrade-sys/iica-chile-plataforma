/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { _resetEnvCache } from '@/lib/utils/env';

const mockUpdateMany = jest.fn();

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    project: {
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
  },
}));

function makeToken(secret: string): string {
  const timestamp = Date.now().toString();
  const signature = createHmac('sha256', secret)
    .update(`admin-session:${timestamp}`)
    .digest('hex');
  return `${signature}.${timestamp}`;
}

function makeRequest(body: Record<string, unknown>, token: string): NextRequest {
  return new NextRequest('http://localhost/api/admin/discoveries/bulk/action', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `admin-token=${token}`,
    },
    body: JSON.stringify(body),
  });
}

describe('/api/admin/discoveries/bulk/action contract', () => {
  const originalEnv = process.env;
  const secret = 'bulk-contract-secret-123456';

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    _resetEnvCache();
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://localhost:5432/test',
      ADMIN_SESSION_SECRET: secret,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    _resetEnvCache();
  });

  it('returns 400 for invalid ids payload', async () => {
    const token = makeToken(secret);
    const { POST } = await import('@/app/api/admin/discoveries/bulk/action/route');

    const response = await POST(makeRequest({ ids: [], action: 'approve' }, token));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain('ids inválidos');
  });

  it('returns updated count for discard action', async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });
    const token = makeToken(secret);
    const { POST } = await import('@/app/api/admin/discoveries/bulk/action/route');

    const response = await POST(makeRequest({ ids: [99], action: 'discard' }, token));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data.updated).toBe(1);
  });
});
