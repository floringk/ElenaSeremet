import type { MetadataRoute } from "next";
import { getAllSlugsMerged } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://elenaseremet.ro";
  const lastModified = new Date();
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "weekly",
      priority: 1,
      lastModified
    }
  ];

  const slugs = await getAllSlugsMerged();
  for (const slug of slugs) {
    routes.push({
      url: `${base}/${slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified
    });
  }

  return routes;
}
