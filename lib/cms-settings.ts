import { cache } from "react";

export type RouteSeoEntry = {
  path: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImagePath?: string | null;
  noIndex?: boolean | null;
};

export type SiteSettings = {
  siteTitle: string | null;
  defaultDescription: string | null;
  staticRoutes: RouteSeoEntry[];
};

const EMPTY: SiteSettings = {
  siteTitle: null,
  defaultDescription: null,
  staticRoutes: []
};

function isPayloadConfigured(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET?.trim() && process.env.PAYLOAD_DATABASE_URL?.trim());
}

function normalizePath(p: string): string {
  const s = p.trim();
  if (!s || s === "/") return "/";
  return s.startsWith("/") ? s : `/${s}`;
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isPayloadConfigured()) {
    return EMPTY;
  }

  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({ slug: "settings", depth: 0 });
    if (!doc || typeof doc !== "object") {
      return EMPTY;
    }

    const d = doc as {
      siteTitle?: string;
      defaultDescription?: string;
      staticRoutes?: Array<{
        path?: string;
        metaTitle?: string;
        metaDescription?: string;
        ogImagePath?: string;
        noIndex?: boolean;
      }>;
    };

    const staticRoutes: RouteSeoEntry[] = [];
    if (Array.isArray(d.staticRoutes)) {
      for (const row of d.staticRoutes) {
        const path = normalizePath(String(row?.path ?? ""));
        if (!path || path === "/") continue;
        staticRoutes.push({
          path,
          metaTitle: row.metaTitle?.trim() || null,
          metaDescription: row.metaDescription?.trim() || null,
          ogImagePath: row.ogImagePath?.trim() || null,
          noIndex: Boolean(row.noIndex)
        });
      }
    }

    return {
      siteTitle: d.siteTitle?.trim() || null,
      defaultDescription: d.defaultDescription?.trim() || null,
      staticRoutes
    };
  } catch (error) {
    console.error("[cms-settings] Failed to load settings global:", error);
    return EMPTY;
  }
}

export const getSiteSettings = cache(fetchSiteSettings);

export async function getRouteSeo(path: string): Promise<RouteSeoEntry | null> {
  const normalized = normalizePath(path);
  const settings = await getSiteSettings();
  return settings.staticRoutes.find((r) => normalizePath(r.path) === normalized) ?? null;
}
