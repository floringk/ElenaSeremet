import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadataForRoute } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForRoute("/politica-cookie", {
    title: "Politica de cookie-uri",
    description:
      "Informații despre cookie-urile folosite pe site-ul Pilates Studio Elena Șeremet: necesare, analiză și cum îți gestionezi preferințele.",
    path: "/politica-cookie"
  });
}

export default function CookiePolicyPage() {
  return (
    <section className="page-section legal-page" aria-labelledby="cookie-policy-heading">
      <div className="container legal-page-inner">
        <header className="legacy-page-header">
          <p className="section-label">Legal</p>
          <h1 id="cookie-policy-heading">Politica de cookie-uri</h1>
          <p className="legacy-intro">
            Această pagină explică ce cookie-uri folosim, de ce și cum poți controla consimțământul.
          </p>
        </header>

        <div className="legal-page-body prose-block">
          <h2>Ce sunt cookie-urile?</h2>
          <p>
            Cookie-urile sunt fișiere mici stocate pe dispozitivul tău când vizitezi un site. Unele sunt
            necesare pentru funcționare; altele ne ajută să înțelegem cum e folosit site-ul, doar dacă
            ești de acord.
          </p>

          <h2>Cookie-uri necesare</h2>
          <p>
            Acestea memorează alegerea ta de consimțământ (preferințele din banner) și susțin
            navigarea de bază. Nu necesită acord separat și nu pot fi dezactivate din banner.
          </p>
          <ul>
            <li>
              <strong>es-cookie-consent</strong> — preferințele tale (necesare / analiză), stocate
              local în browser
            </li>
          </ul>

          <h2>Cookie-uri de analiză</h2>
          <p>
            Cu acordul tău, încărcăm Google Tag Manager / Google Analytics pentru statistici de trafic
            (pagini vizitate, surse aproximative). Fără acord, aceste scripturi nu rulează. Poți
            retrage consimțământul oricând din butonul „Cookie” din colțul paginii.
          </p>

          <h2>Cum îți gestionezi preferințele</h2>
          <p>
            La prima vizită apare bannerul de consimțământ. Poți alege „Acceptă tot”, „Doar necesare”
            sau „Preferințe” pentru a activa/dezactiva analiza. Preferințele se salvează în browserul
            tău.
          </p>

          <h2>Contact</h2>
          <p>
            Pentru întrebări legate de date sau cookie-uri, scrie-ne prin{" "}
            <Link href="/contact">pagina de contact</Link> sau sună la{" "}
            <a href="tel:+40755247412">+40 755 247 412</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
