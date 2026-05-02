import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    host: "https://elenaseremet.ro",
    sitemap: "https://elenaseremet.ro/sitemap.xml"
  };
}
