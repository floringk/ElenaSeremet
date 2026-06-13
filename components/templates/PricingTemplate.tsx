import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import type { NormalizedPage } from "@/lib/content";
import { splitPriceValue } from "@/lib/format-price";
import { pricingPlans } from "@/lib/site-data";

type PricingTemplateProps = {
  page: NormalizedPage;
};

export function PricingTemplate({ page }: PricingTemplateProps) {
  return (
    <section className="page-section pricing-template">
      <div className="container">
        <Reveal>
          <header className="legacy-page-header">
            <p className="section-label">Abonamente</p>
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

        <div className="grid-3 pricing-cards">
          {pricingPlans.map((plan, i) => {
            const featured = plan.name.includes("8");
            const { amount, currency } = splitPriceValue(plan.value);
            return (
              <Reveal key={plan.name} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <article
                  className={`card model5-card-pricing ${featured ? "model5-card-pricing--featured" : ""}`}
                >
                  {featured ? (
                    <span className="pricing-badge" aria-hidden>
                      Recomandat
                    </span>
                  ) : null}
                  <h3>{plan.name}</h3>
                  <p className="price-value">
                    <span className="price-value-amount">{amount}</span>
                    {currency ? <span className="price-value-currency">{currency}</span> : null}
                  </p>
                  <p>{plan.note}</p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="pricing-page-cta surface-soft card">
            <h2 className="rich-section-heading">Gata să începi?</h2>
            <p>
              Abonamentele Pilates Studio by Elena Șeremet te ajută să îți atingi obiectivele de fitness,
              sănătate și wellbeing.
            </p>
            <div className="pricing-page-cta-actions">
              <Link href="/inscriere" className="btn btn-primary">
                Înscrie-te acum
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Întreabă-ne
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
