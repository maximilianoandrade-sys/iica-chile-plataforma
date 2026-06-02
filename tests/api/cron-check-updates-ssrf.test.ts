/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockGetProjects = jest.fn();
const mockPrismaQueryRawUnsafe = jest.fn();
const mockPrismaExecuteRawUnsafe = jest.fn();
const mockSendAlert = jest.fn();
const mockSendEmail = jest.fn();

jest.mock('@/lib/data', () => ({
  getProjects: () => mockGetProjects(),
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $queryRawUnsafe: (...args: unknown[]) => mockPrismaQueryRawUnsafe(...args),
    $executeRawUnsafe: (...args: unknown[]) => mockPrismaExecuteRawUnsafe(...args),
  },
}));

jest.mock('@/lib/kvStore', () => ({
  getKVStore: () => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('@/lib/email', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

jest.mock('@/lib/utils/alerts', () => ({
  sendAlert: (...args: unknown[]) => mockSendAlert(...args),
}));

jest.mock('@/lib/ingestion/embeddings', () => ({
  embedText: jest.fn(),
  projectToEmbeddingText: jest.fn(),
  toPgVector: jest.fn(),
}));

function makeAuthorizedRequest(secret: string): NextRequest {
  return new NextRequest('http://localhost/api/cron/check-updates', {
    method: 'GET',
    headers: {
      authorization: `Bearer ${secret}`,
    },
  });
}

describe('/api/cron/check-updates SSRF protection', () => {
  const originalEnv = process.env;
  const realFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      CRON_SECRET: 'cron-secret-test',
    };

    mockGetProjects.mockResolvedValue({
      ok: true,
      projects: [
        {
          id: 1,
          nombre: 'Internal URL test',
          url_bases: 'http://127.0.0.1/private',
        },
      ],
    });

    mockPrismaQueryRawUnsafe.mockResolvedValue([]);
    mockPrismaExecuteRawUnsafe.mockResolvedValue(0);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: { get: () => null },
      ok: true,
      url: 'https://example.com/x',
    }) as unknown as typeof global.fetch;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = realFetch;
  });

  it('does not fetch blocked internal URLs from DB', async () => {
    const { GET } = await import('@/app/api/cron/check-updates/route');

    const res = await GET(makeAuthorizedRequest('cron-secret-test'));
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data.brokenLinks).toHaveLength(1);
    expect(payload.data.brokenLinks[0].error).toContain('URL not allowed');

    const fetchCalls = (global.fetch as unknown as jest.Mock).mock.calls;
    const anyInternalCall = fetchCalls.some((call) => String(call[0]).includes('127.0.0.1/private'));
    expect(anyInternalCall).toBe(false);
  });
});
