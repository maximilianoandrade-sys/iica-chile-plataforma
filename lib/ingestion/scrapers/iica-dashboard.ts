/**
 * IICA Dashboard Proyectos scraper.
 * Uses Playwright to automate the ASP.NET WebForms dashboard.
 */
import { chromium, type Page } from "playwright";
import { COUNTERPARTS_IICA_CHILE, type Counterpart } from "../counterparts-iica";
import { absoluteUrl, cleanText, parseSpanishDate } from "../utils";
import type { RawProject, Scraper, ScraperResult } from "../types";

const DASHBOARD_URL = "https://apps.iica.int/dashboardproyectos/";
const BASE_URL = "https://apps.iica.int/";

const HEADLESS = process.env.IICA_HEADLESS !== "false";
const DELAY_MS = Number(process.env.IICA_DELAY_MS) || 4000;

// ─── Parsing strategies ──────────────────────────────────────────────────────

interface ParsedItem {
  title: string;
  url?: string;
  description?: string;
  dateText?: string;
  budgetText?: string;
}

async function parseTable(page: Page): Promise<ParsedItem[]> {
  return page.evaluate(() => {
    const items: ParsedItem[] = [];
    const tables = Array.from(document.querySelectorAll("table"));
    for (const table of tables) {
      const rows = table.querySelectorAll("tr");
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td");
        if (cells.length < 1) continue;
        const link = rows[i].querySelector("a[href]") as HTMLAnchorElement | null;
        const title = (cells[0]?.textContent || "").trim();
        if (!title || title.length < 3) continue;
        items.push({
          title,
          url: link?.href || undefined,
          description: cells.length > 1 ? (cells[1]?.textContent || "").trim() : undefined,
          dateText: cells.length > 2 ? (cells[2]?.textContent || "").trim() : undefined,
          budgetText: cells.length > 3 ? (cells[3]?.textContent || "").trim() : undefined,
        });
      }
    }
    return items;
  });
}

async function parseGridView(page: Page): Promise<ParsedItem[]> {
  return page.evaluate(() => {
    const items: ParsedItem[] = [];
    const grid = document.querySelector('[id*="gv"], [id*="GridView"], [id*="gridview"]');
    if (!grid) return items;
    const rows = grid.querySelectorAll("tr");
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td");
      if (cells.length < 1) continue;
      const link = rows[i].querySelector("a[href]") as HTMLAnchorElement | null;
      const title = (cells[0]?.textContent || "").trim();
      if (!title || title.length < 3) continue;
      items.push({
        title,
        url: link?.href || undefined,
        description: cells.length > 1 ? (cells[1]?.textContent || "").trim() : undefined,
        dateText: cells.length > 2 ? (cells[2]?.textContent || "").trim() : undefined,
        budgetText: cells.length > 3 ? (cells[3]?.textContent || "").trim() : undefined,
      });
    }
    return items;
  });
}

async function parseCards(page: Page): Promise<ParsedItem[]> {
  return page.evaluate(() => {
    const items: ParsedItem[] = [];
    const selectors = [
      ".project-card",
      ".card",
      "[class*=project]",
      "[class*=resultado]",
      "[class*=item]",
    ];
    let cards: NodeListOf<Element> | null = null;
    for (const sel of selectors) {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) {
        cards = found;
        break;
      }
    }
    if (!cards) return items;
    for (const card of Array.from(cards)) {
      const heading = card.querySelector("h1, h2, h3, h4, h5, h6, .title, [class*=title]");
      const link = card.querySelector("a[href]") as HTMLAnchorElement | null;
      const title = (heading?.textContent || link?.textContent || "").trim();
      if (!title || title.length < 3) continue;
      const desc = card.querySelector("p, .description, [class*=desc]");
      items.push({
        title,
        url: link?.href || undefined,
        description: desc?.textContent?.trim() || undefined,
      });
    }
    return items;
  });
}

