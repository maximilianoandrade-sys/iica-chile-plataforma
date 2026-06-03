/**
 * @jest-environment node
 */

import { getPreferredProjectUrl } from '@/lib/urlOverrides';

describe('linkGuardian URL overrides', () => {
  it('maps legacy IADB portfolio URL to accessible projects page', () => {
    expect(getPreferredProjectUrl('https://www.iadb.org/es/project-portfolio-search')).toBe('https://idbinvest.org/en/projects');
  });

  it('maps IFAD latest URL to cofinancing catalogue', () => {
    expect(getPreferredProjectUrl('https://www.ifad.org/en/web/latest')).toBe('https://ifad-cofinancing.org/catalogue/');
  });

  it('keeps unrelated URLs unchanged', () => {
    expect(getPreferredProjectUrl('https://www.fao.org/chile/')).toBe('https://www.fao.org/chile/');
  });
});
