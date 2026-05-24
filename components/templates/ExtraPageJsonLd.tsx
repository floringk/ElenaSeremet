import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildInstructorListJsonLd,
  buildPersonJsonLd,
  buildPricingItemListJsonLd,
  buildServiceJsonLd,
  effectivePageDescription
} from "@/lib/seo";
import type { NormalizedPage } from "@/lib/content";
import { instructorProfileSlugs, pricingPlans, team } from "@/lib/site-data";

type ExtraPageJsonLdProps = {
  page: NormalizedPage;
};

export function ExtraPageJsonLd({ page }: ExtraPageJsonLdProps) {
  if (page.slug === "instructori") {
    return (
      <JsonLd
        data={buildInstructorListJsonLd(
          team.map((t) => ({ name: t.name, path: t.href, imagePath: t.image }))
        )}
      />
    );
  }

  if ((instructorProfileSlugs as readonly string[]).includes(page.slug)) {
    return (
      <JsonLd
        data={buildPersonJsonLd({
          name: page.title,
          path: `/${page.slug}`,
          imageUrl: page.heroImagePath
        })}
      />
    );
  }

  if (page.pageType === "servicii" && page.slug !== "servicii") {
    return (
      <JsonLd
        data={buildServiceJsonLd({
          name: page.title,
          description: effectivePageDescription(page),
          path: `/${page.slug}`
        })}
      />
    );
  }

  if (page.slug === "preturi") {
    return (
      <JsonLd
        data={buildPricingItemListJsonLd(
          pricingPlans.map((p) => ({ name: p.name, price: p.value, description: p.note }))
        )}
      />
    );
  }

  return null;
}
