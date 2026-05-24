import "server-only";

/** Safe placeholders for local dev, CI, and `next build` (not used at runtime on Vercel/production). */
const PLACEHOLDERS: Record<string, string> = {
  SUPABASE_URL: "https://dev-placeholder.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "dev-placeholder-service-role-key",
  SMTP_HOST: "localhost",
  SMTP_USER: "dev",
  SMTP_PASS: "dev",
  MAIL_FROM: "dev@localhost.test",
  MAIL_TO: "dev@localhost.test",
  ADMIN_USER: "admin",
  ADMIN_PASSWORD: "dev",
  ADMIN_SESSION_SECRET: "dev-admin-session-secret-min-32-characters-long"
};

function isNextProductionBuild(): boolean {
  const phase = process.env.NEXT_PHASE;
  return phase === "phase-production-build" || phase === "phase-export";
}

function getRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (value) {
    return value;
  }
  if (process.env.NODE_ENV !== "production" && PLACEHOLDERS[name]) {
    return PLACEHOLDERS[name];
  }
  if (isNextProductionBuild() && PLACEHOLDERS[name]) {
    return PLACEHOLDERS[name];
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

export const serverEnv = {
  supabaseUrl: getRequired("SUPABASE_URL"),
  supabaseServiceRoleKey: getRequired("SUPABASE_SERVICE_ROLE_KEY"),
  smtpHost: getRequired("SMTP_HOST"),
  smtpPort: Number(process.env.SMTP_PORT || "587"),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: getRequired("SMTP_USER"),
  smtpPass: getRequired("SMTP_PASS"),
  mailFrom: getRequired("MAIL_FROM"),
  mailTo: getRequired("MAIL_TO"),
  adminUser: getRequired("ADMIN_USER"),
  adminPassword: getRequired("ADMIN_PASSWORD"),
  adminSessionSecret: getRequired("ADMIN_SESSION_SECRET")
};
