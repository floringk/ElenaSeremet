import fs from "node:fs";
import path from "node:path";

import { resolveMediaUrl } from "@/lib/media-url";

export type ContentBlock = {
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "ul";
  text?: string;
  items?: string[];
};

type ContentImage = {
  local_path: string;
  alt?: string;
};

type RawPage = {
  title: string;
  meta?: {
    description?: string;
    title?: string;
    ogImage?: string;
    noIndex?: boolean;
  };
  blocks: ContentBlock[];
  images: ContentImage[];
};

export type ManifestEntry = {
  slug: string;
  url?: string;
  /** From `site_manifest.json`: home | page | servicii | despre-noi | echipa | preturi | contact | program | inregistrare | preturi */
  type?: string;
};

type Manifest = {
  pages: ManifestEntry[];
};

export type NormalizedSection = {
  heading: string;
  blocks: ContentBlock[];
};

export type NormalizedContentImage = {
  src: string;
  alt: string;
};

export type NormalizedPage = {
  slug: string;
  title: string;
  description: string;
  /** SEO title override (CMS or JSON meta.title). */
  seoTitle: string | null;
  /** OG image override (falls back to hero). */
  seoOgImagePath: string | null;
  seoNoIndex: boolean;
  heroImagePath: string | null;
  heroAlt: string;
  intro: string | null;
  sections: NormalizedSection[];
  blocks: ContentBlock[];
  /** Manifest `type` for `/slug` */
  pageType: string;
  /** Inline gallery paths (excludes hero image). */
  contentImages: NormalizedContentImage[];
};

const contentRoot = path.join(process.cwd(), "mockups", "content");
const rawRoot = path.join(contentRoot, "raw");

