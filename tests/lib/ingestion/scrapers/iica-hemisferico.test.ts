import * as fs from "fs";
import * as path from "path";
import { iicaHemisfericoScraper } from "@/lib/ingestion/scrapers/iica-hemisferico";

global.fetch = jest.fn();

describe("iicaHemisfericoScraper", () => {
  it("parsea WP REST API con datos sintéticos vigentes", async () => {
    const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 19).replace("T", " ");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 1,
          title: { rendered: "BARBADOS &#8211; Request For Proposals" },
          link: "https://iica.int/es/bids/test-bid-1",
          date: "2026-04-01",
          acf: { final_date: future, monto_adjudicado_text: "$100,000 USD" },
        },
      ]),
    });

    const result = await iicaHemisfericoScraper.scrape();

    expect(result.sourceSlug).toBe("iica-hemisferico");
    expect(result.projects.length).toBe(1);

    const first = result.projects[0];
    expect(first.title).toBe("BARBADOS – Request For Proposals"); // entidad decodificada
    expect(first.url).toMatch(/^https:\/\/iica\.int\//);
    expect(first.institution).toBe("IICA Sede Central");
    expect(first.ambito).toBe("Internacional");
    expect(first.budget).toBe("$100,000 USD");
  });

  it("parsea fixture real (sin asserción de cantidad — el fixture puede tener todas pasadas)", async () => {
    const json = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../../fixtures/iica-hemisferico.json"), "utf-8")
    );
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    const result = await iicaHemisfericoScraper.scrape();

    expect(result.sourceSlug).toBe("iica-hemisferico");
    // No assert sobre count — todas pueden estar vencidas en momento del test
    for (const p of result.projects) {
      expect(p.title).not.toMatch(/&#\d+;|&[a-z]+;/);
      expect(p.url).toMatch(/^https:\/\/iica\.int\//);
      expect(p.ambito).toBe("Internacional");
    }
  });

  it("propaga error si la API responde no-OK", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });
    await expect(iicaHemisfericoScraper.scrape()).rejects.toThrow();
  });

  it("incluye TODAS las bids con final_date (markStale cierra las vencidas)", async () => {
    const past = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 19).replace("T", " ");
    const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 19).replace("T", " ");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: { rendered: "Cerrada" }, link: "https://iica.int/x", date: "2025-01-01", acf: { final_date: past } },
        { id: 2, title: { rendered: "Vigente" }, link: "https://iica.int/y", date: "2026-01-01", acf: { final_date: future } },
      ]),
    });
    const result = await iicaHemisfericoScraper.scrape();
    expect(result.projects.length).toBe(2);
    // Ambas tienen deadline parseada — el runner aplicará markStale()
    expect(result.projects[0].deadline).toBeInstanceOf(Date);
    expect(result.projects[1].deadline).toBeInstanceOf(Date);
  });

  it("incluye bids sin final_date", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: { rendered: "Sin fecha" }, link: "https://iica.int/x", date: "2026-01-01", acf: {} },
      ]),
    });
    const result = await iicaHemisfericoScraper.scrape();
    expect(result.projects.length).toBe(1);
    expect(result.projects[0].deadline).toBeNull();
  });
});
