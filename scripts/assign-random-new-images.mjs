/**
 * Assigns a random studio photo from mockups/content/images/new to each manifest page.
 * Prepends the photo so it becomes the hero (first raster, non-logo).
 * Run: node scripts/assign-random-new-images.mjs
 * Re-run after human review updates docs/image-map.csv manually.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentRoot = path.join(root, "mockups", "content");
const newRoot = path.join(contentRoot, "images", "new");
const rawRoot = path.join(contentRoot, "raw");
const manifestPath = path.join(contentRoot, "site_manifest.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const SKIP_DIRS = new Set(["Insta", "Retouch"]);

function walkImages(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walkImages(full, acc);
    } else if (IMAGE_EXT.has(path.extname(ent.name).toLowerCase())) {
      const rel = path.relative(contentRoot, full).replace(/\\/g, "/");
      acc.push(rel);
    }
  }
  return acc;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isStockPlaceholder(localPath) {
  return /iStock-|placeholder\.png$/i.test(localPath.replace(/\\/g, "/"));
}

function isLogoOrSvg(localPath) {
  const n = localPath.replace(/\\/g, "/");
  return /logo|moto-pilates|\.svg$/i.test(n);
}

const pool = walkImages(newRoot);
if (pool.length === 0) {
  console.error("No images found under", newRoot);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const slugs = manifest.pages.map((p) => p.slug).filter(Boolean);
const assigned = shuffle(pool);
let poolIndex = 0;

function nextImage() {
  const img = assigned[poolIndex % assigned.length];
  poolIndex += 1;
  return img;
}

let updated = 0;

for (const slug of slugs) {
  const filePath = path.join(rawRoot, `${slug}.json`);
  if (!fs.existsSync(filePath)) continue;

  const page = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const images = Array.isArray(page.images) ? [...page.images] : [];
  const heroPath = nextImage();
  const title = (page.title || slug).replace(/\s*–.*$/, "").trim();

  const filtered = images.filter((img) => {
    if (!img?.local_path) return false;
    if (isStockPlaceholder(img.local_path)) return false;
    if (isLogoOrSvg(img.local_path)) return false;
    return true;
  });

  const heroEntry = {
    src: `https://elenaseremet.ro/content/${heroPath.replace(/^images\//, "")}`,
    alt: `${title} — Pilates Studio Elena Seremet (temporar, de revizuit)`,
    local_path: heroPath
  };

  page.images = [heroEntry, ...filtered.filter((img) => img.local_path !== heroPath)];

  fs.writeFileSync(filePath, `${JSON.stringify(page, null, 2)}\n`, "utf8");
  updated += 1;
  console.log(`${slug} → ${heroPath}`);
}

console.log(`\nUpdated ${updated} pages from ${pool.length} images in images/new/`);
