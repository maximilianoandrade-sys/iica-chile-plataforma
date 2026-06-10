/**
 * Scraper GAFSP — Global Agriculture and Food Security Program.
 *
 * Strategy: Fetch /call-proposals page (static Drupal HTML).
 * Extracts active calls with deadline and amount from the alert box
 * and call detail sections.
 */
import { load } from "cheerio";
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, absoluteUrl } from "../utils";
import { fetchWithRetry } from "../retry";

const logger = getLogger("GAFSPScraper");

const BASE_URL = "https://www.gafspfund.org/call-proposals";
const HOMEPAGE = "https://www.gafspfund.org/";

function parseEnglishDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export const gafspScraper: Scraper = {
  slug: "gafsp",
  name: "GAFSP — Global Agriculture and Food Security Program",
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

      // Look for active call announcements (alert boxes, banners, or call sections)
      const pageText = $("body").text();

      // Find call links (e.g., "/9th-call-proposals", "/10th-call-proposals")
      $(
        "a[href*='call-proposals'], a[href*='call-for-proposals']",
      ).each((_, el) => {
        try {
          const $el = $(el);
          const href = $el.attr("href");
          if (!href) return;

          const url = absoluteUrl(href, "https://www.gafspfund.org/");
          const title = cleanText($el.text());
          if (!title || title.length < 5) return;
          // Skip "Previous calls" navigation links
          if (/previous/i.test(title)) return;

          projects.push({
            title: title.includes("Call") ? title : `GAFSP ${title}`,
            institution: "GAFSP (World Bank)",
            url,
            canonicalKey: url,
            deadline: null,
            description: undefined,
            tags: ["GAFSP", "Food Security", "Agriculture"],
            ambito: "Internacional",
            idioma: "en",
            opportunityType: "Convocatoria",
          });
        } catch (err) {
          partialErrors.push(
            `GAFSP link parse: ${(err as Error).message}`,
          );
        }
      });

      // Try to extract current call details from page content
      // Pattern: "US$XXX million" for budget, "deadline: Month DD, YYYY"
      const budgetMatch = pageText.match(/US\$\s*([\d,.]+)\s*million/i);
      const deadlineMatch = pageText.match(
        /deadline[:\s]*((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/i,
      );

      if (projects.length > 0 && budgetMatch) {
        projects[0].budget = `USD ${budgetMatch[1]} million`;
      }
      if (projects.length > 0 && deadlineMatch) {
        projects[0].deadline = parseEnglishDate(deadlineMatch[1]);
      }

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
          "No GAFSP calls found — page may have changed",
        );
      }

      logger.info("GAFSP scrape completed", { count: projects.length });
    } catch (err) {
      logger.error("GAFSP scrape failed", {
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
