import { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";
import { getEnv } from "@/lib/utils/env";

export const dynamic = "force-dynamic";

const CANONICAL_SITE_URL = "https://iica-chile-plataforma.vercel.app";

function getBaseUrl(): string {
  try {
    const env = getEnv();
    if (env.NEXT_PUBLIC_SITE_URL && !env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
      return env.NEXT_PUBLIC_SITE_URL;
    }
  } catch {
    // Fall back to canonical site URL
  }
  return CANONICAL_SITE_URL;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = getBaseUrl();
  let projectUrls: MetadataRoute.Sitemap = [];

  try {
    const result = await getProjects();
    if (result.ok) {
      projectUrls = result.projects.map((p) => ({
        url: `${BASE_URL}/proyecto/${p.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch {
    // Graceful fallback when the catalog cannot be loaded.
  }

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/legal/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacidad`, changeFrequency: "yearly", priority: 0.3 },
    ...projectUrls,
  ];
}

