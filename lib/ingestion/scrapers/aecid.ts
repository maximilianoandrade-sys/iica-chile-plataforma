/**
 * Scraper AECID — Agencia Española de Cooperación Internacional.
 *
 * Strategy: Fetch /en/tenders listing page (static Liferay HTML).
 * Extracts active tenders with title, date, category.
 * Also has RSS feed for monitoring: aecid.es/en/canales-rss/canal-rss-aecid-anuncios
 */
import { load } from "cheerio";
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, absoluteUrl } from "../utils";
import { fetchWithRetry } from "../retry";

const logger = getLogger("AECIDScraper");

const BASE_URL = "https://www.aecid.es/en/tenders";
const HOMEPAGE = "https://www.aecid.es/en/tenders";

function parseAecidDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Formats: "14 Apr 2026", "02 May 2025"
  const d = new Date(dateStr.trim());
  return isNaN(d.getTime()) ? null : d;
}

export const aecidScraper: Scraper = {
  slug: "aecid",
  name: "AECID — Cooperación Española",
  homepageUrl: HOMEPAGE,

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      const res = await fetchWithRetry(
        BASE_URL,
        {
          headers: {
            "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)",
          },
        },
        3,
        600,
      );
      const html = await res.text();
      const $ = load(html);

      // AECID tenders listing: look for tender entries with title + date + category
      $(
        "article, .tender-item, .asset-entry, tr, .list-item, li",
      ).each((_, el) => {
        try {
          const $el = $(el);
          const $link = $el.find("a").first();
          const href = $link.attr("href");
          if (!href) return;

          const url = absoluteUrl(href, "https://www.aecid.es/");
          if (!url.includes("aecid.es")) return;

          const title = cleanText(
            $link.text() ||
              $el.find("h2, h3, h4, .title").first().text(),
          );
          if (!title || title.length < 10) return;

          // Look for date in the entry
          const dateText = cleanText(
            $el.find("time, .date, .fecha, span.small").first().text(),
          );
          const pubDate = parseAecidDate(dateText);

          // Look for category/fund type
          const category = cleanText(
            $el.find(".category, .badge, .tag, .tipo").first().text(),
          );

          const tags = ["AECID", "Spain", "Cooperation"];
          if (category) tags.push(category);

          projects.push({
            title,
            institution: "AECID (España)",
            url,
            canonicalKey: url,
            deadline: pubDate, // Publication date (deadline is in detail page)
            description: category ? `Categoría: ${category}` : undefined,
            tags,
            ambito: "Internacional",
            idioma: "es",
            opportunityType: "Licitacion",
          });
        } catch (err) {
          partialErrors.push(
            `AECID parse: ${(err as Error).message}`,
          );
        }
      });

      // Deduplicate
      const unique = new Map<string, RawProject>();
      for (const p of projects) {
        const key = p.canonicalKey || p.url;
        if (!unique.has(key)) unique.set(key, p);
      }
      projects.length = 0;
      projects.push(...Array.from(unique.values()));

      if (projects.length === 0) {
        partialErrors.push(
          "No AECID tenders found — page structure may have changed",
        );
      }

      logger.info("AECID scrape completed", { count: projects.length });
    } catch (err) {
      logger.error("AECID scrape failed", {
        error: (err as Error).message,
      });
      return {
        sourceSlug,
        projects: [],
        partialErrors: [(err as Error).message],
      };
    }

    return { sourceSlug, projects, partialErrors };
  },
};
