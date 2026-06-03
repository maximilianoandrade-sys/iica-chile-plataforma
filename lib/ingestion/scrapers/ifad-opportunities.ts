import { load } from "cheerio";
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { absoluteUrl, cleanText } from "../utils";
import { isAmericasCountry } from "../geo-filter";
import { fetchWithRetry } from "../retry";

const logger = getLogger("IFADOpportunitiesScraper");

const IFAD_OPPORTUNITIES_URL = "https://www.ifad.org/en/project-procurement/opportunities";

function parseIfadPublishDate(rawDate: string): Date | null {
  if (!rawDate) return null;
  const compact = rawDate.replace(/\(GMT\)/gi, "").trim();
  const match = compact.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})(?:\s*-\s*(\d{1,2}):(\d{2}))?/);
  if (match) {
    const months: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const [, day, month, year, hour = "12", minute = "00"] = match;
    const m = months[month];
    if (m !== undefined) {
      const parsed = new Date(Date.UTC(Number(year), m, Number(day), Number(hour), Number(minute), 0));
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  const parsed = new Date(compact);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractMetaValue($row: any, label: string): string {
  const match = $row
    .find(".undb-meta-data")
    .toArray()
    .map((el: unknown) => cleanText($row.find(el as any).text()))
    .find((text: string) => text.toLowerCase().startsWith(`${label.toLowerCase()}:`));

  if (!match) return "";
  return cleanText(match.replace(new RegExp(`^${label}:`, "i"), ""));
}

function classifyNotice(title: string): { allowed: boolean; opportunityType?: RawProject["opportunityType"]; kind: string } {
  if (/^specific procurement notice/i.test(title)) {
    return { allowed: true, opportunityType: "Licitacion", kind: "SPN" };
  }
  if (/^general procurement notice/i.test(title)) {
    return { allowed: true, opportunityType: "Programa", kind: "GPN" };
  }
  if (/^contract award notice/i.test(title)) {
    return { allowed: false, kind: "CAN" };
  }
  return { allowed: false, kind: "unknown" };
}

function parseRows(html: string): { projects: RawProject[]; partialErrors: string[] } {
  const $ = load(html);
  const partialErrors: string[] = [];
  const projects: RawProject[] = [];

  $(".undb-content").each((index, rowEl) => {
    const $row = $(rowEl);
    const titleRaw = cleanText($row.find(".undb-title").first().text());
    if (!titleRaw) return;

    const notice = classifyNotice(titleRaw);
    if (!notice.allowed) return;

    const country = extractMetaValue($row, "Country");
    if (!country || !isAmericasCountry(country)) return;

    const publishDateRaw = extractMetaValue($row, "Publish Date");
    const publishDate = parseIfadPublishDate(publishDateRaw);

    const projectInfo = extractMetaValue($row, "Project");
    const href = $row.find("a.btn.btn-outline-primary").first().attr("href");
    if (!href) {
      partialErrors.push(`row ${index + 1}: missing opportunity URL`);
      return;
    }

    const url = absoluteUrl(href, IFAD_OPPORTUNITIES_URL);
    const title = cleanText(titleRaw.replace(/\(v\s*\d+(?:\.\d+)?\)\s*$/i, ""));

    projects.push({
      title,
      institution: "IFAD",
      url,
      canonicalKey: url,
      deadline: publishDate,
      budget: null,
      description: projectInfo || undefined,
      tags: ["IFAD", notice.kind],
      opportunityType: notice.opportunityType,
      region: country,
      ambito: "Internacional",
      idioma: "en",
    });
  });

  return { projects, partialErrors };
}

export const ifadOpportunitiesScraper: Scraper = {
  slug: "ifad-opportunities",
  name: "IFAD Project Procurement Opportunities",
  homepageUrl: IFAD_OPPORTUNITIES_URL,

  async scrape(): Promise<ScraperResult> {
    let html = "";
    try {
      const res = await fetchWithRetry(
        IFAD_OPPORTUNITIES_URL,
        {
          headers: {
            "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)",
          },
        },
        3,
        600,
      );
      html = await res.text();
    } catch (err) {
      const message = (err as Error).message;
      logger.error("IFAD opportunities fetch failed", err as Error, { message });
      return {
        sourceSlug: this.slug,
        projects: [],
        partialErrors: [message],
      };
    }

    const { projects, partialErrors } = parseRows(html);

    logger.info("IFAD opportunities scrape completed", {
      projects: projects.length,
      errors: partialErrors.length,
    });

    return {
      sourceSlug: this.slug,
      projects,
      partialErrors,
    };
  },
};
