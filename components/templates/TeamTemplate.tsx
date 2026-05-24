import Image from "next/image";
import Link from "next/link";

import { PageBlocks } from "@/components/sections/PageBlocks";
import { Reveal } from "@/components/ui/Reveal";
import type { NormalizedPage } from "@/lib/content";
import { team } from "@/lib/site-data";

type TeamTemplateProps = {
  page: NormalizedPage;
};

export function TeamTemplate({ page }: TeamTemplateProps) {
  return (
    <section className="page-section team-template">
      <div className="container">
        <Reveal>
          <header className="legacy-page-header">
            <p className="section-label">Echipa</p>
            <h1>{page.title}</h1>
            {page.intro ? <p className="legacy-intro">{page.intro}</p> : null}
          </header>
        </Reveal>

        {page.heroImagePath ? (
          <Reveal>
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
          </Reveal>
        ) : null}

        <Reveal delay={1}>
          <div className="model5-team-grid team-template-grid">
            {team.map((m) => (
              <Link key={m.name} href={m.href} className="model5-team-card model5-team-card--profile focus-ring">
                <span className="model5-team-photo-wrap">
                  <Image
                    src={m.image}
                    alt={m.name}
                    width={220}
                    height={220}
                    className="model5-team-photo"
                    sizes="(max-width: 600px) 70vw, 220px"
                  />
                </span>
                <strong className="model5-team-name">{m.name}</strong>
                <span className="model5-team-card-hint">Vezi profil →</span>
              </Link>
            ))}
          </div>
        </Reveal>

        <div className="team-template-body">
          <PageBlocks blocks={page.blocks} withSectionWrappers />
        </div>
      </div>
    </section>
  );
}
