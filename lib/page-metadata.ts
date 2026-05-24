import type { Metadata } from "next";

import type { NormalizedPage } from "@/lib/content";
import { getRouteSeo, getSiteSettings } from "@/lib/cms-settings";
import {
  buildPageMetadata,
  defaultDescription,
  effectivePageDescription,
  siteName
} from "@/lib/seo";

export type MetadataFallback = {
  title: string;
  description: string;
  path: string;
  ogImagePath?: string | null;
};

function cleanTitle(raw: string): string {
  return raw
    .trim()
    .replace(/\s*–\s*Pilates Studio.*$/i, "")
    .replace(/\s*-\s*Pilates Studio.*$/i, "")
    .trim();
}

/** Build Next metadata from a normalized page (legacy JSON or CMS `pages`). */
export async function buildMetadataFromPage(page: NormalizedPage, path: string): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = cleanTitle(page.seoTitle?.trim() || page.title) || siteName;
  const description =
    page.description?.trim() ||
    effectivePageDescription(page, settings.defaultDescription || defaultDescription);

  return buildPageMetadata({
    title,
    description,
    path,
    ogImagePath: page.seoOgImagePath || page.heroImagePath,
    noIndex: page.seoNoIndex
  });
}

/** Static app routes (contact, galerie, …) — CMS overrides via Settings → SEO rute fixe. */
export async function buildMetadataForRoute(
  path: string,
  fallback: MetadataFallback
): Promise<Metadata> {
  const routeSeo = await getRouteSeo(path);
  const settings = await getSiteSettings();

  const title = cleanTitle(routeSeo?.metaTitle?.trim() || fallback.title);
  const description =
    routeSeo?.metaDescription?.trim() ||
    fallback.description ||
    settings.defaultDescription ||
    defaultDescription;

  return buildPageMetadata({
    title,
    description,
    path: fallback.path,
    ogImagePath: routeSeo?.ogImagePath || fallback.ogImagePath,
    noIndex: routeSeo?.noIndex ?? false
  });
}
