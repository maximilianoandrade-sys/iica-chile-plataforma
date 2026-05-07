/**
 * @jest-environment node
 */
import { iicaHemisfericoScraper } from "../../../../lib/ingestion/scrapers/iica-hemisferico";

global.fetch = jest.fn();

describe("iicaHemisfericoScraper", () => {
  it("parsea HTML con licitaciones IICA", async () => {
    const html = `<html><body>
      <article><h3><a href="/es/licitaciones/consultoria-digital">Consultoría Transformación Digital</a></h3><p>Servicios de consultoría</p></article>
      <article><h3><a href="/es/licitaciones/equipos-lab">Equipamiento Laboratorio</a></h3><p>Adquisición equipos</p></article>
    </body></html>`;
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve(html) });
    const result = await iicaHemisfericoScraper.scrape();
    expect(result.sourceSlug).toBe("iica-hemisferico");
    expect(result.projects.length).toBe(2);
    expect(result.projects[0].institution).toContain("IICA");
    expect(result.projects[0].url).toContain("iica.int");
  });
});
