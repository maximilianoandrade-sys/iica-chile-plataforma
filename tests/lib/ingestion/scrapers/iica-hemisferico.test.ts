/**
 * @jest-environment node
 */
import { iicaHemisfericoScraper } from "../../../../lib/ingestion/scrapers/iica-hemisferico";

global.fetch = jest.fn();

describe("iicaHemisfericoScraper", () => {
  it("parsea JSON de WP REST API con licitaciones IICA", async () => {
    const bids = [
      {
        id: 301,
        title: { rendered: "Consultoría Transformación Digital" },
        link: "https://iica.int/es/licitaciones/consultoria-digital",
        date: "2026-03-01T10:00:00",
        acf: { final_date: "2026-06-30 17:00:00" },
      },
      {
        id: 302,
        title: { rendered: "Equipamiento Laboratorio" },
        link: "https://iica.int/es/licitaciones/equipos-lab",
        date: "2026-03-15T10:00:00",
        acf: { final_date: "2026-12-31 17:00:00" },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(bids),
    });

    const result = await iicaHemisfericoScraper.scrape();
    expect(result.sourceSlug).toBe("iica-hemisferico");
    expect(result.projects.length).toBe(2);
    expect(result.projects[0].institution).toContain("IICA");
    expect(result.projects[0].url).toContain("iica.int");
    expect(result.projects[0].deadline).toBeInstanceOf(Date);
  });

  it("reporta partialErrors para bids sin title", async () => {
    const bids = [
      {
        id: 400,
        // no title
        link: "https://iica.int/es/licitaciones/sin-titulo",
        date: "2026-01-01T00:00:00",
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(bids),
    });
    const result = await iicaHemisfericoScraper.scrape();
    expect(result.sourceSlug).toBe("iica-hemisferico");
    expect(result.projects.length).toBe(0);
    expect(result.partialErrors?.length).toBeGreaterThan(0);
    expect(result.partialErrors?.[0]).toContain("sin title");
  });

  it("reporta error si fetch falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });
    const result = await iicaHemisfericoScraper.scrape();
    expect(result.sourceSlug).toBe("iica-hemisferico");
    expect(result.projects).toEqual([]);
    expect(result.partialErrors?.[0]).toContain("HTTP 500");
  });
});
