import fs from "node:fs";
import path from "node:path";

const GALLERY_ROOT = path.join(process.cwd(), "mockups", "content", "images", "new");

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".JPG",
  ".JPEG",
  ".PNG",
  ".WEBP"
]);

function isImageFile(name: string): boolean {
  return IMAGE_EXT.has(path.extname(name).toLowerCase());
}

export function slugifyAlbumLabel(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type AlbumInfo = { slug: string; label: string; count: number };

/**
 * Folders under `mockups/content/images/new` — each becomes a gallery album.
 */
export function getAlbums(): AlbumInfo[] {
  if (!fs.existsSync(GALLERY_ROOT)) {
    return [];
  }
  const entries = fs.readdirSync(GALLERY_ROOT, { withFileTypes: true });
  const used = new Set<string>();
  const albums: AlbumInfo[] = [];

  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith(".") || e.name.startsWith("_")) {
      continue;
    }
    const full = path.join(GALLERY_ROOT, e.name);
    const files = fs.readdirSync(full).filter((n) => {
      const p = path.join(full, n);
      return fs.statSync(p).isFile() && isImageFile(n);
    });

    let slug = slugifyAlbumLabel(e.name);
    const base = slug;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${n}`;
      n += 1;
    }
    used.add(slug);
    albums.push({ slug, label: e.name, count: files.length });
  }

  return albums.sort((a, b) => a.label.localeCompare(b.label, "ro"));
}

export function getAlbumBySlug(slug: string): AlbumInfo | null {
  return getAlbums().find((a) => a.slug === slug) ?? null;
}

function encodePathSegment(s: string): string {
  return s.split("/").map(encodeURIComponent).join("/");
}

export type AlbumImage = { src: string; alt: string };

/**
 * Public URLs for every image in an album (`public/content` after build sync).
 */
export function getAlbumImages(slug: string): AlbumImage[] {
  const album = getAlbumBySlug(slug);
  if (!album) {
    return [];
  }
  const dir = path.join(GALLERY_ROOT, album.label);
  if (!fs.existsSync(dir)) {
    return [];
  }
  const files = fs
    .readdirSync(dir)
    .filter((n) => {
      const p = path.join(dir, n);
      return fs.statSync(p).isFile() && isImageFile(n);
    })
    .sort((a, b) => a.localeCompare(b, "ro", { numeric: true }));

  const base = `images/new/${encodePathSegment(album.label)}`;
  return files.map((file) => ({
    src: `/content/${base}/${encodePathSegment(file)}`,
    alt: file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Fotografie"
  }));
}

export function getTotalGalleryImageCount(): number {
  return getAlbums().reduce((sum, a) => sum + a.count, 0);
}

/** First image in album — used as gallery index cover. */
export function getAlbumCoverImage(slug: string): AlbumImage | null {
  const images = getAlbumImages(slug);
  return images[0] ?? null;
}
