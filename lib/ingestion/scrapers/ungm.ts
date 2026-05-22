/**
 * Scraper UNGM — United Nations Global Marketplace.
 *
 * UNGM es la plataforma de procurement de todas las agencias UN (FAO, UNDP,
 * UNICEF, WFP, etc.). Usa una API POST para búsqueda de notices.
 *
 * Endpoint: POST https://www.ungm.org/Public/Notice
 * Content-Type: application/json
 * Body: { PageIndex, PageSize, Description:"agriculture", SortField, ... }
 *
 * La API devuelve un array de notices con: ReferenceNo, Title, Description,
 * OrganizationAcronym, Deadline, NoticeUrl (relative path).
 *
 * Sin autenticación requerida. Rate-limit no documentado pero es generoso
 * para volúmenes bajos (<5 requests/minuto).
 */
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

const logger = getLogger("UNGMScraper");

interface UngmNotice {
  ReferenceNo?: string;
  Title?: string;
  Description?: string;
  OrganizationAcronym?: string;
  Deadline?: string;
  PublishedDate?: string;
  UNSPSCDescription?: string;
  NoticeUrl?: string;
}

const UNGM_BASE = "https://www.ungm.org";
const SEARCH_URL = `${UNGM_BASE}/Public/Notice`;

const SEARCH_BODY = {
  PageIndex: 0,
  PageSize: 50,
  Title: "",
  Description: "agriculture",
  DeadlineFrom: "",
  SortField: "DatePublished",
  SortAscending: false,
  isPagingReset: true,
  NoticeTypes: [],
  UNOrganizations: [],
};

function parseDeadline(dateStr?: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function buildNoticeUrl(relativePath?: string): string | null {
  if (!relativePath || !relativePath.trim()) return null;
  if (relativePath.startsWith("http")) return relativePath;
  return `${UNGM_BASE}${relativePath}`;
}

export const ungmScraper: Scraper = {
  slug: "ungm",
  name: "UNGM — United Nations Global Marketplace",
  homepageUrl: "https://www.ungm.org/Public/Notice",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let notices: UngmNotice[];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)",
        },
        body: JSON.stringify(SEARCH_BODY),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      notices = await res.json();
      if (!Array.isArray(notices)) throw new Error("Response is not an array");
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = (err as Error).message;
      logger.error("UNGM API fetch failed", err as Error);
      return { sourceSlug: this.slug, projects: [], partialErrors: [msg] };
    }

    for (const notice of notices) {
      try {
        const refNo = notice.ReferenceNo || "unknown";

        const title = notice.Title?.trim();
        if (!title) {
          partialErrors.push(`notice ${refNo}: sin Title`);
          continue;
        }

        const url = buildNoticeUrl(notice.NoticeUrl);
        if (!url) {
          partialErrors.push(`notice ${refNo}: sin NoticeUrl`);
          continue;
        }

        const deadline = parseDeadline(notice.Deadline);
        const description = notice.Description
          ? cleanText(notice.Description).slice(0, 500)
          : undefined;

        const org = notice.OrganizationAcronym || "UN";
        const tags: string[] = ["UNGM", org];
        if (notice.UNSPSCDescription) tags.push(notice.UNSPSCDescription);

        projects.push({
          title: cleanText(title),
          institution: `${org} (UN)`,
          url,
          canonicalKey: `ungm-${refNo}`,
          deadline,
          budget: null,
          description,
          tags,
          ambito: "Internacional",
          idioma: "en",
        });
      } catch (err) {
        const refNo = notice.ReferenceNo || "unknown";
        partialErrors.push(`notice ${refNo}: ${(err as Error).message}`);
      }
    }

    logger.info("UNGM scrape completed", {
      parsed: projects.length,
      errors: partialErrors.length,
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
