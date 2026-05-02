import fs from "node:fs";
import path from "node:path";

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
  meta?: { description?: string };
  blocks: ContentBlock[];
  images: ContentImage[];
};

type ManifestEntry = {
  slug: string;
  url?: string;
};

type Manifest = {
  pages: ManifestEntry[];
};

export type NormalizedSection = {
  heading: string;
  blocks: ContentBlock[];
};

export type NormalizedPage = {
  slug: string;
  title: string;
  description: string;
  heroImagePath: string | null;
  heroAlt: string;
  intro: string | null;
  sections: NormalizedSection[];
  blocks: ContentBlock[];
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
  const normalized = localPath.replace(/^\/+/, "");
  const filePath = path.join(contentRoot, normalized);
  return fs.existsSync(filePath);
}

function publicContentPathExists(publicPath: string): boolean {
  const stripped = publicPath.replace(/^\/content\//, "");
  return imageExists(stripped);
}

export function getPrimaryImagePath(page: RawPage): string | null {
  const candidate = page.images[1] ?? page.images[0];
  if (!candidate?.local_path) {
    return null;
  }
  if (!imageExists(candidate.local_path)) {
    return null;
  }
  return mapImagePath(candidate.local_path);
}

function getHeroAlt(page: RawPage): string {
  return page.images[1]?.alt || page.images[0]?.alt || page.title;
}

function getDescription(page: RawPage): string {
  const metaDesc = page.meta?.description?.trim();
  if (metaDesc) return metaDesc;
  const firstParagraph = page.blocks.find((block) => block.type === "p" && block.text?.trim());
  return firstParagraph?.text?.trim() || "";
}

function deriveDescriptionFromBlocks(blocks: ContentBlock[]): string {
  const firstParagraph = blocks.find((block) => block.type === "p" && block.text?.trim());
  return firstParagraph?.text?.trim() || "";
}

function getDisplayTitle(rawTitle: string, slug: string): string {
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

async function getNormalizedPageFromPayload(slug: string): Promise<NormalizedPage | null> {
  const { getPayloadClient } = await import("./payload");
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: "published" } }]
    },
    limit: 1,
    depth: 0
  });

  if (!result.docs.length) {
    return null;
  }

  const doc = result.docs[0] as {
    title?: string;
    description?: string | null;
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
  if (heroImagePath && !publicContentPathExists(heroImagePath)) {
    heroImagePath = null;
  }

  const heroAlt = String(doc.heroAlt || doc.title || title);
  const intro =
    typeof doc.intro === "string" && doc.intro.trim() ? doc.intro.trim() : getIntro(blocks);

  return {
    slug,
    title,
    description,
    heroImagePath,
    heroAlt,
    intro,
    sections: buildSections(blocks),
    blocks
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

  return {
    slug,
    title,
    description: getDescription(page),
    heroImagePath: getPrimaryImagePath(page),
    heroAlt: getHeroAlt(page),
    intro: getIntro(blocks),
    sections: buildSections(blocks),
    blocks
  };
}

/**
 * Prefer Payload when configured (`CONTENT_SOURCE`: auto | cms | legacy).
 * - auto: try CMS, then legacy files
 * - cms: CMS only
 * - legacy: JSON files only
 */
export async function getNormalizedPage(slug: string): Promise<NormalizedPage | null> {
  const mode = (process.env.CONTENT_SOURCE || "auto").toLowerCase();

  if (mode === "legacy") {
    return getNormalizedPageFromLegacyFiles(slug);
  }

  const useCms = mode === "cms" || mode === "auto";

  if (useCms && isPayloadConfigured()) {
    try {
      const fromPayload = await getNormalizedPageFromPayload(slug);
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
