import { load } from "cheerio";
import type { RawProject, Scraper, ScraperResult } from "../types";
import { cleanText } from "../utils";
import { fetchWithRetry } from "../retry";

const FEED_URL = "https://www.mercadopublico.cl/Portal/FeedOrg.aspx?qs=PxtfJ1QTPW/YcX8fnxQceA==";
const DETAIL_BASE_URL = "https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx";

function parseMercadoPublicoDate(raw: string): Date | null {
  const match = raw
    .toLowerCase()
    .match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
  if (!match) return null;

  const monthMap: Record<string, number> = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  };

  const day = Number(match[1]);
  const month = monthMap[match[2]];
  const year = Number(match[3]);
  if (month === undefined) return null;

  const date = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildDetailUrl(licId: string): string {
  const url = new URL(DETAIL_BASE_URL);
  url.searchParams.set("qs", licId);
  return url.toString();
}

export const fiaLicitacionesScraper: Scraper = {
  slug: "fia-licitaciones",
  name: "FIA — Licitaciones MercadoPublico",
  homepageUrl: FEED_URL,

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    try {
      const res = await fetchWithRetry(
        this.homepageUrl,
        {
          headers: {
            "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)",
          },
        },
        3,
        600,
      );
      html = await res.text();
    } catch (err) {
      return {
        sourceSlug: this.slug,
        projects: [],
        partialErrors: [(err as Error).message],
      };
    }

    const $ = load(html);

    // Intentar selector primario; si falla, usar fallback por texto
    let candidates = $("a.Link");
    if (candidates.length === 0) {
      candidates = $("a").filter((_, el) => /Id:\s*[A-Z0-9-]+/i.test($(el).text()));
    }

    candidates.each((_, element) => {
      const rawTitle = cleanText($(element).text());
      if (!rawTitle) return;

      const idMatch = rawTitle.match(/Id:\s*([A-Z0-9-]+)/i);
      const nameMatch = rawTitle.match(/Nombre:\s*(.+)$/i);
      const licId = idMatch?.[1];
      const title = cleanText(nameMatch?.[1] || rawTitle);

      if (!licId || !title) {
        partialErrors.push(`fila sin id/titulo: ${rawTitle.slice(0, 120)}`);
        return;
      }

      const $container = $(element).closest("table");
      const fechaRaw = cleanText(
        $container.find("span.Fecha").toArray().map((node) => $(node).text()).join(" "),
      );
      const descrRaw = cleanText($container.find("span.Descripcion").last().text());

      const detailUrl = buildDetailUrl(licId);

      projects.push({
        title: `[FIA Licitación] ${title}`,
        institution: "FIA",
        url: detailUrl,
        canonicalKey: detailUrl,
        deadline: parseMercadoPublicoDate(fechaRaw),
        description: descrRaw || "Licitación FIA en MercadoPublico.",
        ambito: "Nacional",
        opportunityType: "Licitacion",
        tags: ["FIA", "Mercado Publico", "Licitacion"],
      });
    });

    return {
      sourceSlug: this.slug,
      projects,
      partialErrors,
    };
  },
};
