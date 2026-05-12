/**
 * Scraper CNR — Comisión Nacional de Riego (Chile).
 *
 * CNR publica el calendario de concursos Ley 18.450 (subsidios a riego)
 * en /agricultores/calendario-de-concurso/. Tabla HTML estructurada:
 *
 *   <tr>
 *     <td>01-2026</td>                      ← código
 *     <td>Primer concurso de obras...</td>  ← título descriptivo
 *     <td>8.500</td>                        ← monto en miles de UF
 *     <td>Arica Antofagasta ...</td>        ← regiones
 *     <td>07-01-2026</td>                   ← apertura
 *     <td>14-01-2026</td>                   ← publicación bases
 *     <td>11-02-2026</td>                   ← CIERRE (DD-MM-YYYY)
 *   </tr>
 *
 * URL detalle: https://ley18450.cnr.gob.cl/.../?concurso=XX-YYYY
 */
import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

const DATE_RE = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;

function parseCnrDate(s: string): Date | null {
  if (!s) return null;
  const m = s.trim().match(DATE_RE);
  if (!m) return null;
  const [, d, mo, y] = m;
  // Mediodía UTC para evitar bugs de TZ (la fecha se preserva en cualquier locale).
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12, 0, 0));
  return isNaN(date.getTime()) ? null : date;
}

export const cnrScraper: Scraper = {
  slug: "cnr",
  name: "CNR — Comisión Nacional de Riego",
  homepageUrl: "https://www.cnr.gob.cl/agricultores/calendario-de-concurso/",

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(this.homepageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      clearTimeout(timeoutId);
      return { sourceSlug, projects: [], partialErrors: [(err as Error).message] };
    }

    const $ = load(html);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    $("tr").each((_, el) => {
      try {
        const $tr = $(el);
        const $link = $tr.find('a[href*="ley18450.cnr.gob.cl"]').first();
        const detailUrl = $link.attr("href");
        if (!detailUrl) return;

        // children("td") = solo cells directos (no recursivo en nested tables)
        const $cells = $tr.children("td");
        if ($cells.length < 5) return; // fila incompleta

        const code = cleanText($cells.eq(0).text());
        const title = cleanText($cells.eq(1).text());
        const montoUf = cleanText($cells.eq(2).text()); // "8.500" en miles
        const regiones = cleanText($cells.eq(3).text());

        if (!code || !title || title.length < 5) {
          partialErrors.push(`${code || "?"}: fila incompleta`);
          return;
        }

        // Fechas: cells[4] = apertura, cells[5] = publicación bases,
        // última cell con DD-MM-YYYY = cierre.
        const publicacionBases = parseCnrDate(cleanText($cells.eq(5).text()));
        let deadline: Date | null = null;
        for (let i = $cells.length - 1; i >= 4; i--) {
          const d = parseCnrDate(cleanText($cells.eq(i).text()));
          if (d) {
            deadline = d;
            break;
          }
        }

        // El sitio de detalle (ley18450.cnr.gob.cl) es una SPA Java que
        // solo muestra contenido REAL una vez que se PUBLICARON LAS BASES
        // del concurso (cell[5]). Antes de eso devuelve un shell vacío
        // que parece "página rota". En ese caso apuntamos al listado del
        // calendario donde el usuario ve la fila con código y fechas.
        const stillFuture = publicacionBases && publicacionBases.getTime() > today.getTime();
        const url = stillFuture ? this.homepageUrl : detailUrl;

        const montoText = montoUf ? `Monto: ${montoUf} mil UF.` : "";
        const regionesText = regiones ? `Regiones: ${regiones.slice(0, 200)}.` : "";
        const futureNote = stillFuture
          ? ` (Aún no abierto — link al calendario; el detalle estará disponible desde la fecha de apertura)`
          : "";

        projects.push({
          title: `Concurso CNR ${code}: ${title}`,
          institution: "Comisión Nacional de Riego (CNR)",
          url,
          deadline,
          budget: montoUf || null,
          description: cleanText(`${montoText} ${regionesText} Ley 18.450 — subsidios para obras de riego.`),
          ambito: "Nacional",
          tags: ["CNR", "Ley 18.450", "Riego"],
          region: regiones || undefined,
        });
      } catch (err) {
        partialErrors.push(`row parse: ${(err as Error).message}`);
      }
    });

    if (projects.length === 0) {
      partialErrors.push(
        "No matching <tr> with ley18450 link found — CNR may have changed structure"
      );
    }

    return { sourceSlug, projects, partialErrors };
  },
};
