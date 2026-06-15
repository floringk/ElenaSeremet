import Image from "next/image";
import Link from "next/link";

import { CtaBanner } from "@/components/sections/CtaBanner";
import { Reveal } from "@/components/ui/Reveal";
import type { ContentBlock, NormalizedPage } from "@/lib/content";
import { services, team } from "@/lib/site-data";

type HomeTemplateProps = {
  page: NormalizedPage;
};

const HERO_PILLS = ["Pilates Reformer", "Mat & Props", "Yoga & Tonifiere"] as const;
const DEFAULT_TAGLINE = "Conectează-te la cea mai bună formă.";

function normalizeHomeTagline(text: string | null | undefined): string {
  const raw = text?.trim() || "";
  if (!raw) return DEFAULT_TAGLINE;
  return raw
    .replace(/conectează-tela/gi, "Conectează-te la")
    .replace(/conecteaza-tela/gi, "Conectează-te la")
    .replace(/\s+/g, " ")
    .trim();
}

function splitHomeBlocks(blocks: ContentBlock[]) {
  const lines: string[] = [];
  let i = 0;
  while (i < blocks.length && blocks[i]?.type === "h2") {
    const t = blocks[i].text?.trim() || "";
    if (t.length > 64) {
      break;
    }
    lines.push(t);
    if (lines.length >= 5) {
      i++;
      break;
    }
    i++;
  }
  let tagline: string | null = null;
  if (blocks[i]?.type === "p") {
    tagline = blocks[i].text?.trim() || null;
  }
  return {
    lines: lines.length >= 2 ? lines : null,
    tagline
  };
}

export function HomeTemplate({ page }: HomeTemplateProps) {
  const { lines, tagline } = splitHomeBlocks(page.blocks);
  const displayTagline = normalizeHomeTagline(tagline || page.intro);
  const hero = page.heroImagePath;
  const titleLines = lines && lines.length >= 2 ? lines : null;

  return (
    <>
      <section className="home-hero home-hero--cinematic home-hero--immersive" aria-labelledby="home-hero-heading">
        {hero ? (
          <div className="home-hero-media" aria-hidden>
            <Image
              src={hero}
              alt=""
              fill
              className="home-hero-media-img"
              priority
              quality={100}
              sizes="100vw"
              unoptimized
            />
            <div className="home-hero-media-scrim" />
            <div className="home-hero-media-vignette" />
            <div className="home-hero-media-overlay" />
            <div className="home-hero-media-grain" />
          </div>
        ) : (
          <div className="home-hero-media home-hero-media--fallback" aria-hidden>
            <div className="home-hero-media-vignette" />
            <div className="home-hero-media-overlay" />
            <div className="home-hero-media-grain" />
          </div>
        )}

        <div className="home-hero-fade-bottom" aria-hidden />

        <div className="container home-hero-cinematic-inner">
          <Reveal className="home-hero-cinematic-copy">
            <div className="home-hero-glass">
            <p className="home-hero-eyebrow">Pilates Studio · București</p>

            {titleLines ? (
              <h1 id="home-hero-heading" className="home-hero-display">
                {titleLines.map((line, index) => (
                  <span
                    key={`${line}-${index}`}
                    className={
                      line === "&" ? "home-hero-display-line home-hero-display-line--accent" : "home-hero-display-line"
                    }
                  >
                    {line}
                  </span>
                ))}
              </h1>
            ) : (
              <h1 id="home-hero-heading" className="home-hero-display home-hero-display--single">
                {page.title.split(" – ")[0]}
              </h1>
            )}

            <p className="home-hero-tagline home-hero-tagline--cinematic">
              <span className="home-hero-tagline-text">{displayTagline}</span>
            </p>

            <ul className="home-hero-pills" aria-label="Specialități studio">
              {HERO_PILLS.map((pill) => (
                <li key={pill}>{pill}</li>
              ))}
            </ul>

            <div className="home-hero-cta home-hero-cta--cinematic">
              <Link href="/inscriere#inscriere-studio" className="btn btn-primary focus-ring">
                Înscrie-te
              </Link>
              <Link href="/schedules" className="btn btn-secondary focus-ring home-hero-btn-ghost">
                Program clase
              </Link>
            </div>
            </div>
          </Reveal>
        </div>

        <div className="home-hero-scroll-hint" aria-hidden>
          <span />
        </div>
      </section>

      <section className="surface-soft page-section home-section home-services">
        <div className="container">
          <Reveal>
            <p className="section-label">Servicii</p>
            <h2>Descoperă clasa potrivită pentru tine</h2>
            <p className="home-lead">
              Te invităm să îți descoperi forța interioară prin mișcări controlate și conștiente.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <div className="model5-cards">
              {services.map((s) => (
                <Link key={s.title} href={s.href} className="model5-card focus-ring">
                  <Image src={s.icon} alt="" width={48} height={48} className="model5-card-icon" />
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal delay={2}>
            <p className="home-inline-cta">
              <Link href="/servicii" className="btn btn-secondary focus-ring">
                Toate serviciile
              </Link>
              <Link href="/schedules" className="btn btn-primary focus-ring">
                Vezi programul
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="page-section home-section home-testimonial">
        <div className="container">
          <Reveal>
            <div className="model5-testimonial-inner">
              <blockquote>
                „Aici vei găsi un loc al relaxării, al energiei pozitive și al evoluției constante.”
              </blockquote>
              <cite>Pilates Studio Elena Seremet</cite>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="surface-soft page-section home-section home-pricing-teaser">
        <div className="container model5-pricing-teaser-inner">
          <Reveal className="model5-pricing-teaser-copy">
            <h2>Abonamente flexibile</h2>
            <p>4, 8 sau 12 ședințe – alege varianta care ți se potrivește.</p>
          </Reveal>
          <Reveal className="model5-pricing-teaser-action" delay={1}>
            <span className="model5-pricing-teaser-divider" aria-hidden />
            <Link href="/preturi" className="btn btn-primary focus-ring">
              Vezi prețuri
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="page-section home-section home-team">
        <div className="container">
          <Reveal>
            <p className="section-label">Echipă</p>
            <h2>Echipa noastră</h2>
          </Reveal>
          <Reveal delay={1}>
            <div className="model5-team-grid">
              {team.map((m) => (
                <Link key={m.name} href={m.href} className="model5-team-card focus-ring">
                  <span className="model5-team-photo-wrap">
                    <Image
                      src={m.image}
                      alt={m.name}
                      width={220}
                      height={220}
                      className="model5-team-photo"
                      sizes="(max-width: 600px) 80vw, 220px"
                    />
                  </span>
                  <strong className="model5-team-name">{m.name}</strong>
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal delay={2}>
            <p className="home-inline-cta">
              <Link href="/instructori" className="btn btn-secondary focus-ring">
                Vezi instructorii
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBanner className="home-section" />
    </>
  );
}
