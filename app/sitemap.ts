import type { MetadataRoute } from "next";
import { getAllSlugsMerged, getNoIndexSlugs } from "@/lib/content";
import { getAlbums } from "@/lib/new-gallery";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://elenaseremet.ro";
  const lastModified = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1, lastModified },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.85, lastModified },
    { url: `${base}/despre-noi`, changeFrequency: "monthly", priority: 0.9, lastModified },
    { url: `${base}/servicii`, changeFrequency: "weekly", priority: 0.9, lastModified },
    { url: `${base}/preturi`, changeFrequency: "weekly", priority: 0.88, lastModified },
    { url: `${base}/schedules`, changeFrequency: "weekly", priority: 0.88, lastModified },
    { url: `${base}/inscriere`, changeFrequency: "monthly", priority: 0.72, lastModified },
    { url: `${base}/galerie`, changeFrequency: "weekly", priority: 0.75, lastModified },
    { url: `${base}/instructori`, changeFrequency: "monthly", priority: 0.8, lastModified }
  ];

  const slugs = await getAllSlugsMerged();
  const noIndex = await getNoIndexSlugs();
  for (const slug of slugs) {
    if (noIndex.has(slug)) continue;
    routes.push({
      url: `${base}/${slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified
    });
  }

  for (const album of getAlbums()) {
    routes.push({
      url: `${base}/galerie/${album.slug}`,
      changeFrequency: "monthly",
      priority: 0.65,
      lastModified
    });
  }

  return routes;
}
