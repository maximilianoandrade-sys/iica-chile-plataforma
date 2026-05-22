/**
 * Scraper GEF — Global Environment Facility project database.
 *
 * Strategy: Try CSV export first, fallback to HTML table scraping.
 * Filters to Americas countries only and active projects.
 */
import { load } from "cheerio";
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";
import { isAmericasCountry } from "../geo-filter";

const logger = getLogger("GEFScraper");

const BASE_URL = "https://www.thegef.org/projects-operations/database";
const CSV_URL =
  "https://www.thegef.org/projects-operations/database/export?page&_format=csv";
const PROJECT_URL_BASE = "https://www.thegef.org/projects-operations/projects/";

const ACTIVE_STATUSES = new Set(["project approved", "concept approved"]);

const FETCH_OPTIONS = {
  headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
};

function hasAmericasCountry(countriesStr: string): boolean {
  const countries = countriesStr.split(",").map((c) => c.trim());
  return countries.some((c) => isAmericasCountry(c));
}

function getAmericasCountries(countriesStr: string): string {
  return countriesStr
    .split(",")
    .map((c) => c.trim())
    .filter((c) => isAmericasCountry(c))
    .join(", ");
}

function formatBudget(raw: string): string | null {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return `USD ${Math.round(num).toLocaleString("en-US")}`;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...FETCH_OPTIONS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

function parseHtmlRows(html: string): RawProject[] {
  const $ = load(html);
  const projects: RawProject[] = [];

  $("table tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 9) return;

    const title = cleanText($(cells[0]).text());
    const id = cleanText($(cells[1]).text());
    const countries = cleanText($(cells[2]).text());
    const focalAreas = cleanText($(cells[3]).text());
    // cells[4] = Type (unused)
    const agencies = cleanText($(cells[5]).text());
    const gefGrant = cleanText($(cells[6]).text());
    // cells[7] = Cofinancing (unused)
    const status = cleanText($(cells[8]).text());

    if (!ACTIVE_STATUSES.has(status.toLowerCase())) return;
    if (!hasAmericasCountry(countries)) return;
    if (!id || !title) return;

    const tags = ["GEF"];
    if (focalAreas) {
      focalAreas.split(",").forEach((fa) => {
        const trimmed = fa.trim();
        if (trimmed) tags.push(trimmed);
      });
    }

    projects.push({
      title,
      institution: agencies || "GEF",
      url: `${PROJECT_URL_BASE}${id}`,
      budget: formatBudget(gefGrant),
      deadline: null,
      description: focalAreas || undefined,
      tags,
      region: getAmericasCountries(countries) || countries,
      ambito: "Internacional",
      idioma: "en",
    });
  });

  return projects;
}

function parseCsv(csvText: string): RawProject[] {
  const lines = csvText.split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const titleIdx = headers.findIndex((h) => h.includes("title"));
  const idIdx = headers.findIndex((h) => h === "id" || h.includes("gef id"));
  const countriesIdx = headers.findIndex((h) => h.includes("countr"));
  const focalIdx = headers.findIndex((h) => h.includes("focal"));
  const agenciesIdx = headers.findIndex((h) => h.includes("agenc"));
  const grantIdx = headers.findIndex((h) => h.includes("grant"));
  const statusIdx = headers.findIndex((h) => h.includes("status"));

  if (titleIdx < 0 || idIdx < 0) return [];

  const projects: RawProject[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse (doesn't handle quoted commas perfectly but sufficient)
    const cells = line.split(",");

    const title = cleanText(cells[titleIdx] || "");
    const id = cleanText(cells[idIdx] || "");
    const countries = cleanText(cells[countriesIdx] || "");
    const focalAreas = cleanText(cells[focalIdx] || "");
    const agencies = cleanText(cells[agenciesIdx] || "");
    const gefGrant = cleanText(cells[grantIdx] || "");
    const status = cleanText(cells[statusIdx] || "");

    if (statusIdx >= 0 && !ACTIVE_STATUSES.has(status.toLowerCase())) continue;
    if (countriesIdx >= 0 && !hasAmericasCountry(countries)) continue;
    if (!id || !title) continue;

    const tags = ["GEF"];
    if (focalAreas) {
      focalAreas.split(",").forEach((fa) => {
        const trimmed = fa.trim();
        if (trimmed) tags.push(trimmed);
      });
    }

    projects.push({
      title,
      institution: agencies || "GEF",
      url: `${PROJECT_URL_BASE}${id}`,
      budget: formatBudget(gefGrant),
      deadline: null,
      description: focalAreas || undefined,
      tags,
      region: getAmericasCountries(countries) || countries,
      ambito: "Internacional",
      idioma: "en",
    });
  }

  return projects;
}

export const gefScraper: Scraper = {
  slug: "gef",
  name: "GEF — Global Environment Facility",
  homepageUrl: BASE_URL,

  async scrape(): Promise<ScraperResult> {
    const partialErrors: string[] = [];

    // Try CSV export first
    try {
      logger.info("Attempting CSV export fetch");
      const res = await fetchWithTimeout(CSV_URL);
      if (res.ok) {
        const csvText = await res.text();
        const projects = parseCsv(csvText);
        if (projects.length > 0) {
          logger.info("CSV export successful", { count: projects.length });
          return { sourceSlug: this.slug, projects, partialErrors };
        }
        logger.warn("CSV export returned no parseable projects, falling back to HTML");
      } else {
        logger.warn("CSV export returned non-200, falling back to HTML", {
          status: res.status,
        });
      }
    } catch (err) {
      logger.warn("CSV export failed, falling back to HTML", {
        error: (err as Error).message,
      });
      partialErrors.push(`CSV fetch failed: ${(err as Error).message}`);
    }

    // Fallback: HTML table scraping (pages 0 and 1)
    const allProjects: RawProject[] = [];
    for (const page of [0, 1]) {
      const url = `${BASE_URL}?page=${page}`;
      try {
        logger.info("Fetching HTML page", { page });
        const res = await fetchWithTimeout(url);
        if (!res.ok) {
          partialErrors.push(`HTML page ${page}: HTTP ${res.status}`);
          continue;
        }
        const html = await res.text();
        const projects = parseHtmlRows(html);
        allProjects.push(...projects);
      } catch (err) {
        const msg = `HTML page ${page}: ${(err as Error).message}`;
        partialErrors.push(msg);
        logger.error("HTML page fetch failed", { page, error: (err as Error).message });
      }
    }

    if (allProjects.length === 0 && partialErrors.length > 0) {
      logger.error("GEF scrape failed completely", { errors: partialErrors });
    } else {
      logger.info("GEF HTML scrape completed", {
        count: allProjects.length,
        errors: partialErrors.length,
      });
    }

    return { sourceSlug: this.slug, projects: allProjects, partialErrors };
  },
};
