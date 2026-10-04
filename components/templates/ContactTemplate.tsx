import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import type { NavLink } from "@/lib/cms-navigation";
import type { OpeningHoursRow } from "@/lib/program-shared";
import type { StudioChrome } from "@/lib/cms-studio";

type ContactTemplateProps = {
  title: string;
  intro?: string | null;
  heroImagePath?: string | null;
  heroAlt?: string;
  studio: StudioChrome;
  openingHours: OpeningHoursRow[];
  navLinks: NavLink[];
  children: ReactNode;
};

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 4h-.8c-1 0-1.7.9-1.5 1.9l.6 3.2a2 2 0 001.6 1.6l2.2.5a14 14 0 006.3 6.3l.5 2.2a2 2 0 001.6 1.6l3.2.6c1 .2 1.9-.5 1.9-1.5v-.8c0-7.5-6-13.5-13.5-13.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.25" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function ContactTemplate({
  title,
  intro,
  heroImagePath,
  heroAlt,
  studio,
  openingHours,
  navLinks,
  children
}: ContactTemplateProps) {
  const quickLinks = navLinks.filter((l) => l.href !== "/contact");

  return (
    <section className="page-section contact-template-section" aria-labelledby="contact-heading">
      <div className="container contact-template-inner">
        <header className="legacy-page-header contact-template-header">
          <p className="section-label">Contact</p>
          <h1 id="contact-heading">{title}</h1>
          <p id="contact-intro" className="legacy-intro">
            {intro?.trim() || "Trimite-ne un mesaj și îți răspundem rapid."}
          </p>
        </header>

        {heroImagePath ? (
          <div className="page-hero-block contact-template-hero">
            <Image
              src={heroImagePath}
              alt={heroAlt || title}
              width={1200}
              height={680}
              className="legacy-hero"
              priority
              sizes="(max-width: 768px) 100vw, min(1200px, 92vw)"
            />
          </div>
        ) : null}

        <div className="contact-template-grid">
          <aside className="contact-aside surface-soft card">
            <h2 className="contact-aside-title">
              <IconPin className="contact-aside-icon" />
              Studio
            </h2>
            <p className="contact-aside-line">{studio.addressLine1}</p>
            <p className="contact-aside-line">{studio.addressLine2}</p>
            <p className="contact-aside-line contact-aside-line--phone">
              <IconPhone className="contact-aside-icon" />
              <a href={studio.phoneHref} className="focus-ring">
                {studio.phoneDisplay}
              </a>
            </p>
            <h2 className="contact-aside-title">
              <IconClock className="contact-aside-icon" />
              Program
            </h2>
            {openingHours.map((item) => (
              <p key={item.day} className="contact-aside-line">
                <strong>{item.day}:</strong> {item.hours}
              </p>
            ))}
            <h2 className="contact-aside-title contact-aside-title--links">Pagini utile</h2>
            <ul className="contact-aside-nav">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="focus-ring">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
          <div className="contact-form-panel card">{children}</div>
        </div>
      </div>
    </section>
  );
}
