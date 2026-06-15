import { getServiciiDetailSlugs } from "@/lib/content";

export type NavServiceLink = { href: string; label: string };

export type NavServiceGroup = {
  label: string;
  items: NavServiceLink[];
};

/**
 * Static nav data — must not depend on `mockups/` at runtime (excluded from Vercel serverless bundles).
 * Manifest titles are merged in when available (local dev / build).
 */
const SERVICE_NAV_GROUPS: NavServiceGroup[] = [
  {
    label: "Pilates & antrenament",
    items: [
      { href: "/pilates-mat", label: "Pilates Mat" },
      { href: "/pilates-reformer", label: "Pilates Reformer" },
      { href: "/postural", label: "Postural" },
      { href: "/sedinte-private", label: "Sedinte Private" }
    ]
  },
  {
    label: "Yoga & Yogalates",
    items: [
      { href: "/yoga", label: "Yoga" },
      { href: "/yoga-3", label: "Hatha Yoga (continuitate)" },
      { href: "/yogalates-stretching", label: "Yogalates & Stretching" }
    ]
  },
  {
    label: "Tonifiere & recuperare",
    items: [
      { href: "/tonifiere", label: "Tonifiere" },
      { href: "/masaj-si-drenaj", label: "Masaj si Drenaj" }
    ]
  }
];

function mergeManifestTitles(groups: NavServiceGroup[]): NavServiceGroup[] {
  const rows = getServiciiDetailSlugs();
  if (rows.length === 0) {
    return groups;
  }

  const titleBySlug = new Map(rows.map((row) => [row.slug, row.title]));

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const slug = item.href.replace(/^\//, "");
      const title = titleBySlug.get(slug);
      return title ? { ...item, label: title } : item;
    })
  }));
}

export function getServiceNavGroups(): NavServiceGroup[] {
  return mergeManifestTitles(SERVICE_NAV_GROUPS);
}
