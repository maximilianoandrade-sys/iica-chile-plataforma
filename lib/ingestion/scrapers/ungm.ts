/**
 * Scraper UNGM — United Nations Global Marketplace.
 *
 * UNGM es la plataforma de procurement de todas las agencias UN (FAO, UNDP,
 * UNICEF, WFP, etc.). Usa un endpoint AJAX que devuelve HTML fragments.
 *
 * Endpoint: POST https://www.ungm.org/Public/Notice/Search
 * Content-Type: application/x-www-form-urlencoded
 * X-Requested-With: XMLHttpRequest
 * Body: PageIndex=0&PageSize=50&Description=agriculture&SortField=DatePublished&...
 *
 * La respuesta es HTML con div[data-noticeid] por cada notice. Se extrae:
 *   - noticeId (de data-noticeid attr) → URL: /Public/Notice/{id}
 *   - title (de .ungm-title span)
 *   - deadline (de .tableCell.deadline span)
 *   - agency (de .resultAgency span) — e.g. FAO, UNDP, WFP
 *   - reference (de [data-description="Reference"] span)
 *   - country (del último .tableCell span)
 *
 * Sin autenticación requerida. Rate-limit no documentado pero generoso
 * para volúmenes bajos.
 */
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText } from "../utils";

const logger = getLogger("UNGMScraper");

const UNGM_BASE = "https://www.ungm.org";
const SEARCH_URL = `${UNGM_BASE}/Public/Notice/Search`;

const SEARCH_PARAMS = new URLSearchParams({
  PageIndex: "0",
  PageSize: "50",
  Title: "",
  Description: "agriculture",
  DeadlineFrom: "",
  SortField: "DatePublished",
  SortAscending: "false",
  isPagingReset: "true",
});

interface ParsedNotice {
  noticeId: string;
  title: string;
  deadline: string | null;
  agency: string | null;
  reference: string | null;
}

/**
 * Parse UNGM HTML fragment into structured notices.
 * Each notice is a div[data-noticeid] containing cells with class selectors.
 */
export function parseUngmHtml(html: string): ParsedNotice[] {
  const notices: ParsedNotice[] = [];

  // Match only the top-level row divs (class contains "tableRow dataRow")
  // NOT the inner button elements that also have data-noticeid
  const rowRegex = /class="tableRow dataRow[^"]*"[^>]*data-noticeid="(\d+)"|data-noticeid="(\d+)"[^>]*class="tableRow dataRow/g;
  const ids: { id: string; pos: number }[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(html)) !== null) {
    const id = match[1] || match[2];
    if (!seen.has(id)) {
      seen.add(id);
      ids.push({ id, pos: match.index });
    }
  }

  // Fallback: if the class-based regex found nothing, try the simpler approach
  // but deduplicate by only taking the first occurrence of each ID
  if (ids.length === 0) {
    const simpleRegex = /data-noticeid="(\d+)"/g;
    const allIds = new Set<string>();
    while ((match = simpleRegex.exec(html)) !== null) {
      if (!allIds.has(match[1])) {
        allIds.add(match[1]);
        ids.push({ id: match[1], pos: match.index });
      }
    }
  }

  for (let i = 0; i < ids.length; i++) {
    const start = ids[i].pos;
    const end = i + 1 < ids.length ? ids[i + 1].pos : html.length;
    const rowHtml = html.slice(start, end);

    // Extract title from .ungm-title span
    const titleMatch = rowHtml.match(/class="ungm-title[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/span>/);
    const title = titleMatch ? cleanText(titleMatch[1].replace(/<[^>]+>/g, "")) : "";

    // Extract deadline from .deadline cell
    const deadlineMatch = rowHtml.match(/class="tableCell[^"]*deadline[^"]*"[^>]*>[\s\S]*?<span[^>]*>\s*([\s\S]*?)\s*<\/span>/);
    const deadlineRaw = deadlineMatch ? cleanText(deadlineMatch[1]) : null;

    // Extract agency from .resultAgency
    const agencyMatch = rowHtml.match(/class="tableCell resultAgency"[^>]*>[\s\S]*?<span[^>]*>\s*([\s\S]*?)\s*<\/span>/);
    const agency = agencyMatch ? cleanText(agencyMatch[1]) : null;

    // Extract reference from data-description="Reference"
    const refMatch = rowHtml.match(/data-description="Reference"[^>]*>[\s\S]*?<span[^>]*>\s*([\s\S]*?)\s*<\/span>/);
    const reference = refMatch ? cleanText(refMatch[1]) : null;

    notices.push({
      noticeId: ids[i].id,
      title,
      deadline: deadlineRaw,
      agency,
      reference,
    });
  }

  return notices;
}

/**
 * Parse UNGM deadline format: "14-Jun-2026 23:30"
 */
function parseUngmDeadline(dateStr: string | null): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  // Remove GMT offset text: "(GMT 3.00)" etc
  const cleaned = dateStr.replace(/\(GMT[^)]*\)/i, "").trim();
  // Try native parse: "14-Jun-2026 23:30"
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;

  // Manual parse: DD-Mon-YYYY HH:MM
  const match = cleaned.match(/(\d{1,2})-(\w{3})-(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const [, day, mon, year, hour, min] = match;
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const m = months[mon];
  if (m === undefined) return null;
  const date = new Date(Date.UTC(Number(year), m, Number(day), Number(hour), Number(min)));
  return isNaN(date.getTime()) ? null : date;
}

export const ungmScraper: Scraper = {
  slug: "ungm",
  name: "UNGM — United Nations Global Marketplace",
  homepageUrl: "https://www.ungm.org/Public/Notice",

  async scrape(): Promise<ScraperResult> {
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    let html: string;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)",
        },
        body: SEARCH_PARAMS.toString(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
      // Verify we got HTML fragment (not full page redirect)
      if (html.includes("<!DOCTYPE html>")) {
        throw new Error("Received full HTML page instead of AJAX fragment");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = (err as Error).message;
      logger.error("UNGM search fetch failed", err as Error);
      return { sourceSlug: this.slug, projects: [], partialErrors: [msg] };
    }

    const notices = parseUngmHtml(html);

    for (const notice of notices) {
      try {
        if (!notice.title) {
          partialErrors.push(`notice ${notice.noticeId}: sin title`);
          continue;
        }

        const url = `${UNGM_BASE}/Public/Notice/${notice.noticeId}`;
        const deadline = parseUngmDeadline(notice.deadline);
        const org = notice.agency || "UN";
        const tags: string[] = ["UNGM", org];

        projects.push({
          title: notice.title,
          institution: `${org} (UN)`,
          url,
          deadline,
          budget: null,
          tags,
          ambito: "Internacional",
          idioma: "en",
        });
      } catch (err) {
        partialErrors.push(`notice ${notice.noticeId}: ${(err as Error).message}`);
      }
    }

    logger.info("UNGM scrape completed", {
      parsed: projects.length,
      errors: partialErrors.length,
    });

    return { sourceSlug: this.slug, projects, partialErrors };
  },
};
