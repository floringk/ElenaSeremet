import nodemailer from "nodemailer";
import { NextRequest } from "next/server";
import { z } from "zod";
import { getSmtpEnv, isSmtpConfigured } from "@/lib/mail";
import { getPayloadClient } from "@/lib/payload";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isPayloadConfigured, isSupabaseConfigured } from "@/lib/site-status";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional().default(""),
  message: z.string().min(10).max(3000),
  source_page: z.string().max(200).optional().default("/contact"),
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

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return Response.json({ ok: false, error: "Prea multe cereri. Încearcă mai târziu." }, { status: 429 });
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

  const sourcePage = data.source_page?.trim() || "/contact";
  const usePayload = isPayloadConfigured();
  const useSupabase = isSupabaseConfigured();

  if (!usePayload && !useSupabase) {
    return Response.json(
      { ok: false, error: "Salvarea mesajelor nu este configurată. Contactează administratorul site-ului." },
      { status: 503 }
    );
  }

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
          sourcePage,
          deliveryStatus: isSmtpConfigured() ? "pending" : "skipped",
          submittedAt: new Date().toISOString(),
          ipAddress: ip
        },
        overrideAccess: true
      });
      submissionId = String(created.id);
    } catch (error) {
      console.error("[contact] Payload create failed:", error);
      if (!useSupabase) {
        return Response.json({ ok: false, error: "Nu am putut salva formularul." }, { status: 500 });
      }
    }
  }

  if (!submissionId && useSupabase) {
    const supabase = getSupabaseServerClient();
    const { error: dbError } = await supabase.from("form_submissions").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      source_page: sourcePage,
      submitted_at: new Date().toISOString(),
      ip_address: ip
    });

    if (dbError) {
      console.error("[contact] Supabase insert failed:", dbError);
      return Response.json({ ok: false, error: "Nu am putut salva formularul." }, { status: 500 });
    }
  }

  if (!isSmtpConfigured()) {
    return Response.json({
      ok: true,
      saved: true,
      emailSent: false,
      message:
        "Mesajul a fost înregistrat. Echipa îl poate vedea în panoul de administrare. Notificarea pe email va fi activată la publicare."
    });
  }

  const smtp = getSmtpEnv();
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    }
  });

  try {
    await transporter.sendMail({
      from: smtp.from,
      to: smtp.to,
      subject: `Formular contact — ${data.name} (${sourcePage})`,
      text: `Pagină: ${sourcePage}\nNume: ${data.name}\nEmail: ${data.email}\nTelefon: ${data.phone || "-"}\n\nMesaj:\n${data.message}`
    });
  } catch (error) {
    console.error("[contact] SMTP send failed:", error);
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
      saved: true,
      emailSent: false,
      message:
        "Mesajul a fost înregistrat, dar notificarea email nu a putut fi trimisă. Echipa îl poate vedea în sistem."
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

  return Response.json({ ok: true, saved: true, emailSent: true });
}
