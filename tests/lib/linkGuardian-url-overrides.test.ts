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

  it('maps verified legacy opportunity URLs to current official pages', () => {
    expect(getPreferredProjectUrl('https://www.undp.org/es/chile/participa')).toBe('https://www.undp.org/es/chile');
    expect(getPreferredProjectUrl('https://www.sag.gob.cl/ambitos-de-accion/sustentabilidad-agroambiental')).toBe('https://www.sag.gob.cl/');
    expect(getPreferredProjectUrl('https://www.ifc.org/en/what-we-do/sector-expertise/agribusiness')).toBe('https://www.ifc.org/en/what-we-do');
    expect(getPreferredProjectUrl('https://www.unep.org/resources/small-grants/mountains-adapt')).toBe('https://www.unep.org/en/who-we-are/about-us/call-proposals');
    expect(getPreferredProjectUrl('https://futurefornature.org/')).toBe('https://futurefornature.org/future-for-nature/about/awards/');
    expect(getPreferredProjectUrl('https://globalebafund.org/grants/')).toBe('https://globalebafund.org/news/new-calls-for-proposals-informative-webinars/');
    expect(getPreferredProjectUrl('https://www.cnr.gob.cl/concursos-oua/')).toBe('https://www.cnr.gob.cl/agricultores/concursos-de-riego-y-drenaje/');
    expect(getPreferredProjectUrl('https://www.innovationbridge.info/funding/power-of-diversity')).toBe('https://innovationbridge.info/ibportal/opportunities-and-events');
  });

  it('keeps unrelated URLs unchanged', () => {
    expect(getPreferredProjectUrl('https://www.fao.org/chile/')).toBe('https://www.fao.org/chile/');
  });
});
