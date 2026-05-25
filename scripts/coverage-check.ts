import prisma from "../lib/prisma";
import { getLogger } from "../lib/utils/logger";

const logger = getLogger("CoverageCheck");

const CRITICAL_SOURCES = ["fia", "fia-licitaciones", "corfo", "indap", "fontagro", "cnr"];

async function main() {
  const sources = await prisma.source.findMany({
    where: { slug: { in: CRITICAL_SOURCES } },
    orderBy: { slug: "asc" },
  });

  const now = Date.now();
  const problems: string[] = [];

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

main().catch(async (err) => {
  logger.error("Coverage check failed", err as Error);
  await prisma.$disconnect();
  process.exit(1);
});
