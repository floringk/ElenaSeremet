import type { MetadataRoute } from "next";
import { getAlbumsResolved } from "@/lib/cms-gallery";
import { getAllSlugsMerged, getNoIndexSlugs } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl;
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
    { url: `${base}/instructori`, changeFrequency: "monthly", priority: 0.8, lastModified },
    { url: `${base}/politica-cookie`, changeFrequency: "yearly", priority: 0.3, lastModified }
  ];

  const [slugs, noIndex, albums] = await Promise.all([
    getAllSlugsMerged(),
    getNoIndexSlugs(),
    getAlbumsResolved()
  ]);
  for (const slug of slugs) {
    if (noIndex.has(slug)) continue;
    routes.push({
      url: `${base}/${slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified
    });
  }

  for (const album of albums) {
    routes.push({
      url: `${base}/galerie/${album.slug}`,
      changeFrequency: "monthly",
      priority: 0.65,
      lastModified
    });
  }

  return routes;
}
