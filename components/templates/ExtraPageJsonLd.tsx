import { JsonLd } from "@/components/seo/JsonLd";
import { getPricingPlans } from "@/lib/cms-pricing";
import { getStudioChrome } from "@/lib/cms-studio";
import {
  buildInstructorListJsonLd,
  buildPersonJsonLd,
  buildPricingItemListJsonLd,
  buildServiceJsonLd,
  effectivePageDescription
} from "@/lib/seo";
import type { NormalizedPage } from "@/lib/content";
import { instructorProfileSlugs } from "@/lib/site-data";

type ExtraPageJsonLdProps = {
  page: NormalizedPage;
};

export async function ExtraPageJsonLd({ page }: ExtraPageJsonLdProps) {
  if (page.slug === "instructori") {
    const studio = await getStudioChrome();
    return (
      <JsonLd
        data={buildInstructorListJsonLd(
          studio.team.map((t) => ({ name: t.name, path: t.href, imagePath: t.image }))
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
    const plans = await getPricingPlans();
    return (
      <JsonLd
        data={buildPricingItemListJsonLd(
          plans.map((p) => ({
            name: p.name,
            price: p.value.replace(/[^\d.]/g, "") || "0",
            description: p.note
          }))
        )}
      />
    );
  }

  return null;
}
