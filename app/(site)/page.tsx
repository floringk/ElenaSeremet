import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderPageByTemplate } from "@/components/templates/renderPageByTemplate";
import { getNormalizedPage } from "@/lib/content";
import { buildMetadataFromPage } from "@/lib/page-metadata";
import { buildPageMetadata, siteName } from "@/lib/seo";

export const dynamic = "force-static";

export default async function HomePage() {
  const page = await getNormalizedPage("index");
  if (!page) notFound();

  return await renderPageByTemplate(page, true);
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
  return buildMetadataFromPage(page, "/");
}
