import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

import { getEnv } from "@/lib/utils/env";

export const dynamic = "force-dynamic";

const DEFAULT_SITE_URL = "https://iica-chile-plataforma.vercel.app";

function getBaseUrl(): string {
  try {
    const env = getEnv();
    return env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : DEFAULT_SITE_URL;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = getBaseUrl();
  let projectUrls: MetadataRoute.Sitemap = [];

  try {
    const projects = await prisma.project.findMany({
      select: { id: true, updatedAt: true },
    });

    projectUrls = projects.map((p) => ({
      url: `${BASE_URL}/proyecto/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // Non-blocking fallback if DB is unreachable during sitemap generation
  }

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/legal/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacidad`, changeFrequency: "yearly", priority: 0.3 },
    ...projectUrls,
  ];
}
