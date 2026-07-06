/**
 * Scraper: fondos.gob.cl — Portal Único de Fondos Concursables del Estado
 *
 * GET /searchernew/ returns all ~400 funds as server-rendered HTML cards.
 * We parse the card grid, filter by agro-relevant keywords/institutions,
 * and map to RawProject[].
 *
 * No API, no auth, no anti-bot. Plain ASP.NET MVC site.
 */
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, parseSpanishDate } from "../utils";
import { fetchWithRetry } from "../retry";
import { getLogger } from "@/lib/utils/logger";

const logger = getLogger("FondosGobScraper");

const LISTING_URL = "https://fondos.gob.cl/searchernew/";
const BASE_URL = "https://fondos.gob.cl";

/**
 * Institutions whose name signals agro relevance (lowercase, normalized).
 * If the card's institution contains any of these, it passes regardless of title.
 */
const AGRO_INSTITUTION_HINTS = [
  "agricultura", "cnr", "riego", "indap", "fia", "sag", "conaf",
  "inia", "odepa", "pesca", "acuicultura", "indespa", "subpesca",
];

/**
 * Keywords in the fund title that signal agro relevance.
 */
const AGRO_TITLE_KEYWORDS = [
  "agríco", "agricol", "agro", "rural", "riego", "campesino",
  "ganader", "pecuari", "forestal", "apícol", "apicol",
  "silvoagropecuari", "agroalimentari", "hídric", "hidric",
  "sustentab", "cambio climátic", "cambio climatico",
  "medioambient", "medio ambient", "biodiversidad",
  "semilla", "fertilizan", "plaga", "fitosanitar",
  "pesca artesanal", "acuícol", "acuicol", "lechería", "lecheria",
  "cooperativa agr", "cooperativa camp",
];

/**
 * If title matches these, exclude even if it matched a broad keyword.
 */
const EXCLUDE_TITLE_KEYWORDS = [
  "música", "musica", "danza", "teatro", "audiovisual", "cine",
  "artesanía", "artesania", "libro", "lectura", "patrimonio cultural",
  "deporte", "deportista",
];

function isAgroRelevant(title: string, institution: string): boolean {
  const instLow = institution.toLowerCase();
  if (AGRO_INSTITUTION_HINTS.some(h => instLow.includes(h))) return true;

  const titleLow = title.toLowerCase();
  if (EXCLUDE_TITLE_KEYWORDS.some(k => titleLow.includes(k))) return false;
  return AGRO_TITLE_KEYWORDS.some(k => titleLow.includes(k));
}

export const fondosGobScraper: Scraper = {
  slug: "fondos-gob",
  name: "Portal Único Fondos Concursables (fondos.gob.cl)",
  homepageUrl: "https://fondos.gob.cl/",

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetchWithRetry(
        LISTING_URL,
        { headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" } },
        3,
        600,
      );
      html = await res.text();
    } catch (err) {
      const msg = (err as Error).message;
      logger.error("Fetch failed", new Error(msg));
      return { sourceSlug, projects: [], partialErrors: [msg] };
    }

    const $ = load(html);

    // Each fund card lives inside a column with a wrapping <a> and .card
    $(".col-md-6.col-lg-3, .col-lg-3").each((_, col) => {
      try {
        const $col = $(col);
        const $card = $col.find(".card").first();
        if (!$card.length) return;

        // Title
        const title = cleanText($card.find("h6, h5, .card-title").first().text());
        if (!title || title.length < 5) return;

        // Institution (the <small> in .titular)
        const institution = cleanText($card.find(".titular small").first().text());

        // Status badge
        const badgeText = cleanText($card.find(".badge").first().text()).toLowerCase();
        const isOpen = badgeText.includes("abierto") || badgeText.includes("por abrir");
        if (!isOpen) return;

        // Filter: only agro-relevant
        if (!isAgroRelevant(title, institution)) return;

        // Alcance (Nacional/Regional/Comunal) from the geo span
        const geoText = cleanText(
          $card.find(".titular .text-white").not(".badge").text()
        ).toLowerCase();
        const ambito: "Nacional" | "Regional" = geoText.includes("regional") || geoText.includes("comunal")
          ? "Regional"
          : "Nacional";

        // Dates — pattern: "Inicio: DD/MM/YYYY | Fin: DD/MM/YYYY"
        const bodyText = $card.find(".card-body").text();
        const finMatch = bodyText.match(/Fin:\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
        const deadline = finMatch ? parseSpanishDate(finMatch[1].replace(/\//g, "-")) : null;

        // Budget
        const montoMatch = bodyText.match(/Montos?:\s*\n?\s*(.+?)(?:\n|$)/i)
          || bodyText.match(/((?:Hasta|Entre)\s+\$[\d.,]+(?:\s+hasta\s+\$[\d.,]+)?)/i);
        const budget = montoMatch ? cleanText(montoMatch[1]) : null;

        // URL from the wrapping <a>
        const href = $col.find("a[href*='/ficha/']").attr("href");
        const url = href
          ? (href.startsWith("http") ? href : `${BASE_URL}${href}`)
          : BASE_URL;

        projects.push({
          title,
          institution: institution || "Estado de Chile",
          url,
          canonicalKey: url,
          deadline,
          budget,
          description: `Fondo concursable del Estado: ${title}`,
          ambito,
          opportunityType: "Convocatoria",
          tags: ["fondos.gob.cl", "Estado"],
          relevanciaChile: true,
        });
      } catch (err) {
        partialErrors.push(`parse: ${(err as Error).message}`);
      }
    });

    // Deduplicate by URL
    const unique = new Map<string, RawProject>();
    for (const p of projects) {
      const key = p.canonicalKey || p.url;
      if (!unique.has(key)) unique.set(key, p);
    }

    if (unique.size === 0 && partialErrors.length === 0) {
      partialErrors.push(
        "No matching cards found — fondos.gob.cl structure may have changed"
      );
    }

    logger.info("Scrape complete", { found: unique.size, errors: partialErrors.length });
    return { sourceSlug, projects: Array.from(unique.values()), partialErrors };
  },
};
