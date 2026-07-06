import { getLogger } from "@/lib/utils/logger";
import type { RawProject, Scraper, ScraperResult } from "../types";
import { fetchWithRetry } from "../retry";
import { isAmericasCountry } from "../geo-filter";

const logger = getLogger("TEDNoticesScraper");

const TED_SEARCH_URL = "https://api.ted.europa.eu/v3/notices/search";

const TED_FIELDS = [
  "notice-title",
  "publication-number",
  "publication-date",
  "place-of-performance-country-proc",
  "deadline-receipt-tender-date-lot",
  "buyer-name",
];

const TED_QUERY_STRINGS = [
  'notice-title~"agriculture"',
  'notice-title~"agricultura" OR notice-title~"rural" OR notice-title~"irrigation"',
];

function buildTedRequestBody(query: string) {
  return {
    query,
    fields: TED_FIELDS,
    limit: 100,
    page: 1,
    scope: "LATEST",
    paginationMode: "PAGE_NUMBER",
  };
}

const IICA_CODE_TO_NAME: Record<string, string> = {
  ARG: "Argentina",
  BOL: "Bolivia",
  BRA: "Brazil",
  CHL: "Chile",
  COL: "Colombia",
  ECU: "Ecuador",
  PRY: "Paraguay",
  PER: "Peru",
  URY: "Uruguay",
  VEN: "Venezuela",
  CAN: "Canada",
  USA: "United States",
  MEX: "Mexico",
  BLZ: "Belize",
  CRI: "Costa Rica",
  SLV: "El Salvador",
  GTM: "Guatemala",
  HND: "Honduras",
  NIC: "Nicaragua",
  PAN: "Panama",
  ATG: "Antigua and Barbuda",
  BHS: "Bahamas",
  BRB: "Barbados",
  DMA: "Dominica",
  DOM: "Dominican Republic",
  GRD: "Grenada",
  GUY: "Guyana",
  HTI: "Haiti",
  JAM: "Jamaica",
  KNA: "Saint Kitts and Nevis",
  LCA: "Saint Lucia",
  VCT: "Saint Vincent and the Grenadines",
  SUR: "Suriname",
  TTO: "Trinidad and Tobago",
};

interface TedNotice {
  "notice-title"?: Record<string, string | string[]>;
  "publication-number"?: string;
  "publication-date"?: string;
  "place-of-performance-country-proc"?: string[];
  "deadline-receipt-tender-date-lot"?: string[];
  "buyer-name"?: Record<string, string | string[]>;
  links?: {
    htmlDirect?: Record<string, string>;
    html?: Record<string, string>;
    pdf?: Record<string, string>;
  };
}

interface TedSearchResponse {
  notices?: TedNotice[];
}

function toText(value: string | string[] | undefined): string {
  if (!value) return "";
  if (Array.isArray(value)) return value[0] || "";
  return value;
}

function pickLocalizedText(values: Record<string, string | string[]> | undefined): string {
  if (!values) return "";

  const preferredLangs = ["eng", "spa", "fra", "por", "deu"];
  for (const lang of preferredLangs) {
    const text = toText(values[lang]);
    if (text) return text;
  }

  const firstValue = Object.values(values)[0];
  return toText(firstValue);
}

function parseTedDate(value: string | undefined): Date | null {
  if (!value) return null;

  const normalized = value.trim();
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const dateWithOffset = normalized.match(/^(\d{4}-\d{2}-\d{2})([+-]\d{2}:\d{2})$/);
  if (dateWithOffset) {
    const [, datePart, offsetPart] = dateWithOffset;
    const withMidnightTime = new Date(`${datePart}T00:00:00${offsetPart}`);
    if (!Number.isNaN(withMidnightTime.getTime())) {
      return withMidnightTime;
    }
  }

  return null;
}

function mapCountryCodeToName(code: string | undefined): string {
  if (!code) return "";
  return IICA_CODE_TO_NAME[code] ?? "";
}

function pickNoticeUrl(notice: TedNotice): string {
  return (
    notice.links?.htmlDirect?.ENG ||
    notice.links?.html?.ENG ||
    notice.links?.pdf?.ENG ||
    ""
  );
}

export const tedNoticesScraper: Scraper = {
  slug: "ted-notices",
  name: "TED Public Notices",
  homepageUrl: "https://ted.europa.eu/en/search/expert-search",

  async scrape(): Promise<ScraperResult> {
    const partialErrors: string[] = [];
    const uniqueNotices = new Map<string, TedNotice>();

    for (const query of TED_QUERY_STRINGS) {
      try {
        const res = await fetchWithRetry(
          TED_SEARCH_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)",
            },
            body: JSON.stringify(buildTedRequestBody(query)),
          },
          3,
          600,
        );

        const data = (await res.json()) as TedSearchResponse;
        for (const notice of data.notices ?? []) {
          const key = notice["publication-number"] || pickNoticeUrl(notice) || pickLocalizedText(notice["notice-title"]);
          if (!key || uniqueNotices.has(key)) continue;
          uniqueNotices.set(key, notice);
        }
      } catch (err) {
        const message = (err as Error).message;
        partialErrors.push(message);
        logger.warn("TED query failed", { query, message });
      }
    }

    if (uniqueNotices.size === 0 && partialErrors.length > 0) {
      logger.error("TED notice search failed", new Error(partialErrors.join(" | ")), {
        errors: partialErrors,
      });
      return {
        sourceSlug: this.slug,
        projects: [],
        partialErrors,
      };
    }

    const projects: RawProject[] = [];

    for (const notice of Array.from(uniqueNotices.values())) {
      const title = pickLocalizedText(notice["notice-title"]);
      if (!title) {
        partialErrors.push("notice without title");
        continue;
      }

      const countryCode = notice["place-of-performance-country-proc"]?.[0];
      const countryName = mapCountryCodeToName(countryCode);
      if (!countryName || !isAmericasCountry(countryName)) {
        continue;
      }

      const url = pickNoticeUrl(notice);
      if (!url) {
        partialErrors.push(`notice ${notice["publication-number"] || "unknown"}: missing URL`);
        continue;
      }

      const institution = pickLocalizedText(notice["buyer-name"]) || "TED Buyer";
      const deadline = parseTedDate(notice["deadline-receipt-tender-date-lot"]?.[0]);
      const publicationDate = parseTedDate(notice["publication-date"]);

      projects.push({
        title,
        institution,
        url,
        canonicalKey: url,
        deadline: deadline || publicationDate,
        budget: null,
        tags: ["TED", "Licitacion"],
        opportunityType: "Licitacion",
        region: countryName,
        ambito: "Internacional",
        idioma: "en",
      });
    }

    logger.info("TED notice scrape completed", {
      noticeCandidates: uniqueNotices.size,
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
