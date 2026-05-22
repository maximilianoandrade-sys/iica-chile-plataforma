import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ciruela-certificada.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await prisma.project.findMany({
    select: { id: true, updatedAt: true },
  });

  const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE_URL}/proyecto/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/maletin`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/legal/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacidad`, changeFrequency: "yearly", priority: 0.3 },
    ...projectUrls,
  ];
}
