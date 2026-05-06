import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

interface WpRestPost {
  id: number;
  title?: { rendered: string };
  link?: string;
  date?: string;
  excerpt?: { rendered: string };
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Ntilde;/g, "Ñ");
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

export const fiaScraper: Scraper = {
  slug: "fia",
  name: "FIA — Fundación para la Innovación Agraria",
  homepageUrl: "https://www.fia.cl/wp-json/wp/v2/convocatorias?per_page=50&_fields=id,title,link,date,excerpt",

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
        const description = post.excerpt?.rendered
          ? cleanText(decodeHtmlEntities(stripHtml(post.excerpt.rendered)))
          : undefined;

        // FIA REST no expone deadline; usamos null y el sistema verá la convocatoria
        // como vigente hasta que markStale la cierre por lastSeenAt o por fecha_cierre default
        // (queda en 2099-12-31 si no se sobrescribe)
        projects.push({
          title,
          institution: "FIA",
          url,
          deadline: null,
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
