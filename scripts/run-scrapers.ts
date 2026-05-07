import { scrapers } from "../lib/ingestion/registry";
import { upsertProject, markStale, updateSourceStatus } from "../lib/ingestion/persistence";
import prisma from "../lib/prisma";

async function runOne(scraper: typeof scrapers[number]) {
  console.log(`[${scraper.slug}] Iniciando...`);
  try {
    const result = await scraper.scrape();
    let inserted = 0;
    const skipReasons: string[] = [];

    for (const raw of result.projects) {
      const r = await upsertProject(raw, scraper.slug);
      if (r.skipped) {
        skipReasons.push(`${raw.url}: ${r.reason}`);
      } else {
        inserted++;
      }
    }

    const status: "success" | "partial" =
      result.partialErrors.length > 0 || skipReasons.length > 0 ? "partial" : "success";
    const errorSummary = [
      ...result.partialErrors.slice(0, 5),
      ...skipReasons.slice(0, 5),
    ].join("\n") || undefined;

    await updateSourceStatus(scraper.slug, status, inserted, errorSummary);
    console.log(`[${scraper.slug}] Done: ${inserted} ingestados (${result.projects.length} crudos), status=${status}`);
  } catch (err) {
    const msg = (err as Error).message;
    await updateSourceStatus(scraper.slug, "error", 0, msg);
    console.error(`[${scraper.slug}] ERROR: ${msg}`);
    throw err;
  }
}

async function main() {
  if (scrapers.length === 0) {
    console.warn("[run-scrapers] Registry vacío, nada que correr.");
  } else {
    console.log(`[run-scrapers] Corriendo ${scrapers.length} scrapers en paralelo...`);
    const results = await Promise.allSettled(scrapers.map(runOne));
    const failed = results.filter((r) => r.status === "rejected").length;
    console.log(`[run-scrapers] Terminado. Fallidos: ${failed}/${scrapers.length}`);

    if (failed === scrapers.length && scrapers.length > 0) {
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  console.log(`[run-scrapers] Marcando proyectos stale...`);
  const stale = await markStale();
  console.log(`[run-scrapers] Stale: ${stale.markedByLastSeen} por lastSeenAt, ${stale.markedByDeadline} por deadline`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
