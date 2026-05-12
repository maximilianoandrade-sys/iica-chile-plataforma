import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { corfoScraper } from "./scrapers/corfo";
import { iicaHemisfericoScraper } from "./scrapers/iica-hemisferico";

/**
 * Scrapers de Capa A (determinísticos, corren diario vía GitHub Actions).
 *
 * QUÉ NO ESTÁ ACÁ Y POR QUÉ:
 * ─────────────────────────
 * - INDAP: opera con programas continuos (PRODESAL, PAP, PDI...) no
 *   convocatorias time-bound. La plata pública concreta va a Mercado
 *   Público (capturado en runtime por /api/search-projects). AI Discovery
 *   semanal cubre lo demás. El scraper inicial devolvía 0 hits.
 *
 * - FONTAGRO: el sitio no expone WP REST ni API pública. El scraper
 *   genérico de Cheerio devolvía 0 hits porque sus clases CSS no eran
 *   estándar. AI Discovery semanal lo captura mejor que un scraper
 *   roto. Los archivos lib/ingestion/scrapers/indap.ts y fontagro.ts
 *   se mantienen como referencia/punto de partida para reescribirlos
 *   con Playwright en el futuro si se invierte el tiempo.
 *
 * - IICA Dashboard (Playwright): requiere browser headless + cookie
 *   Cloudflare persistente. Se corre separadamente (ver export más abajo).
 */
export const scrapers: Scraper[] = [
  fiaScraper,
  corfoScraper,
  iicaHemisfericoScraper,
];

/**
 * Heavy scraper requiring Playwright (browser automation).
 * Run separately via: npx tsx scripts/scrape-iica-dashboard.ts
 * NOT included in the main `scrapers` array because it requires
 * Chromium binaries not available in serverless/Vercel.
 */
export { iicaDashboardScraper } from "./scrapers/iica-dashboard";
