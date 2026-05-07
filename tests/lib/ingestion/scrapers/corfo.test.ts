/**
 * @jest-environment node
 */
import { corfoScraper } from "../../../../lib/ingestion/scrapers/corfo";

global.fetch = jest.fn();

describe("corfoScraper", () => {
  it("parsea HTML con programas CORFO", async () => {
    const html = `<html><body>
      <article><h3><a href="/sites/cpp/convocatoria-innova">Innova CORFO 2026</a></h3><p>Innovación empresarial</p></article>
      <article><h3><a href="/sites/cpp/startup-ciencia">Startup Ciencia</a></h3><p>Base científica</p></article>
    </body></html>`;
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });
    const result = await corfoScraper.scrape();
    expect(result.sourceSlug).toBe("corfo");
    expect(result.projects.length).toBe(2);
    expect(result.projects[0].institution).toBe("CORFO");
    expect(result.projects[0].url).toContain("corfo.cl");
  });
});
