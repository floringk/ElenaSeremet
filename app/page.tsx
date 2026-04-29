import Image from "next/image";
import { notFound } from "next/navigation";
import { PageBlocks } from "@/components/sections/PageBlocks";
import { getPageBySlug, getPrimaryImagePath } from "@/lib/content";

export default function HomePage() {
  const page = getPageBySlug("index");
  if (!page) notFound();
  const heroImagePath = getPrimaryImagePath(page);

  return (
    <section className="page-section">
      <div className="container">
        {heroImagePath ? (
          <Image
            src={heroImagePath}
            alt={page.images[1]?.alt || page.images[0]?.alt || "Pilates Studio"}
            width={1200}
            height={680}
            className="legacy-hero"
            priority
          />
        ) : null}
        <PageBlocks blocks={page.blocks} />
      </div>
    </section>
  );
}
