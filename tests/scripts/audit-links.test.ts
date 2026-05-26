/**
 * @jest-environment node
 */

import { checkExternal, parseHrefs } from '../../scripts/audit-links';

describe('audit-links parser', () => {
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

describe('audit-links external checker', () => {
  it('retries check-link api on 429 and eventually succeeds', async () => {
    const fetchMock = jest
      .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Intente nuevamente más tarde.' }),
          { status: 429, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            isValid: true,
            status: 200,
            reason: 'ok',
            redirectedToHome: false,
            originalIsHomepage: false,
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );

    const result = await checkExternal('https://iica.int/es/countries/chile-es/', {
      checkLinkBaseUrl: 'https://example.test',
      fetcher: fetchMock,
      maxAttempts: 2,
      retryDelayMs: 0,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.classification).toBe('ok');
    expect(result.reason).toBe('ok');
  });

  it('returns a hard failure after exhausting retries on 429', async () => {
    const fetchMock = jest
      .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Intente nuevamente más tarde.' }),
          { status: 429, headers: { 'content-type': 'application/json' } },
        ),
      );

    const result = await checkExternal('https://iica.int/es/countries/chile-es/', {
      checkLinkBaseUrl: 'https://example.test',
      fetcher: fetchMock,
      maxAttempts: 3,
      retryDelayMs: 0,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(429);
    expect(result.reason).toBe('check_api_rate_limited');
    expect(result.classification).toBe('invalid');
  });
});
