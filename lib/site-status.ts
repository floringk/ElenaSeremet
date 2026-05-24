import "server-only";

import { isSmtpConfigured } from "@/lib/mail";

export function isPayloadConfigured(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET?.trim() && process.env.PAYLOAD_DATABASE_URL?.trim());
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!url || !key) return false;
  if (url.includes("dev-placeholder") || key.includes("dev-placeholder")) return false;
  return true;
}

/** Contact or membership can persist when either backend is available. */
export function isFormsDatabaseConfigured(): boolean {
  return isPayloadConfigured() || isSupabaseConfigured();
}

export function getPreviewBannerMessage(): string | null {
  const db = isFormsDatabaseConfigured();
  const smtp = isSmtpConfigured();

  if (!db && !smtp) {
    return "Formularele nu sunt încă conectate la baza de date sau email. Poți revizui designul și conținutul.";
  }

  if (db && !smtp) {
    return "Mesajele și înscrierile se salvează în baza de date. Notificările email vor fi activate la publicare.";
  }

  if (!db && smtp) {
    return "Email este configurat, dar salvarea în baza de date lipsește — verifică variabilele Supabase / Payload.";
  }

  return null;
}
