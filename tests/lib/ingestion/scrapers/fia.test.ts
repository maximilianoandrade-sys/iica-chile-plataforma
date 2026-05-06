import * as fs from "fs";
import * as path from "path";
import { fiaScraper } from "@/lib/ingestion/scrapers/fia";

global.fetch = jest.fn();

describe("fiaScraper", () => {
  it("parsea WP REST API y extrae proyectos", async () => {
    const json = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../../fixtures/fia.json"), "utf-8")
    );
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(json),
    });

    const result = await fiaScraper.scrape();

    expect(result.sourceSlug).toBe("fia");
    expect(result.projects.length).toBeGreaterThan(0);
    expect(result.projects.length).toBeLessThanOrEqual(20);

    const first = result.projects[0];
    expect(first.title).toBeTruthy();
    expect(first.title).not.toMatch(/&#\d+;/); // sin entidades HTML
    expect(first.url).toMatch(/^https:\/\/(www\.)?fia\.cl\//);
    expect(first.institution).toBe("FIA");
    expect(first.ambito).toBe("Nacional");
  });

  it("propaga error si la API responde no-OK", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });
    await expect(fiaScraper.scrape()).rejects.toThrow();
  });

  it("captura partialErrors en items malformados", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: { rendered: "Válida" }, link: "https://www.fia.cl/x", date: "2026-01-01" },
        { id: 2 }, // sin title ni link
      ]),
    });
    const result = await fiaScraper.scrape();
    expect(result.projects.length).toBe(1);
    expect(result.partialErrors.length).toBeGreaterThan(0);
  });
});
