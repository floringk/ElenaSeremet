import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { ContactTemplate } from "@/components/templates/ContactTemplate";
import { getNormalizedPage } from "@/lib/content";
import { buildMetadataForRoute, buildMetadataFromPage } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getNormalizedPage("contact");
  if (page) {
    return buildMetadataFromPage(page, "/contact");
  }
  return buildMetadataForRoute("/contact", {
    title: "Contact",
    description:
      "Contactează Pilates Studio Elena Seremet — București, Sector 3. Telefon, program și formular de mesaje.",
    path: "/contact"
  });
}

export default async function ContactPage() {
  const page = await getNormalizedPage("contact");

  return (
    <ContactTemplate
      title={page?.title ?? "Contact"}
      intro={page?.intro ?? null}
      heroImagePath={page?.heroImagePath}
      heroAlt={page?.heroAlt}
    >
      <ContactForm />
    </ContactTemplate>
  );
}
