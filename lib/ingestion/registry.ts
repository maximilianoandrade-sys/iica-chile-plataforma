import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { indapScraper } from "./scrapers/indap";
import { corfoScraper } from "./scrapers/corfo";
import { fontagroScraper } from "./scrapers/fontagro";
import { iicaHemisfericoScraper } from "./scrapers/iica-hemisferico";

/** Lightweight scrapers (Cheerio-based) suitable for serverless environments */
export const scrapers: Scraper[] = [
  fiaScraper,
  indapScraper,
  corfoScraper,
  fontagroScraper,
  iicaHemisfericoScraper,
];

/**
 * Heavy scraper requiring Playwright (browser automation).
 * Run separately via: npx tsx scripts/scrape-iica-dashboard.ts
 * NOT included in the main `scrapers` array because it requires
 * Chromium binaries not available in serverless/Vercel.
 */
export { iicaDashboardScraper } from "./scrapers/iica-dashboard";
