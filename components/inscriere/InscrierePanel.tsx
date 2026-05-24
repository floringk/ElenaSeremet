import Link from "next/link";

import { MembershipSignupForm } from "@/components/membership/MembershipSignupForm";
import { gymAppLeadsUrl, gymAppLoginUrl } from "@/lib/gym-app";

export function InscrierePanel() {
  return (
    <div className="inscriere-panel">
      <section className="inscriere-existing card surface-soft" aria-labelledby="inscriere-existing-heading">
        <h2 id="inscriere-existing-heading" className="inscriere-existing-title">
          Ești deja client?
        </h2>
        <p className="inscriere-existing-text">Intră în contul tău aici:</p>
        <Link
          href={gymAppLoginUrl}
          className="btn btn-primary focus-ring inscriere-login-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          Autentificare
        </Link>
        <p className="muted inscriere-existing-note">
          Te redirecționăm către platforma Gym Management App —{" "}
          <a href={gymAppLoginUrl} className="focus-ring" target="_blank" rel="noopener noreferrer">
            deschide login
          </a>
          .
        </p>
      </section>

      <section className="inscriere-studio card surface-soft" aria-labelledby="inscriere-studio-heading">
        <header className="inscriere-leads-header">
          <h2 id="inscriere-studio-heading" className="inscriere-leads-title">
            Înscriere la studio
          </h2>
          <p className="muted inscriere-leads-intro">
            Formular scurt — datele se salvează în sistemul site-ului. Pentru detalii medicale sau program extins, poți
            folosi și formularul Gym App de mai jos.
          </p>
        </header>
        <MembershipSignupForm sourcePage="/inscriere" id="inscriere-studio" />
      </section>

      <section className="inscriere-leads card" aria-labelledby="inscriere-leads-heading">
        <header className="inscriere-leads-header">
          <h2 id="inscriere-leads-heading" className="inscriere-leads-title">
            Formular detaliat (Gym App)
          </h2>
          <p className="muted inscriere-leads-intro">
            Completează formularul pentru clienți noi. Dacă nu se încarcă, deschide-l într-un tab nou.
          </p>
          <p className="inscriere-leads-fallback">
            <a href={gymAppLeadsUrl} className="focus-ring" target="_blank" rel="noopener noreferrer">
              Deschide formularul de înscriere →
            </a>
          </p>
        </header>
        <div className="inscriere-iframe-wrap">
          <iframe
            src={gymAppLeadsUrl}
            title="Formular înscriere — Pilates Studio Elena Seremet"
            className="inscriere-iframe"
            loading="lazy"
            allow="fullscreen"
          />
        </div>
      </section>
    </div>
  );
}
