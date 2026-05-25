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
  const problems: string[] = [];

  const foundSlugs = new Set(sources.map((s) => s.slug));
  for (const slug of CRITICAL_SOURCES) {
    if (!foundSlugs.has(slug)) {
      problems.push(`${slug}: source no sembrada en tabla Source`);
    }
  }

  for (const source of sources) {
    const ranRecently = source.lastRunAt
      ? now - source.lastRunAt.getTime() <= 48 * 60 * 60 * 1000
      : false;

    if (!ranRecently) {
      problems.push(`${source.slug}: sin corrida reciente (48h)`);
      continue;
    }

    if (source.projectsCount === 0 && source.lastRunStatus !== "error") {
      problems.push(`${source.slug}: 0 proyectos con status ${source.lastRunStatus || "desconocido"}`);
    }
  }

  if (problems.length > 0) {
    logger.warn("Coverage check detected anomalies", { problems });
    throw new Error(problems.join(" | "));
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
