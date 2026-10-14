const URL_OVERRIDES: Array<{ match: RegExp; target: string }> = [
  { match: /^https?:\/\/www\.undp\.org\/es\/chile\/participa\/?$/i, target: 'https://www.undp.org/es/chile' },
  { match: /^https?:\/\/www\.sag\.gob\.cl\/ambitos-de-accion\/sustentabilidad-agroambiental\/?$/i, target: 'https://www.sag.gob.cl/' },
  { match: /^https?:\/\/www\.ifc\.org\/en\/what-we-do\/sector-expertise\/agribusiness\/?$/i, target: 'https://www.ifc.org/en/what-we-do' },
  { match: /^https?:\/\/www\.unep\.org\/resources\/small-grants\/mountains-adapt\/?$/i, target: 'https://www.unep.org/en/who-we-are/about-us/call-proposals' },
  { match: /^https?:\/\/futurefornature\.org\/?$/i, target: 'https://futurefornature.org/future-for-nature/about/awards/' },
  { match: /^https?:\/\/globalebafund\.org\/grants\/?$/i, target: 'https://globalebafund.org/news/new-calls-for-proposals-informative-webinars/' },
  { match: /^https?:\/\/www\.cnr\.gob\.cl\/concursos-oua\/?$/i, target: 'https://www.cnr.gob.cl/agricultores/concursos-de-riego-y-drenaje/' },
  { match: /^https?:\/\/www\.innovationbridge\.info\/funding\/power-of-diversity\/?$/i, target: 'https://innovationbridge.info/ibportal/opportunities-and-events' },
  { match: /^https?:\/\/(www\.)?iadb\.org\/es\/project-portfolio-search\/?$/i, target: 'https://idbinvest.org/en/projects' },
  { match: /^https?:\/\/(www\.)?iadb\.org\/es\/sectores\/agricultura-y-desarrollo-rural\/resumen\/?$/i, target: 'https://idbinvest.org/en/countries/chile' },
  { match: /^https?:\/\/(www\.)?ifad\.org\/en\/web\/latest\/?$/i, target: 'https://ifad-cofinancing.org/catalogue/' },
];

export function getPreferredProjectUrl(url: string): string {
  if (!url) return url;

  const normalized = url.trim();
  for (const override of URL_OVERRIDES) {
    if (override.match.test(normalized)) {
      return override.target;
    }
  }

  return normalized;
}
