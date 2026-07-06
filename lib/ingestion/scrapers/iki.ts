/**
 * Scraper IKI — International Climate Initiative (Germany).
 *
 * Strategy: Fetch the funding instruments page (static HTML, TYPO3 CMS).
 * Each instrument has title, description, and open/closed status via CSS class.
 * Only returns instruments with status "open".
 */
import { load } from "cheerio";
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, absoluteUrl } from "../utils";
import { fetchWithRetry } from "../retry";

const logger = getLogger("IKIScraper");

const BASE_URL =
  "https://www.international-climate-initiative.com/en/funding/";
const HOMEPAGE =
  "https://www.international-climate-initiative.com/en/funding/";

export const ikiScraper: Scraper = {
  slug: "iki",
  name: "IKI — International Climate Initiative",
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

      // IKI uses cards/sections for each funding instrument
      // Look for elements indicating open calls
      $("a[href*='funding'], .funding-item, .card, article").each((_, el) => {
        try {
          const $el = $(el);
          const text = $el.text().toLowerCase();

          // Skip if explicitly closed
          if (text.includes("closed") && !text.includes("open")) return;

          const $link = $el.is("a") ? $el : $el.find("a").first();
          const href = $link.attr("href");
          if (!href) return;

          const url = absoluteUrl(
            href,
            "https://www.international-climate-initiative.com/",
          );
          if (!url.includes("international-climate-initiative.com")) return;

          const title = cleanText(
            $el.find("h2, h3, h4, .title").first().text() ||
              $link.attr("title") ||
              $link.text(),
          );
          if (!title || title.length < 10) return;

          const description = cleanText(
            $el.find("p, .description, .text").first().text(),
          );

          // Check for budget mentions in text
          const budgetMatch =
            $el.text().match(/EUR\s*[\d,.]+\s*(million|mio|m)/i) ||
            $el.text().match(/€\s*[\d,.]+\s*(million|mio|m)/i);
          const budget = budgetMatch
            ? `EUR ${budgetMatch[0].replace(/EUR|€/i, "").trim()}`
            : null;

          projects.push({
            title,
            institution: "IKI (BMU Germany)",
            url,
            canonicalKey: url,
            deadline: null, // IKI deadlines are in call detail pages
            budget,
            description: description || undefined,
            tags: ["IKI", "Climate", "Germany"],
            ambito: "Internacional",
            idioma: "en",
            opportunityType: "Convocatoria",
          });
        } catch (err) {
          partialErrors.push(
            `IKI parse element: ${(err as Error).message}`,
          );
        }
      });

      // Deduplicate by URL
      const unique = new Map<string, RawProject>();
      for (const p of projects) {
        const key = p.canonicalKey || p.url;
        if (!unique.has(key)) unique.set(key, p);
      }
      projects.length = 0;
      projects.push(...Array.from(unique.values()));

      if (projects.length === 0) {
        partialErrors.push(
          "No open IKI funding instruments found — page structure may have changed",
        );
      }

      logger.info("IKI scrape completed", { count: projects.length });
    } catch (err) {
      logger.error("IKI scrape failed", { error: (err as Error).message });
      return {
        sourceSlug,
        projects: [],
        partialErrors: [(err as Error).message],
      };
    }

    return { sourceSlug, projects, partialErrors };
  },
};
