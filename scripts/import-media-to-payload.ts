/**
 * Sync heroImagePath on CMS pages from docs/image-map.csv (no upload — paths only).
 * Run: npm run cms:sync-hero-paths
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

type CsvRow = {
  slug: string;
  hero_filename: string;
  hero_alt: string;
};

const root = process.cwd();
const csvPath = path.join(root, "docs", "image-map.csv");
const contentRoot = path.join(root, "mockups", "content");
const imagesRoot = path.join(contentRoot, "images");

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split(/\r?\n/);
  const header = lines[0]?.split(",") ?? [];
  const slugIdx = header.indexOf("slug");
  const heroIdx = header.indexOf("hero_filename");
  const altIdx = header.indexOf("hero_alt");
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const slug = cols[slugIdx]?.trim();
    const hero_filename = cols[heroIdx]?.trim();
    const hero_alt = cols[altIdx]?.trim();
    if (!slug || !hero_filename) continue;
    rows.push({ slug, hero_filename, hero_alt: hero_alt || slug });
  }
  return rows;
}

function findImageFile(filename: string): string | null {
  const direct = path.join(imagesRoot, filename);
  if (fs.existsSync(direct)) return direct;

  const stack = [imagesRoot];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.name === filename || ent.name.endsWith(filename)) {
        return full;
      }
    }
  }
  return null;
}

function toPublicPath(filePath: string): string {
  const rel = path.relative(contentRoot, filePath).replace(/\\/g, "/");
  return `/content/${rel}`;
}

async function main() {
  if (!process.env.PAYLOAD_SECRET?.trim() || !process.env.PAYLOAD_DATABASE_URL?.trim()) {
    console.error("Missing PAYLOAD_SECRET or PAYLOAD_DATABASE_URL");
    process.exit(1);
  }

  const { getPayload } = await import("payload");
  const config = (await import("../payload.config")).default;
  const payload = await getPayload({ config });

  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  let linked = 0;
  let missing = 0;

  for (const row of rows) {
    const filePath = findImageFile(row.hero_filename);
    if (!filePath) {
      console.warn(`  [missing file] ${row.slug}: ${row.hero_filename}`);
      missing += 1;
      continue;
    }

    const heroImagePath = toPublicPath(filePath);
    const pageRes = await payload.find({
      collection: "pages",
      where: { slug: { equals: row.slug } },
      limit: 1
    });

    if (pageRes.docs[0]) {
      await payload.update({
        collection: "pages",
        id: pageRes.docs[0].id,
        data: {
          heroImagePath,
          heroAlt: row.hero_alt,
          ogImagePath: heroImagePath,
          heroImage: null,
          ogImage: null
        },
        overrideAccess: true
      });
      linked += 1;
      console.log(`  ${row.slug} → ${heroImagePath}`);
    } else {
      console.warn(`  [no CMS page] ${row.slug}`);
    }
  }

  console.log(`Done. linked=${linked} missing=${missing}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
