import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const corfoScraper: Scraper = {
  slug: "corfo",
  name: "CORFO",
  homepageUrl: "https://www.corfo.cl/sites/cpp/programas-background",

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
      $(".programa-card, .convocatoria-card, article, .card, .item-programa").each((_, el) => {
        try {
          const $el = $(el);
          const $link = $el.find("a").first();
          const title = cleanText($el.find("h2, h3, .titulo, .card-title").first().text() || $link.text());
          if (!title || title.length < 5) return;
          const href = $link.attr("href");
          if (!href) { partialErrors.push(`sin href: ${title}`); return; }
          const url = absoluteUrl(href, "https://www.corfo.cl/");
          if (!url.includes("corfo.cl")) return;
          const deadline = parseSpanishDate(cleanText($el.find(".fecha, time, .cierre, .date").text()));
          const description = cleanText($el.find(".descripcion, .resumen, p").first().text());
          projects.push({ title, institution: "CORFO", url, deadline, description, ambito: "Nacional" });
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
