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

function makeRequest(body: Record<string, unknown>, token?: string): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) {
    headers.cookie = `admin-token=${token}`;
  }
  return new NextRequest('http://localhost/api/admin/discoveries/bulk/action', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('/api/admin/discoveries/bulk/action', () => {
  const originalEnv = process.env;
  const secret = 'bulk-secret-12345678';

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

  it('rejects requests without auth cookie', async () => {
    const { POST } = await import('@/app/api/admin/discoveries/bulk/action/route');
    const response = await POST(makeRequest({ ids: [1, 2], action: 'approve' }));

    expect(response.status).toBe(401);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('returns 500 when update fails', async () => {
    mockUpdateMany.mockRejectedValueOnce(new Error('db fail'));
    const token = makeToken(secret);
    const { POST } = await import('@/app/api/admin/discoveries/bulk/action/route');

    const response = await POST(makeRequest({ ids: [1], action: 'approve' }, token));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
  });

  it('approves ids in batch and returns standardized envelope', async () => {
    mockUpdateMany.mockResolvedValue({ count: 2 });
    const token = makeToken(secret);
    const { POST } = await import('@/app/api/admin/discoveries/bulk/action/route');

    const response = await POST(makeRequest({ ids: [1, 2], action: 'approve' }, token));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data.updated).toBe(2);
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: [1, 2] } },
      }),
    );
  });
});
