/**
 * @jest-environment node
 */
import { indapScraper } from "../../../../lib/ingestion/scrapers/indap";

global.fetch = jest.fn();

describe("indapScraper", () => {
  it("parsea HTML con programas INDAP", async () => {
    const html = `<html><body>
      <article><h3><a href="/programas/pdti-2026">Programa PDTI 2026</a></h3><p>Desarrollo territorial</p></article>
      <article><h3><a href="/programas/sirsd-s">SIRSD-S Sustentable</a></h3><p>Suelos degradados</p></article>
    </body></html>`;
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });
    const result = await indapScraper.scrape();
    expect(result.sourceSlug).toBe("indap");
    expect(result.projects.length).toBe(2);
    expect(result.projects[0].institution).toBe("INDAP");
    expect(result.projects[0].url).toContain("indap.gob.cl");
  });

  it("reporta partialErrors si fetch falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    await expect(indapScraper.scrape()).resolves.toEqual({
      sourceSlug: "indap",
      projects: [],
      partialErrors: ["HTTP 500"],
    });
  });
});
