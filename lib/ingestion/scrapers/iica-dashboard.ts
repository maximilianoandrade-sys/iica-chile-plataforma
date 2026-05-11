/**
 * IICA Dashboard Proyectos scraper.
 * Uses Playwright with a persistent browser context to bypass Cloudflare.
 *
 * The IICA dashboard renders projects as:
 *   <ul class="lista-programas">
 *     <li class="item row">
 *       <h3><a href="Detalle?CRON=XXXX&SCRON=YY">Title</a></h3>
 *       <div class="add-data"><strong>Código:</strong> XXXX-YY</div>
 *       <div class="add-data"><strong>País:</strong> Chile</div>
 *       <div class="add-data"><strong>Fecha de inicio:</strong> DD/MM/YYYY</div>
 *       <div class="add-data"><strong>Fecha de finalización:</strong> DD/MM/YYYY</div>
 *     </li>
 *   </ul>
 *
 * Pagination uses ASP.NET __doPostBack (ProgramasDataPager).
 * Cloudflare is bypassed via a persistent browser profile stored in USER_DATA_DIR.
 */
import { chromium, type Page, type BrowserContext } from "playwright";
import path from "path";
import { COUNTERPARTS_IICA_CHILE, type Counterpart } from "../counterparts-iica";
import { cleanText, parseSpanishDate } from "../utils";
import type { RawProject, Scraper, ScraperResult } from "../types";

const DASHBOARD_URL = "https://apps.iica.int/dashboardproyectos/";
const DETAIL_BASE = "https://apps.iica.int/dashboardproyectos/";

const HEADLESS = process.env.IICA_HEADLESS !== "false";
const DELAY_MS = Number(process.env.IICA_DELAY_MS) || 4000;
const USER_DATA_DIR = process.env.IICA_USER_DATA_DIR || path.resolve("tmp/iica-browser-profile");

// Anti-detection args
const STEALTH_ARGS = [
  "--disable-blink-features=AutomationControlled",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
];

// ─── Parsing: li.item.row structure ──────────────────────────────────────────

interface ParsedProject {
  title: string;
  url: string;
  code: string;
  country: string;
  startDate: string | null;
  endDate: string | null;
}

/**
 * Extract projects from the current page's `ul.lista-programas > li.item.row`.
 */
async function parseListaProgramas(page: Page): Promise<ParsedProject[]> {
  return page.evaluate((detailBase: string) => {
    const items: ParsedProject[] = [];
    const lis = document.querySelectorAll("li.item.row");

    for (const li of Array.from(lis)) {
      // Title + URL from <h3><a href="Detalle?CRON=...&SCRON=...">
      const link = li.querySelector("h3 a") as HTMLAnchorElement | null;
      if (!link) continue;
      const title = (link.textContent || "").trim();
      if (!title || title.length < 3) continue;

      const href = link.getAttribute("href") || "";
      const url = href.startsWith("http") ? href : detailBase + href;

      // Extract metadata from <div class="add-data"> blocks
      const dataDivs = li.querySelectorAll(".add-data");
      let code = "";
      let country = "";
      let startDate: string | null = null;
      let endDate: string | null = null;

      for (const div of Array.from(dataDivs)) {
        const strong = div.querySelector("strong");
        const label = (strong?.textContent || "").trim().toLowerCase();
        // Text after the <strong> tag
        const value = (div.textContent || "")
          .replace(strong?.textContent || "", "")
          .trim();

        if (label.includes("código")) code = value;
        else if (label.includes("país")) country = value;
        else if (label.includes("inicio")) startDate = value;
        else if (label.includes("finalización") || label.includes("finalizacion"))
          endDate = value;
      }

      items.push({ title, url, code, country, startDate, endDate });
    }
    return items;
  }, DETAIL_BASE);
}

/**
 * Get total result count from "Se encontraron <strong>N</strong> resultados."
 */
async function getResultCount(page: Page): Promise<number> {
  const text = await page
    .locator(".cant-proyectos")
    .textContent({ timeout: 5000 })
    .catch(() => "");
  const match = (text || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Check if there are more pages in the pager.
 */
async function hasNextPage(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const pager = document.querySelector('[id*="ProgramasDataPager"]');
    if (!pager) return false;
    // The pager shows page numbers as links; current page is a plain <span>
    const links = pager.querySelectorAll("a");
    return links.length > 0;
  });
}

/**
 * Click the next page link in the pager.
 */
