import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { fiaLicitacionesScraper } from "./scrapers/fia-licitaciones";
import { corfoScraper } from "./scrapers/corfo";
import { cnrScraper } from "./scrapers/cnr";
import { indapScraper } from "./scrapers/indap";
import { fontagroScraper } from "./scrapers/fontagro";
import { iicaHemisfericoScraper } from "./scrapers/iica-hemisferico";
import { ifadOpportunitiesScraper } from "./scrapers/ifad-opportunities";
import { tedNoticesScraper } from "./scrapers/ted-notices";
import { devexFundingScraper } from "./scrapers/devex-funding";
import { worldBankScraper } from "./scrapers/world-bank";
import { ungmScraper } from "./scrapers/ungm";
import { gefScraper } from "./scrapers/gef";
import { ikiScraper } from "./scrapers/iki";
import { gafspScraper } from "./scrapers/gafsp";
import { aecidScraper } from "./scrapers/aecid";
import { gcfScraper } from "./scrapers/gcf";
import { afdScraper } from "./scrapers/afd";
import { fundsforNgosScraper } from "./scrapers/fundsforngos";
import { anidScraper } from "./scrapers/anid";
import { minagriFeedScraper } from "./scrapers/minagri-licitaciones";
import { iniaScraper } from "./scrapers/inia";
import { globalSouthOpportunitiesScraper } from "./scrapers/global-south-opportunities";

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
  ifadOpportunitiesScraper,
  tedNoticesScraper,
  devexFundingScraper,
  worldBankScraper,
  ungmScraper,
  gefScraper,
  ikiScraper,
  gafspScraper,
  aecidScraper,
  gcfScraper,
  afdScraper,
  fundsforNgosScraper,
  anidScraper,
  minagriFeedScraper,
  iniaScraper,
  globalSouthOpportunitiesScraper,
];

/**
 * Heavy scraper requiring Playwright (browser automation).
 * Run separately via: npx tsx scripts/scrape-iica-dashboard.ts
 * NOT included in the main `scrapers` array because it requires
 * Chromium binaries not available in serverless/Vercel.
 */
export { iicaDashboardScraper } from "./scrapers/iica-dashboard";
