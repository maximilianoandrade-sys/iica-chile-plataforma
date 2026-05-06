import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

interface WpRestPost {
  id: number;
  title?: { rendered: string };
  link?: string;
  date?: string;
  content?: { rendered: string };
}

const MONTHS_ES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

/**
 * Parsea fecha de cierre del HTML del content de FIA.
 *
 * FIA pone la calendarización dentro del content como:
 *   <li>Cierre: <strong>07 d</strong>e abril de 2026 a las <strong>15:00</strong></li>
 *
 * Cuando hay extensiones, la fecha vieja queda con strikethrough:
 *   <li><s>Cierre: ... 31 de marzo de 2026</s></li>
 *   <li>Cierre: ... 07 de abril de 2026</li>
 *
 * Estrategia: stripear primero las secciones <s>...</s>, después texto plano,
 * después regex sobre "cierre <día> de <mes> de <año>".
 */
export function parseFiaDeadline(html: string | undefined): Date | null {
  if (!html) return null;
  const withoutStrike = html.replace(/<s>[\s\S]*?<\/s>/gi, "");
  const text = decodeHtmlEntities(stripHtml(withoutStrike));
  const match = text.match(
    /cierre[:\s]+(\d{1,2})\s*(?:de\s+)?([a-záéíóúñ]+)\s+(?:de\s+)?(\d{4})/i
  );
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = MONTHS_ES[monthName.toLowerCase()];
  if (month === undefined) return null;
  const date = new Date(Number(year), month, Number(day));
  return isNaN(date.getTime()) ? null : date;
}

export const fiaScraper: Scraper = {
  slug: "fia",
  name: "FIA — Fundación para la Innovación Agraria",
  homepageUrl: "https://www.fia.cl/wp-json/wp/v2/convocatorias?per_page=50&_fields=id,title,link,date,content",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let posts: WpRestPost[];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(this.homepageUrl, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      posts = await res.json();
      if (!Array.isArray(posts)) throw new Error("respuesta no es array");
    } catch (err) {
      clearTimeout(timeoutId);
      throw new Error(`fetch fallido: ${(err as Error).message}`);
    }

    for (const post of posts) {
      try {
        const titleRaw = post.title?.rendered;
        if (!titleRaw) {
          partialErrors.push(`post ${post.id}: sin title`);
          continue;
        }
        const url = post.link;
        if (!url) {
          partialErrors.push(`post ${post.id}: sin link`);
          continue;
        }

        const title = cleanText(decodeHtmlEntities(titleRaw));
        const deadline = parseFiaDeadline(post.content?.rendered);
        const description = post.content?.rendered
          ? cleanText(decodeHtmlEntities(stripHtml(post.content.rendered))).slice(0, 300)
          : undefined;

        projects.push({
          title,
          institution: "FIA",
          url,
          deadline,
          description,
          ambito: "Nacional",
          tags: ["FIA"],
        });
      } catch (err) {
        partialErrors.push(`post ${post.id}: ${(err as Error).message}`);
      }
    }

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
