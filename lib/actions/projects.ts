"use server";
import prisma from "@/lib/prisma";
import { getLogger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

const logger = getLogger("ProjectActions");

export async function approveProject(id: number) {
  try {
    await prisma.project.update({
      where: { id },
      data: { needsReview: false, bases_estado: "published" },
    });
    revalidatePath("/admin/projects/needsReview");
    revalidatePath("/");
  } catch (err) {
    logger.error("Failed to approve project", err as Error, { id });
    throw err;
  }
}

export async function rejectProject(id: number) {
  try {
    await prisma.project.update({
      where: { id },
      data: { needsReview: false, bases_estado: "rejected" },
    });
    revalidatePath("/admin/projects/needsReview");
  } catch (err) {
    logger.error("Failed to reject project", err as Error, { id });
    throw err;
  }
}

export async function getProjectsNeedingReview() {
  try {
    return await prisma.project.findMany({
      where: {
        needsReview: true,
      },
      orderBy: {
        fecha_cierre: "asc",
      },
    });
  } catch (err) {
    logger.error("Failed to get projects needing review", err as Error);
    return [];
  }
}
