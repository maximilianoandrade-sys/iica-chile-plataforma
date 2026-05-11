import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const iicaHemisfericoScraper: Scraper = {
  slug: "iica-hemisferico",
  name: "IICA Hemisférico",
  homepageUrl: "https://iica.int/es/licitaciones",

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
      $(".licitacion, article, .views-row, .card, .node--type-licitacion").each((_, el) => {
        try {
          const $el = $(el);
          const $link = $el.find("a").first();
          const title = cleanText($el.find("h2, h3, .titulo, .field--name-title").first().text() || $link.text());
          if (!title || title.length < 5) return;
          const href = $link.attr("href");
          if (!href) { partialErrors.push(`sin href: ${title}`); return; }
          const url = absoluteUrl(href, "https://iica.int/");
          if (!url.includes("iica.int")) return;
          const deadline = parseSpanishDate(cleanText($el.find(".fecha-cierre, .deadline, time").text()));
          const description = cleanText($el.find(".descripcion, .field--name-body, p").first().text());
          projects.push({
            title,
            institution: "IICA Sede Central",
            url, deadline, description,
            ambito: "Internacional",
            tags: ["IICA", "Licitación institucional"],
          });
        } catch (err) {
          partialErrors.push(`parse: ${(err as Error).message}`);
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
