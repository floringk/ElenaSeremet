import { cache } from "react";

import { resolveMediaUrl } from "@/lib/media-url";
import { isPayloadEnvConfigured } from "@/lib/payload-database-url";
import { services as fallbackServices, team as fallbackTeam } from "@/lib/site-data";

export type StudioServiceCard = {
  title: string;
  description: string;
  href: string;
  icon: string;
};

export type StudioTeamMember = {
  name: string;
  image: string;
  href: string;
};

export type StudioChrome = {
  studioName: string;
  addressLine1: string;
  addressLine2: string;
  phoneDisplay: string;
  phoneHref: string;
  sameAs: string[];
  services: StudioServiceCard[];
  team: StudioTeamMember[];
};

const DEFAULTS: StudioChrome = {
  studioName: "Pilates Studio Elena Șeremet",
  addressLine1: "Bd. 1 Decembrie 1918, nr. 58",
  addressLine2: "București, Sector 3",
  phoneDisplay: "+40 755 247 412",
  phoneHref: "tel:+40755247412",
  sameAs: [],
  services: fallbackServices.map((s) => ({
    title: s.title,
    description: s.description,
    href: s.href,
    icon: s.icon
  })),
  team: fallbackTeam.map((m) => ({
    name: m.name,
    image: m.image,
    href: m.href
  }))
};

function isPayloadConfigured(): boolean {
  return isPayloadEnvConfigured();
}

function normalizeTelHref(phone: string, explicit?: string | null): string {
  if (explicit?.trim()) {
    const e = explicit.trim();
    return e.startsWith("tel:") ? e : `tel:${e.replace(/\s+/g, "")}`;
  }
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : DEFAULTS.phoneHref;
}

function parseSameAs(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("http"));
}

async function fetchStudioChrome(): Promise<StudioChrome> {
  if (!isPayloadConfigured()) {
    return DEFAULTS;
  }

  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({ slug: "studio", depth: 1 });
    if (!doc || typeof doc !== "object") {
      return DEFAULTS;
    }

    const d = doc as {
      studioName?: string;
      addressLine1?: string;
      addressLine2?: string;
      phone?: string;
      phoneHref?: string;
      sameAs?: string;
      services?: Array<{
        title?: string;
        description?: string;
        href?: string;
        icon?: unknown;
        iconPath?: string;
      }>;
      team?: Array<{
        name?: string;
        href?: string;
        photo?: unknown;
        imagePath?: string;
      }>;
    };

    const services: StudioServiceCard[] = [];
    if (Array.isArray(d.services)) {
      for (const row of d.services) {
        const title = row.title?.trim();
        const description = row.description?.trim();
        const href = row.href?.trim();
        if (!title || !description || !href) continue;
        const icon =
          resolveMediaUrl(row.icon, row.iconPath) || "/content/images/Classes.svg";
        services.push({ title, description, href, icon });
      }
    }

    const team: StudioTeamMember[] = [];
    if (Array.isArray(d.team)) {
      for (const row of d.team) {
        const name = row.name?.trim();
        const href = row.href?.trim();
        if (!name || !href) continue;
        const image = resolveMediaUrl(row.photo, row.imagePath);
        if (!image) continue;
        team.push({ name, href, image });
      }
    }

    const phoneDisplay = d.phone?.trim() || DEFAULTS.phoneDisplay;

    return {
      studioName: d.studioName?.trim() || DEFAULTS.studioName,
      addressLine1: d.addressLine1?.trim() || DEFAULTS.addressLine1,
      addressLine2: d.addressLine2?.trim() || DEFAULTS.addressLine2,
      phoneDisplay,
      phoneHref: normalizeTelHref(phoneDisplay, d.phoneHref),
      sameAs: parseSameAs(d.sameAs),
      services: services.length > 0 ? services : DEFAULTS.services,
      team: team.length > 0 ? team : DEFAULTS.team
    };
  } catch (error) {
    console.error("[cms-studio] Failed to load studio global:", error);
    return DEFAULTS;
  }
}

export const getStudioChrome = cache(fetchStudioChrome);
