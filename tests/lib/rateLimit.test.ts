import { getRateLimitIdentifier } from '@/lib/utils/rateLimit';

function requestWithHeaders(values: Record<string, string>) {
  const headers = new Map(Object.entries(values));
  return { headers: { get: (name: string) => headers.get(name.toLowerCase()) ?? null } };
}

describe('rate limit client identity', () => {
  const originalHeader = process.env.TRUSTED_PROXY_IP_HEADER;

  afterEach(() => {
    if (originalHeader === undefined) delete process.env.TRUSTED_PROXY_IP_HEADER;
    else process.env.TRUSTED_PROXY_IP_HEADER = originalHeader;
  });

  it('prefiere la identidad entregada por el runtime y no headers falsificados', () => {
    delete process.env.TRUSTED_PROXY_IP_HEADER;
    const request = requestWithHeaders({ 'x-forwarded-for': '203.0.113.10', 'x-real-ip': '198.51.100.20' });
    Object.defineProperty(request, 'ip', { value: '192.0.2.40' });

    expect(getRateLimitIdentifier(request, 'api')).toBe('api:192.0.2.40');
  });

  it('solo usa un header reenviado cuando el despliegue lo declara confiable', () => {
    process.env.TRUSTED_PROXY_IP_HEADER = 'x-vercel-forwarded-for';
    const request = requestWithHeaders({
      'x-vercel-forwarded-for': '192.0.2.41',
      'x-forwarded-for': '198.51.100.20',
    });

    expect(getRateLimitIdentifier(request, 'api')).toBe('api:192.0.2.41');
  });

  it('no acepta x-forwarded-for arbitrario por defecto', () => {
    delete process.env.TRUSTED_PROXY_IP_HEADER;
    const request = requestWithHeaders({ 'x-forwarded-for': '203.0.113.10' });

    expect(getRateLimitIdentifier(request, 'api')).toBe('api:unknown');
  });
});