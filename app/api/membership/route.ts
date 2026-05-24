import { NextRequest } from "next/server";
import { z } from "zod";
import {
  MEMBERSHIP_KINDS,
  MEMBERSHIP_WANT_GOALS,
  MEMBERSHIP_SUBSCRIPTION_VALUES
} from "@/lib/membership-signup";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const wantValues = MEMBERSHIP_WANT_GOALS.map((x) => x.value) as [string, ...string[]];
const kindValues = MEMBERSHIP_KINDS.map((x) => x.value) as [string, ...string[]];

const membershipSchema = z.object({
  want_goal: z.enum(wantValues),
  subscription_type: z.enum(MEMBERSHIP_SUBSCRIPTION_VALUES),
  member_kind: z.enum(kindValues),
  source_page: z.string().max(200).optional().default("/inscriere"),
  company: z.string().max(200).optional().default("")
});

const ipHits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = ipHits.get(ip);
  if (!existing || now > existing.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    return true;
  }
  existing.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return Response.json({ ok: false, error: "Prea multe cereri. Încearcă mai târziu." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = membershipSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Date invalide." }, { status: 400 });
  }

  const data = parsed.data;
  if (data.company) {
    return Response.json({ ok: true });
  }

  const supabase = getSupabaseServerClient();
  const { error: dbError } = await supabase.from("membership_signups").insert({
    want_goal: data.want_goal,
    subscription_type: data.subscription_type,
    member_kind: data.member_kind,
    source_page: data.source_page || "/inscriere",
    submitted_at: new Date().toISOString(),
    ip_address: ip
  });

  if (dbError) {
    console.error("[membership] insert failed:", dbError);
    return Response.json({ ok: false, error: "Nu am putut salva înscrierea." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
