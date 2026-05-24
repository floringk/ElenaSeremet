import { getServiciiDetailSlugs } from "@/lib/content";

export type NavServiceLink = { href: string; label: string };

export type NavServiceGroup = {
  label: string;
  items: NavServiceLink[];
};

/** Column labels + slugs (manifest `type: servicii`). Order within each column is preserved. */
const SERVICE_GROUPS: { label: string; slugs: string[] }[] = [
  {
    label: "Pilates & antrenament",
    slugs: ["pilates-mat", "pilates-reformer", "postural", "sedinte-private"]
  },
  {
    label: "Yoga & Yogalates",
    slugs: ["yoga", "yoga-3", "yogalates-stretching"]
  },
  {
    label: "Tonifiere & recuperare",
    slugs: ["tonifiere", "masaj-si-drenaj"]
  }
];

export function getServiceNavGroups(): NavServiceGroup[] {
  const rows = getServiciiDetailSlugs();
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const assigned = new Set<string>();
  const groups: NavServiceGroup[] = [];

  for (const def of SERVICE_GROUPS) {
    const items: NavServiceLink[] = [];
    for (const slug of def.slugs) {
      const row = bySlug.get(slug);
      if (row) {
        items.push({ href: `/${slug}`, label: row.title });
        assigned.add(slug);
      }
    }
    if (items.length > 0) {
      groups.push({ label: def.label, items });
    }
  }

  const rest = rows.filter((r) => !assigned.has(r.slug));
  if (rest.length > 0) {
    groups.push({
      label: "Alte servicii",
      items: rest.map((r) => ({ href: `/${r.slug}`, label: r.title }))
    });
  }

  return groups;
}
