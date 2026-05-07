/**
 * CLI orchestrator for the IICA Dashboard scraper.
 *
 * Usage:
 *   npx tsx scripts/scrape-iica-dashboard.ts
 *   npx tsx scripts/scrape-iica-dashboard.ts --dry-run
 *   npx tsx scripts/scrape-iica-dashboard.ts --category chilean
 *   npx tsx scripts/scrape-iica-dashboard.ts --category regional --dry-run
 */

import { iicaDashboardScraper } from "../lib/ingestion/scrapers/iica-dashboard";
import { upsertProject, updateSourceStatus } from "../lib/ingestion/persistence";
import prisma from "../lib/prisma";
import {
  getByCategory,
  CounterpartCategory,
} from "../lib/ingestion/counterparts-iica";

// ---------------------------------------------------------------------------
// Parse CLI args (no external deps)
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const categoryIdx = args.indexOf("--category");
const category =
  categoryIdx >= 0 ? (args[categoryIdx + 1] as CounterpartCategory) : undefined;

const VALID_CATEGORIES: CounterpartCategory[] = [
  "chilean",
  "regional",
  "multilateral",
  "bilateral",
  "un",
  "research",
  "other",
];

if (category && !VALID_CATEGORIES.includes(category)) {
  console.error(
    `[scrape-iica] Invalid category "${category}". Valid: ${VALID_CATEGORIES.join(", ")}`
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`[scrape-iica] Starting...`);
  console.log(
    `[scrape-iica] Mode: ${dryRun ? "DRY RUN" : "LIVE (will write to DB)"}`
  );
  if (category) console.log(`[scrape-iica] Category filter: ${category}`);

  const result = await iicaDashboardScraper.scrape();

  // Filter by category if specified
  let projects = result.projects;
  if (category) {
    const validNames = new Set(getByCategory(category).map((c) => c.name));
    projects = projects.filter((p) => validNames.has(p.institution));
  }

  // Progress logging
  const total = projects.length;
  console.log(`\n[scrape-iica] Scrape complete: ${total} projects`);

  if (result.partialErrors && result.partialErrors.length > 0) {
    console.warn(
      `[scrape-iica] Partial errors: ${result.partialErrors.length}`
    );
    result.partialErrors
      .slice(0, 10)
      .forEach((e) => console.warn(`  - ${e}`));
  }

  if (dryRun) {
    projects.forEach((p, i) => {
      console.log(
        `  [DRY] (${i + 1}/${total}) ${p.institution} | ${p.title} | ${p.url}`
      );
    });
    console.log(
      `\n[scrape-iica] DRY RUN complete. ${total} projects would be ingested.`
    );
  } else {
    let ingested = 0;
    let skipped = 0;
    const skipReasons: string[] = [];

    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      console.log(
        `[scrape-iica] (${i + 1}/${total}) ${p.institution}: ${p.title}`
      );

      const r = await upsertProject(p, "iica-dashboard");
      if (r.skipped) {
        skipped++;
        skipReasons.push(`${p.url}: ${r.reason}`);
      } else {
        ingested++;
      }
    }

    const errorCount = result.partialErrors?.length ?? 0;
    const status =
      errorCount > 0 || skipped > 0 ? "partial" : "success";
    await updateSourceStatus(
      "iica-dashboard",
      status,
      ingested,
      result.partialErrors?.slice(0, 5).join("\n") || undefined
    );

    console.log(`\n[scrape-iica] SUMMARY:`);
    console.log(`  Found:    ${total}`);
    console.log(`  Ingested: ${ingested}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Errors:   ${errorCount}`);
    if (skipReasons.length > 0) {
      console.log(`  Skip reasons (first 5):`);
      skipReasons.slice(0, 5).forEach((r) => console.log(`    - ${r}`));
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[scrape-iica] Fatal:", err);
  prisma.$disconnect().finally(() => process.exit(1));
});
