import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, absoluteUrl } from "../utils";

/**
 * Parsea fechas "DD/MM/YYYY" (formato CORFO en .box-cierre).
 */
function parseCorfoDate(s: string): Date | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  // Mediodía UTC para evitar bugs de TZ.
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12, 0, 0));
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Fetch página de detalle CORFO y extrae monto del primer párrafo que
 * mencione "$X.XXX.XXX". CORFO escribe el monto en lenguaje natural
 * como "InnovaChile cofinanciará... hasta $150.000.000.- (ciento cincuenta
 * millones de pesos)". Devolvemos un string compacto como "Hasta $150M".
 */
async function fetchCorfoMonto(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = load(html);

    // Buscar el primer <p>/<li> que contenga "$X.XXX.XXX"
    const raw = $("p, li")
      .toArray()
      .map((el) => $(el).text().trim().replace(/\s+/g, " "))
      .find((txt) => /\$\s*\d{1,3}(?:\.\d{3}){2,}/.test(txt) && txt.length < 400);
    if (!raw) return null;

    // Extraer el monto y formatear corto.
    const m = raw.match(/\$\s*(\d{1,3}(?:\.\d{3}){2,})/);
    if (!m) return null;
    const value = Number(m[1].replace(/\./g, ""));
    if (!value) return null;

    const prefix = /hasta/i.test(raw) ? "Hasta " : "";
    if (value >= 1_000_000_000) return `${prefix}$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${prefix}$${Math.round(value / 1_000_000)}M`;
    return `${prefix}$${value.toLocaleString("es-CL")}`;
  } catch {
    return null;
  }
}

export const corfoScraper: Scraper = {
  slug: "corfo",
  name: "CORFO",
  // CORFO migró de corfo.cl a corfo.gob.cl. La página de listado real es
  // /sites/cpp/convocatorias_programas_innovacion/ (otras secciones como
  // Emprendimiento existen pero usan formato JS-rendered; este listing es
  // el más confiable de extraer con Cheerio).
  homepageUrl: "https://www.corfo.gob.cl/sites/cpp/convocatorias_programas_innovacion/",

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      const res = await fetch(this.homepageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const $ = load(html);

      // Cada convocatoria está en un div.cuadro-completo_fase2
      $(".cuadro-completo_fase2").each((_, el) => {
        try {
          const $card = $(el);

          // Título: <span class="cuerpo-titulo_fase2">...</span>
          const title = cleanText($card.find(".cuerpo-titulo_fase2").first().text());
          if (!title || title.length < 4) {
            return; // sin título, skip
          }

          // URL: enlace en .cuadro-completo_fase2-info
          const $link = $card.find(".cuadro-completo_fase2-info a").first();
          let href = $link.attr("href");
          if (!href) {
            partialErrors.push(`sin href: ${title}`);
            return;
          }
          const url = absoluteUrl(href, "https://www.corfo.gob.cl/");
          // Aceptamos tanto corfo.cl como corfo.gob.cl (corfo.cl redirige)
          if (!url.match(/corfo\.(gob\.)?cl/)) return;

          // Fecha de cierre: <div class="box-cierre"><h6>Cierre</h6><p>DD/MM/YYYY</p></div>
          const deadlineText = cleanText($card.find(".box-cierre p").first().text());
          const deadline = parseCorfoDate(deadlineText);

          // Descripción: <div class="cuerpo-texto_fase2">...</div>
          const description = cleanText($card.find(".cuerpo-texto_fase2").first().text()).slice(0, 400);

          // Subtítulo (alcance geográfico): "Alcance: Todo Chile"
          const subtitle = cleanText($card.find(".cuerpo-titulo_fase2-subtitulo").first().text());

          projects.push({
            title,
            institution: "CORFO",
            url,
            deadline,
            description: subtitle ? `${subtitle}. ${description}` : description,
            ambito: "Nacional",
            tags: ["CORFO", "Innovación"],
          });
        } catch (err) {
          partialErrors.push(`parse: ${(err as Error).message}`);
        }
      });

      if (projects.length === 0) {
        partialErrors.push(
          "No matching .cuadro-completo_fase2 elements found — CORFO may have changed structure"
        );
      }
    } catch (err) {
      return { sourceSlug, projects: [], partialErrors: [(err as Error).message] };
    }

    // Enriquecer cada proyecto con el monto extraído del detalle.
    // Concurrencia 4 — CORFO normalmente lista <15 convocatorias.
    const CONCURRENCY = 4;
    for (let i = 0; i < projects.length; i += CONCURRENCY) {
      const slice = projects.slice(i, i + CONCURRENCY);
      const montos = await Promise.all(slice.map((p) => fetchCorfoMonto(p.url)));
      slice.forEach((p, idx) => {
        if (montos[idx]) p.budget = montos[idx];
      });
    }

    return { sourceSlug, projects, partialErrors };
  },
};
