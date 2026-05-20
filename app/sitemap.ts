import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await prisma.project.findMany({
    select: { id: true, updatedAt: true },
  });

  const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `https://radar.iica.cl/proyecto/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: "https://radar.iica.cl", changeFrequency: "daily", priority: 1 },
    { url: "https://radar.iica.cl/about", changeFrequency: "monthly", priority: 0.5 },
    { url: "https://radar.iica.cl/consultores", changeFrequency: "weekly", priority: 0.7 },
    { url: "https://radar.iica.cl/legal/terminos", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://radar.iica.cl/legal/privacidad", changeFrequency: "yearly", priority: 0.3 },
    ...projectUrls,
  ];
}
