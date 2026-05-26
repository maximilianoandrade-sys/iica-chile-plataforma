/**
 * @jest-environment node
 */

describe('audit-links parser', () => {
  function parseHrefs(html: string): string[] {
    return Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi), (m) => m[1]);
  }

  it('extracts href values only from anchor tags', () => {
    const html = [
      '<html>',
      '<head><link rel="dns-prefetch" href="https://www.google-analytics.com"></head>',
      '<body>',
      '<a href="https://example.com/path">Example</a>',
      '<div href="https://should-not-match.test">No anchor</div>',
      '<a class="btn" data-x="1" href="/relative">Relative</a>',
      '</body>',
      '</html>',
    ].join('');

    expect(parseHrefs(html)).toEqual(['https://example.com/path', '/relative']);
  });

  it('treats project detail paths as skippable by default policy', () => {
    const pages = [
      'https://iica-chile-plataforma.vercel.app/',
      'https://iica-chile-plataforma.vercel.app/about',
      'https://iica-chile-plataforma.vercel.app/proyecto/123',
    ];

    const filtered = pages.filter((raw) => {
      const pathname = new URL(raw).pathname;
      return !pathname.startsWith('/proyecto/');
    });

    expect(filtered).toEqual([
      'https://iica-chile-plataforma.vercel.app/',
      'https://iica-chile-plataforma.vercel.app/about',
    ]);
  });
});
