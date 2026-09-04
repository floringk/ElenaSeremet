import "server-only";

import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { getSmtpEnv, isSmtpConfigured } from "@/lib/mail";

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
  if (!isSmtpConfigured()) {
    return;
  }

  dedupeUntil.set(key, now + DEDUPE_TTL_MS);

  const lines = [
    input.message,
    "",
    input.context ? `Context: ${JSON.stringify(input.context, null, 2)}` : null
  ].filter(Boolean);

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
      subject: input.subject,
      text: lines.join("\n")
    });
  } catch (error) {
    console.error("[alerts] Failed to send error alert email:", error);
  }
}