async function parseGenericLinks(page: Page): Promise<ParsedItem[]> {
  return page.evaluate(() => {
    const items: ParsedItem[] = [];
    const links = Array.from(document.querySelectorAll("a[href]")) as HTMLAnchorElement[];
    for (const link of links) {
      const text = (link.textContent || "").trim();
      // Skip nav/pagination links
      if (
        text.length < 5 ||
        /^(prev|next|anterior|siguiente|\d+|«|»|first|last|inicio|fin)$/i.test(text)
      ) continue;
      const href = link.href;
      if (!href || href === "#" || href.includes("javascript:")) continue;
      // Skip if it looks like a menu/nav link
      const parent = link.closest("nav, .nav, .menu, .pagination, header, footer");
      if (parent) continue;
      items.push({ title: text, url: href });
    }
    return items;
  });
}

// ─── Main parsing orchestrator ───────────────────────────────────────────────

async function parseProjects(page: Page, counterpart: Counterpart): Promise<RawProject[]> {
  // Try strategies in order of specificity
  let items: ParsedItem[] = [];

  items = await parseGridView(page);
  if (items.length === 0) items = await parseTable(page);
  if (items.length === 0) items = await parseCards(page);
  if (items.length === 0) items = await parseGenericLinks(page);

  return items.map((item) => ({
    title: cleanText(item.title),
    institution: counterpart.name,
    url: item.url ? absoluteUrl(item.url, BASE_URL) : DASHBOARD_URL,
    deadline: item.dateText ? parseSpanishDate(item.dateText) : null,
    budget: item.budgetText || null,
    description: item.description ? cleanText(item.description) : undefined,
    tags: [counterpart.abbrev, counterpart.category],
    ambito: "Internacional" as const,
  }));
}

// ─── Scraper implementation ──────────────────────────────────────────────────

export const iicaDashboardScraper: Scraper = {
  slug: "iica-dashboard",
  name: "IICA Dashboard Proyectos",
  homepageUrl: DASHBOARD_URL,

  async scrape(): Promise<ScraperResult> {
    const allProjects: RawProject[] = [];
    const partialErrors: string[] = [];
    const total = COUNTERPARTS_IICA_CHILE.length;

    const browser = await chromium.launch({ headless: HEADLESS });
    const page = await browser.newPage();

    try {
      await page.goto(DASHBOARD_URL, { waitUntil: "networkidle", timeout: 60_000 });

      // Wait for dropdown
      await page.waitForSelector("#ddl_Contrapartes", { state: "visible", timeout: 30_000 });

      for (let i = 0; i < total; i++) {
        const cp = COUNTERPARTS_IICA_CHILE[i];
        try {
          await page.selectOption("#ddl_Contrapartes", cp.id);

          // Try to find and click submit button
          const submitBtn = await page.$(
            'input[type="submit"], button[type="submit"], .btn-primary, #btn_Buscar, [id*="btn"]'
          );
          if (submitBtn) {
            await submitBtn.click();
          }

          // Wait for page response
          await page
            .waitForLoadState("networkidle", { timeout: 30_000 })
            .catch(() => page.waitForTimeout(5000));

          const projects = await parseProjects(page, cp);
          allProjects.push(...projects);

          console.log(
            `[iica-dashboard] (${i + 1}/${total}) ${cp.abbrev}: found ${projects.length} projects`
          );
        } catch (err: unknown) {
          const msg = `Error on ${cp.abbrev} (${cp.id}): ${err instanceof Error ? err.message : String(err)}`;
          partialErrors.push(msg);
          console.warn(`[iica-dashboard] ${msg}`);
        }

        // Delay between queries
        if (i < total - 1) {
          await page.waitForTimeout(DELAY_MS);
        }
      }
    } finally {
      await browser.close();
    }

    return {
      sourceSlug: "iica-dashboard",
      projects: allProjects,
      partialErrors,
    };
  },
};
