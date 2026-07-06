/**
 * @jest-environment node
 */

jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

import { isAllowedPublicHttpUrl, isBlockedHost, verifyHostnameResolvesToPublicIps } from '@/lib/utils/network-security';

const mockedLookup = require('dns/promises').lookup as jest.Mock;

describe('network security helpers', () => {
  beforeEach(() => {
    mockedLookup.mockReset();
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
});
