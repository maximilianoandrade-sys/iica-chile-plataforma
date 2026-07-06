/**
 * Scraper FundsforNGOs — RSS feed aggregator.
 *
 * Strategy: Poll main RSS feed (https://www2.fundsforngos.org/feed/)
 * and filter by agriculture/food/climate keywords.
 * This is a meta-source that catches diverse funders.
 *
 * Note: HTML scraping blocked by ShopShield anti-bot. RSS works fine.
 */
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { fetchRSSFeed } from "../rss-utils";

const logger = getLogger("FundsforNGOsScraper");

const RSS_URL = "https://www2.fundsforngos.org/feed/";
const HOMEPAGE = "https://www2.fundsforngos.org/";

const RELEVANT_KEYWORDS = [
  "agriculture",
  "food security",
  "rural development",
  "climate",
  "sustainable development",
  "environment",
  "latin america",
  "water",
  "irrigation",
  "agroforestry",
  "resilience",
  "smallholder",
  "farming",
];

function isRelevant(
  title: string,
  description: string,
  categories: string[],
): boolean {
  const combined =
    `${title} ${description} ${categories.join(" ")}`.toLowerCase();
  return RELEVANT_KEYWORDS.some((kw) => combined.includes(kw));
}

function extractDeadline(description: string): Date | null {
  // Common patterns: "Deadline: Month DD, YYYY" or "closes on Month DD, YYYY"
  const patterns = [
    /deadline[:\s]*((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/i,
    /closes?\s+(?:on\s+)?((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/i,
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i,
  ];
  for (const p of patterns) {
    const match = description.match(p);
    if (match) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

export const fundsforNgosScraper: Scraper = {
  slug: "fundsforngos",
  name: "FundsforNGOs (Aggregator)",
  homepageUrl: HOMEPAGE,

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      const items = await fetchRSSFeed(RSS_URL);

      for (const item of items) {
        if (!isRelevant(item.title, item.description, item.categories))
          continue;

        const deadline = extractDeadline(item.description);

        projects.push({
          title: item.title,
          institution: "FundsforNGOs (Aggregator)",
          url: item.link,
          canonicalKey: item.link,
          deadline,
          description: item.description.slice(0, 400) || undefined,
          tags: ["FundsforNGOs", ...item.categories.slice(0, 3)],
          ambito: "Internacional",
          idioma: "en",
          opportunityType: "Convocatoria",
        });
      }

      if (projects.length === 0) {
        partialErrors.push(
          "No relevant FundsforNGOs items found in RSS feed (keyword filter too strict or feed empty)",
        );
      }

      logger.info("FundsforNGOs RSS scrape completed", {
        count: projects.length,
      });
    } catch (err) {
      logger.error("FundsforNGOs RSS scrape failed", {
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
