import Image from "next/image";
import Link from "next/link";

import { PageBlocks } from "@/components/sections/PageBlocks";
import { Reveal } from "@/components/ui/Reveal";
import type { NormalizedPage } from "@/lib/content";
import { getServiceNavGroups } from "@/lib/nav-services";

type ServiciiHubTemplateProps = {
  page: NormalizedPage;
};

function HubCardIcon() {
  return (
    <span className="servicii-hub-card-icon" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
        <path
          d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ServiciiHubTemplate({ page }: ServiciiHubTemplateProps) {
  const groups = getServiceNavGroups();

  return (
    <section className="page-section servicii-hub">
      <div className="container">
        <Reveal>
          <header className="legacy-page-header">
            <p className="section-label">Servicii</p>
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

        <div className="servicii-hub-groups">
          {groups.map((group, gi) => (
            <Reveal key={group.label} delay={(gi % 4) as 0 | 1 | 2 | 3}>
              <div className="servicii-hub-group">
                <h3 className="servicii-hub-group-label">{group.label}</h3>
                <ul className="servicii-hub-grid">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="servicii-hub-card focus-ring">
                        <HubCardIcon />
                        <span className="servicii-hub-card-title">{item.label}</span>
                        <span className="muted servicii-hub-card-more">Detalii →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="servicii-hub-body">
          <PageBlocks blocks={page.blocks} withSectionWrappers />
        </div>
      </div>
    </section>
  );
}
