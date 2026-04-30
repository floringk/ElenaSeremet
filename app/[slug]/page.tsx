import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyPageShell } from "@/components/sections/LegacyPageShell";
import { PageBlocks } from "@/components/sections/PageBlocks";
import { getAllSlugs, getNormalizedPage } from "@/lib/content";
import { buildPageMetadata, defaultDescription } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getNormalizedPage(slug);
  if (!page) {
    return { title: "Pagina indisponibila" };
  }

  return buildPageMetadata({
    title: page.title,
    description: page.description || defaultDescription,
    path: `/${slug}`,
    ogImagePath: page.heroImagePath
  });
}

export default async function LegacyPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getNormalizedPage(slug);
  if (!page) {
    notFound();
  }

  return (
    <LegacyPageShell title={page.title} intro={page.intro} heroImagePath={page.heroImagePath} heroAlt={page.heroAlt}>
      <PageBlocks blocks={page.blocks} withSectionWrappers />
    </LegacyPageShell>
  );
}