function safeReadJson<T>(filePath: string): T | null {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export function getManifest(): Manifest {
  const manifestPath = path.join(contentRoot, "site_manifest.json");
  const parsed = safeReadJson<Manifest>(manifestPath);
  if (!parsed || !Array.isArray(parsed.pages)) {
    return { pages: [] };
  }
  return parsed;
}

export function getManifestEntries(): ManifestEntry[] {
  return getManifest().pages;
}

export function getManifestEntryForSlug(slug: string): ManifestEntry | null {
  const s = slug.trim();
  return getManifest().pages.find((p) => p.slug === s) ?? null;
}

/** Slugs whose manifest `type` is `servicii` (detail pages, excludes hub `/servicii`). */
export function getServiciiDetailSlugs(): { slug: string; title: string }[] {
  const out: { slug: string; title: string }[] = [];
  for (const entry of getManifest().pages) {
    if (entry.type !== "servicii" || entry.slug === "servicii") continue;
    const raw = getPageBySlug(entry.slug);
    const title = raw ? getDisplayTitle(raw.title, entry.slug) : entry.slug;
    out.push({ slug: entry.slug, title });
  }
  return out.sort((a, b) => a.title.localeCompare(b.title, "ro"));
}

/** Exclude brand marks from inline galleries (pairing by section index). */
function isLogoAssetPath(localPath: string): boolean {
  const n = localPath.replace(/\\/g, "/");
  return /(^|\/)logo|moto-pilates-mat|wordmark/i.test(n);
}

function buildContentImagesFromRaw(page: RawPage): NormalizedContentImage[] {
  const heroPath = getPrimaryImagePath(page);
  return page.images
    .filter((img) => img?.local_path && imageExists(img.local_path))
    .filter((img) => !isLogoAssetPath(img.local_path))
    .map((img) => ({
      src: mapImagePath(img.local_path),
      alt: (img.alt?.trim() || "").trim()
    }))
    .filter((img) => !heroPath || img.src !== heroPath);
}

/** Manifest-based slug list (used for static path generation without a DB). */
export function getAllSlugs(): string[] {
  return getManifest().pages
    .map((item) => item.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .filter((slug) => slug !== "index")
    .sort((a, b) => a.localeCompare(b));
}

function isPayloadConfigured(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET?.trim() && process.env.PAYLOAD_DATABASE_URL?.trim());
}

export function getPageBySlug(slug: string): RawPage | null {
  const safeSlug = slug.trim();
  if (!safeSlug) {
    return null;
  }

  if (!/^[a-z0-9-]+$/i.test(safeSlug)) {
    return null;
  }

  const filePath = path.join(rawRoot, `${safeSlug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const parsed = safeReadJson<RawPage>(filePath);
  if (!parsed) {
    return null;
  }

  return {
    title: parsed.title || safeSlug,
    meta: parsed.meta || {},
    blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
    images: Array.isArray(parsed.images) ? parsed.images : []
  };
}

export function mapImagePath(localPath: string): string {
  return `/content/${localPath.replace(/^\/+/, "")}`;
}

function imageExists(localPath: string): boolean {
  // Do not stat public/content on Vercel — file tracing would pull albums into lambdas.
  if (process.env.VERCEL) {
    return true;
  }
  const normalized = localPath.replace(/^\/+/, "").replace(/\\/g, "/");
  const mockupsPath = path.join(contentRoot, normalized);
  if (fs.existsSync(mockupsPath)) {
    return true;
  }
  const publicPath = path.join(process.cwd(), "public", "content", normalized);
  return fs.existsSync(publicPath);
}

function publicContentPathExists(publicPath: string): boolean {
  const stripped = publicPath.replace(/^\/content\//, "");
  return imageExists(stripped);
}

/** Prefer a real photo over logos/SVGs so hero banners look intentional. */
function pickHeroLocalPath(page: RawPage): string | null {
  const list = (page.images ?? []).filter((img) => img?.local_path && imageExists(img.local_path));
  if (list.length === 0) {
    return null;
  }

  const norm = (p: string) => p.replace(/\\/g, "/");
  const isRaster = (p: string) => /\.(jpe?g|png|webp|gif)$/i.test(norm(p));

  for (const img of list) {
    const p = img.local_path;
    if (isRaster(p) && !isLogoAssetPath(p)) {
      return p;
    }
  }
  for (const img of list) {
    if (isRaster(img.local_path)) {
      return img.local_path;
    }
  }

  const legacy = list[1] ?? list[0];
  return legacy?.local_path ?? null;
}

export function getPrimaryImagePath(page: RawPage): string | null {
  const local = pickHeroLocalPath(page);
  if (!local) {
    return null;
  }
  return mapImagePath(local);
}

function getHeroAlt(page: RawPage): string {
  const local = pickHeroLocalPath(page);
  if (!local) {
    return page.title;
  }
  const img = page.images?.find((i) => i.local_path === local);
  const alt = img?.alt?.trim();
  return alt || page.title;
}

function getDescription(page: RawPage): string {
  const metaDesc = page.meta?.description?.trim();
  if (metaDesc) return metaDesc;
  const firstParagraph = page.blocks.find((block) => block.type === "p" && block.text?.trim());
  return firstParagraph?.text?.trim() || "";
}

function getSeoTitle(page: RawPage): string | null {
  return page.meta?.title?.trim() || null;
}

function getSeoOgFromRaw(page: RawPage): string | null {
  const og = page.meta?.ogImage?.trim();
  if (!og) return null;
  if (og.startsWith("/content/")) return og;
  return mapImagePath(og.replace(/^\/+/, ""));
}

function getSeoNoIndex(page: RawPage): boolean {
  return Boolean(page.meta?.noIndex);
}

function deriveDescriptionFromBlocks(blocks: ContentBlock[]): string {
  const firstParagraph = blocks.find((block) => block.type === "p" && block.text?.trim());
  return firstParagraph?.text?.trim() || "";
}

const SLUG_TITLE_OVERRIDES: Record<string, string> = {
  "sedinte-private": "Ședințe Private",
  "masaj-si-drenaj": "Masaj și Drenaj"
};

function getDisplayTitle(rawTitle: string, slug: string): string {
  if (SLUG_TITLE_OVERRIDES[slug]) return SLUG_TITLE_OVERRIDES[slug];
  const trimmed = rawTitle.trim();
  if (!trimmed) return slug;
  return trimmed.split(" – ")[0].trim();
}

function normalizeSectionHeading(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildSections(blocks: ContentBlock[]): NormalizedSection[] {
  const sections: NormalizedSection[] = [];
  let current: NormalizedSection | null = null;

  for (const block of blocks) {
    if (block.type === "h2" && block.text?.trim()) {
      current = {
        heading: normalizeSectionHeading(block.text),
        blocks: []
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = { heading: "Introducere", blocks: [] };
      sections.push(current);
    }

    current.blocks.push(block);
  }

  return sections;
}

function getIntro(blocks: ContentBlock[]): string | null {
  const firstParagraph = blocks.find((block) => block.type === "p" && block.text?.trim());
  return firstParagraph?.text?.trim() || null;
}

function mapPayloadBlocks(rows: unknown): ContentBlock[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map((row: unknown) => {
      if (!row || typeof row !== "object") {
        return null;
      }
      const r = row as { type?: string; text?: string; items?: { value?: string }[] };
      if (typeof r.type !== "string") {
        return null;
      }
      if (r.type === "ul") {
        const items = Array.isArray(r.items)
          ? r.items.map((i) => String(i?.value ?? "").trim()).filter(Boolean)
          : [];
        return { type: "ul" as const, items };
      }
      return { type: r.type as ContentBlock["type"], text: String(r.text ?? "") };
    })
    .filter(Boolean) as ContentBlock[];
}

function normalizeHeroPath(raw: unknown): string | null {
  if (raw == null || typeof raw !== "string") {
    return null;
  }
  const s = raw.trim();
  if (!s) {
    return null;
  }
  if (s.startsWith("/content/")) {
    return s;
  }
  return mapImagePath(s.replace(/^\/+/, ""));
}

type PageLoadOptions = {
  includeDraft?: boolean;
};

async function getNormalizedPageFromPayload(
  slug: string,
  options?: PageLoadOptions
): Promise<NormalizedPage | null> {
  const { getPayloadClient } = await import("./payload");
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    where: options?.includeDraft
      ? { slug: { equals: slug } }
      : {
          and: [{ slug: { equals: slug } }, { status: { equals: "published" } }]
        },
    limit: 1,
    depth: 1
  });

  if (!result.docs.length) {
    return null;
  }

  const doc = result.docs[0] as {
    title?: string;
    description?: string | null;
    metaTitle?: string | null;
    ogImage?: unknown;
    ogImagePath?: string | null;
    noIndex?: boolean | null;
    heroImage?: unknown;
    heroImagePath?: string | null;
    heroAlt?: string | null;
    intro?: string | null;
    blocks?: unknown;
  };

  let blocks = mapPayloadBlocks(doc.blocks);
  if (blocks[0]?.type === "h1" && blocks[0].text?.trim()) {
    blocks = blocks.slice(1);
  }

  const title = getDisplayTitle(String(doc.title || slug), slug);
  const description =
    (typeof doc.description === "string" && doc.description.trim()) || deriveDescriptionFromBlocks(blocks);

  let heroImagePath = normalizeHeroPath(doc.heroImagePath);
  if (!heroImagePath) {
    heroImagePath = resolveMediaUrl(doc.heroImage, null);
  }
  if (heroImagePath?.startsWith("/content/") && !publicContentPathExists(heroImagePath)) {
    heroImagePath = resolveMediaUrl(doc.heroImage, null);
  }

  let seoOgImagePath = normalizeHeroPath(doc.ogImagePath);
  if (!seoOgImagePath) {
    seoOgImagePath = resolveMediaUrl(doc.ogImage, heroImagePath);
  }
  if (seoOgImagePath?.startsWith("/content/") && !publicContentPathExists(seoOgImagePath)) {
    seoOgImagePath = heroImagePath;
  }

  const heroAlt = String(doc.heroAlt || doc.title || title);
  const intro =
    typeof doc.intro === "string" && doc.intro.trim() ? doc.intro.trim() : getIntro(blocks);
  const seoTitle =
    typeof doc.metaTitle === "string" && doc.metaTitle.trim() ? doc.metaTitle.trim() : null;

  const entry = getManifestEntryForSlug(slug);

  return {
    slug,
    title,
    description,
    seoTitle,
    seoOgImagePath,
    seoNoIndex: Boolean(doc.noIndex),
    heroImagePath,
    heroAlt,
    intro,
    sections: buildSections(blocks),
    blocks,
    pageType: entry?.type ?? "page",
    contentImages: []
  };
}

/** Legacy JSON files only (sync). */
export function getNormalizedPageFromLegacyFiles(slug: string): NormalizedPage | null {
  const page = getPageBySlug(slug);
  if (!page) return null;
  const title = getDisplayTitle(page.title, slug);
  const blocks = [...page.blocks];
  if (blocks[0]?.type === "h1" && blocks[0].text?.trim()) {
    blocks.shift();
  }

  const entry = getManifestEntryForSlug(slug);

  return {
    slug,
    title,
    description: getDescription(page),
    seoTitle: getSeoTitle(page),
    seoOgImagePath: getSeoOgFromRaw(page),
    seoNoIndex: getSeoNoIndex(page),
    heroImagePath: getPrimaryImagePath(page),
    heroAlt: getHeroAlt(page),
    intro: getIntro(blocks),
    sections: buildSections(blocks),
    blocks,
    pageType: entry?.type ?? "page",
    contentImages: buildContentImagesFromRaw(page)
  };
}

/**
 * Prefer Payload when configured (`CONTENT_SOURCE`: auto | cms | legacy).
 * - auto: try CMS, then legacy files
 * - cms: CMS only
 * - legacy: JSON files only
 */
export async function getNormalizedPage(
  slug: string,
  options?: PageLoadOptions
): Promise<NormalizedPage | null> {
  const mode = (process.env.CONTENT_SOURCE || "auto").toLowerCase();

  if (mode === "legacy" && !options?.includeDraft) {
    return getNormalizedPageFromLegacyFiles(slug);
  }

  const useCms = mode === "cms" || mode === "auto" || options?.includeDraft;

  if (useCms && isPayloadConfigured()) {
    try {
      const fromPayload = await getNormalizedPageFromPayload(slug, options);
      if (fromPayload) {
        return fromPayload;
      }
      if (mode === "cms") {
        return null;
      }
    } catch (error) {
      console.error("[content] Payload page fetch failed:", error);
      if (mode === "cms") {
        return null;
      }
    }
  }

  return getNormalizedPageFromLegacyFiles(slug);
}

/** Slugs with noIndex from CMS (for sitemap exclusion). */
export async function getNoIndexSlugs(): Promise<Set<string>> {
  const out = new Set<string>();
  if (!isPayloadConfigured()) {
    return out;
  }
  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "pages",
      where: {
        and: [{ status: { equals: "published" } }, { noIndex: { equals: true } }]
      },
      limit: 500,
      depth: 0
    });
    for (const doc of result.docs) {
      const s = String((doc as { slug?: string }).slug || "")
        .trim()
        .toLowerCase();
      if (s && s !== "index") {
        out.add(s);
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}

/** Merge manifest slugs with published CMS slugs (for sitemap). */
export async function getAllSlugsMerged(): Promise<string[]> {
  const legacy = new Set(getAllSlugs());

  if (!isPayloadConfigured()) {
    return Array.from(legacy).sort((a, b) => a.localeCompare(b));
  }

  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "pages",
      where: { status: { equals: "published" } },
      limit: 500,
      depth: 0
    });
    for (const doc of result.docs) {
      const s = String((doc as { slug?: string }).slug || "")
        .trim()
        .toLowerCase();
      if (s && s !== "index") {
        legacy.add(s);
      }
    }
  } catch (error) {
    console.error("[content] CMS slug list failed, using manifest only:", error);
  }

  return Array.from(legacy).sort((a, b) => a.localeCompare(b));
}
