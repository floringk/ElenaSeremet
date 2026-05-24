/**
 * Deletes ALL Payload CMS users and creates one from PAYLOAD_ADMIN_EMAIL / PAYLOAD_ADMIN_PASSWORD.
 * Use when you forgot the password or .env credentials never matched the DB user.
 *
 *   npm run cms:reset-admin
 */
import "dotenv/config";

async function main() {
  if (!process.env.PAYLOAD_SECRET?.trim() || !process.env.PAYLOAD_DATABASE_URL?.trim()) {
    console.error("Missing PAYLOAD_SECRET or PAYLOAD_DATABASE_URL in .env");
    process.exit(1);
  }

  const email = process.env.PAYLOAD_ADMIN_EMAIL?.trim();
  const password = process.env.PAYLOAD_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD in .env, then run again.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("PAYLOAD_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "users",
    limit: 200,
    overrideAccess: true
  });

  for (const doc of existing.docs) {
    await payload.delete({
      collection: "users",
      id: doc.id,
      overrideAccess: true
    });
    console.log(`Deleted user id=${doc.id}`);
  }

  await payload.create({
    collection: "users",
    data: { email, password, role: "admin" },
    overrideAccess: true
  });

  await payload.destroy();

  console.log("\nCMS admin reset complete.");
  console.log(`  Email: ${email}`);
  console.log(`  Password: (value from PAYLOAD_ADMIN_PASSWORD in .env)`);
  console.log("  Login: http://localhost:3000/cms/login");
  console.log("\nUsers are in Postgres schema `payload`, table `users` (not in public).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
