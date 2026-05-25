import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";
import { fetchWithRetry } from "../retry";

const ALLOWED_PATH_HINTS = [
  "/programas",
  "/concursos",
  "/plataforma-de-servicios",
  "/servicio",
];

function isLikelyOpportunityUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    return ALLOWED_PATH_HINTS.some((hint) => path.includes(hint));
  } catch {
    return false;
  }
}

export const indapScraper: Scraper = {
  slug: "indap",
  name: "INDAP",
  homepageUrl: "https://www.indap.gob.cl/concursos",

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      let html: string;
      const [concursosRes, serviciosRes] = await Promise.all([
        fetchWithRetry(
          this.homepageUrl,
          {
            headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
          },
          3,
          600,
        ),
        fetchWithRetry(
          "https://www.indap.gob.cl/plataforma-de-servicios",
          {
            headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
          },
          3,
          600,
        ),
      ]);
      html = `${await concursosRes.text()}\n${await serviciosRes.text()}`;

      const $ = load(html);
      $(".noticia-card, .programa-item, article.programa, article, .views-row, .card, h3, h2").each((_, el) => {
        try {
          const $el = $(el);
          const $link = $el.is("a") ? $el : $el.find("a").first();
          const title = cleanText(
            $el.find("h2, h3, .titulo, .card-title").first().text() ||
            $link.text() ||
            $el.text(),
          );
          if (!title || title.length < 5) return;
          const href = $link.attr("href");
          if (!href) return;
          const url = absoluteUrl(href, "https://www.indap.gob.cl/");
          if (!url.includes("indap.gob.cl")) return;
          if (!isLikelyOpportunityUrl(url)) return;
          const deadline = parseSpanishDate(cleanText($el.find(".fecha, time, .date").text()));
          const description = cleanText($el.find(".descripcion, .resumen, p").first().text());
          projects.push({
            title,
            institution: "INDAP",
            url,
            canonicalKey: url,
            deadline,
            description,
            ambito: "Nacional",
            opportunityType: "Programa",
            tags: ["INDAP", "Programa"],
          });
        } catch (err) {
          partialErrors.push(`parse: ${(err as Error).message}`);
        }
      });

      const unique = new Map<string, RawProject>();
      for (const p of projects) {
        const key = p.canonicalKey || p.url;
        if (!unique.has(key)) unique.set(key, p);
      }

      projects.length = 0;
      projects.push(...Array.from(unique.values()));

      if (projects.length === 0) {
        partialErrors.push("No matching elements found on page — CSS selectors may need updating");
      }
    } catch (err) {
      return { sourceSlug, projects: [], partialErrors: [(err as Error).message] };
    }

    return { sourceSlug, projects, partialErrors };
  },
};
