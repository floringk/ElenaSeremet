import Image from "next/image";

import { PageBlocks } from "@/components/sections/PageBlocks";
import { Reveal } from "@/components/ui/Reveal";
import type { NormalizedPage } from "@/lib/content";

type AboutTemplateProps = {
  page: NormalizedPage;
};

const MAX_ASIDE_PHOTOS = 5;

function isRasterPhoto(src: string): boolean {
  return /\.(jpe?g|png|webp|gif)$/i.test(src.split("?")[0] ?? "");
}

function pickAsidePhotos(images: NormalizedPage["contentImages"]) {
  const photos = images.filter((img) => isRasterPhoto(img.src));
  const studioFirst = [
    ...photos.filter((img) => img.src.includes("/images/new/")),
    ...photos.filter((img) => !img.src.includes("/images/new/"))
  ];
  // Prefer distinct shots; drop tiny/wordmark-like leftovers by path heuristics.
  const deduped: typeof photos = [];
  const seen = new Set<string>();
  for (const img of studioFirst) {
    const key = img.src.replace(/-1024x\d+/i, "").toLowerCase();
    if (seen.has(key)) continue;
    if (/home\d/i.test(img.src) && deduped.length >= 2) continue;
    seen.add(key);
    deduped.push(img);
    if (deduped.length >= MAX_ASIDE_PHOTOS) break;
  }
  return deduped;
}

export function AboutTemplate({ page }: AboutTemplateProps) {
  const imgs = pickAsidePhotos(page.contentImages);

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

        <div className={`about-split ${imgs.length > 0 ? "about-split--with-aside" : ""}`}>
          <Reveal className="about-split-main">
            <PageBlocks blocks={page.blocks} withSectionWrappers />
          </Reveal>
          {imgs.length > 0 ? (
            <aside className="about-split-aside" aria-label="Imagini din studio">
              {imgs.map((img, ii) => (
                <Reveal key={img.src} delay={(ii % 4) as 0 | 1 | 2 | 3}>
                  <figure className="about-aside-figure about-aside-figure--photo">
                    <div className="about-aside-photo-frame">
                      <Image
                        src={img.src}
                        alt={img.alt || `${page.title} — imagine din studio`}
                        fill
                        className="about-aside-img"
                        loading="lazy"
                        sizes="(max-width: 900px) 100vw, 380px"
                      />
                    </div>
                  </figure>
                </Reveal>
              ))}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
