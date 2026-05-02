import Image from "next/image";
import { ReactNode } from "react";

type LegacyPageShellProps = {
  title: string;
  intro?: string | null;
  heroImagePath?: string | null;
  heroAlt?: string;
  heroPriority?: boolean;
  children: ReactNode;
};

export function LegacyPageShell({
  title,
  intro,
  heroImagePath,
  heroAlt,
  heroPriority = false,
  children
}: LegacyPageShellProps) {
  return (
    <section className="page-section">
      <div className="container">
        {heroImagePath ? (
          <Image
            src={heroImagePath}
            alt={heroAlt || title}
            width={1200}
            height={680}
            className="legacy-hero"
            priority={heroPriority}
            sizes="(max-width: 768px) 100vw, min(1200px, 92vw)"
          />
        ) : null}
        <header className="legacy-page-header">
          <h1>{title}</h1>
          {intro ? <p className="legacy-intro">{intro}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}
