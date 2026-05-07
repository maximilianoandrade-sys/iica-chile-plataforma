/**
 * Discovery script: navigates to IICA Dashboard, selects counterparts,
 * and saves raw HTML to tmp/iica-discovery/ for offline DOM inspection.
 *
 * Uses persistent context + stealth techniques to bypass Cloudflare.
 *
 * Usage:
 *   npx tsx scripts/discover-iica-html.ts          # First 3 counterparts (default)
 *   npx tsx scripts/discover-iica-html.ts --all    # All 75 counterparts
 *   npx tsx scripts/discover-iica-html.ts --count  # Just count results per counterpart
 *   npx tsx scripts/discover-iica-html.ts --ids 179,230,183  # Specific IDs
 */
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { COUNTERPARTS_IICA_CHILE, type Counterpart } from "../lib/ingestion/counterparts-iica";

const DASHBOARD_URL = "https://apps.iica.int/dashboardproyectos/";
const OUT_DIR = join(process.cwd(), "tmp", "iica-discovery");
const USER_DATA_DIR = join(process.cwd(), "tmp", "iica-browser-profile");

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 2000));
}

function parseArgs(): { mode: "html" | "count"; counterparts: Counterpart[] } {
  const args = process.argv.slice(2);
  const mode = args.includes("--count") ? "count" : "html";

  if (args.includes("--all")) {
    return { mode, counterparts: COUNTERPARTS_IICA_CHILE };
  }

  const idsIdx = args.indexOf("--ids");
  if (idsIdx >= 0 && args[idsIdx + 1]) {
    const ids = args[idsIdx + 1].split(",");
    const filtered = COUNTERPARTS_IICA_CHILE.filter((cp) => ids.includes(cp.id));
    return { mode, counterparts: filtered };
  }

  // Default: first 3
  return { mode, counterparts: COUNTERPARTS_IICA_CHILE.slice(0, 3) };
}

async function getResultCount(page: Page): Promise<number> {
  const text = await page
    .locator(".cant-proyectos")
    .textContent({ timeout: 5000 })
    .catch(() => "");
  const match = (text || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

async function main() {
  const { mode, counterparts } = parseArgs();
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[discover] Mode: ${mode}, counterparts: ${counterparts.length}`);
  console.log("[discover] Launching persistent browser context (headed)...");
  console.log("[discover] Si Cloudflare muestra un challenge, resuélvelo manualmente.");
  console.log("[discover] El script esperará hasta 60s por cada carga.\n");

  // Persistent context keeps Cloudflare cookies between navigations
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    locale: "es-CL",
    timezoneId: "America/Santiago",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  const page = context.pages()[0] || (await context.newPage());

  // Override navigator.webdriver to false (anti-detection)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  console.log(`[discover] Navigando a ${DASHBOARD_URL}`);
  await page.goto(DASHBOARD_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // Wait for Cloudflare challenge to resolve (up to 30s)
  console.log("[discover] Esperando que Cloudflare resuelva (máx 30s)...");
  try {
    await page.waitForSelector("#ddl_Contrapartes", { state: "visible", timeout: 30_000 });
    console.log("[discover] ✓ Dropdown visible, Cloudflare pasado.");
  } catch {
    console.log("[discover] ⚠ Dropdown no visible. Si hay un CAPTCHA, resuélvelo ahora.");
    console.log("[discover] Esperando 60s adicionales...");
    await page.waitForSelector("#ddl_Contrapartes", { state: "visible", timeout: 60_000 });
  }

  // Save initial page (only in html mode)
  if (mode === "html") {
    const initialHtml = await page.content();
    writeFileSync(join(OUT_DIR, "initial.html"), initialHtml, "utf-8");
    console.log(`[discover] Guardado initial.html (${(initialHtml.length / 1024).toFixed(0)}KB)`);
  }

  const results: { abbrev: string; id: string; count: number }[] = [];

  for (let i = 0; i < counterparts.length; i++) {
    const cp = counterparts[i];
    console.log(
      `\n[discover] (${i + 1}/${counterparts.length}) Seleccionando: ${cp.abbrev} (id=${cp.id})`
    );
    await sleep(2000);

    // Select value in dropdown
    await page.selectOption("#ddl_Contrapartes", cp.id);
    await sleep(1000);

    // Try to find and click a submit/search button
    const submitSelectors = [
      'input[type="submit"]',
      'button[type="submit"]',
      "#btn_Buscar",
      '[id*="btn"][id*="uscar"]',
      '[value*="Buscar"]',
      ".btn-primary",
    ];

    let clicked = false;
    for (const sel of submitSelectors) {
      const btn = await page.$(sel);
      if (btn && (await btn.isVisible())) {
        if (i === 0) console.log(`[discover]   → Click en: ${sel}`);
        await btn.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      console.log("[discover]   → No encontré botón, esperando auto-postback...");
    }

    // Wait for navigation/response
    try {
      await page.waitForSelector(".cant-proyectos, li.item.row", { timeout: 30_000 });
    } catch {
      await sleep(5000);
    }

    // Check if we got blocked
    const bodyText = await page.locator("body").textContent().catch(() => "");
    if (
      bodyText?.includes("Attention Required") ||
      bodyText?.includes("you have been blocked")
    ) {
      console.log("[discover]   ✗ BLOQUEADO por Cloudflare. Deteniendo.");
      break;
    }

    const count = await getResultCount(page);
    results.push({ abbrev: cp.abbrev, id: cp.id, count });

    if (mode === "html") {
      const html = await page.content();
      const filename = `contraparte-${cp.id}.html`;
      writeFileSync(join(OUT_DIR, filename), html, "utf-8");
      console.log(`[discover]   Guardado ${filename} (${(html.length / 1024).toFixed(0)}KB) — ${count} proyectos`);
    } else {
      console.log(`[discover]   ${cp.abbrev}: ${count} proyectos`);
    }

    await sleep(2000);
  }

  await context.close();

  // Summary
  const total = results.reduce((sum, r) => sum + r.count, 0);
  console.log("\n[discover] ═══════════════════════════════════════════");
  console.log(`[discover] RESUMEN: ${results.length} contrapartes consultadas`);
  console.log(`[discover] Total proyectos encontrados: ${total}`);
  if (mode === "count") {
    console.log("[discover] Detalle:");
    for (const r of results.filter((r) => r.count > 0)) {
      console.log(`  ${r.abbrev.padEnd(20)} ${r.count}`);
    }
  }
  console.log("[discover] ═══════════════════════════════════════════");

  // Save results summary
  writeFileSync(
    join(OUT_DIR, "results-summary.json"),
    JSON.stringify({ timestamp: new Date().toISOString(), results, total }, null, 2),
    "utf-8"
  );
}

main().catch((err) => {
  console.error("[discover] Error fatal:", err.message || err);
  process.exit(1);
});
