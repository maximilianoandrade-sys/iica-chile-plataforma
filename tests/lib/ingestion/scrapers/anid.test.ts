/**
 * @jest-environment node
 */
import { anidScraper, parseAnidDate } from "../../../../lib/ingestion/scrapers/anid";

global.fetch = jest.fn() as jest.Mock;

describe("parseAnidDate", () => {
  it("parsea '19 de junio, 2026'", () => {
    const d = parseAnidDate("19 de junio, 2026");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getUTCFullYear()).toBe(2026);
    expect(d!.getUTCMonth()).toBe(5); // junio = 5
    expect(d!.getUTCDate()).toBe(19);
  });

  it("parsea '6 de agosto, 2026 - 13:00'", () => {
    const d = parseAnidDate("6 de agosto, 2026 - 13:00");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getUTCMonth()).toBe(7); // agosto = 7
  });

  it("retorna null para texto sin fecha", () => {
    expect(parseAnidDate("sin fecha")).toBeNull();
    expect(parseAnidDate("")).toBeNull();
  });
});

describe("anidScraper", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("parsea concursos abiertos desde la página de listado", async () => {
    const html = `
      <html><body>
        <article>
          <h3><a href="https://anid.cl/concursos/fondecyt-regular-2027/">Fondecyt Regular 2027</a></h3>
          <p>Inicio: 22 de abril, 2026  Cierre: 6 de agosto, 2026 - 13:00</p>
        </article>
        <article>
          <h3><a href="https://anid.cl/concursos/fondequip-mediano-2026/">Fondequip Mediano 2026</a></h3>
          <p>Inicio: 19 de junio, 2026  Cierre: 6 de agosto, 2026 - 13:00</p>
        </article>
      </html></body>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await anidScraper.scrape();
    expect(result.sourceSlug).toBe("anid");
    expect(result.projects.length).toBeGreaterThanOrEqual(2);
    expect(result.projects[0].institution).toBe("ANID");
    expect(result.projects[0].opportunityType).toBe("Convocatoria");
    expect(result.projects[0].url).toContain("anid.cl/concursos/");
    expect(result.projects[0].title).toContain("[ANID]");
    expect(result.projects[0].deadline).toBeInstanceOf(Date);
  });

  it("omite concursos con estado adjudicado o desierto", async () => {
    const html = `
      <html><body>
        <article>
          <h3><a href="https://anid.cl/concursos/fondecyt-2025/">Fondecyt 2025</a></h3>
          <p>Adjudicado  Cierre: 24 de junio, 2025</p>
        </article>
        <article>
          <h3><a href="https://anid.cl/concursos/fondecyt-2026/">Fondecyt 2026</a></h3>
          <p>Cierre: 24 de junio, 2026</p>
        </article>
      </html></body>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await anidScraper.scrape();
    expect(result.projects.every((p) => !p.title.includes("2025"))).toBe(true);
    expect(result.projects.some((p) => p.title.includes("2026"))).toBe(true);
  });

  it("ignora URLs que no son páginas individuales de concursos", async () => {
    const html = `
      <html><body>
        <a href="https://anid.cl/concursos/">Ver listado</a>
        <a href="https://anid.cl/concursos/fondecyt-2027/">Fondecyt 2027</a>
        <a href="https://anid.cl/conoce-anid/">Sobre ANID</a>
      </html></body>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    });

    const result = await anidScraper.scrape();
    // Solo la URL individual /fondecyt-2027/ debe pasar
    expect(result.projects.every((p) => p.url.includes("/fondecyt-2027/"))).toBe(true);
  });

  it("retorna vacío sin partialErrors si la página no tiene concursos", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<html><body><p>Sin concursos activos</p></body></html>"),
    });

    const result = await anidScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(0);
  });

  it("reporta partialErrors si el fetch falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });

    const result = await anidScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 503");
  });
});
