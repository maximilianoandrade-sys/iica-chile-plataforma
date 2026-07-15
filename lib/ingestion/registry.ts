import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { fiaLicitacionesScraper } from "./scrapers/fia-licitaciones";
import { corfoScraper } from "./scrapers/corfo";
import { cnrScraper } from "./scrapers/cnr";
import { fondosGobScraper } from "./scrapers/fondos-gob";
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
import { scrapeUrlWithAI } from "./universal-ai-scraper";
import type { RawProject } from "./types";

const TARGET_URLS = [
  "https://www.agci.cl/becas/becas-para-chilenos", // AGCID
  "https://www.sercotec.cl/programas/", // SERCOTEC
  "https://www.goremet.cl/", // FNDR/GORE (Ejemplo GORE RM)
  "https://www.undp.org/es/chile/licitaciones", // PNUD Chile
  "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home", // EuropeAid / Horizonte Europa
  "https://projectprocurement.iadb.org/es/procesos-de-adquisicion", // BID Procurement
  "https://www2.fundsforngos.org/",
  "https://international.grantwatch.com/",
  "https://www.forus-international.org/es/funding-opportunities",
  "https://www.visegradfund.org/grants",
  "https://www.developmentaid.org/", // DevelopmentAid
];

export const universalAiCrawler: Scraper = {
  slug: "universal-ai-crawler",
  name: "Extractor Universal LLM",
  homepageUrl: "https://gemini.google.com",
  async scrape() {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];
    
    for (const url of TARGET_URLS) {
      try {
        const project = await scrapeUrlWithAI(url);
        if (project) projects.push(project);
      } catch (err) {
        partialErrors.push(`Failed URL ${url}: ${(err as Error).message}`);
      }
    }
    
    return {
      sourceSlug: this.slug,
      projects,
      partialErrors
    };
  }
};

export const scrapers: Scraper[] = [
  fiaScraper,
  fiaLicitacionesScraper,
  corfoScraper,
  indapScraper,
  fontagroScraper,
  cnrScraper,
  fondosGobScraper,
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
  universalAiCrawler,
];

/**
 * Heavy scraper requiring Playwright (browser automation).
 * Run separately via: npx tsx scripts/scrape-iica-dashboard.ts
 * NOT included in the main `scrapers` array because it requires
 * Chromium binaries not available in serverless/Vercel.
 */
export { iicaDashboardScraper } from "./scrapers/iica-dashboard";
