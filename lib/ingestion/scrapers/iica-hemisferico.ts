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
  // formato "YYYY-MM-DD HH:MM:SS" → ISO
  const iso = input.includes("T") ? input : input.replace(" ", "T");
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export const iicaHemisfericoScraper: Scraper = {
  slug: "iica-hemisferico",
  name: "IICA Hemisférico",
  homepageUrl: "https://iica.int/wp-json/wp/v2/bids?per_page=50&orderby=date&order=desc&_fields=id,title,link,date,acf",

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
      throw new Error(`fetch fallido: ${(err as Error).message}`);
    }

    const now = Date.now();

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

        // Filtrar bids vencidas: si tiene final_date en el pasado, descartar
        if (deadline && deadline.getTime() < now) {
          continue;
        }

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
