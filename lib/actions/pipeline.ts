"use server";
import prisma from "@/lib/prisma";

export async function getPipelineMetrics() {
  const projects = await prisma.project.findMany();
  
  const sources = [...new Set(projects.map(p => p.institucion))];
  
  const stats = sources.map(source => {
    const sourceProjects = projects.filter(p => p.institucion === source);
    return {
      source,
      total: sourceProjects.length,
      active: sourceProjects.filter(p => p.estado === 'Abierto').length,
      needsReview: sourceProjects.filter(p => p.bases_estado === 'needsReview').length,
      lastScraped: new Date().toLocaleDateString() // Placeholder
    };
  });
  
  return {
    stats,
    summary: {
      total: projects.length,
      active: projects.filter(p => p.estado === 'Abierto').length,
      pendingReview: projects.filter(p => p.bases_estado === 'needsReview').length
    }
  };
}
