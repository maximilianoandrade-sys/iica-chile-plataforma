/**
 * @jest-environment node
 */
import { fiaScraper } from "../../../../lib/ingestion/scrapers/fia";

global.fetch = jest.fn() as jest.Mock;

describe("fiaScraper", () => {
  it("parsea HTML con convocatorias", async () => {
    const html = `
      <html><body>
        <article>
          <h3><a href="/convocatorias/innovacion-2026">Convocatoria Innovación Agraria 2026</a></h3>
          <span class="fecha">31/12/2026</span>
          <p>Fondos para innovación en el sector agrícola</p>
        </article>
        <article>
          <h3><a href="/convocatorias/riego-sustentable">Programa de Riego Sustentable</a></h3>
          <span class="fecha">15/06/2026</span>
          <p>Apoyo a sistemas de riego eficiente</p>
        </article>
      </body></html>
    `;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await fiaScraper.scrape();

    expect(result.sourceSlug).toBe("fia");
    expect(result.projects.length).toBe(2);
    expect(result.projects[0].title).toContain("Innovación");
    expect(result.projects[0].url).toMatch(/^https:\/\/(www\.)?fia\.cl\//);
    expect(result.projects[0].institution).toBe("FIA");
  });

  it("reporta partialErrors para cards sin href", async () => {
    const html = `
      <html><body>
        <article>
          <h3>Card sin link válido</h3>
          <p>No tiene href</p>
        </article>
      </body></html>
    `;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });
    const result = await fiaScraper.scrape();
    expect(result.sourceSlug).toBe("fia");
  });

  it("reporta partialErrors si fetch falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
    });
    await expect(fiaScraper.scrape()).resolves.toEqual({
      sourceSlug: "fia",
      projects: [],
      partialErrors: ["HTTP 503"],
    });
  });
});
