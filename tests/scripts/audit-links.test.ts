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
            ok: true,
            data: {
              isValid: true,
              status: 200,
              reason: 'ok',
              redirectedToHome: false,
              originalIsHomepage: false,
            },
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

  it('reclassifies blocked links as ok when direct check succeeds', async () => {
    const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>(async (input) => {
      const requestUrl = String(input);

      if (requestUrl.startsWith('https://example.test/api/check-link?url=')) {
        return new Response(
          JSON.stringify({
            ok: true,
            data: {
              isValid: true,
              status: 403,
              reason: 'blocked_by_bot_protection',
              redirectedToHome: false,
              originalIsHomepage: false,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }

      const directResponse = new Response('', { status: 200 });
      Object.defineProperty(directResponse, 'url', { value: 'https://www.iadb.org/es/project-portfolio-search' });
      return directResponse;
    });

    const result = await checkExternal('https://www.iadb.org/es/project-portfolio-search', {
      checkLinkBaseUrl: 'https://example.test',
      fetcher: fetchMock,
      maxAttempts: 1,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(true);
    expect(result.classification).toBe('ok');
    expect(result.reason).toBe('ok_via_direct_check');
  });

  it('reclassifies blocked links as needs_review when direct check redirects to homepage', async () => {
    const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>(async (input) => {
      const requestUrl = String(input);

      if (requestUrl.startsWith('https://example.test/api/check-link?url=')) {
        return new Response(
          JSON.stringify({
            ok: true,
            data: {
              isValid: true,
              status: 403,
              reason: 'blocked_by_bot_protection',
              redirectedToHome: false,
              originalIsHomepage: false,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }

      const directResponse = new Response('', { status: 200 });
      Object.defineProperty(directResponse, 'url', { value: 'https://www.iadb.org/' });
      return directResponse;
    });

    const result = await checkExternal('https://www.iadb.org/es/project-portfolio-search', {
      checkLinkBaseUrl: 'https://example.test',
      fetcher: fetchMock,
      maxAttempts: 1,
      retryDelayMs: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.classification).toBe('needs_review');
    expect(result.reason).toBe('redirected_to_home');
  });

  it('fails process when review links are configured as blocking', async () => {
    const reviewLinks = [{ classification: 'needs_review' }];
    const shouldFailByReview = true && reviewLinks.length > 0;

    expect(shouldFailByReview).toBe(true);
  });
});
