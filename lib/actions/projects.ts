"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveProject(id: number) {
  await prisma.project.update({
    where: { id },
    data: { bases_estado: 'published' }
  });
  revalidatePath("/admin/projects/needsReview");
  revalidatePath("/");
}

export async function rejectProject(id: number) {
  // En lugar de borrar, lo marcamos como rechazado
  await prisma.project.update({
    where: { id },
    data: { bases_estado: 'rejected' }
  });
  revalidatePath("/admin/projects/needsReview");
}

export async function getProjectsNeedingReview() {
  return await prisma.project.findMany({
    where: {
      bases_estado: 'needsReview'
    },
    orderBy: {
      fecha_cierre: 'asc'
    }
  });
}
