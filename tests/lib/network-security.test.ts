/**
 * @jest-environment node
 */

jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

import { fetchPublicUrl, isAllowedPublicHttpUrl, isBlockedHost, verifyHostnameResolvesToPublicIps } from '@/lib/utils/network-security';

const mockedLookup = require('dns/promises').lookup as jest.Mock;

describe('network security helpers', () => {
  beforeEach(() => {
    mockedLookup.mockReset();
    jest.restoreAllMocks();
  });

  it('blocks private IPv6 addresses', () => {
    expect(isBlockedHost('::1')).toBe(true);
    expect(isBlockedHost('fc00::1')).toBe(true);
    expect(isBlockedHost('fd12:3456:789a::1')).toBe(true);
    expect(isBlockedHost('fe80::1')).toBe(true);
  });

  it('rejects URLs that target blocked hosts', () => {
    expect(isAllowedPublicHttpUrl('http://127.0.0.1/private')).toBe(false);
    expect(isAllowedPublicHttpUrl('http://[::1]/private')).toBe(false);
    expect(isAllowedPublicHttpUrl('https://metadata.google.internal/path')).toBe(false);
  });

  it('verifies public hostnames without throwing', async () => {
    mockedLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
    await expect(verifyHostnameResolvesToPublicIps('example.com')).resolves.toBe(true);
  });

  it('blocks IPv4-mapped loopback addresses', () => {
    expect(isBlockedHost('::ffff:127.0.0.1')).toBe(true);
    expect(isBlockedHost('::ffff:7f00:1')).toBe(true);
  });

  it('validates every redirect destination', async () => {
    mockedLookup
      .mockResolvedValueOnce([{ address: '93.184.216.34', family: 4 }])
      .mockResolvedValueOnce([{ address: '127.0.0.1', family: 4 }]);
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(null, {
      status: 302,
      headers: { location: 'http://127.0.0.1/private' },
    }));

    await expect(fetchPublicUrl('https://example.com/start')).rejects.toThrow(/not allowed|private\/internal/);
  });
});
