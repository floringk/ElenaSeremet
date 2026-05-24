import { pricingPlans } from "@/lib/site-data";

export const MEMBERSHIP_WANT_GOALS = [
  { value: "incepe_pilates", label: "Vreau să încep Pilates" },
  { value: "continuare", label: "Continui antrenamentul / abonament nou" },
  { value: "clasa_proba", label: "Vreau o clasă probă" },
  { value: "sedinta_privata", label: "Mă interesează ședință privată" }
] as const;

export const MEMBERSHIP_KINDS = [
  { value: "incepator", label: "Începător" },
  { value: "intermediar", label: "Am mai practicat Pilates" },
  { value: "avansat", label: "Nivel avansat" },
  { value: "revin_dupa_pauza", label: "Revino după o pauză" }
] as const;

export const MEMBERSHIP_SUBSCRIPTION_VALUES = pricingPlans.map((p) => p.name) as [
  string,
  ...string[]
];

export type MembershipWantGoal = (typeof MEMBERSHIP_WANT_GOALS)[number]["value"];
export type MembershipKind = (typeof MEMBERSHIP_KINDS)[number]["value"];
