/**
 * Clears broken hero_image_id / og_image_id on CMS pages (after failed schema migration).
 * Run once: npm run cms:clear-media-refs
 */
import "dotenv/config";
import pg from "pg";

async function main() {
  const url = process.env.PAYLOAD_DATABASE_URL?.trim();
  if (!url) {
    console.error("Missing PAYLOAD_DATABASE_URL");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  const res = await client.query(`
    update payload.pages
    set hero_image_id = null, og_image_id = null
    where hero_image_id is not null or og_image_id is not null
  `);

  console.log(`Cleared media FK refs on ${res.rowCount ?? 0} page row(s).`);
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
