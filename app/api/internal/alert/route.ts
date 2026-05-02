import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendErrorAlert } from "@/lib/alerts";

const bodySchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(8000),
  context: z.record(z.string(), z.unknown()).optional()
});

/**
 * Server-to-server or tooling endpoint. Requires INTERNAL_ALERT_KEY in Authorization header.
 * Not intended for browser clients (avoids exposing secrets).
 */
export async function POST(request: NextRequest) {
  const expected = process.env.INTERNAL_ALERT_KEY?.trim();
  if (!expected) {
    return NextResponse.json({ ok: false, error: "Alerts not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (token !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  await sendErrorAlert({
    subject: parsed.data.subject,
    message: parsed.data.message,
    context: parsed.data.context
  });

  return NextResponse.json({ ok: true });
}
