import Image from "next/image";

import { PageBlocks } from "@/components/sections/PageBlocks";
import { ScheduleBlock } from "@/components/sections/ScheduleBlock";
import { ScheduleRegulations } from "@/components/sections/ScheduleRegulations";
import { MembershipSignupForm } from "@/components/membership/MembershipSignupForm";
import { ServiceLeadCta } from "@/components/templates/ServiceLeadCta";
import { Reveal } from "@/components/ui/Reveal";
import { getServiceChipLabel } from "@/lib/service-chip";
import type { ContentBlock, NormalizedPage } from "@/lib/content";

type RichLegacyTemplateProps = {
  page: NormalizedPage;
  variant: "service" | "generic";
};

function normalizeHeading(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isReservationSection(heading: string): boolean {
  const normalized = normalizeHeading(heading);
  return normalized.includes("rezerva") && normalized.includes("loc");
}

function isMembershipSection(heading: string): boolean {
  const normalized = normalizeHeading(heading);
  if (normalized.includes("alatura") || normalized.includes("inscriere")) {
    return true;
  }
  return isReservationSection(heading);
}

function isLegacyMembershipLabelBlock(block: ContentBlock): boolean {
  if (block.type !== "h3" && block.type !== "p") {
    return false;
  }
  const text = normalizeHeading(block.text || "");
  if (!text) {
    return false;
  }
  if (text.includes("vreau sa") || text.includes("alege tipul") || text.includes("eu sunt")) {
    return true;
  }
  if (text.includes("ativo membership") || text.includes("squeaky clean")) {
    return true;
  }
  return false;
}

function sectionHasLegacyMembershipLabels(blocks: ContentBlock[]): boolean {
  return blocks.some(isLegacyMembershipLabelBlock);
}

function isSvgPath(src: string): boolean {
  const base = src.split("?")[0] ?? "";
  return base.toLowerCase().endsWith(".svg");
}

export function RichLegacyTemplate({ page, variant }: RichLegacyTemplateProps) {
  const images = page.contentImages;
  const isService = variant === "service";
  const heroPath = page.heroImagePath;
  const heroSvg = heroPath ? isSvgPath(heroPath) : false;
  const chip = isService ? getServiceChipLabel(page.slug) : null;
  const membershipFormRendered =
    isService &&
    page.sections.some(
      (sec) => isMembershipSection(sec.heading) || sectionHasLegacyMembershipLabels(sec.blocks)
    );

  return (
    <section className={`page-section rich-legacy ${isService ? "rich-legacy--service" : ""}`}>
      <div className="container rich-legacy-container">
        {heroPath && isService ? (
          heroSvg ? (
            <Reveal>
              <div className="rich-service-hero rich-service-hero--svg">
                <Image
                  src={heroPath}
                  alt={page.heroAlt || page.title}
                  width={360}
                  height={140}
                  className="rich-service-hero-svg-img"
                  priority
                  sizes="360px"
                />
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <div className="rich-service-hero">
                <Image
                  src={heroPath}
                  alt={page.heroAlt || page.title}
                  fill
                  priority
                  className="rich-service-hero-img"
                  sizes="(max-width: 768px) 100vw, min(1140px, 94vw)"
                />
                <div className="rich-service-hero-overlay" aria-hidden />
              </div>
            </Reveal>
          )
        ) : null}

        <header className={`legacy-page-header ${isService ? "legacy-page-header--service" : ""}`}>
          {isService ? (
            <div className="rich-service-header-row">
              <p className="rich-service-eyebrow">Serviciu</p>
              {chip ? <span className="rich-service-chip">{chip}</span> : null}
            </div>
          ) : null}
          <h1>{page.title}</h1>
          {page.intro ? <p className="legacy-intro">{page.intro}</p> : null}
        </header>

        {page.slug === "schedules" ? (
          <Reveal>
            <div className="schedule-highlight surface-soft card">
              <h2 className="rich-section-heading">Program studio</h2>
              <ScheduleBlock />
              <p className="muted schedule-highlight-note">
                Orele pot varia în sărbători — confirmă la telefon înainte de vizită.
              </p>
            </div>
          </Reveal>
        ) : null}

        {page.slug === "schedules" ? (
          <ScheduleRegulations sections={page.sections} />
        ) : null}

        {page.slug !== "schedules" && heroPath && !isService ? (
          <Reveal>
            <div className="page-hero-block">
              <Image
                src={heroPath}
                alt={page.heroAlt || page.title}
                width={1200}
                height={680}
                className="legacy-hero"
                priority
                sizes="(max-width: 768px) 100vw, min(1200px, 92vw)"
              />
            </div>
          </Reveal>
        ) : null}

        {page.slug !== "schedules"
          ? page.sections.map((sec, idx) => {
          const img = images[idx];
          const hasImg = Boolean(img);
          const flip = Boolean(hasImg && idx % 2 === 1);
          const inlineSvg = img ? isSvgPath(img.src) : false;

          const toneClass =
            isService && (idx % 2 === 0 ? "rich-section--tone-a" : "rich-section--tone-b");

          const showMembershipForm =
            isService &&
            (isMembershipSection(sec.heading) || sectionHasLegacyMembershipLabels(sec.blocks));

          const sectionBlocks = showMembershipForm
            ? sec.blocks.filter((block) => !isLegacyMembershipLabelBlock(block))
            : sec.blocks;

          return (
            <Reveal key={`${sec.heading}-${idx}`} delay={(idx % 4) as 0 | 1 | 2 | 3}>
              <section
                className={`rich-section ${isService ? toneClass : "surface-soft"} ${
                  hasImg && isService ? "rich-section--with-media" : ""
                }`}
              >
                {flip && hasImg && isService ? (
                  <InlineFigure img={img} heading={sec.heading} inlineSvg={inlineSvg} />
                ) : null}

                <div className="rich-section-copy">
                  {sec.heading !== "Introducere" ? (
                    <h2 className="rich-section-heading">{sec.heading}</h2>
                  ) : null}
                  <PageBlocks blocks={sectionBlocks} withSectionWrappers={false} />
                  {showMembershipForm ? (
                    <div className="service-lead-block">
                      <MembershipSignupForm
                        sourcePage={`/${page.slug}`}
                        compact
                        title="Alătură-te astăzi"
                        id={`membership-${page.slug}`}
                      />
                      <ServiceLeadCta />
                    </div>
                  ) : null}
                </div>

                {!flip && hasImg && isService ? (
                  <InlineFigure img={img} heading={sec.heading} inlineSvg={inlineSvg} />
                ) : null}

                {hasImg && !isService ? (
                  <InlineFigure img={img} heading={sec.heading} inlineSvg={inlineSvg} />
                ) : null}
              </section>
            </Reveal>
          );
        })
          : null}

        {isService && !membershipFormRendered ? (
          <Reveal>
            <section className="rich-section rich-section--tone-a">
              <div className="rich-section-copy">
                <MembershipSignupForm
                  sourcePage={`/${page.slug}`}
                  compact
                  title="Alătură-te astăzi"
                  id={`membership-${page.slug}-footer`}
                />
                <ServiceLeadCta />
              </div>
            </section>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function InlineFigure({
  img,
  heading,
  inlineSvg
}: {
  img: { src: string; alt: string };
  heading: string;
  inlineSvg: boolean;
}) {
  return (
    <figure className={`rich-inline-figure ${inlineSvg ? "rich-inline-figure--svg" : "rich-inline-figure--photo"}`}>
      {inlineSvg ? (
        <div className="rich-inline-svg-wrap">
          <Image
            src={img.src}
            alt={img.alt || heading}
            width={160}
            height={96}
            className="rich-inline-img rich-inline-img--svg"
            loading="lazy"
            sizes="120px"
          />
        </div>
      ) : (
        <div className="rich-inline-photo-frame">
          <Image
            src={img.src}
            alt={img.alt || heading}
            fill
            className="rich-inline-img rich-inline-img--cover"
            loading="lazy"
            sizes="(max-width: 900px) 100vw, 420px"
          />
        </div>
      )}
    </figure>
  );
}
