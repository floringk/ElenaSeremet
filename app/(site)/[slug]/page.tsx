import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExtraPageJsonLd } from "@/components/templates/ExtraPageJsonLd";
import { renderPageByTemplate } from "@/components/templates/renderPageByTemplate";
import { getAllSlugsMerged, getNormalizedPage } from "@/lib/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadataFromPage } from "@/lib/page-metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Prerender merged CMS + manifest slugs; allow CMS-only slugs at request time. */
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllSlugsMerged();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getNormalizedPage(slug);
  if (!page) {
    return { title: "Pagina indisponibila" };
  }

  return buildMetadataFromPage(page, `/${slug}`);
}

export default async function LegacyPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getNormalizedPage(slug);
  if (!page) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(slug, page.title)} />
      <ExtraPageJsonLd page={page} />
      {await renderPageByTemplate(page, false)}
    </>
  );
}
