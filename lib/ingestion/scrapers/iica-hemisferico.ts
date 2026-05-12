/**
 * Scraper IICA Hemisférico — usa WordPress REST API.
 *
 * IICA.int corre WordPress. La página /es/licitaciones es un CPT
 * `bids` accesible vía /wp-json/wp/v2/bids?per_page=50&orderby=date.
 *
 * ¿Por qué REST API en lugar de Cheerio HTML?
 *   - Datos estructurados: ACF expone final_date y monto_adjudicado_text
 *     que en el HTML están enredados con clases CSS variables.
 *   - Más robusto: si IICA cambia el diseño visual, la API sigue.
 *   - Más rápido: payload chico, JSON nativo (no parser HTML).
 *   - Cobertura: 410 bids históricos vs ~15 visibles en página.
 *
 * El scraper NO filtra por final_date (markStale del runner cierra
 * vencidas en post-procesamiento — única fuente de verdad).
 */
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

interface IicaBid {
  id: number;
  title?: { rendered: string };
  link?: string;
  date?: string;
  acf?: {
    final_date?: string;          // "2026-04-30 17:00:00"
    monto_adjudicado_text?: string;
    countries?: number[];
    numero?: string;
    bids_year?: string;
  };
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Ntilde;/g, "Ñ");
}

function parseFinalDate(input?: string): Date | null {
  if (!input || !input.trim()) return null;
  const iso = input.includes("T") ? input : input.replace(" ", "T");
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export const iicaHemisfericoScraper: Scraper = {
  slug: "iica-hemisferico",
  name: "IICA Hemisférico",
  homepageUrl:
    "https://iica.int/wp-json/wp/v2/bids?per_page=50&orderby=date&order=desc&_fields=id,title,link,date,acf",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let bids: IicaBid[];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      bids = await res.json();
      if (!Array.isArray(bids)) throw new Error("respuesta no es array");
    } catch (err) {
      clearTimeout(timeoutId);
      return {
        sourceSlug: this.slug,
        projects: [],
        partialErrors: [(err as Error).message],
      };
    }

    for (const bid of bids) {
      try {
        const titleRaw = bid.title?.rendered;
        if (!titleRaw) {
          partialErrors.push(`bid ${bid.id}: sin title`);
          continue;
        }
        const url = bid.link;
        if (!url) {
          partialErrors.push(`bid ${bid.id}: sin link`);
          continue;
        }

        const deadline = parseFinalDate(bid.acf?.final_date);
        const title = cleanText(decodeHtmlEntities(titleRaw));
        const budget = bid.acf?.monto_adjudicado_text?.trim() || null;

        projects.push({
          title,
          institution: "IICA Sede Central",
          url,
          deadline,
          budget,
          ambito: "Internacional",
          tags: ["IICA", "Licitación institucional"],
        });
      } catch (err) {
        partialErrors.push(`bid ${bid.id}: ${(err as Error).message}`);
      }
    }

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
