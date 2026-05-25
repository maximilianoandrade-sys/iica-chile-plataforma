import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { fiaLicitacionesScraper } from "./scrapers/fia-licitaciones";
import { corfoScraper } from "./scrapers/corfo";
import { cnrScraper } from "./scrapers/cnr";
import { indapScraper } from "./scrapers/indap";
import { fontagroScraper } from "./scrapers/fontagro";
import { iicaHemisfericoScraper } from "./scrapers/iica-hemisferico";
import { worldBankScraper } from "./scrapers/world-bank";
import { ungmScraper } from "./scrapers/ungm";
import { gefScraper } from "./scrapers/gef";

/**
 * Scrapers de Capa A (determinísticos, corren diario vía GitHub Actions).
 *
 * QUÉ NO ESTÁ ACÁ Y POR QUÉ:
 * ─────────────────────────
 * Incluye ahora INDAP, FONTAGRO y FIA licitaciones para cubrir mejor
 * oportunidades postulables que antes quedaban fuera por cambios de
 * estructura HTML o fuentes no incluidas en la corrida diaria.
 *
 * - IICA Dashboard (Playwright): requiere browser headless + cookie
 *   Cloudflare persistente. Se corre separadamente (ver export más abajo).
 */
export const scrapers: Scraper[] = [
  fiaScraper,
  fiaLicitacionesScraper,
  corfoScraper,
  indapScraper,
  fontagroScraper,
  cnrScraper,
  iicaHemisfericoScraper,
  worldBankScraper,
  ungmScraper,
  gefScraper,
];

/**
 * Heavy scraper requiring Playwright (browser automation).
 * Run separately via: npx tsx scripts/scrape-iica-dashboard.ts
 * NOT included in the main `scrapers` array because it requires
 * Chromium binaries not available in serverless/Vercel.
 */
export { iicaDashboardScraper } from "./scrapers/iica-dashboard";
