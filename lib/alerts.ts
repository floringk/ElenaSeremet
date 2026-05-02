import "server-only";

import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { serverEnv } from "@/lib/server-env";

export type ErrorAlertInput = {
  subject: string;
  message: string;
  context?: Record<string, unknown>;
};

const DEDUPE_TTL_MS = 10 * 60 * 1000;
const dedupeUntil = new Map<string, number>();

function pruneDedupe(now: number): void {
  for (const [key, until] of dedupeUntil) {
    if (until < now) dedupeUntil.delete(key);
  }
}

function hashDedupeKey(subject: string, message: string): string {
  const slice = message.slice(0, 200);
  return crypto.createHash("sha256").update(`${subject}\n${slice}`).digest("hex");
}

/**
 * Sends an operational email alert using the same SMTP config as the contact form.
 * Dedupes identical alerts within a short window to avoid storms.
 */
export async function sendErrorAlert(input: ErrorAlertInput): Promise<void> {
  const now = Date.now();
  pruneDedupe(now);

  const key = hashDedupeKey(input.subject, input.message);
  const existing = dedupeUntil.get(key);
  if (existing && existing > now) {
    return;
  }
  dedupeUntil.set(key, now + DEDUPE_TTL_MS);

  const lines = [
    input.message,
    "",
    input.context ? `Context: ${JSON.stringify(input.context, null, 2)}` : null
  ].filter(Boolean);

  const transporter = nodemailer.createTransport({
    host: serverEnv.smtpHost,
    port: serverEnv.smtpPort,
    secure: serverEnv.smtpSecure,
    auth: {
      user: serverEnv.smtpUser,
      pass: serverEnv.smtpPass
    }
  });

  try {
    await transporter.sendMail({
      from: serverEnv.mailFrom,
      to: serverEnv.mailTo,
      subject: input.subject,
      text: lines.join("\n")
    });
  } catch (error) {
    console.error("[alerts] Failed to send error alert email:", error);
  }
}
