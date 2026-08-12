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
import { curatedExternalScraper } from "./scrapers/curated-external";

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
  "https://www.undp.org/es/chile/licitaciones", // PNUD Chile
  "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home", // EuropeAid / Horizonte Europa
  "https://projectprocurement.iadb.org/es/procesos-de-adquisicion", // BID Procurement
  "https://www2.fundsforngos.org/",
  "https://www.fosis.gob.cl/", // FOSIS (fondos territoriales/rural)
  "https://www.prochile.gob.cl/", // ProChile
  "https://www.cgiar.org/", // CGIAR (investigación agrícola)
  // ── 16 Gobiernos Regionales de Chile (FIC-R / FNDR / Transferencia Agrícola) ──
  "https://www.gorearicayparinacota.cl/", // GORE Arica y Parinacota
  "https://www.goretarapaca.gov.cl/",      // GORE Tarapacá
  "https://www.goreantofagasta.cl/",      // GORE Antofagasta
  "https://www.goreatacama.cl/",          // GORE Atacama
  "https://www.gorecoquimbo.cl/",         // GORE Coquimbo
  "https://www.gorevalparaiso.cl/",       // GORE Valparaíso
  "https://www.goremet.cl/",              // GORE Región Metropolitana
  "https://www.goreohiggins.cl/",         // GORE O'Higgins
  "https://www.goremaule.cl/",            // GORE Maule
  "https://www.gorenuble.cl/",            // GORE Ñuble
  "https://www.gorebiobio.cl/",           // GORE Biobío
  "https://www.gorearaucania.cl/",        // GORE La Araucanía
  "https://www.gorelarios.cl/",           // GORE Los Ríos
  "https://www.goreloslagos.cl/",         // GORE Los Lagos
  "https://www.goreaysen.cl/",            // GORE Aysén
  "https://www.goremagallanes.cl/",       // GORE Magallanes
  // ── Nuevas Fuentes Internacionales 2026 ──
  "https://genderenvironmentdata.org/small-grants/", // GEDA
  "https://www.ctc-n.org/adaptation-fund-climate-innovation-accelerator", // AFCIA
  "https://futurefornature.org/", // Future for Nature Foundation
  "https://www.cartagena.gov.co/", // Generacción Climática
  "https://www.betterpolitics.foundation/resilient-futures-call-2026", // Resilient Futures Fund
  "https://rea.ec.europa.eu/funding-and-grants/horizon-europe-cluster-6-food-bioeconomy-natural-resources-agriculture-and-environment/biodiversity-and-ecosystem-services_en", // Horizon Europe
  "https://cinea.ec.europa.eu/life-calls-proposals-2026_en", // EU LIFE Programme
  "https://common-fund.org/index.php/call-for-proposals", // Common Fund for Commodities (CFC)
  "https://www.rainforesttrust.org/get-involved/apply-for-funding/", // Rainforest Trust
  // ── Convocatorias e Inteligencia Artificial + Agricultura (AgriTech 2026) ──
  "https://www.microsoft.com/en-us/ai/ai-for-earth", // Microsoft AI for Earth & Climate
  "https://idrc-crdi.ca/en/research-in-action/artificial-intelligence-development", // IDRC AI4D Agriculture
  "https://www.fao.org/digital-agriculture/en/", // FAO Digital Agriculture Hub
  "https://www.ifc.org/en/what-we-do/sector-expertise/agribusiness", // IFC World Bank Agritech
  "https://apps.iica.int/agtech-accelerator/", // IICA AgTech Accelerator
  "https://www.nwo.nl/en/researchprogrammes/kic/kic-ai-for-agriculture-food", // NWO KIC AI Agriculture
  "https://convocatoria.fia.cl/", // FIA Chile Innovación IA Agro
  // ── Adaptación Climática, Recursos Hídricos y Relaciones Bilaterales 2026 ──
  "https://globalebafund.org/grants/", // Global EbA Fund
  "https://www.dfat.gov.au/people-to-people/foundations-councils-institutes/coalar/grants", // COALAR Australia
  "https://www.cnr.gob.cl/concursos-oua/", // CNR OUA Chile
  "https://www.dga.mop.gob.cl/fiie/", // FIIE Recursos Hídricos Chile
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
  curatedExternalScraper,
  universalAiCrawler,
];

/**
 * Heavy scraper requiring Playwright (browser automation).
 * Run separately via: npx tsx scripts/scrape-iica-dashboard.ts
 * NOT included in the main `scrapers` array because it requires
 * Chromium binaries not available in serverless/Vercel.
 */
export { iicaDashboardScraper } from "./scrapers/iica-dashboard";
