import * as fs from "fs";
import * as path from "path";
import { fiaScraper, parseFiaDeadline } from "@/lib/ingestion/scrapers/fia";

global.fetch = jest.fn();

describe("parseFiaDeadline", () => {
  it("parsea 'Cierre: 07 de abril de 2026' simple", () => {
    const html = "<li>Cierre: <strong>07</strong> de abril de 2026 a las 15:00</li>";
    const d = parseFiaDeadline(html);
    expect(d?.toISOString().slice(0, 10)).toBe("2026-04-07");
  });

  it("ignora dates en strikethrough (extensión de plazo)", () => {
    const html = `<li><s>Cierre: 31 de marzo de 2026</s></li><li>Cierre: 07 de abril de 2026</li>`;
    const d = parseFiaDeadline(html);
    expect(d?.toISOString().slice(0, 10)).toBe("2026-04-07");
  });

  it("devuelve null si no hay 'Cierre:' en el contenido", () => {
    const html = "<p>Información sobre el programa AgroCoopInnova</p>";
    expect(parseFiaDeadline(html)).toBeNull();
  });

  it("devuelve null para contenido vacío", () => {
    expect(parseFiaDeadline("")).toBeNull();
    expect(parseFiaDeadline(undefined)).toBeNull();
  });
});

describe("fiaScraper", () => {
  it("parsea WP REST API y extrae proyectos con deadlines", async () => {
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
    expect(first.title).not.toMatch(/&#\d+;/);
    expect(first.url).toMatch(/^https:\/\/(www\.)?fia\.cl\//);
    expect(first.institution).toBe("FIA");
    expect(first.ambito).toBe("Nacional");

    // La mayoría debería tener deadline parseado del content
    const withDeadline = result.projects.filter((p) => p.deadline !== null);
    expect(withDeadline.length).toBeGreaterThan(result.projects.length / 2);
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
