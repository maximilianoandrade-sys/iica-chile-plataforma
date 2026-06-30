import { getLogger } from "@/lib/utils/logger";
import type { RawProject, Scraper, ScraperResult } from "../types";
import { cleanText } from "../utils";
import { isAmericasCountry } from "../geo-filter";
import { fetchWithRetry } from "../retry";

const logger = getLogger("DevexFundingScraper");

const DEVEX_API_URL = "https://www.devex.com/api/funding_projects";
const DEFAULT_QUERY =
  "filter%5Bplaces%5D%5B%5D=Chile&filter%5Bstatuses%5D%5B%5D=forecast&filter%5Bstatuses%5D%5B%5D=open&sorting%5Border%5D=desc&sorting%5Bfield%5D=updated_at";

const MAX_PAGES = 3;
const CRAWL_DELAY_MS = 10000;

const DEVEX_BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
  Referer: "https://www.devex.com/funding/r",
  Origin: "https://www.devex.com",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
};

interface DevexPlace {
  name?: string;
}

interface DevexFundingItem {
  id?: number;
  type?: string;
  title?: string;
  places?: DevexPlace[];
  deadline?: string | null;
  updated_at?: string | null;
  status?: string;
  summarized_description?: string | null;
}

interface DevexFundingResponse {
  data?: DevexFundingItem[];
  page?: {
    next_url?: string | null;
  };
  url?: string;
}

function stripHtml(value: string | null | undefined): string {
  if (!value) return "";
  return cleanText(value.replace(/<[^>]+>/g, " "));
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapOpportunityType(type: string | undefined): RawProject["opportunityType"] {
  if (!type) return "Licitacion";
  const normalized = type.toLowerCase();
  if (normalized === "pipeline" || normalized === "funding_info") return "Programa";
  return "Licitacion";
}

function shouldKeepType(type: string | undefined): boolean {
  if (!type) return true;
  const normalized = type.toLowerCase();
  return ["tender", "grant", "open_opportunity", "pipeline", "funding_info"].includes(normalized);
}

function buildPageUrl(nextUrl: string | null | undefined): string {
  if (!nextUrl) {
    return `${DEVEX_API_URL}?${DEFAULT_QUERY}`;
  }

  if (nextUrl.startsWith("http://") || nextUrl.startsWith("https://")) {
    return nextUrl;
  }

  if (nextUrl.startsWith("/")) {
    if (nextUrl.startsWith("/funding_projects")) {
      return `https://www.devex.com/api${nextUrl}`;
    }
    return `https://www.devex.com${nextUrl}`;
  }

  return `${DEVEX_API_URL}?${nextUrl}`;
}

function buildProjectUrl(item: DevexFundingItem): string {
  const kind = cleanText(item.type || "tender").toLowerCase() || "tender";
  return `https://www.devex.com/funding/r?report=${kind}-${item.id}`;
}

export const devexFundingScraper: Scraper = {
  slug: "devex-funding",
  name: "Devex Funding Search",
  homepageUrl: `https://www.devex.com/funding/r?${DEFAULT_QUERY}`,

  async scrape(): Promise<ScraperResult> {
    const partialErrors: string[] = [];
    const projects: RawProject[] = [];
    const seenKeys = new Set<string>();
    let nextUrl: string | null = null;

    for (let page = 1; page <= MAX_PAGES; page++) {
      const pageUrl = buildPageUrl(nextUrl);

      let bodyText = "";
      try {
        const response = await fetchWithRetry(
          pageUrl,
          {
            headers: DEVEX_BROWSER_HEADERS,
          },
          3,
          600,
        );
        bodyText = await response.text();
      } catch (err) {
        const message = (err as Error).message;
        partialErrors.push(message);
        logger.error("Devex funding fetch failed", err as Error, { page, pageUrl, message });
        break;
      }

      let payload: DevexFundingResponse;
      try {
        payload = JSON.parse(bodyText) as DevexFundingResponse;
      } catch {
        const message = "Devex funding payload is not valid JSON";
        partialErrors.push(message);
        logger.warn("Devex funding JSON parse failed", { page, pageUrl });
        break;
      }

      if (typeof payload.url === "string" && payload.url.includes("captcha")) {
        const message = "Devex funding blocked by captcha challenge";
        partialErrors.push(message);
        logger.warn("Devex captcha challenge detected", { page, pageUrl });
        break;
      }

      const records = payload.data ?? [];
      for (const item of records) {
        const id = item.id;
        const type = cleanText(item.type || "tender").toLowerCase() || "tender";

        if (!id) {
          partialErrors.push("devex record without id");
          continue;
        }

        if (!shouldKeepType(type)) {
          continue;
        }

        const title = cleanText(item.title);
        if (!title) {
          partialErrors.push(`devex record ${id}: missing title`);
          continue;
        }

        const firstPlace = cleanText(item.places?.[0]?.name);
        if (!firstPlace || !isAmericasCountry(firstPlace)) {
          continue;
        }

        const canonicalKey = `devex:${type}:${id}`;
        if (seenKeys.has(canonicalKey)) {
          continue;
        }
        seenKeys.add(canonicalKey);

        const deadline = parseDate(item.deadline) || parseDate(item.updated_at);

        // Chile relevance: true if firstPlace is Chile, or title/description mentions Chile
        const allPlaces = (item.places ?? []).map(p => cleanText(p.name).toLowerCase());
        const descText = stripHtml(item.summarized_description).toLowerCase();
        const titleLower = title.toLowerCase();
        const relevanciaChile =
          firstPlace.toLowerCase() === 'chile' ||
          allPlaces.includes('chile') ||
          titleLower.includes('chile') ||
          descText.includes('chile');

        projects.push({
          title,
          institution: "Devex",
          url: buildProjectUrl(item),
          canonicalKey,
          deadline,
          budget: null,
          description: stripHtml(item.summarized_description),
          tags: ["Devex", cleanText(item.status || "open") || "open", type],
          opportunityType: mapOpportunityType(type),
          region: firstPlace,
          ambito: "Internacional",
          idioma: "en",
          relevanciaChile,
        });
      }

      const maybeNext = payload.page?.next_url ?? null;
      nextUrl = maybeNext;
      if (!nextUrl) {
        break;
      }

      if (page < MAX_PAGES) {
        await new Promise((resolve) => setTimeout(resolve, CRAWL_DELAY_MS));
      }
    }

    logger.info("Devex funding scrape completed", {
      projects: projects.length,
      errors: partialErrors.length,
      maxPages: MAX_PAGES,
    });

    return {
      sourceSlug: this.slug,
      projects,
      partialErrors,
    };
  },
};
