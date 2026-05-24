import type { Metadata } from "next";

import { InscrierePanel } from "@/components/inscriere/InscrierePanel";
import { ContactTemplate } from "@/components/templates/ContactTemplate";
import { getNormalizedPage } from "@/lib/content";
import { buildMetadataForRoute } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadataForRoute("/inscriere", {
    title: "Înscriere",
    description:
      "Înscriere clienți noi și autentificare pentru membrii existenți — Pilates Studio Elena Seremet, București.",
    path: "/inscriere"
  });
}

export default async function InscrierePage() {
  const page = await getNormalizedPage("inregistrare-clienti");

  const intro =
    page?.intro?.trim() ||
    "Clienți noi: completează formularul de mai jos. Dacă ai deja cont, folosește autentificarea Gym App.";

  return (
    <ContactTemplate
      title={page?.title?.split(" – ")[0]?.trim() || "Înscriere"}
      intro={intro}
      heroImagePath={page?.heroImagePath}
      heroAlt={page?.heroAlt}
    >
      <InscrierePanel />
    </ContactTemplate>
  );
}
