/**
 * Scraper GCF — Green Climate Fund.
 *
 * Strategy: Poll the announcements RSS feed and filter for "Call for" items.
 * RSS at: https://www.greenclimate.fund/news/announcements/feed
 * Returns calls with title, link, description, publication date.
 */
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { fetchRSSFeed } from "../rss-utils";

const logger = getLogger("GCFScraper");

const RSS_URL = "https://www.greenclimate.fund/news/announcements/feed";
const HOMEPAGE = "https://www.greenclimate.fund/news/announcements";

// Only include items whose title indicates a call for proposals/submissions/input
const CALL_PATTERNS = [
  /call for/i,
  /request for proposal/i,
  /rfp/i,
  /expression of interest/i,
  /eoi/i,
];

function isCallItem(title: string): boolean {
  return CALL_PATTERNS.some((p) => p.test(title));
}

export const gcfScraper: Scraper = {
  slug: "gcf",
  name: "GCF — Green Climate Fund",
  homepageUrl: HOMEPAGE,

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      const items = await fetchRSSFeed(RSS_URL);

      for (const item of items) {
        if (!isCallItem(item.title)) continue;

        // Try to extract deadline from description
        const deadlineMatch =
          item.description.match(/deadline[:\s]*([\w\s,]+\d{4})/i) ||
          item.description.match(/by\s+([\w]+\s+\d{1,2},?\s*\d{4})/i);
        const deadline = deadlineMatch ? new Date(deadlineMatch[1]) : null;

        projects.push({
          title: item.title,
          institution: "Green Climate Fund",
          url: item.link,
          canonicalKey: item.link,
          deadline:
            deadline && !isNaN(deadline.getTime()) ? deadline : null,
          description: item.description.slice(0, 500) || undefined,
          tags: ["GCF", "Climate Finance", "Green Climate Fund"],
          ambito: "Internacional",
          idioma: "en",
          opportunityType: "Convocatoria",
        });
      }

      if (projects.length === 0) {
        partialErrors.push("No GCF call items found in RSS feed");
      }

      logger.info("GCF RSS scrape completed", { count: projects.length });
    } catch (err) {
      logger.error("GCF RSS scrape failed", {
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
