import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/projects";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://askhemanth.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const projects = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/projects/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/chat`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...projects,
  ];
}
