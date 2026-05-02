import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "mockups", "content");
const manifestPath = path.join(contentRoot, "site_manifest.json");
const rawRoot = path.join(contentRoot, "raw");
const imagesRoot = path.join(contentRoot, "images");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

const manifest = readJson(manifestPath);
if (!manifest || !Array.isArray(manifest.pages)) {
  console.error("Critical: invalid or missing site_manifest.json");
  process.exit(1);
}

const warnings = [];
const critical = [];

for (const page of manifest.pages) {
  const slug = page.slug;
  if (!slug) {
    critical.push("Manifest entry missing slug");
    continue;
  }

  const filePath = path.join(rawRoot, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    critical.push(`Missing raw file for slug: ${slug}`);
    continue;
  }

  const raw = readJson(filePath);
  if (!raw) {
    critical.push(`Unreadable JSON for slug: ${slug}`);
    continue;
  }

  const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
  const images = Array.isArray(raw.images) ? raw.images : [];
  if (blocks.length === 0) warnings.push(`No blocks for slug: ${slug}`);

  const textBlockCount = blocks.filter((block) => typeof block.text === "string" && block.text.trim()).length;
  if (textBlockCount === 0) warnings.push(`No readable text blocks for slug: ${slug}`);

  for (const [idx, image] of images.entries()) {
    const localPath = image?.local_path;
    if (!localPath) {
      warnings.push(`Image #${idx} missing local_path for slug: ${slug}`);
      continue;
    }
    const localFile = path.join(imagesRoot, path.basename(localPath));
    if (!fs.existsSync(localFile)) {
      warnings.push(`Missing image file for slug ${slug}: ${localPath}`);
    }
  }
}

console.log(`Checked ${manifest.pages.length} manifest entries`);
console.log(`Critical issues: ${critical.length}`);
console.log(`Warnings: ${warnings.length}`);

if (critical.length > 0) {
  for (const issue of critical) console.error(`CRITICAL: ${issue}`);
  process.exit(1);
}

for (const issue of warnings) {
  console.warn(`WARN: ${issue}`);
}
