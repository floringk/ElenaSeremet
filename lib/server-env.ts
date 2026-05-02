import "server-only";

function getRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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
