/**
 * Scraper World Bank — usa la Procurement Notices API v2.
 *
 * Endpoint: https://search.worldbank.org/api/v2/procnotices
 * Parámetros clave:
 *   - format=json (devuelve JSON en lugar de XML)
 *   - qterm=agriculture (búsqueda textual)
 *   - countrycode=CL (Chile — pero API devuelve global con este search)
 *   - rows=100 (máximo por página)
 *
 * La API es pública, sin autenticación, con rate-limit generoso.
 * Devuelve un objeto con `procnotices` como dict {index: notice}.
 * Las claves son índices "0","1","2"... NO IDs.
 *
 * Cada notice tiene: id (ej "OP00446316"), project_name, bid_description,
 * notice_type, submission_deadline_date, procurement_method_name,
 * project_ctry_name, contact_name, project_id.
 *
 * NO incluye un campo URL directo — se construye como:
 * https://projects.worldbank.org/en/projects-operations/procurement-detail/{id}
 */
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

const logger = getLogger("WorldBankScraper");

interface WbNotice {
  id?: string;
  notice_type?: string;
  project_name?: string;
  bid_description?: string;
  submission_deadline_date?: string;
  procurement_method_name?: string;
  project_ctry_name?: string;
  project_id?: string;
  contact_name?: string;
  contact_web_url?: string;
  bid_reference_no?: string;
}

interface WbApiResponse {
  total: number | string;
  rows: string;
  procnotices: Record<string, WbNotice>;
}

const API_URL =
  "https://search.worldbank.org/api/v2/procnotices?format=json&qterm=agriculture&countrycode=CL&rows=100";

const NOTICE_URL_BASE =
  "https://projects.worldbank.org/en/projects-operations/procurement-detail/";

function parseDeadline(dateStr?: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export const worldBankScraper: Scraper = {
  slug: "world-bank",
  name: "World Bank Procurement",
  homepageUrl: "https://projects.worldbank.org/en/projects-operations/procurement",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let data: WbApiResponse;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(API_URL, {
        headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = (err as Error).message;
      logger.error("World Bank API fetch failed", err as Error);
      return { sourceSlug: this.slug, projects: [], partialErrors: [msg] };
    }

    const notices = data.procnotices ?? {};
    for (const [, notice] of Object.entries(notices)) {
      try {
        const noticeId = notice.id;
        if (!noticeId || !noticeId.trim()) {
          partialErrors.push(`notice sin id`);
          continue;
        }

        const title = notice.project_name?.trim();
        if (!title) {
          partialErrors.push(`notice ${noticeId}: sin project_name`);
          continue;
        }

        const url = `${NOTICE_URL_BASE}${noticeId}`;
        const deadline = parseDeadline(notice.submission_deadline_date);
        const description = notice.bid_description
          ? cleanText(notice.bid_description).slice(0, 500)
          : undefined;

        const tags: string[] = ["World Bank"];
        if (notice.notice_type) tags.push(notice.notice_type);

        projects.push({
          title: cleanText(title),
          institution: "World Bank",
          url,
          deadline,
          budget: null,
          description,
          tags,
          region: notice.project_ctry_name ?? "Chile",
          ambito: "Internacional",
          idioma: "en",
        });
      } catch (err) {
        const nid = notice.id || "unknown";
        partialErrors.push(`notice ${nid}: ${(err as Error).message}`);
      }
    }

    logger.info("World Bank scrape completed", {
      total: data.total,
      parsed: projects.length,
      errors: partialErrors.length,
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
