const URL_OVERRIDES: Array<{ match: RegExp; target: string }> = [
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
