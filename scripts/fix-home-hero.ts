/**
 * Updates Payload page `index` hero to match mockups/content/raw/index.json (NX6A7960).
 * Run: npm run cms:fix-home-hero
 */
import "dotenv/config";

async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const fs = await import("node:fs");
  const path = await import("node:path");

  const indexPath = path.join(process.cwd(), "mockups", "content", "raw", "index.json");
  const raw = JSON.parse(fs.readFileSync(indexPath, "utf8")) as {
    images?: { local_path?: string; alt?: string }[];
  };

  const first = raw.images?.find((img) => {
    const p = img.local_path?.replace(/\\/g, "/") ?? "";
    return /\.(jpe?g|webp)$/i.test(p) && !/logo|moto-pilates|Design-fara-titlu/i.test(p);
  });

  const local = first?.local_path?.trim();
  if (!local) {
    console.error("No suitable hero in index.json");
    process.exit(1);
  }

  const heroImagePath = local.startsWith("/content/") ? local : `/content/${local.replace(/^\/+/, "")}`;
  const heroAlt = first?.alt?.trim() || "Clasă de Pilates — Elena Seremet";

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: "index" } },
    limit: 1,
    depth: 0
  });

  if (!existing.docs[0]) {
    console.error("No CMS page with slug=index. Run npm run import:pages first.");
    await payload.destroy();
    process.exit(1);
  }

  const taglineBlock = (raw as { blocks?: { type?: string; text?: string }[] }).blocks?.find(
    (b) => b.type === "p" && b.text?.trim()
  );
  const intro = taglineBlock?.text
    ?.replace(/conectează-tela/gi, "Conectează-te la")
    .replace(/conecteaza-tela/gi, "Conectează-te la")
    .trim();

  await payload.update({
    collection: "pages",
    id: existing.docs[0].id,
    data: {
      heroImagePath,
      heroAlt,
      ogImagePath: heroImagePath,
      ...(intro ? { intro, description: intro } : {})
    },
    overrideAccess: true
  });

  await payload.destroy();
  console.log("Home hero updated in CMS:");
  console.log(`  ${heroImagePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
