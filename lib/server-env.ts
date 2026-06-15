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

/** Lazy getters — reading Supabase vars must not require SMTP/admin at import time. */
export const serverEnv = {
  get supabaseUrl() {
    return getRequired("SUPABASE_URL");
  },
  get supabaseServiceRoleKey() {
    return getRequired("SUPABASE_SERVICE_ROLE_KEY");
  },
  get smtpHost() {
    return getRequired("SMTP_HOST");
  },
  get smtpPort() {
    return Number(process.env.SMTP_PORT || "587");
  },
  get smtpSecure() {
    return process.env.SMTP_SECURE === "true";
  },
  get smtpUser() {
    return getRequired("SMTP_USER");
  },
  get smtpPass() {
    return getRequired("SMTP_PASS");
  },
  get mailFrom() {
    return getRequired("MAIL_FROM");
  },
  get mailTo() {
    return getRequired("MAIL_TO");
  },
  get adminUser() {
    return getRequired("ADMIN_USER");
  },
  get adminPassword() {
    return getRequired("ADMIN_PASSWORD");
  },
  get adminSessionSecret() {
    return getRequired("ADMIN_SESSION_SECRET");
  }
};
