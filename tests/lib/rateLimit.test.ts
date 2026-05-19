/**
 * @jest-environment node
 */
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

describe('checkRateLimit', () => {
  it('permite requests dentro del límite', () => {
    const id = `test-${Date.now()}`;
    const config = { maxRequests: 3, windowSizeSeconds: 60 };

    const r1 = checkRateLimit(id, config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(id, config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(id, config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('bloquea requests que exceden el límite', () => {
    const id = `test-block-${Date.now()}`;
    const config = { maxRequests: 2, windowSizeSeconds: 60 };

    checkRateLimit(id, config);
    checkRateLimit(id, config);
    const r3 = checkRateLimit(id, config);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });
});

describe('getClientIp', () => {
  it('extrae IP de x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('usa fallback a x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.8.7.6' },
    });
    expect(getClientIp(req)).toBe('9.8.7.6');
  });

  it('retorna "unknown" sin headers de IP', () => {
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });
});
