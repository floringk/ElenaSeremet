import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyPageShell } from "@/components/sections/LegacyPageShell";
import { PageBlocks } from "@/components/sections/PageBlocks";
import { getNormalizedPage } from "@/lib/content";
import { buildPageMetadata, defaultDescription, siteName } from "@/lib/seo";

export default async function HomePage() {
  const page = await getNormalizedPage("index");
  if (!page) notFound();

  return (
    <LegacyPageShell
      title={page.title}
      intro={page.intro}
      heroImagePath={page.heroImagePath}
      heroAlt={page.heroAlt}
      heroPriority
    >
      <PageBlocks blocks={page.blocks} withSectionWrappers />
    </LegacyPageShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getNormalizedPage("index");
  if (!page) {
    return buildPageMetadata({
      title: siteName,
      description: "Continutul original al studioului Pilates, migrat in Next.js cu structura URL compatibila.",
      path: "/"
    });
  }
  return buildPageMetadata({
    title: page.title,
    description: page.description || defaultDescription,
    path: "/",
    ogImagePath: page.heroImagePath
  });
}
