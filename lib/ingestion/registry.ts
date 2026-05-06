import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { iicaHemisfericoScraper } from "./scrapers/iica-hemisferico";

/**
 * Scrapers de Capa A (determinísticos, corren diariamente vía GitHub Actions).
 *
 * Fuentes que NO están aquí y por qué:
 * - INDAP / CORFO: opera con programas continuos (no convocatorias time-bound).
 *   Las licitaciones específicas aparecen en Mercado Público (capturadas como
 *   API live en /api/search-projects). AI Discovery (Capa B) cubre lo demás.
 * - FONTAGRO: no expone WP REST ni API pública. Diferido a v2 (requiere
 *   Playwright o partnership con FONTAGRO para feed JSON).
 * - SAG / MINAGRI / ANID / GEF / GCF / etc.: cobertura vía Mercado Público
 *   (nacionales) y AI Discovery (internacionales).
 */
export const scrapers: Scraper[] = [
  fiaScraper,
  iicaHemisfericoScraper,
];
