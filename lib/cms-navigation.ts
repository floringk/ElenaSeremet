import { cache } from "react";

import { isPayloadEnvConfigured } from "@/lib/payload-database-url";
import { navLinks as fallbackNavLinks } from "@/lib/site-data";

export type NavLink = { href: string; label: string };

function isPayloadConfigured(): boolean {
  return isPayloadEnvConfigured();
}

function normalizeHref(href: string): string {
  const s = href.trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("mailto:") || s.startsWith("tel:")) {
    return s;
  }
  return s.startsWith("/") ? s : `/${s}`;
}

async function fetchNavLinks(): Promise<NavLink[]> {
  if (!isPayloadConfigured()) {
    return [...fallbackNavLinks];
  }

  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({ slug: "navigation", depth: 0 });
    if (!doc || typeof doc !== "object") {
      return [...fallbackNavLinks];
    }

    const d = doc as { links?: Array<{ label?: string; href?: string }> };
    const links: NavLink[] = [];
    if (Array.isArray(d.links)) {
      for (const row of d.links) {
        const label = row.label?.trim();
        const href = normalizeHref(String(row.href ?? ""));
        if (!label || !href) continue;
        links.push({ label, href });
      }
    }

    return links.length > 0 ? links : [...fallbackNavLinks];
  } catch (error) {
    console.error("[cms-navigation] Failed to load navigation global:", error);
    return [...fallbackNavLinks];
  }
}

export const getNavLinks = cache(fetchNavLinks);
