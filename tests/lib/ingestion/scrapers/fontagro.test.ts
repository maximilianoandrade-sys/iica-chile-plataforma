/**
 * @jest-environment node
 */
import { fontagroScraper } from "../../../../lib/ingestion/scrapers/fontagro";

global.fetch = jest.fn();

describe("fontagroScraper", () => {
  it("parsea HTML con convocatorias FONTAGRO", async () => {
    const html = `<html><body>
      <article><h3><a href="/es/convocatoria/bioeconomia-2026">Bioeconomía Circular ALC</a></h3><p>Investigación aplicada</p></article>
    </body></html>`;
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });
    const result = await fontagroScraper.scrape();
    expect(result.sourceSlug).toBe("fontagro");
    expect(result.projects.length).toBe(1);
    expect(result.projects[0].ambito).toBe("Internacional");
    expect(result.projects[0].url).toContain("fontagro.org");
    expect(result.projects[0].opportunityType).toBe("Convocatoria");
    expect(result.projects[0].canonicalKey).toBe(result.projects[0].url);
  });

  it("deduplica links repetidos de convocatoria", async () => {
    const html = `<html><body>
      <a href="/es/iniciativas/convocatorias/convocatoria-2026/">Convocatoria 2026</a>
      <a href="/es/iniciativas/convocatorias/convocatoria-2026/">Ver información</a>
    </body></html>`;
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });
    const result = await fontagroScraper.scrape();
    expect(result.projects).toHaveLength(1);
  });
});
