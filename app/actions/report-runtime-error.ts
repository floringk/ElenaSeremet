"use server";

import { sendErrorAlert } from "@/lib/alerts";

export type RuntimeErrorPayload = {
  message: string;
  digest?: string;
  pathname?: string;
  stack?: string;
  scope?: "route" | "root";
};

/**
 * Called from client error boundaries. Emails only in production when SMTP is configured (via serverEnv).
 */
export async function reportRuntimeError(payload: RuntimeErrorPayload): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.error("[runtime-error]", payload);
    return;
  }

  const path = payload.pathname || "unknown";
  const subject = `[${payload.scope === "root" ? "Global" : "App"}] Eroare ${path}`;

  const body = [
    `Mesaj: ${payload.message}`,
    payload.digest ? `Digest: ${payload.digest}` : null,
    payload.stack ? `Stack:\n${payload.stack}` : null
  ]
    .filter(Boolean)
    .join("\n\n");

  await sendErrorAlert({
    subject,
    message: body,
    context: {
      pathname: path,
      digest: payload.digest,
      scope: payload.scope
    }
  });
}
