import { buildProjectWhere } from '@/lib/searchHybrid';

describe('buildProjectWhere', () => {
  it('always excludes non-publishable projects and applies Chile eligibility in the main mode', () => {
    const where = buildProjectWhere({
      ambito: 'chile',
      selectedInstitutions: [],
      selectedRegions: [],
      selectedCategories: [],
      minAmount: 0,
      maxAmount: Number.POSITIVE_INFINITY,
      includeUnverified: false,
    });

    expect(where.publishable).toBe(true);
    expect(where.chileEligibility).toBe('eligible');
    expect(where.needsReview).toBe(false);
  });

  it('keeps the full catalog eligible for publication when browsing all coverage', () => {
    const where = buildProjectWhere({
      ambito: 'all',
      selectedInstitutions: [],
      selectedRegions: [],
      selectedCategories: [],
      minAmount: 0,
      maxAmount: Number.POSITIVE_INFINITY,
      includeUnverified: true,
    });

    expect(where.publishable).toBe(true);
    expect(where.chileEligibility).toBeUndefined();
    expect(where.needsReview).toBeUndefined();
  });
});