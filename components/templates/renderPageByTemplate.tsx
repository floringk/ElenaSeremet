import type { ReactNode } from "react";
import type { NormalizedPage } from "@/lib/content";
import { AboutTemplate } from "@/components/templates/AboutTemplate";
import { HomeTemplate } from "@/components/templates/HomeTemplate";
import { PricingTemplate } from "@/components/templates/PricingTemplate";
import { RichLegacyTemplate } from "@/components/templates/RichLegacyTemplate";
import { ServiciiHubTemplate } from "@/components/templates/ServiciiHubTemplate";
import { TeamTemplate } from "@/components/templates/TeamTemplate";
import { resolveTemplateKind, type TemplateKind } from "@/components/templates/resolveTemplateKind";

export function renderPageByTemplate(page: NormalizedPage, isHome: boolean): ReactNode {
  const kind = resolveTemplateKind(page, isHome);
  return renderByKind(kind, page);
}

export function renderByKind(kind: TemplateKind, page: NormalizedPage): ReactNode {
  switch (kind) {
    case "home":
      return <HomeTemplate page={page} />;
    case "servicii-hub":
      return <ServiciiHubTemplate page={page} />;
    case "about":
      return <AboutTemplate page={page} />;
    case "team":
      return <TeamTemplate page={page} />;
    case "pricing":
      return <PricingTemplate page={page} />;
    case "rich-service":
      return <RichLegacyTemplate page={page} variant="service" />;
    case "rich-generic":
    default:
      return <RichLegacyTemplate page={page} variant="generic" />;
  }
}
