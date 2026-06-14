import type { Metadata } from "next";

/** Public site URL — env override for preview/staging; production should set NEXT_PUBLIC_SITE_URL. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://elenaseremet.ro"
).replace(/\/$/, "");
export const siteName = "Pilates Studio Elena Seremet";
export const defaultDescription =
  "Studio de Pilates în București — clase mat și reformer, antrenament personalizat și program flexibil. Mișcare conștientă într-un spațiu calm și primitor.";
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

export function effectivePageDescription(
  page: { description: string; intro: string | null },
  fallback: string = defaultDescription
): string {
  const d = page.description?.trim();
  if (d) {
    return d;
  }
  const i = page.intro?.trim();
  if (i) {
    return i.length > 200 ? `${i.slice(0, 197)}…` : i;
  }
  return fallback;
}

/** JSON-LD for a service detail page. */
export function buildServiceJsonLd(input: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: { "@type": "Country", name: "Romania" },
    url: absoluteUrl(input.path)
  };
}

export function buildPersonJsonLd(input: { name: string; path: string; imageUrl?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    url: absoluteUrl(input.path),
    ...(input.imageUrl ? { image: absoluteUrl(input.imageUrl) } : {}),
    worksFor: { "@id": `${siteUrl}/#organization` }
  };
}

export function buildInstructorListJsonLd(
  people: { name: string; path: string; imagePath: string | null }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Echipa de instructori",
    numberOfItems: people.length,
    itemListElement: people.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: p.name,
        url: absoluteUrl(p.path),
        ...(p.imagePath ? { image: absoluteUrl(p.imagePath) } : {})
      }
    }))
  };
}

export function buildPricingItemListJsonLd(
  offers: { name: string; price: string; description?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Preturi si abonamente",
    numberOfItems: offers.length,
    itemListElement: offers.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Offer",
        name: o.name,
        description: o.description,
        price: o.price,
        priceCurrency: "RON",
        url: absoluteUrl("/preturi")
      }
    }))
  };
}

function truncateDescription(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  ogImagePath?: string | null;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  const imagePath = absoluteUrl(input.ogImagePath || defaultOgImagePath);
  const description = truncateDescription(input.description);
  const pageTitle = input.title.includes(siteName) ? input.title : input.title;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: input.path },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName,
      locale: "ro_RO",
      type: "website",
      images: [{ url: imagePath, width: 1200, height: 630, alt: pageTitle }]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imagePath]
    }
  };
}
