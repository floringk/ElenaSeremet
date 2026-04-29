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
};

type Manifest = {
  pages: ManifestEntry[];
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

export function getAllSlugs(): string[] {
  return getManifest().pages
    .map((item) => item.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .filter((slug) => slug !== "index")
    .sort((a, b) => a.localeCompare(b));
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

export function getPrimaryImagePath(page: RawPage): string | null {
  const candidate = page.images[1] ?? page.images[0];
  if (!candidate?.local_path) {
    return null;
  }
  return mapImagePath(candidate.local_path);
}
