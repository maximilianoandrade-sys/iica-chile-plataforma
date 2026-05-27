import { LinkedInPublicProvider } from '@/lib/search/external/providers/linkedinPublic';

function createHtmlWithResults(): string {
  return `
    <html>
      <body>
        <div class="result">
          <a href="https://www.linkedin.com/posts/abc123">Convocatoria de riego en Maule</a>
          <p>INDAP abre convocatoria para proyectos agrícolas con cierre 2026-12-31.</p>
        </div>
        <div class="result">
          <a href="https://www.linkedin.com/posts/xyz789">Fondo para cooperativas rurales</a>
          <p>Apoyo técnico y financiero para innovación en territorio regional.</p>
        </div>
      </body>
    </html>
  `;
}

describe('LinkedInPublicProvider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns normalized records from public search html', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => createHtmlWithResults(),
    } as unknown as Response);

    const provider = new LinkedInPublicProvider();
    const results = await provider.search(
      {
        query: 'riego',
        institution: 'INDAP',
        region: 'Maule',
      },
      { timeoutMs: 5000 }
    );

    expect(results).toHaveLength(2);
    expect(results[0].sourceId).toContain('linkedin_public:');
    expect(results[0].url_bases).toContain('linkedin.com');
    expect(results[0].categoria).toBe('Convocatoria');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('duckduckgo.com/html/?q='),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept-Language': expect.stringContaining('es-CL'),
        }),
      })
    );
  });

  it('returns empty list when public search endpoint fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => '',
    } as unknown as Response);

    const provider = new LinkedInPublicProvider();
    const results = await provider.search({ query: 'riego' });

    expect(results).toEqual([]);
  });

  it('returns empty list when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    const provider = new LinkedInPublicProvider();
    const results = await provider.search({ query: 'riego' });

    expect(results).toEqual([]);
  });
});
