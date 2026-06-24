/**
 * Scraper INIA — Instituto de Investigaciones Agropecuarias
 *
 * Scrapes la tabla de licitaciones de INIA disponibles en:
 *   https://www.inia.cl/licitaciones/
 *
 * La tabla tiene columnas: ID/Nombre | Fecha publicación | Fecha cierre | Estado | Documentos
 * Solo se importan licitaciones con estado "Abierta" o "Publicada"
 * (se omiten Adjudicada, Desierta, etc.).
 */
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";
import { fetchWithRetry } from "../retry";

const BASE_URL = "https://www.inia.cl";
const LISTING_URL = `${BASE_URL}/licitaciones/`;

const MONTHS_ES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

export function parseIniaDate(raw: string): Date | null {
  // "25 de febrero 2026" o "25 de febrero de 2026"
  const match = raw
    .toLowerCase()
    .match(/(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de)?\s+(\d{4})/i);
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS_ES[match[2]];
  const year = Number(match[3]);
  if (month === undefined) return null;
  const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return isNaN(date.getTime()) ? null : date;
}

const OPEN_STATUSES = new Set(["abierta", "publicada", "vigente", "en proceso"]);

function isOpenStatus(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return OPEN_STATUSES.has(lower) || lower === "" || lower.startsWith("abierta");
}

export const iniaScraper: Scraper = {
  slug: "inia",
  name: "INIA — Instituto de Investigaciones Agropecuarias",
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

    // La página tiene una tabla DataTables con las licitaciones
    $("table tr").each((_, row) => {
      try {
        const $row = $(row);
        const cells = $row.find("td");
        if (cells.length < 3) return;

        const rawTitle = cleanText(cells.eq(0).text());
        if (!rawTitle || rawTitle.length < 5) return;

        // Estado: generalmente en la columna 3 (índice 3)
        const statusText = cleanText(cells.eq(3).text());
        if (statusText && !isOpenStatus(statusText)) return;

        const fechaCierreRaw = cleanText(cells.eq(2).text());
        const deadline = parseIniaDate(fechaCierreRaw);

        // Buscar primer enlace dentro de la fila para bases
        const $link = $row.find("a[href]").first();
        const href = $link.attr("href");
        const url = href
          ? new URL(href, BASE_URL).toString()
          : LISTING_URL;

        // ID de la licitación está al inicio del título (ej: "ID 01-1433-26 ...")
        const idMatch = rawTitle.match(/^(ID\s+[\w-]+)/i);
        const canonicalKey = idMatch ? `inia-${idMatch[1].replace(/\s+/g, "-")}` : url;

        projects.push({
          title: `[INIA Licitación] ${rawTitle}`,
          institution: "INIA",
          url,
          canonicalKey,
          deadline,
          description: `Licitación INIA. ${statusText ? `Estado: ${statusText}.` : ""}`.trim(),
          ambito: "Nacional",
          opportunityType: "Licitacion",
          tags: ["INIA", "Licitacion", "Investigación Agropecuaria"],
        });
      } catch (err) {
        partialErrors.push(`parse row: ${(err as Error).message}`);
      }
    });

    return { sourceSlug, projects, partialErrors };
  },
};
