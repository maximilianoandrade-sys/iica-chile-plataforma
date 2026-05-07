import * as fs from "fs";
import * as path from "path";
// Use cheerio/slim to avoid undici's ReadableStream requirement in jsdom
import { load } from "cheerio/slim";
import { COUNTERPARTS_IICA_CHILE, getByCategory, TOTAL_COUNTERPARTS } from "../../../../lib/ingestion/counterparts-iica";
import { parseSpanishDate, cleanText } from "../../../../lib/ingestion/utils";

// ─── HTML Parsing logic (mirrors Playwright's page.evaluate) ─────────────────

interface ParsedProject {
  title: string;
  url: string;
  code: string;
  country: string;
  startDate: string | null;
  endDate: string | null;
}

function parseHtmlListaProgramas(html: string): ParsedProject[] {
  const $ = load(html);
  const items: ParsedProject[] = [];
  const detailBase = "https://apps.iica.int/dashboardproyectos/";

  $("li.item.row").each((_i, li) => {
    const link = $(li).find("h3 a");
    if (!link.length) return;
    const title = link.text().trim();
    if (!title || title.length < 3) return;

    const href = link.attr("href") || "";
    const url = href.startsWith("http") ? href : detailBase + href;

    let code = "";
    let country = "";
    let startDate: string | null = null;
    let endDate: string | null = null;

    $(li).find(".add-data").each((_j, div) => {
      const strong = $(div).find("strong").text().trim().toLowerCase();
      const value = $(div).text().replace($(div).find("strong").text(), "").trim();

      if (strong.includes("código")) code = value;
      else if (strong.includes("país")) country = value;
      else if (strong.includes("inicio")) startDate = value;
      else if (strong.includes("finalización") || strong.includes("finalizacion"))
        endDate = value;
    });

    items.push({ title, url, code, country, startDate, endDate });
  });

  return items;
}

// ─── Tests using captured HTML ───────────────────────────────────────────────

const DISCOVERY_DIR = path.resolve(__dirname, "../../../../tmp/iica-discovery");

describe("IICA Dashboard - HTML parsing (offline)", () => {
  const fiaHtml = path.join(DISCOVERY_DIR, "contraparte-179.html");
  const indapHtml = path.join(DISCOVERY_DIR, "contraparte-230.html");
  const iniaHtml = path.join(DISCOVERY_DIR, "contraparte-183.html");

  const hasFiles = fs.existsSync(fiaHtml) && fs.existsSync(indapHtml) && fs.existsSync(iniaHtml);

  (hasFiles ? describe : describe.skip)("with captured HTML files", () => {
    it("parses FIA (contraparte-179) projects correctly", () => {
      const html = fs.readFileSync(fiaHtml, "utf-8");
      const projects = parseHtmlListaProgramas(html);
      expect(projects.length).toBe(2);

      const first = projects[0];
      expect(first.title).toContain("Ciruelas Deshidratadas");
      expect(first.url).toContain("Detalle?CRON=5478");
      expect(first.code).toBe("5478-00");
      expect(first.country).toBe("Chile");
      expect(first.startDate).toBe("10/01/2025");
      expect(first.endDate).toBe("31/12/2027");
    });

    it("parses INDAP (contraparte-230) projects correctly", () => {
      const html = fs.readFileSync(indapHtml, "utf-8");
      const projects = parseHtmlListaProgramas(html);
      expect(projects.length).toBe(3);

      expect(projects[0].url).toContain("CRON=5594");
      expect(projects[2].url).toContain("CRON=4597");
    });

    it("parses INIA (contraparte-183) projects correctly", () => {
      const html = fs.readFileSync(iniaHtml, "utf-8");
      const projects = parseHtmlListaProgramas(html);
      expect(projects.length).toBe(2);
    });

    it("dates are parseable by parseSpanishDate", () => {
      const html = fs.readFileSync(fiaHtml, "utf-8");
      const projects = parseHtmlListaProgramas(html);
      const date = parseSpanishDate(projects[0].startDate || "");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
    });

    it("result count matches .cant-proyectos", () => {
      const html = fs.readFileSync(fiaHtml, "utf-8");
      const $ = load(html);
      const countText = $(".cant-proyectos strong").text().trim();
      const count = Number(countText);
      const projects = parseHtmlListaProgramas(html);
      expect(projects.length).toBe(count);
    });
  });
});

describe("IICA Dashboard - counterparts-iica", () => {
  it("has the expected total of counterparts", () => {
    expect(TOTAL_COUNTERPARTS).toBeGreaterThanOrEqual(70);
    expect(TOTAL_COUNTERPARTS).toBeLessThanOrEqual(80);
    expect(COUNTERPARTS_IICA_CHILE.length).toBe(TOTAL_COUNTERPARTS);
  });

  it("all counterparts have required fields", () => {
    for (const cp of COUNTERPARTS_IICA_CHILE) {
      expect(cp.id).toBeTruthy();
      expect(cp.name).toBeTruthy();
      expect(cp.abbrev).toBeTruthy();
      expect(cp.category).toBeTruthy();
      expect(typeof cp.id).toBe("string");
      expect(cp.id).toMatch(/^\d+$/); // numeric string
    }
  });

  it("has no duplicate IDs", () => {
    const ids = COUNTERPARTS_IICA_CHILE.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("has no duplicate abbreviations", () => {
    const abbrevs = COUNTERPARTS_IICA_CHILE.map(c => c.abbrev);
    const unique = new Set(abbrevs);
    expect(unique.size).toBe(abbrevs.length);
  });

  it("getByCategory returns correct subset", () => {
    const chilean = getByCategory("chilean");
    expect(chilean.length).toBeGreaterThan(10);
    expect(chilean.every(c => c.category === "chilean")).toBe(true);

    const research = getByCategory("research");
    expect(research.length).toBeGreaterThan(5);
    expect(research.every(c => c.category === "research")).toBe(true);
  });

  it("includes key Chilean institutions", () => {
    const ids = COUNTERPARTS_IICA_CHILE.map(c => c.id);
    expect(ids).toContain("179"); // FIA
    expect(ids).toContain("230"); // INDAP
    expect(ids).toContain("183"); // INIA
    expect(ids).toContain("252"); // MINAGRI
  });

  it("includes key international organizations", () => {
    const ids = COUNTERPARTS_IICA_CHILE.map(c => c.id);
    expect(ids).toContain("33"); // FAO
    expect(ids).toContain("7");  // IDB
    expect(ids).toContain("37"); // GEF
    expect(ids).toContain("97"); // GIZ
  });
});
