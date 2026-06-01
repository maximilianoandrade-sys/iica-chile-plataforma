import { scrapers } from "../lib/ingestion/registry";
import { upsertProject, markStale, updateSourceStatus } from "../lib/ingestion/persistence";
import prisma from "../lib/prisma";
import { getLogger } from "../lib/utils/logger";

const logger = getLogger("RunScrapers");
const CRITICAL_SOURCE_SLUGS = new Set(["fia", "fia-licitaciones", "corfo", "indap", "fontagro", "cnr"]);

interface RunOneResult {
  slug: string;
  status: "success" | "partial";
  inserted: number;
  duplicatesMerged: number;
}

interface MainOptions {
  exitOnAllFailed?: boolean;
}

export function selectScrapers(onlyScraperRaw: string | undefined): typeof scrapers {
  const onlyScraper = onlyScraperRaw?.trim().toLowerCase();
  return onlyScraper
    ? scrapers.filter((s) => s.slug.toLowerCase() === onlyScraper)
    : scrapers;
}

async function runOne(scraper: typeof scrapers[number]): Promise<RunOneResult> {
  logger.info("Scraper started", { scraper: scraper.slug });
  try {
    const result = await scraper.scrape();
    let inserted = 0;
    let duplicatesMerged = 0;
    const skipReasons: string[] = [];

    for (const raw of result.projects) {
      const r = await upsertProject(raw, scraper.slug);
      if (r.skipped) {
        if (r.reason?.startsWith('duplicate_')) {
          duplicatesMerged++;
        }
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
    logger.info("Scraper completed", {
      scraper: scraper.slug,
      inserted,
      duplicatesMerged,
      rawCount: result.projects.length,
      status,
    });
    return { slug: scraper.slug, status, inserted, duplicatesMerged };
  } catch (err) {
    const msg = (err as Error).message;
    await updateSourceStatus(scraper.slug, "error", 0, msg);
    logger.error("Scraper failed", err as Error, { scraper: scraper.slug, message: msg });
    throw err;
  }
}

export async function main(options: MainOptions = {}) {
  const { exitOnAllFailed = true } = options;
  const onlyScraper = process.env.ONLY_SCRAPER?.trim().toLowerCase();
  const selectedScrapers = selectScrapers(process.env.ONLY_SCRAPER);
  let staleProtectedSourceSlugs: string[] = [];

  if (onlyScraper && selectedScrapers.length === 0) {
    logger.warn("Requested scraper not found in registry", { onlyScraper });
    await prisma.$disconnect();
    process.exit(1);
  }

  if (selectedScrapers.length === 0) {
    logger.warn("Registry vacío, nada que correr.");
  } else {
    logger.info("Running deterministic scrapers", {
      count: selectedScrapers.length,
      onlyScraper: onlyScraper || null,
      slugs: selectedScrapers.map((s) => s.slug),
    });
    const results = await Promise.allSettled(selectedScrapers.map(runOne));
    const failed = results.filter((r) => r.status === "rejected").length;
    staleProtectedSourceSlugs = results.flatMap((result, index) => {
      const fallbackSlug = selectedScrapers[index].slug;
      if (result.status === "rejected") return [fallbackSlug];

      const run = result.value;
      const isCritical = CRITICAL_SOURCE_SLUGS.has(run.slug);
      if (isCritical && (run.status !== "success" || run.inserted === 0)) {
        return [run.slug];
      }

      return [];
    });
    logger.info("Scraper run finished", {
      failed,
      total: selectedScrapers.length,
      staleProtectedSourceSlugs,
      duplicatesMerged: results
        .filter((result): result is PromiseFulfilledResult<RunOneResult> => result.status === 'fulfilled')
        .reduce((sum, result) => sum + result.value.duplicatesMerged, 0),
    });

    if (failed === selectedScrapers.length && selectedScrapers.length > 0) {
      await prisma.$disconnect();
      if (exitOnAllFailed) {
        process.exit(1);
      }
      return;
    }
  }

  logger.info("Marking stale projects");
  const stale = await markStale({ skipSourceSlugs: staleProtectedSourceSlugs });
  logger.info("Stale projects marked", {
    markedByLastSeen: stale.markedByLastSeen,
    markedByDeadline: stale.markedByDeadline,
    protectedSources: staleProtectedSourceSlugs,
  });

  await prisma.$disconnect();
}

if (process.env.NODE_ENV !== "test" && process.argv[1]?.includes("run-scrapers")) {
  main().catch((e) => {
    logger.error("run-scrapers fatal error", e as Error);
    process.exit(1);
  });
}
