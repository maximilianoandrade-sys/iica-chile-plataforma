import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const fiaScraper: Scraper = {
  slug: "fia",
  name: "FIA — Fundación para la Innovación Agraria",
  homepageUrl: "https://www.fia.cl/convocatorias/",

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      let html: string;
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();

      const $ = load(html);

      // Multiple selectors to cover different FIA HTML structures
      $("article, .convocatoria, .convocatoria-card, .post-convocatoria, .entry, .wp-block-post").each((_, el) => {
        try {
          const $el = $(el);
          const $titleLink = $el.find("h3 a, h2 a, .entry-title a, .titulo a, a.wp-block-post-title").first();
          const title = cleanText($titleLink.text() || $el.find("h3, h2, .entry-title").first().text());
          if (!title || title.length < 5) return;

          const href = $titleLink.attr("href") || $el.find("a").first().attr("href");
          if (!href) {
            partialErrors.push(`card sin href: ${title}`);
            return;
          }
          const url = absoluteUrl(href, "https://www.fia.cl/");

          // Only include FIA links
          if (!url.includes("fia.cl")) return;

          const fechaTxt = cleanText($el.find(".fecha-cierre, .fecha, time, .date").text());
          const deadline = parseSpanishDate(fechaTxt);

          const description = cleanText($el.find(".descripcion, .extracto, .excerpt, p").first().text());

          projects.push({
            title,
            institution: "FIA",
            url,
            deadline,
            description,
            ambito: "Nacional",
          });
        } catch (err) {
          partialErrors.push(`parse error: ${(err as Error).message}`);
        }
      });

      if (projects.length === 0) {
        partialErrors.push("No matching elements found on page — CSS selectors may need updating");
      }
    } catch (err) {
      return { sourceSlug, projects: [], partialErrors: [(err as Error).message] };
    }

    return { sourceSlug, projects, partialErrors };
  },
};
