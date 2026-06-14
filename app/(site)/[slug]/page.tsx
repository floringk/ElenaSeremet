import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExtraPageJsonLd } from "@/components/templates/ExtraPageJsonLd";
import { renderPageByTemplate } from "@/components/templates/renderPageByTemplate";
import { getAllSlugs, getNormalizedPage } from "@/lib/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadataFromPage } from "@/lib/page-metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const preview = sp.preview === "true";
  const page = await getNormalizedPage(slug, { includeDraft: preview });
  if (!page) {
    return { title: "Pagina indisponibila" };
  }

  return buildMetadataFromPage(page, `/${slug}`);
}

export default async function LegacyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const preview = sp.preview === "true";
  const page = await getNormalizedPage(slug, { includeDraft: preview });
  if (!page) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(slug, page.title)} />
      <ExtraPageJsonLd page={page} />
      {preview ? (
        <div className="preview-draft-banner" role="status">
          <div className="container">
            <p>
              <strong>Previzualizare draft</strong> — conținutul poate include pagini nepublicate din CMS.
            </p>
          </div>
        </div>
      ) : null}
      {renderPageByTemplate(page, false)}
    </>
  );
}
