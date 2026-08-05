import { load } from "cheerio";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, absoluteUrl } from "../utils";
import { fetchWithRetry } from "../retry";

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

interface ConvocatoriasAjaxConfig {
  ajaxurl: string;
  nonce: string;
  searchParam?: string;
  postType?: string;
}

function parseConvocatoriasAjaxConfig(html: string): ConvocatoriasAjaxConfig | null {
  const match = html.match(/var\s+convocatoriasAjax\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return null;

  try {
    return JSON.parse(match[1]) as ConvocatoriasAjaxConfig;
  } catch {
    return null;
  }
}

function parseCorfoDateLoose(s: string): Date | null {
  const normalized = s.trim();
  const exact = parseCorfoDate(normalized);
  if (exact) return exact;

  const m = normalized.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12, 0, 0));
  return isNaN(date.getTime()) ? null : date;
}

function extractProjectsFromCorfoHtml(html: string, partialErrors: string[]): RawProject[] {
  const $ = load(html);
  const projects: RawProject[] = [];

  const cards = $(".caja-resultados_uno").length > 0 ? $(".caja-resultados_uno") : $(".cuadro-completo_fase2");

  cards.each((_, el) => {
    try {
      const $card = $(el);
      const isAjaxCard = $card.hasClass("caja-resultados_uno");

      const title = isAjaxCard
        ? cleanText($card.find(".titulo-cajas_fechas h4").first().text())
        : cleanText($card.find(".cuerpo-titulo_fase2").first().text());

      if (!title || title.length < 4) return;

      const href = isAjaxCard
        ? $card.find(".foot-caja_result a").first().attr("href")
        : $card.find(".cuadro-completo_fase2-info a").first().attr("href");

      if (!href) {
        partialErrors.push(`sin href: ${title}`);
        return;
      }

      const url = absoluteUrl(href, "https://www.corfo.gob.cl/");
      if (!url.match(/corfo\.(gob\.)?cl/)) return;

      const deadlineText = isAjaxCard
        ? cleanText($card.find(".cierre span").first().text())
        : cleanText($card.find(".box-cierre p").first().text());
      const deadline = parseCorfoDateLoose(deadlineText);

      const description = isAjaxCard
        ? cleanText($card.find(".contenido-caja_prog p").first().text()).slice(0, 400)
        : cleanText($card.find(".cuerpo-texto_fase2").first().text()).slice(0, 400);

      const subtitle = isAjaxCard
        ? cleanText($card.find("h5 em").first().text())
        : cleanText($card.find(".cuerpo-titulo_fase2-subtitulo").first().text());

      projects.push({
        title,
        institution: "CORFO",
        url,
        canonicalKey: url,
        deadline,
        description: subtitle ? `${subtitle}. ${description}` : description,
        ambito: "Nacional",
        opportunityType: "Programa",
        tags: ["CORFO", "Innovación", "Programa"],
      });
    } catch (err) {
      partialErrors.push(`parse: ${(err as Error).message}`);
    }
  });

  return projects;
}

export const corfoScraper: Scraper = {
  slug: "corfo",
  name: "CORFO",
  // CORFO migró de corfo.cl a corfo.gob.cl. La página de listado real es
  // /sites/cpp/programasyconvocatorias/ (otras secciones como
  // Emprendimiento existen pero usan formato JS-rendered; este listing es
  // el más confiable de extraer con Cheerio).
  homepageUrl: "https://www.corfo.gob.cl/sites/cpp/programasyconvocatorias/",

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      const listingCandidates = [
        this.homepageUrl,
        "https://www.corfo.gob.cl/sites/cpp/convocatorias_programas_innovacion/",
      ];

      let listingHtml = "";
      for (const listingUrl of listingCandidates) {
        try {
          const listingResponse = await fetchWithRetry(
            listingUrl,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
              },
            },
            3,
            600,
          );
          listingHtml = await listingResponse.text();
          break;
        } catch (err) {
          partialErrors.push(`listing fetch: ${(err as Error).message}`);
        }
      }

      const ajaxConfig = parseConvocatoriasAjaxConfig(listingHtml);

      const mergedProjects: RawProject[] = [];

      if (!ajaxConfig?.ajaxurl || !ajaxConfig?.nonce) {
        mergedProjects.push(...extractProjectsFromCorfoHtml(listingHtml, partialErrors));
      } else {
        const formBase = {
          action: "filter_convocatorias",
          post_type: ajaxConfig.postType || "convocatoria",
          nonce: ajaxConfig.nonce,
        };

        const pageOneResponse = await fetchWithRetry(
          ajaxConfig.ajaxurl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
            },
            body: new URLSearchParams({ ...formBase, page: "1" }),
          },
          3,
          600,
        );

        const pageOneJson = await pageOneResponse.json() as { found?: number; html?: string };
        const pageOneHtml = pageOneJson.html || "";
        const pageOneProjects = extractProjectsFromCorfoHtml(pageOneHtml, partialErrors);
        mergedProjects.push(...pageOneProjects);

        const totalFound = typeof pageOneJson.found === "number" ? pageOneJson.found : pageOneProjects.length;
        const pageSize = pageOneProjects.length > 0 ? pageOneProjects.length : 10;
        const totalPages = Math.max(1, Math.ceil(totalFound / pageSize));

        for (let page = 2; page <= totalPages; page++) {
          const pageResponse = await fetchWithRetry(
            ajaxConfig.ajaxurl,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
              },
              body: new URLSearchParams({ ...formBase, page: String(page) }),
            },
            3,
            600,
          );

          const pageJson = await pageResponse.json() as { html?: string };
          if (!pageJson.html) break;
          mergedProjects.push(...extractProjectsFromCorfoHtml(pageJson.html, partialErrors));
        }
      }

      const unique = new Map<string, RawProject>();
      for (const p of mergedProjects) {
        const key = p.canonicalKey || p.url;
        if (!unique.has(key)) unique.set(key, p);
      }
      projects.push(...Array.from(unique.values()));

      if (projects.length === 0) {
        partialErrors.push(
          "No matching CORFO results found — the listing structure or AJAX endpoint may have changed"
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
