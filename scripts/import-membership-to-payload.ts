/**
 * One-shot import of membership_signups from Supabase into Payload.
 * Run: npm run cms:import-membership
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function main() {
  if (!process.env.PAYLOAD_SECRET?.trim() || !process.env.PAYLOAD_DATABASE_URL?.trim()) {
    console.error("Missing PAYLOAD_SECRET or PAYLOAD_DATABASE_URL");
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
  const { data, error } = await supabase
    .from("membership_signups")
    .select("*")
    .order("submitted_at", { ascending: true });

  if (error) {
    console.error("Supabase read failed:", error);
    process.exit(1);
  }

  const { getPayload } = await import("payload");
  const config = (await import("../payload.config")).default;
  const payload = await getPayload({ config });

  let imported = 0;
  let skipped = 0;

  for (const row of data ?? []) {
    const sourcePage = String(row.source_page || "/inscriere");
    const submittedAt = String(row.submitted_at || new Date().toISOString());

    const existing = await payload.find({
      collection: "membership-signups",
      where: {
        and: [
          { sourcePage: { equals: sourcePage } },
          { submittedAt: { equals: submittedAt } },
          { wantGoal: { equals: String(row.want_goal) } }
        ]
      },
      limit: 1
    });

    if (existing.docs.length) {
      skipped += 1;
      continue;
    }

    await payload.create({
      collection: "membership-signups",
      data: {
        wantGoal: String(row.want_goal),
        subscriptionType: String(row.subscription_type),
        memberKind: String(row.member_kind),
        sourcePage,
        submittedAt,
        ipAddress: row.ip_address ? String(row.ip_address) : undefined
      },
      overrideAccess: true
    });
    imported += 1;
  }

  console.log(`Done. imported=${imported} skipped=${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
