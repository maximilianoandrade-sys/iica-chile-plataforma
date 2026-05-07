/**
 * Discovery script: navigates to IICA Dashboard, selects a few counterparts,
 * and saves raw HTML to tmp/iica-discovery/ for offline DOM inspection.
 *
 * Usage: npx tsx scripts/discover-iica-html.ts
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { COUNTERPARTS_IICA_CHILE } from "../lib/ingestion/counterparts-iica";

const DASHBOARD_URL = "https://apps.iica.int/dashboardproyectos/";
const OUT_DIR = join(process.cwd(), "tmp", "iica-discovery");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("[discover] Launching browser (headed)...");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log(`[discover] Navigating to ${DASHBOARD_URL}`);
  await page.goto(DASHBOARD_URL, { waitUntil: "networkidle", timeout: 60_000 });

  // Save initial page
  const initialHtml = await page.content();
  writeFileSync(join(OUT_DIR, "initial.html"), initialHtml, "utf-8");
  console.log("[discover] Saved initial.html");

  // Pick first 3 counterparts
  const samples = COUNTERPARTS_IICA_CHILE.slice(0, 3);

  for (const cp of samples) {
    console.log(`[discover] Selecting counterpart: ${cp.abbrev} (id=${cp.id})`);

    await page.selectOption("#ddl_Contrapartes", cp.id);

    // Try to click a submit button
    const submitBtn = await page.$(
      'input[type="submit"], button[type="submit"], .btn-primary, #btn_Buscar, [id*="btn"]'
    );
    if (submitBtn) {
      await submitBtn.click();
    }

    // Wait for response
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});

    const html = await page.content();
    writeFileSync(join(OUT_DIR, `contraparte-${cp.id}.html`), html, "utf-8");
    console.log(`[discover] Saved contraparte-${cp.id}.html`);

    // Delay between queries
    await page.waitForTimeout(3000);
  }

  await browser.close();
  console.log("[discover] Done. Check tmp/iica-discovery/");
}

main().catch((err) => {
  console.error("[discover] Fatal error:", err);
  process.exit(1);
});
