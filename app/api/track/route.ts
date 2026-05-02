import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const trackSchema = z.object({
  path: z.string().min(1).max(300),
  referrer: z.string().max(500).optional(),
  event: z.enum(["page_view", "contact_submit"]).default("page_view")
});

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  const supabase = getSupabaseServerClient();

  await supabase.from("page_events").insert({
    event_name: parsed.data.event,
    page_path: parsed.data.path,
    referrer: parsed.data.referrer || null,
    ip_address: ip,
    user_agent: userAgent,
    created_at: new Date().toISOString()
  });

  return Response.json({ ok: true });
}
