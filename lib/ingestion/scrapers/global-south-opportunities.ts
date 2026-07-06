/**
 * Scraper Global South Opportunities — RSS feed aggregator.
 *
 * Strategy: Poll main RSS feed (https://www.globalsouthopportunities.com/feed/)
 * and filter by agriculture/food/climate/Chile keywords.
 * WordPress site aggregating grants, fellowships, and calls for the Global South.
 */
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { fetchRSSFeed } from "../rss-utils";

const logger = getLogger("GlobalSouthOpportunitiesScraper");

const RSS_URL = "https://www.globalsouthopportunities.com/feed/";
const HOMEPAGE = "https://www.globalsouthopportunities.com/";

const RELEVANT_KEYWORDS = [
  "chile",
  "latin america",
  "agriculture",
  "sustainable agriculture",
  "food security",
  "forestry",
  "fisheries",
  "aquaculture",
  "rural development",
  "climate",
  "agroforestry",
  "biodiversity",
  "irrigation",
  "oecd",
  "fao",
  "ifad",
  "smallholder",
  "farming",
  "research fellowship",
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
  // Common patterns: "Deadline: Month DD, YYYY", "closes on Month DD, YYYY", "by Month DD, YYYY"
  const patterns = [
    /deadline[:\s]*((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/i,
    /closes?\s+(?:on\s+)?((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/i,
    /by\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/i,
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

export const globalSouthOpportunitiesScraper: Scraper = {
  slug: "global-south-opportunities",
  name: "Global South Opportunities",
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
          institution: "Global South Opportunities",
          url: item.link,
          canonicalKey: item.link,
          deadline,
          description: item.description.slice(0, 400) || undefined,
          tags: ["GSO", ...item.categories.slice(0, 3)],
          ambito: "Internacional",
          idioma: "en",
          opportunityType: "Convocatoria",
          relevanciaChile: true,
        });
      }

      if (projects.length === 0) {
        partialErrors.push(
          "No relevant Global South Opportunities items found in RSS feed (keyword filter too strict or feed empty)",
        );
      }

      logger.info("Global South Opportunities RSS scrape completed", {
        count: projects.length,
      });
    } catch (err) {
      logger.error("Global South Opportunities RSS scrape failed", {
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