async function goToNextPage(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const pager = document.querySelector('[id*="ProgramasDataPager"]');
    if (!pager) return false;
    // Find the link after the current page (plain span)
    const children = Array.from(pager.children);
    let foundCurrent = false;
    for (const child of children) {
      if (child.tagName === "SPAN" && !child.querySelector("a")) {
        foundCurrent = true;
        continue;
      }
      if (foundCurrent && child.tagName === "A") {
        (child as HTMLAnchorElement).click();
        return true;
      }
    }
    return false;
  });
}

// ─── Convert parsed items to RawProject ──────────────────────────────────────

function toRawProjects(items: ParsedProject[], counterpart: Counterpart): RawProject[] {
  return items.map((item) => ({
    title: cleanText(item.title),
    institution: counterpart.name,
    url: item.url,
    deadline: item.endDate ? parseSpanishDate(item.endDate) : null,
    budget: null,
    description: item.code
      ? `Código: ${item.code}. País: ${item.country || "N/A"}.`
      : undefined,
    tags: [counterpart.abbrev, counterpart.category, item.country || ""].filter(Boolean),
    ambito: "Internacional" as const,
  }));
}

// ─── Wait for Cloudflare challenge ───────────────────────────────────────────

async function waitForCloudflare(page: Page, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const dropdown = await page.$("#ddl_Contrapartes").catch(() => null);
    if (dropdown) return;
    await page.waitForTimeout(2000);
  }
  throw new Error("Cloudflare challenge not resolved within timeout");
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

    // Use persistent context for Cloudflare cookie persistence
    const context: BrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: HEADLESS,
      args: STEALTH_ARGS,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      viewport: { width: 1366, height: 768 },
      locale: "es-CL",
      timezoneId: "America/Santiago",
    });

    const page = context.pages()[0] || (await context.newPage());

    // Remove webdriver flag
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    try {
      console.log("[iica-dashboard] Navigating to dashboard...");
      await page.goto(DASHBOARD_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });

      // Wait for Cloudflare to pass
      console.log("[iica-dashboard] Waiting for Cloudflare...");
      await waitForCloudflare(page);
      console.log("[iica-dashboard] Dashboard loaded. Starting scrape.");

      for (let i = 0; i < total; i++) {
        const cp = COUNTERPARTS_IICA_CHILE[i];
        try {
          // Select counterpart from dropdown
          await page.selectOption("#ddl_Contrapartes", cp.id);

          // Click submit button
          const submitBtn = await page.$(
            'input[type="submit"], button[type="submit"]'
          );
          if (submitBtn) {
            await submitBtn.click();
          }

          // Wait for results to load (ASP.NET postback)
          await page
            .waitForSelector(".cant-proyectos, li.item.row", { timeout: 30_000 })
            .catch(() => page.waitForTimeout(8000));

          // Check if blocked by Cloudflare
          const blocked = await page.$("div.cf-error-details, #challenge-running");
          if (blocked) {
            partialErrors.push(`Cloudflare blocked on ${cp.abbrev}`);
            console.warn(`[iica-dashboard] Cloudflare blocked on ${cp.abbrev}, waiting...`);
            await waitForCloudflare(page);
          }

          // Parse current page
          const resultCount = await getResultCount(page);
          let projects = await parseListaProgramas(page);

          // Handle pagination (if more than 10 results per page)
          let pageNum = 1;
          while (projects.length < resultCount && (await hasNextPage(page))) {
            const clicked = await goToNextPage(page);
            if (!clicked) break;
            pageNum++;
            await page
              .waitForSelector("li.item.row", { timeout: 15_000 })
              .catch(() => page.waitForTimeout(5000));
            const moreProjects = await parseListaProgramas(page);
            projects.push(...moreProjects);
            if (pageNum > 20) break; // Safety limit
          }

          const rawProjects = toRawProjects(projects, cp);
          allProjects.push(...rawProjects);

          console.log(
            `[iica-dashboard] (${i + 1}/${total}) ${cp.abbrev}: ${projects.length} projects (expected ${resultCount})`
          );
        } catch (err: unknown) {
          const msg = `Error on ${cp.abbrev} (${cp.id}): ${err instanceof Error ? err.message : String(err)}`;
          partialErrors.push(msg);
          console.warn(`[iica-dashboard] ${msg}`);
        }

        // Delay between queries to avoid rate-limiting
        if (i < total - 1) {
          await page.waitForTimeout(DELAY_MS);
        }
      }
    } finally {
      await context.close();
    }

    return {
      sourceSlug: "iica-dashboard",
      projects: allProjects,
      partialErrors,
    };
  },
};
