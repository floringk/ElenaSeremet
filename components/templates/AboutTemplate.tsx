import Image from "next/image";

import { PageBlocks } from "@/components/sections/PageBlocks";
import { Reveal } from "@/components/ui/Reveal";
import type { NormalizedPage } from "@/lib/content";

type AboutTemplateProps = {
  page: NormalizedPage;
};

export function AboutTemplate({ page }: AboutTemplateProps) {
  const imgs = page.contentImages;

  return (
    <section className="page-section about-template">
      <div className="container">
        <header className="legacy-page-header">
          <p className="section-label">Studioul nostru</p>
          <h1>{page.title}</h1>
          {page.intro ? <p className="legacy-intro">{page.intro}</p> : null}
        </header>

        {page.heroImagePath ? (
          <div className="page-hero-block">
            <Image
              src={page.heroImagePath}
              alt={page.heroAlt || page.title}
              width={1200}
              height={680}
              className="legacy-hero"
              priority
              sizes="(max-width: 768px) 100vw, min(1200px, 92vw)"
            />
          </div>
        ) : null}

        <div className="about-split">
          <Reveal className="about-split-main">
            <PageBlocks blocks={page.blocks} withSectionWrappers />
          </Reveal>
          {imgs.length > 0 ? (
            <aside className="about-split-aside" aria-label="Imagini">
              {imgs.map((img, ii) => {
                const lower = img.src.toLowerCase();
                const isSvg = lower.endsWith(".svg");
                const isLogo = lower.includes("logo") || lower.includes("moto-pilates");
                const cardClass = isSvg
                  ? "about-aside-figure about-aside-figure--icon"
                  : isLogo
                    ? "about-aside-figure about-aside-figure--logo"
                    : "about-aside-figure about-aside-figure--photo";
                return (
                  <Reveal key={img.src} delay={(ii % 4) as 0 | 1 | 2 | 3}>
                    <figure className={cardClass}>
                      <Image
                        src={img.src}
                        alt={img.alt || page.title}
                        width={480}
                        height={360}
                        className="about-aside-img"
                        loading="lazy"
                        sizes="(max-width: 900px) 100vw, 400px"
                      />
                    </figure>
                  </Reveal>
                );
              })}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
