/**
 * Scraper ANID — Agencia Nacional de Investigación y Desarrollo
 *
 * Estrategia: fetcher HTML estático + Cheerio con selectores amplios.
 * ANID usa WordPress/Elementor, pero las URLs de concursos individuales
 * aparecen en el HTML server-side como enlaces internos. Se filtran
 * por patrón `/concursos/[slug]/` y se descartan la página raíz de listado.
 *
 * Los concursos con estado "Adjudicado" o "Desierto" se omiten.
 */
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";
import { fetchWithRetry } from "../retry";

const ANID_BASE = "https://anid.cl";
const LISTING_URL = `${ANID_BASE}/concursos/`;

const MONTHS_ES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

export function parseAnidDate(raw: string): Date | null {
  // "19 de junio, 2026" o "6 de agosto, 2026 - 13:00"
  const match = raw.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)[,\s]+(\d{4})/i);
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS_ES[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (month === undefined) return null;
  const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return isNaN(date.getTime()) ? null : date;
}

const SKIP_KEYWORDS = ["adjudicado", "desierto", "suspendido"];

function isClosedStatus(text: string): boolean {
  const lower = text.toLowerCase();
  return SKIP_KEYWORDS.some((kw) => lower.includes(kw));
}

function isIndividualConcursoUrl(href: string): boolean {
  try {
    const u = new URL(href, ANID_BASE);
    // La URL del listado termina en /concursos/; los individuales tienen slug adicional
    const path = u.pathname.replace(/\/$/, "");
    return (
      u.hostname.includes("anid.cl") &&
      /\/concursos\/.+/.test(path)
    );
  } catch {
    return false;
  }
}

export const anidScraper: Scraper = {
  slug: "anid",
  name: "ANID — Agencia Nacional de Investigación y Desarrollo",
  homepageUrl: LISTING_URL,

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetchWithRetry(
        this.homepageUrl,
        { headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" } },
        3,
        600,
      );
      html = await res.text();
    } catch (err) {
      return { sourceSlug, projects: [], partialErrors: [(err as Error).message] };
    }

    const $ = load(html);
    const seen = new Set<string>();

    $("a[href]").each((_, el) => {
      try {
        const $el = $(el);
        const href = $el.attr("href") ?? "";
        if (!isIndividualConcursoUrl(href)) return;

        const url = new URL(href, ANID_BASE).toString();
        if (seen.has(url)) return;

        // Busca el contenedor del card (ancestro con texto de fecha)
        const $card = $el.closest("article, .elementor-post, .jet-listing-grid__item, li, div");

        // Omitir si el card contiene estado cerrado
        const cardText = $card.text();
        if (isClosedStatus(cardText)) return;

        // Título desde el propio enlace o h2/h3 dentro del card
        const rawTitle = cleanText(
          $card.find("h2, h3").first().text() ||
          $el.text(),
        );
        if (!rawTitle || rawTitle.length < 5) return;

        // Cierre desde el texto del card
        const cierreMatch = cardText.match(/[Cc]ierre[:\s]+([^\n\r|]+)/);
        const deadline = cierreMatch ? parseAnidDate(cierreMatch[1]) : null;

        const description = cleanText(
          $card.find("p, .excerpt, .descripcion").first().text(),
        );

        seen.add(url);
        projects.push({
          title: `[ANID] ${rawTitle}`,
          institution: "ANID",
          url,
          canonicalKey: url,
          deadline,
          description: description || "Concurso ANID de investigación y desarrollo.",
          ambito: "Nacional",
          opportunityType: "Convocatoria",
          tags: ["ANID", "Investigación", "Chile"],
        });
      } catch (err) {
        partialErrors.push(`parse: ${(err as Error).message}`);
      }
    });

    return { sourceSlug, projects, partialErrors };
  },
};
