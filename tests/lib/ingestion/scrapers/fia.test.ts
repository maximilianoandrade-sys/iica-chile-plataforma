/**
 * @jest-environment node
 */
import { fiaScraper } from "../../../../lib/ingestion/scrapers/fia";

global.fetch = jest.fn() as jest.Mock;

describe("fiaScraper", () => {
  it("parsea JSON de WP REST API con convocatorias", async () => {
    const posts = [
      {
        id: 101,
        title: { rendered: "Convocatoria Innovación Agraria 2026" },
        link: "https://www.fia.cl/convocatorias/innovacion-2026",
        date: "2026-01-15T10:00:00",
        content: {
          rendered:
            "<p>Fondos para innovación en el sector agrícola</p><ul><li>Cierre: <strong>31</strong> de diciembre de 2026 a las 15:00</li></ul>",
        },
      },
      {
        id: 102,
        title: { rendered: "Programa de Riego Sustentable" },
        link: "https://www.fia.cl/convocatorias/riego-sustentable",
        date: "2026-02-01T10:00:00",
        content: {
          rendered:
            "<p>Apoyo a sistemas de riego eficiente</p><ul><li>Cierre: <strong>15</strong> de junio de 2026 a las 15:00</li></ul>",
        },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(posts),
    });

    const result = await fiaScraper.scrape();

    expect(result.sourceSlug).toBe("fia");
    expect(result.projects.length).toBe(2);
    expect(result.projects[0].title).toContain("Innovación");
    expect(result.projects[0].url).toMatch(/^https:\/\/(www\.)?fia\.cl\//);
    expect(result.projects[0].institution).toBe("FIA");
    expect(result.projects[0].deadline).toBeInstanceOf(Date);
  });

  it("reporta partialErrors para posts sin link", async () => {
    const posts = [
      {
        id: 200,
        title: { rendered: "Post sin link" },
        // no link field
        date: "2026-01-01T00:00:00",
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(posts),
    });
    const result = await fiaScraper.scrape();
    expect(result.sourceSlug).toBe("fia");
    expect(result.projects.length).toBe(0);
    expect(result.partialErrors?.length).toBeGreaterThan(0);
    expect(result.partialErrors?.[0]).toContain("sin link");
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
