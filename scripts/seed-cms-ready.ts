/**
 * Populate CMS for day-to-day use:
 * - upload key images into Media
 * - seed Navigation, Studio, Pricing, Program, Settings
 * - import legacy pages if empty + link heroes / content images
 * - seed gallery albums from mockups/content/images/new
 *
 *   npm run cms:seed-ready
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import { TEMPLATE_PROGRAM_SESSIONS } from "../lib/cms-program";
import { navLinks, pricingPlans, schedule, services, team } from "../lib/site-data";

const root = process.cwd();
const contentRoot = path.join(root, "mockups", "content");
const imagesRoot = path.join(contentRoot, "images");
const galleryRoot = path.join(imagesRoot, "new");
const csvPath = path.join(root, "docs", "image-map.csv");

const MAX_GALLERY_IMAGES_PER_ALBUM = 10;
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

type MediaDoc = { id: number | string; url?: string | null };

const mediaCache = new Map<string, MediaDoc>();

function mimeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "image/jpeg";
}

function findImageFile(filename: string): string | null {
  const direct = path.join(imagesRoot, filename);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;

  const stack = [imagesRoot];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name.startsWith(".") || ent.name === "new") continue;
        stack.push(full);
      } else if (ent.name === filename) {
        return full;
      }
    }
  }
  return null;
}

function publicPathFromFile(filePath: string): string {
  const rel = path.relative(contentRoot, filePath).replace(/\\/g, "/");
  return `/content/${rel}`;
}

function fileFromPublicPath(publicPath: string): string | null {
  const rel = publicPath.replace(/^\/content\//, "");
  const full = path.join(contentRoot, rel);
  return fs.existsSync(full) ? full : null;
}

function parseHeroCsv(): { slug: string; filename: string; alt: string; inlines: { filename: string; alt: string }[] }[] {
  if (!fs.existsSync(csvPath)) return [];
  const lines = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
  const header = lines[0]?.split(",") ?? [];
  const idx = (name: string) => header.indexOf(name);
  const out: { slug: string; filename: string; alt: string; inlines: { filename: string; alt: string }[] }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const slug = cols[idx("slug")]?.trim();
    const filename = cols[idx("hero_filename")]?.trim();
    if (!slug) continue;
    const inlines: { filename: string; alt: string }[] = [];
    for (const n of [1, 2] as const) {
      const f = cols[idx(`inline_${n}`)]?.trim();
      if (f) inlines.push({ filename: f, alt: cols[idx(`inline_${n}_alt`)]?.trim() || f });
    }
    out.push({
      slug: slug === "index" ? "index" : slug,
      filename: filename || "",
      alt: cols[idx("hero_alt")]?.trim() || slug,
      inlines
    });
  }
  return out;
}

function slugifyAlbum(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureMedia(
  payload: Awaited<ReturnType<typeof import("payload").getPayload>>,
  filePath: string,
  alt: string,
  category: "hero" | "inline" | "team" | "og" | "gallery"
): Promise<MediaDoc | null> {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.warn(`  [missing] ${filePath}`);
    return null;
  }

  const cached = mediaCache.get(abs);
  if (cached) return cached;

  const filename = path.basename(abs);
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  if (existing.docs[0]) {
    const doc = existing.docs[0] as MediaDoc;
    mediaCache.set(abs, doc);
    return doc;
  }

  const created = await payload.create({
    collection: "media",
    data: { alt, category },
    filePath: abs,
    overrideAccess: true
  });
  const doc = created as unknown as MediaDoc;
  mediaCache.set(abs, doc);
  console.log(`  + media ${filename}`);
  return doc;
}

async function main() {
  if (!process.env.PAYLOAD_SECRET?.trim() || !process.env.PAYLOAD_DATABASE_URL?.trim()) {
    console.error("Missing PAYLOAD_SECRET or PAYLOAD_DATABASE_URL");
    process.exit(1);
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  console.log("\n=== 1) Media uploads (heroes, team, icons) ===");
  const csvRows = parseHeroCsv();
  const heroMediaBySlug = new Map<string, MediaDoc>();
  const contentMediaBySlug = new Map<string, MediaDoc[]>();

  for (const row of csvRows) {
    if (!row.filename) continue;
    const file = findImageFile(row.filename);
    if (!file) {
      console.warn(`  [hero missing] ${row.slug}: ${row.filename}`);
      continue;
    }
    const media = await ensureMedia(payload, file, row.alt, "hero");
    if (media) heroMediaBySlug.set(row.slug === "index" ? "index" : row.slug, media);

    const inlines: MediaDoc[] = [];
    for (const inline of row.inlines) {
      const inlineFile = findImageFile(inline.filename);
      if (!inlineFile) continue;
      const m = await ensureMedia(payload, inlineFile, inline.alt, "inline");
      if (m) inlines.push(m);
    }
    if (inlines.length) contentMediaBySlug.set(row.slug, inlines);
  }

  const teamMedia: { name: string; href: string; photo: MediaDoc | null; path: string }[] = [];
  for (const member of team) {
    const file = fileFromPublicPath(member.image);
    const photo = file ? await ensureMedia(payload, file, member.name, "team") : null;
    teamMedia.push({ name: member.name, href: member.href, photo, path: member.image });
  }

  const serviceCards: {
    title: string;
    description: string;
    href: string;
    icon: MediaDoc | null;
    iconPath: string;
  }[] = [];
  for (const s of services) {
    const file = fileFromPublicPath(s.icon);
    const icon = file ? await ensureMedia(payload, file, s.title, "inline") : null;
    serviceCards.push({
      title: s.title,
      description: s.description,
      href: s.href,
      icon,
      iconPath: s.icon
    });
  }

  console.log("\n=== 2) Globals: navigation, studio, pricing, program, settings ===");
  await payload.updateGlobal({
    slug: "navigation",
    data: {
      links: navLinks.map((l) => ({ label: l.label, href: l.href }))
    },
    overrideAccess: true
  });
  console.log(`  navigation: ${navLinks.length} links`);

  await payload.updateGlobal({
    slug: "studio",
    data: {
      studioName: "Pilates Studio Elena Șeremet",
      addressLine1: "Bd. 1 Decembrie 1918, nr. 58",
      addressLine2: "București, Sector 3",
      phone: "+40 755 247 412",
      phoneHref: "+40755247412",
      sameAs: "",
      services: serviceCards.map((s) => ({
        title: s.title,
        description: s.description,
        href: s.href,
        icon: s.icon?.id ?? undefined,
        iconPath: s.iconPath
      })),
      team: teamMedia.map((m) => ({
        name: m.name,
        href: m.href,
        photo: m.photo?.id ?? undefined,
        imagePath: m.path
      }))
    },
    overrideAccess: true
  });
  console.log(`  studio: ${serviceCards.length} services, ${teamMedia.length} team`);

  await payload.updateGlobal({
    slug: "pricing",
    data: {
      plans: pricingPlans.map((plan) => ({
        name: plan.name,
        price: plan.value,
        note: plan.note,
        featured: plan.name.includes("8")
      }))
    },
    overrideAccess: true
  });
  console.log(`  pricing: ${pricingPlans.length} plans`);

  await payload.updateGlobal({
    slug: "program",
    data: {
      openingHours: schedule.map((row) => ({ day: row.day, hours: row.hours })),
      gmaNote:
        "Rezervările se fac în aplicația GMA (cod sală: elenaseremet). Programul afișează clasele disponibile pentru o săptămână.",
      sessions: TEMPLATE_PROGRAM_SESSIONS.map((session) => ({
        day: session.day,
        startTime: session.startTime,
        endTime: session.endTime,
        title: session.title,
        instructor: session.instructor ?? "",
        track: session.track,
        level: session.level ?? "",
        note: session.note ?? ""
      }))
    },
    overrideAccess: true
  });
  console.log(
    `  program: ${schedule.length} hours + ${TEMPLATE_PROGRAM_SESSIONS.length} sessions`
  );

  await payload.updateGlobal({
    slug: "settings",
    data: {
      siteTitle: "Pilates Studio Elena Seremet",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://elenaseremet.ro",
      defaultDescription:
        "Studio de Pilates în București — clase mat și reformer, antrenament personalizat și program flexibil.",
      staticRoutes: [
        {
          path: "/contact",
          metaTitle: "Contact",
          metaDescription:
            "Contactează Pilates Studio Elena Seremet — București, Sector 3. Telefon, program și formular de mesaje."
        },
        {
          path: "/galerie",
          metaTitle: "Galerie foto",
          metaDescription: "Galerie foto — studio Pilates Elena Seremet."
        },
        {
          path: "/inscriere",
          metaTitle: "Înscriere",
          metaDescription: "Înscriere clienți noi — Pilates Studio Elena Seremet."
        },
        {
          path: "/politica-cookie",
          metaTitle: "Politica de cookie-uri",
          metaDescription: "Informații despre cookie-urile folosite pe site."
        }
      ]
    },
    overrideAccess: true
  });
  console.log("  settings: SEO defaults + static routes");

  console.log("\n=== 3) Pages — ensure imported, link media ===");
  let pageCount = await payload.count({ collection: "pages", overrideAccess: true });
  if (pageCount.totalDocs === 0) {
    console.log("  No pages — run: npm run import:pages  then re-run cms:seed-ready");
    console.log("  Continuing with globals + gallery only…");
  } else {
    console.log(`  pages present: ${pageCount.totalDocs}`);
  }

  const pageTypeBySlug: Record<string, string> = {
    index: "home",
    "despre-noi": "despre",
    servicii: "servicii",
    preturi: "preturi",
    schedules: "program",
    instructori: "instructor",
    "elena-seremet": "instructor",
    "gabriela-ostafe": "instructor",
    "adelina-csolti": "instructor"
  };

  let linked = 0;
  for (const row of csvRows) {
    const slug = row.slug;
    const pageRes = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true
    });
    const doc = pageRes.docs[0];
    if (!doc) continue;

    const hero = heroMediaBySlug.get(slug);
    const inlines = contentMediaBySlug.get(slug) || [];
    const heroFile = row.filename ? findImageFile(row.filename) : null;
    const heroPath = heroFile ? publicPathFromFile(heroFile) : undefined;

    await payload.update({
      collection: "pages",
      id: doc.id,
      data: {
        pageType: pageTypeBySlug[slug] || "page",
        ...(hero
          ? {
              heroImage: hero.id,
              heroAlt: row.alt,
              heroImagePath: heroPath,
              ogImage: hero.id,
              ogImagePath: heroPath
            }
          : heroPath
            ? { heroImagePath: heroPath, heroAlt: row.alt, ogImagePath: heroPath }
            : {}),
        ...(inlines.length
          ? {
              contentImages: inlines.map((m, i) => ({
                image: m.id,
                alt: row.inlines[i]?.alt || row.alt
              }))
            }
          : {})
      },
      overrideAccess: true
    });
    linked += 1;
  }
  console.log(`  linked media on ${linked} page(s)`);

  console.log("\n=== 4) Gallery albums ===");
  let albumCount = 0;
  if (fs.existsSync(galleryRoot)) {
    const dirs = fs
      .readdirSync(galleryRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !d.name.startsWith("_"))
      .map((d) => d.name)
      .sort((a, b) => a.localeCompare(b, "ro"));

    for (const label of dirs) {
      const slug = slugifyAlbum(label);
      const dir = path.join(galleryRoot, label);
      const files = fs
        .readdirSync(dir)
        .filter((n) => IMAGE_EXT.has(path.extname(n).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, "ro", { numeric: true }))
        .slice(0, MAX_GALLERY_IMAGES_PER_ALBUM);

      if (files.length === 0) continue;

      const imageIds: { image: string | number; alt: string }[] = [];
      for (const file of files) {
        const full = path.join(dir, file);
        const alt = file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || label;
        const media = await ensureMedia(payload, full, alt, "gallery");
        if (media) imageIds.push({ image: media.id, alt });
      }

      const existingAlbum = await payload.find({
        collection: "gallery-albums",
        where: { slug: { equals: slug } },
        limit: 1,
        overrideAccess: true
      });

      const data = {
        title: label,
        slug,
        published: true,
        coverImage: imageIds[0]?.image,
        images: imageIds
      };

      if (existingAlbum.docs[0]) {
        await payload.update({
          collection: "gallery-albums",
          id: existingAlbum.docs[0].id,
          data,
          overrideAccess: true
        });
      } else {
        await payload.create({
          collection: "gallery-albums",
          data,
          overrideAccess: true
        });
      }
      albumCount += 1;
      console.log(`  album ${slug}: ${imageIds.length} images`);
    }
  }
  console.log(`  albums ready: ${albumCount}`);

  const mediaTotal = await payload.count({ collection: "media", overrideAccess: true });
  pageCount = await payload.count({ collection: "pages", overrideAccess: true });
  console.log("\n=== Done ===");
  console.log(`Media: ${mediaTotal.totalDocs}`);
  console.log(`Pages: ${pageCount.totalDocs}`);
  console.log(`Albums: ${albumCount}`);
  console.log("Open http://localhost:3000/cms — Media, Pagini, Studio, Navigare, Albume galerie.");

  await payload.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
