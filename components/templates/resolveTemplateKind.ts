import type { NormalizedPage } from "@/lib/content";

export type TemplateKind =
  | "home"
  | "servicii-hub"
  | "about"
  | "team"
  | "pricing"
  | "rich-service"
  | "rich-generic";

export function resolveTemplateKind(page: NormalizedPage, isHome: boolean): TemplateKind {
  if (isHome) {
    return "home";
  }
  if (page.slug === "servicii") {
    return "servicii-hub";
  }
  if (page.slug === "despre-noi" || page.pageType === "despre-noi") {
    return "about";
  }
  if (page.slug === "instructori" || page.pageType === "echipa") {
    return "team";
  }
  if (page.slug === "preturi" || page.pageType === "preturi") {
    return "pricing";
  }
  if (page.pageType === "servicii") {
    return "rich-service";
  }
  return "rich-generic";
}
