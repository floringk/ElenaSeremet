/**
 * Seeds Payload globals for pricing + program (schema push + default content).
 * Run: npm run cms:seed
 */
import "dotenv/config";

import { TEMPLATE_PROGRAM_SESSIONS } from "../lib/cms-program";
import { pricingPlans, schedule } from "../lib/site-data";

const DEFAULT_GMA_NOTE =
  "Rezervările se fac în aplicația GMA (cod sală: elenaseremet). Programul afișează clasele disponibile pentru o săptămână.";

async function main() {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");

  const payload = await getPayload({ config });

  const pricingData = {
    plans: pricingPlans.map((plan) => ({
      name: plan.name,
      price: plan.value,
      note: plan.note,
      featured: plan.name.includes("8")
    }))
  };

  const programData = {
    openingHours: schedule.map((row) => ({
      day: row.day,
      hours: row.hours
    })),
    gmaNote: DEFAULT_GMA_NOTE,
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
  };

  await payload.updateGlobal({
    slug: "pricing",
    data: pricingData,
    overrideAccess: true
  });
  console.log(`Seeded pricing global with ${pricingData.plans.length} plan(s).`);

  await payload.updateGlobal({
    slug: "program",
    data: programData,
    overrideAccess: true
  });
  console.log(
    `Seeded program global with ${programData.openingHours.length} opening hour row(s) and ${programData.sessions.length} class session(s).`
  );

  await payload.destroy();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
