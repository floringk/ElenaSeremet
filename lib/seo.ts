import type { Metadata } from "next";

export const siteUrl = "https://elenaseremet.ro";
export const siteName = "Pilates Studio Elena Seremet";
export const defaultDescription = "Pilates studio cu abordare calm nature inspired.";
/** Default social preview — served from `public/og-default.jpg` (regenerate via `node scripts/bootstrap-public-assets.mjs`). */
export const defaultOgImagePath = "/og-default.jpg";

/** Matches footer contact block — used for Organization JSON-LD */
export const sitePostalAddress = {
  "@type": "PostalAddress" as const,
  streetAddress: "Bd. 1 Decembrie 1918, nr. 58",
  addressLocality: "Bucuresti",
  addressRegion: "Sector 3",
  addressCountry: "RO"
};

export const siteTelephone = "+40755247412";

export function parseSameAsFromEnv(): string[] {
  const raw = process.env.SITE_SAME_AS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildRootStructuredDataGraph(): {
  "@context": string;
  "@graph": Record<string, unknown>[];
} {
  const sameAs = parseSameAsFromEnv();

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/content/images/logo-moto-pilates-mat-9.png"),
    image: absoluteUrl(defaultOgImagePath),
    telephone: siteTelephone,
    address: sitePostalAddress
  };

  if (sameAs.length > 0) {
    organization.sameAs = sameAs;
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "SportsActivityLocation",
        name: siteName,
        description: defaultDescription,
        url: absoluteUrl("/"),
        image: absoluteUrl(defaultOgImagePath),
        parentOrganization: { "@id": `${siteUrl}/#organization` }
      },
      {
        "@type": "WebSite",
        name: siteName,
        url: absoluteUrl("/"),
        publisher: { "@id": `${siteUrl}/#organization` }
      }
    ]
  };
}

export function buildBreadcrumbJsonLd(slug: string, pageTitle: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Acasa",
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageTitle,
        item: absoluteUrl(`/${slug}`)
      }
    ]
  };
}

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
  const imagePath = absoluteUrl(input.ogImagePath || defaultOgImagePath);
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
