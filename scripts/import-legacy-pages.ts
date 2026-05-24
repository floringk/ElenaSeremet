import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

type RawBlock = {
  type: string;
  text?: string;
  items?: (string | { value?: string })[];
};

type RawPage = {
  title: string;
  meta?: { description?: string; title?: string; noIndex?: boolean };
  blocks: RawBlock[];
  images?: { local_path: string; alt?: string }[];
};

type Manifest = {
  pages: { slug: string }[];
};

function loadJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function mapBlocks(blocks: RawBlock[]) {
  return blocks.map((block) => {
    if (block.type === "ul") {
      const items = Array.isArray(block.items)
        ? block.items.map((item) => ({
            value: typeof item === "string" ? item : String((item as { value?: string }).value ?? "")
          }))
        : [];
      return { type: "ul" as const, items };
    }
    return {
      type: block.type as
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6"
        | "p"
        | "ul",
      text: block.text ?? ""
    };
  });
}

function isLogoAssetPath(localPath: string): boolean {
  const n = localPath.replace(/\\/g, "/");
  return /(^|\/)logo|moto-pilates-mat|wordmark|Design-fara-titlu/i.test(n);
}

/** Same rules as lib/content.ts pickHeroLocalPath — first raster photo, not logo. */
function heroFromImages(images: RawPage["images"]) {
  if (!Array.isArray(images) || images.length === 0) {
    return { heroImagePath: undefined as string | undefined, heroAlt: undefined as string | undefined };
  }

  const list = images.filter((img) => img?.local_path?.trim());
  const isRaster = (p: string) => /\.(jpe?g|png|webp|gif)$/i.test(p.replace(/\\/g, "/"));

  let picked =
    list.find((img) => isRaster(img.local_path) && !isLogoAssetPath(img.local_path)) ?? null;
  if (!picked) {
    picked = list.find((img) => isRaster(img.local_path)) ?? null;
  }
  if (!picked) {
    picked = list[0] ?? null;
  }

  const local = picked?.local_path?.trim();
  if (!local) {
    return { heroImagePath: undefined, heroAlt: undefined };
  }

  const heroImagePath = local.startsWith("/content/")
    ? local
    : `/content/${local.replace(/^\/+/, "")}`;

  return {
    heroImagePath,
    heroAlt: picked?.alt?.trim() || undefined
  };
}

function introFromBlocks(blocks: RawBlock[]) {
  const firstP = blocks.find((b) => b.type === "p" && b.text?.trim());
  return firstP?.text?.trim() || undefined;
}

async function main() {
  if (!process.env.PAYLOAD_SECRET || !process.env.PAYLOAD_DATABASE_URL) {
    console.error("Set PAYLOAD_SECRET and PAYLOAD_DATABASE_URL before running this script.");
    process.exit(1);
  }

  const contentRoot = path.join(process.cwd(), "mockups", "content");
  const manifestPath = path.join(contentRoot, "site_manifest.json");
  const manifest = loadJson<Manifest>(manifestPath);
  if (!manifest?.pages?.length) {
    console.error("No site_manifest.json pages found.");
    process.exit(1);
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const slugs = new Set<string>();
  for (const p of manifest.pages) {
    const s = p.slug?.trim();
    if (s) slugs.add(s);
  }
  slugs.add("index");

  let created = 0;
  let updated = 0;

  for (const slug of slugs) {
    const filePath = path.join(contentRoot, "raw", `${slug}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skip missing file for slug=${slug}`);
      continue;
    }

    const raw = loadJson<RawPage>(filePath);
    if (!raw) {
      console.warn(`Skip invalid JSON slug=${slug}`);
      continue;
    }

    const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
    const mappedBlocks = mapBlocks(blocks);
    const { heroImagePath, heroAlt } = heroFromImages(raw.images);
    const description =
      raw.meta?.description?.trim() ||
      blocks.find((b) => b.type === "p" && b.text?.trim())?.text?.trim() ||
      "";

    const displayTitle = (raw.title?.trim() || slug).split(" – ")[0].trim();

    const doc = {
      title: raw.title?.trim() || slug,
      slug,
      status: "published" as const,
      description,
      metaTitle: raw.meta?.title?.trim() || displayTitle,
      ogImagePath: heroImagePath,
      noIndex: Boolean(raw.meta?.noIndex),
      heroImagePath,
      heroAlt,
      intro: introFromBlocks(blocks),
      blocks: mappedBlocks
    };

    const existing = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: "pages",
        id: existing.docs[0].id,
        data: doc,
        overrideAccess: true
      });
      updated += 1;
      console.log(`Updated page: ${slug}`);
    } else {
      await payload.create({
        collection: "pages",
        data: doc,
        overrideAccess: true
      });
      created += 1;
      console.log(`Created page: ${slug}`);
    }
  }

  console.log(`Done. Created ${created}, updated ${updated}.`);
  await payload.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
