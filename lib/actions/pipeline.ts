"use server";
import prisma from "@/lib/prisma";
import { getLogger } from "@/lib/utils/logger";

const logger = getLogger("PipelineActions");

export async function getPipelineMetrics() {
  try {
    const [total, active, needsReview, lastScrapedSource, sources] =
      await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { estado: "Abierto" } }),
        prisma.project.count({ where: { needsReview: true } }),
        prisma.source.findFirst({ orderBy: { lastRunAt: "desc" } }),
        prisma.source.findMany(),
      ]);

    return {
      total,
      active,
      needsReview,
      lastScraped: lastScrapedSource?.lastRunAt ?? null,
      sources,
    };
  } catch (err) {
    logger.error("Failed to get pipeline metrics", err as Error);
    return {
      total: 0,
      active: 0,
      needsReview: 0,
      lastScraped: null,
      sources: [] as Awaited<ReturnType<typeof prisma.source.findMany>>,
    };
  }
}
