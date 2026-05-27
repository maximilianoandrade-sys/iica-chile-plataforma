import prisma from "../lib/prisma";
import { getLogger } from "../lib/utils/logger";

const logger = getLogger("CoverageCheck");

const CRITICAL_SOURCES = ["fia", "fia-licitaciones", "corfo", "indap", "fontagro", "cnr"];

export async function runCoverageCheck() {
  const sources = await prisma.source.findMany({
    where: { slug: { in: CRITICAL_SOURCES } },
    orderBy: { slug: "asc" },
  });

  const now = Date.now();
  const blockingProblems: string[] = [];
  const softWarnings: string[] = [];

  const foundSlugs = new Set(sources.map((s) => s.slug));
  for (const slug of CRITICAL_SOURCES) {
    if (!foundSlugs.has(slug)) {
      blockingProblems.push(`${slug}: source no sembrada en tabla Source`);
    }
  }

  for (const source of sources) {
    const ranRecently = source.lastRunAt
      ? now - source.lastRunAt.getTime() <= 48 * 60 * 60 * 1000
      : false;

    if (!ranRecently) {
      blockingProblems.push(`${source.slug}: sin corrida reciente (48h)`);
      continue;
    }

    if (source.projectsCount === 0) {
      if (source.lastRunStatus === "success" || !source.lastRunStatus) {
        blockingProblems.push(`${source.slug}: 0 proyectos con status ${source.lastRunStatus || "desconocido"}`);
      } else {
        softWarnings.push(`${source.slug}: 0 proyectos con status ${source.lastRunStatus}`);
      }
    }
  }

  if (softWarnings.length > 0) {
    logger.warn("Coverage check detected non-blocking anomalies", { warnings: softWarnings });
  }

  if (blockingProblems.length > 0) {
    logger.warn("Coverage check detected blocking anomalies", { problems: blockingProblems, warnings: softWarnings });
    throw new Error(blockingProblems.join(" | "));
  }

  logger.info("Coverage check passed", {
    checkedSources: sources.map((s) => s.slug),
  });

  await prisma.$disconnect();
}

if (process.env.NODE_ENV !== "test" && process.argv[1]?.includes("coverage-check")) {
  runCoverageCheck().catch(async (err) => {
    logger.error("Coverage check failed", err as Error);
    await prisma.$disconnect();
    process.exit(1);
  });
}
