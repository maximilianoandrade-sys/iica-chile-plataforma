import {
  EXTERNAL_PROVIDER_IDS,
  SEARCH_SOURCE_MODES,
  isExternalProviderId,
  isSearchSourceMode,
} from '@/lib/search/contracts';

describe('search contracts', () => {
  it('exposes supported source modes', () => {
    expect(SEARCH_SOURCE_MODES).toEqual(['internal', 'external', 'mixed']);
  });

  it('validates source mode values', () => {
    expect(isSearchSourceMode('internal')).toBe(true);
    expect(isSearchSourceMode('external')).toBe(true);
    expect(isSearchSourceMode('mixed')).toBe(true);
    expect(isSearchSourceMode('invalid')).toBe(false);
  });

  it('exposes supported external provider ids', () => {
    expect(EXTERNAL_PROVIDER_IDS).toEqual(['linkedin_public']);
  });

  it('validates external provider ids', () => {
    expect(isExternalProviderId('linkedin_public')).toBe(true);
    expect(isExternalProviderId('linkedin')).toBe(false);
  });
});
