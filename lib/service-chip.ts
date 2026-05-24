/** Short label shown next to „Serviciu” on service detail pages. */
export function getServiceChipLabel(slug: string): string | null {
  const map: Record<string, string> = {
    "pilates-mat": "Clasă în grup",
    "pilates-reformer": "Studio reformer",
    postural: "Postural",
    "sedinte-private": "Ședință 1:1",
    yoga: "Yoga",
    "yoga-3": "Yoga",
    "yogalates-stretching": "Yogalates",
    tonifiere: "Tonifiere",
    "masaj-si-drenaj": "Masaj & drenaj"
  };
  return map[slug] ?? null;
}
