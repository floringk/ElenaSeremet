import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";

type CtaBannerProps = {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function CtaBanner({
  title = "Programează-te",
  description = "Rezervă locul la clasele preferate sau trimite-ne un mesaj.",
  primaryHref = "/inscriere#inscriere-studio",
  primaryLabel = "Înscrie-te",
  secondaryHref = "/contact",
  secondaryLabel = "Contact",
  className = ""
}: CtaBannerProps) {
  return (
    <section className={`cta-strip page-section ${className}`.trim()}>
      <div className="container cta-strip-inner">
        <Reveal>
          <h2>{title}</h2>
          <p>{description}</p>
        </Reveal>
        <Reveal delay={1}>
          <div className="cta-strip-actions">
            <Link href={primaryHref} className="btn btn-primary focus-ring">
              {primaryLabel}
            </Link>
            {secondaryHref ? (
              <Link href={secondaryHref} className="btn btn-secondary focus-ring">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
