import { instructorProfileSlugs } from "@/lib/site-data";

/** Class/service pages that should show the membership signup form. */
const CLASS_PAGE_SLUGS = new Set([
  "pilates-props",
  "abcpilates",
  "healthy-spine",
  "fit-pilates",
  "elastic-band",
  "total-body",
  "circuit",
  "personal-training"
]);

const INSTRUCTOR_SLUGS = new Set<string>(instructorProfileSlugs);

export function isClassPage(slug: string, pageType?: string | null): boolean {
  if (INSTRUCTOR_SLUGS.has(slug)) {
    return false;
  }
  if (slug === "inregistrare-clienti") {
    return false;
  }
  if (pageType === "servicii") {
    return true;
  }
  return CLASS_PAGE_SLUGS.has(slug);
}
