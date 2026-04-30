import type { Metadata } from "next";

export const siteUrl = "https://elenaseremet.ro";
export const siteName = "Pilates Studio Elena Seremet";
export const defaultDescription = "Pilates studio cu abordare calm nature inspired.";
/** Served via `app/content/[...path]` — usable as default OG image */
export const defaultOgImagePath = "/content/images/Elena-scaled.jpg";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }
  const base = siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  ogImagePath?: string | null;
}): Metadata {
  const url = absoluteUrl(input.path);
  const imagePath = input.ogImagePath || defaultOgImagePath;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName,
      locale: "ro_RO",
      type: "website",
      images: [{ url: imagePath, width: 1200, height: 630, alt: input.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imagePath]
    }
  };
}
