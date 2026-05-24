/**
 * Creates the first Payload CMS admin user (email + password).
 * Run once after PAYLOAD_SECRET and PAYLOAD_DATABASE_URL are set.
 *
 *   npm run cms:create-admin
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
    console.error("Add to .env then run again:\n");
    console.error("  PAYLOAD_ADMIN_EMAIL=your-email@example.com");
    console.error("  PAYLOAD_ADMIN_PASSWORD=your-secure-password");
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
    limit: 1,
    overrideAccess: true
  });

  if (existing.totalDocs > 0) {
    const first = existing.docs[0] as { email?: string };
    console.log("A Payload user already exists.");
    console.log(`  First account email: ${first.email ?? "(unknown)"}`);
    console.log("  Log in at: http://localhost:3000/cms/login");
    console.log("\nTo reset password: Payload admin → Users, or create another user while logged in.");
    await payload.destroy();
    process.exit(0);
  }

  await payload.create({
    collection: "users",
    data: {
      email,
      password,
      role: "admin"
    },
    overrideAccess: true
  });

  await payload.destroy();

  console.log("First Payload CMS admin created.");
  console.log(`  Email: ${email}`);
  console.log("  Login: http://localhost:3000/cms/login");
  console.log("\nOptional: npm run import:pages  — copy JSON content into CMS Pages");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
