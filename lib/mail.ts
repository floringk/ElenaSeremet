import "server-only";

const PLACEHOLDER_HOSTS = new Set(["localhost", "127.0.0.1"]);
const PLACEHOLDER_USERS = new Set(["dev", "test", "placeholder"]);

/** True when real SMTP credentials are set (not dev placeholders). */
export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim() ?? "";
  const user = process.env.SMTP_USER?.trim() ?? "";
  const pass = process.env.SMTP_PASS?.trim() ?? "";
  const from = process.env.MAIL_FROM?.trim() ?? "";
  const to = process.env.MAIL_TO?.trim() ?? "";

  if (!host || !user || !pass || !from || !to) {
    return false;
  }

  if (PLACEHOLDER_HOSTS.has(host.toLowerCase()) && PLACEHOLDER_USERS.has(user.toLowerCase())) {
    return false;
  }

  if (from.includes("localhost.test") || to.includes("localhost.test")) {
    return false;
  }

  return true;
}

export function getSmtpEnv() {
  return {
    host: process.env.SMTP_HOST!.trim(),
    port: Number(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER!.trim(),
    pass: process.env.SMTP_PASS!.trim(),
    from: process.env.MAIL_FROM!.trim(),
    to: process.env.MAIL_TO!.trim()
  };
}
