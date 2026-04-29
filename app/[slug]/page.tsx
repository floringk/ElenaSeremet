import Image from "next/image";
import { notFound } from "next/navigation";
import { PageBlocks } from "@/components/sections/PageBlocks";
import { getAllSlugs, getPageBySlug, getPrimaryImagePath } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function LegacyPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) {
    notFound();
  }

  const heroImagePath = getPrimaryImagePath(page);

  return (
    <section className="page-section">
      <div className="container">
        {heroImagePath ? (
          <Image
            src={heroImagePath}
            alt={page.images[1]?.alt || page.images[0]?.alt || page.title}
            width={1200}
            height={680}
            className="legacy-hero"
          />
        ) : null}
        <PageBlocks blocks={page.blocks} />
      </div>
    </section>
  );
}
