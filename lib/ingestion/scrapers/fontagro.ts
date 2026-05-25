import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate, absoluteUrl } from "../utils";
import { fetchWithRetry } from "../retry";

export const fontagroScraper: Scraper = {
  slug: "fontagro",
  name: "FONTAGRO",
  homepageUrl: "https://www.fontagro.org/es/iniciativas/convocatorias/",

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      let html: string;
      const res = await fetchWithRetry(
        this.homepageUrl,
        {
          headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        },
        3,
        600,
      );
      html = await res.text();

      const $ = load(html);
      $("article, .post, .convocatoria-item, .entry, .card, a").each((_, el) => {
        try {
          const $el = $(el);
          const $link = $el.is("a") ? $el : $el.find("a").first();
          const href = $link.attr("href");
          if (!href) return;

          const url = absoluteUrl(href, "https://www.fontagro.org/");
          if (!url.includes("fontagro.org") || !/convocatoria/i.test(url)) return;

          const fallbackTitle = "Convocatoria FONTAGRO";
          const title = cleanText(
            $el.find("h2, h3, .entry-title, .card-title").first().text() ||
            $link.text() ||
            fallbackTitle,
          );
          if (!title || title.length < 5) return;

          const deadline = parseSpanishDate(cleanText($el.find(".fecha, time, .deadline").text()));
          const description = cleanText($el.find(".excerpt, .extracto, p").first().text());
          projects.push({
            title,
            institution: "FONTAGRO",
            url,
            canonicalKey: url,
            deadline,
            description,
            ambito: "Internacional",
            opportunityType: "Convocatoria",
            tags: ["FONTAGRO", "ALC", "Convocatoria"],
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
