"use server";
import prisma from "@/lib/prisma";

export async function getPipelineMetrics() {
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
}
