import nodemailer from "nodemailer";
import { NextRequest } from "next/server";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { serverEnv } from "@/lib/server-env";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional().default(""),
  message: z.string().min(10).max(3000),
  company: z.string().max(200).optional().default("")
});

const ipHits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
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

function isPayloadStorageEnabled(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET?.trim() && process.env.PAYLOAD_DATABASE_URL?.trim());
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return Response.json({ ok: false, error: "Prea multe cereri. Incearca mai tarziu." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Date invalide." }, { status: 400 });
  }

  const data = parsed.data;
  if (data.company) {
    return Response.json({ ok: true });
  }

  const usePayload = isPayloadStorageEnabled();
  let submissionId: string | null = null;

  if (usePayload) {
    try {
      const payload = await getPayloadClient();
      const created = await payload.create({
        collection: "submissions",
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          message: data.message,
          sourcePage: "/contact",
          deliveryStatus: "pending",
          submittedAt: new Date().toISOString(),
          ipAddress: ip
        },
        overrideAccess: true
      });
      submissionId = String(created.id);
    } catch (error) {
      console.error("[contact] Payload create failed:", error);
      return Response.json({ ok: false, error: "Nu am putut salva formularul." }, { status: 500 });
    }
  } else {
    const supabase = getSupabaseServerClient();
    const { error: dbError } = await supabase.from("form_submissions").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      source_page: "/contact",
      submitted_at: new Date().toISOString(),
      ip_address: ip
    });

    if (dbError) {
      return Response.json({ ok: false, error: "Nu am putut salva formularul." }, { status: 500 });
    }
  }

  const transporter = nodemailer.createTransport({
    host: serverEnv.smtpHost,
    port: serverEnv.smtpPort,
    secure: serverEnv.smtpSecure,
    auth: {
      user: serverEnv.smtpUser,
      pass: serverEnv.smtpPass
    }
  });

  let emailSent = true;
  try {
    await transporter.sendMail({
      from: serverEnv.mailFrom,
      to: serverEnv.mailTo,
      subject: `Form contact nou - ${data.name}`,
      text: `Nume: ${data.name}\nEmail: ${data.email}\nTelefon: ${data.phone || "-"}\n\nMesaj:\n${data.message}`
    });
  } catch (error) {
    console.error("[contact] SMTP send failed:", error);
    emailSent = false;
    if (usePayload && submissionId) {
      try {
        const payload = await getPayloadClient();
        await payload.update({
          collection: "submissions",
          id: submissionId,
          data: {
            deliveryStatus: "failed",
            deliveryError: error instanceof Error ? error.message : String(error)
          },
          overrideAccess: true
        });
      } catch (updateErr) {
        console.error("[contact] Payload delivery status update failed:", updateErr);
      }
    }
    return Response.json({
      ok: true,
      emailSent: false,
      message: "Mesajul a fost inregistrat, dar notificarea email nu a putut fi trimisa."
    });
  }

  if (usePayload && submissionId) {
    try {
      const payload = await getPayloadClient();
      await payload.update({
        collection: "submissions",
        id: submissionId,
        data: { deliveryStatus: "sent" },
        overrideAccess: true
      });
    } catch (updateErr) {
      console.error("[contact] Payload sent status update failed:", updateErr);
    }
  }

  return Response.json({ ok: true, emailSent });
}
