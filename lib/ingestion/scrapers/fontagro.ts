import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";

export const fontagroScraper: Scraper = {
  slug: "fontagro",
  name: "FONTAGRO",
  homepageUrl: "https://www.fontagro.org/es/iniciativas/convocatorias/",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      throw new Error(`fetch fallido: ${(err as Error).message}`);
    }

    const $ = load(html);
    $("article, .post, .convocatoria-item, .entry, .card").each((_, el) => {
      try {
        const $el = $(el);
        const $link = $el.find("a").first();
        const title = cleanText($el.find("h2, h3, .entry-title, .card-title").first().text() || $link.text());
        if (!title || title.length < 5) return;
        const href = $link.attr("href");
        if (!href) { partialErrors.push(`sin href: ${title}`); return; }
        const url = absoluteUrl(href, "https://www.fontagro.org/");
        if (!url.includes("fontagro.org")) return;
        const deadline = parseSpanishDate(cleanText($el.find(".fecha, time, .deadline").text()));
        const description = cleanText($el.find(".excerpt, .extracto, p").first().text());
        projects.push({
          title, institution: "FONTAGRO", url, deadline, description,
          ambito: "Internacional",
          tags: ["FONTAGRO", "ALC"],
        });
      } catch (err) {
        partialErrors.push(`parse: ${(err as Error).message}`);
      }
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
