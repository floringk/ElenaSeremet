import { cache } from "react";

import { pricingPlans as fallbackPlans } from "@/lib/site-data";

export type PricingPlan = {
  name: string;
  value: string;
  note: string;
  featured: boolean;
};

function isPayloadConfigured(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET?.trim() && process.env.PAYLOAD_DATABASE_URL?.trim());
}

async function fetchPricingPlans(): Promise<PricingPlan[]> {
  if (!isPayloadConfigured()) {
    return fallbackPlans.map((plan) => ({
      name: plan.name,
      value: plan.value,
      note: plan.note,
      featured: plan.name.includes("8")
    }));
  }

  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({ slug: "pricing", depth: 0 });

    if (!doc || typeof doc !== "object") {
      return fallbackPlans.map((plan) => ({
        name: plan.name,
        value: plan.value,
        note: plan.note,
        featured: plan.name.includes("8")
      }));
    }

    const d = doc as {
      plans?: Array<{
        name?: string;
        price?: string;
        note?: string;
        featured?: boolean;
      }>;
    };

    if (!Array.isArray(d.plans) || d.plans.length === 0) {
      return fallbackPlans.map((plan) => ({
        name: plan.name,
        value: plan.value,
        note: plan.note,
        featured: plan.name.includes("8")
      }));
    }

    return d.plans
      .map((row) => ({
        name: row.name?.trim() || "",
        value: row.price?.trim() || "",
        note: row.note?.trim() || "",
        featured: Boolean(row.featured)
      }))
      .filter((plan) => plan.name && plan.value);
  } catch (error) {
    console.error("[cms-pricing] Failed to load pricing global:", error);
    return fallbackPlans.map((plan) => ({
      name: plan.name,
      value: plan.value,
      note: plan.note,
      featured: plan.name.includes("8")
    }));
  }
}

export const getPricingPlans = cache(fetchPricingPlans);

export async function getSubscriptionOptionNames(): Promise<string[]> {
  const plans = await getPricingPlans();
  return plans.map((plan) => plan.name);
}
