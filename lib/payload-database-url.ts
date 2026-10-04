/**
 * Resolve Postgres URL for Payload.
 * Vercel Marketplace often exposes POSTGRES_URL(_NON_POOLING) without PAYLOAD_DATABASE_URL.
 */
export function resolvePayloadDatabaseUrl(): string {
  const candidates = [
    process.env.PAYLOAD_DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL
  ];
  for (const raw of candidates) {
    const value = raw?.trim();
    if (value && !value.includes("[SENSITIVE]")) {
      return value;
    }
  }
  return "";
}

export function isPayloadEnvConfigured(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET?.trim() && resolvePayloadDatabaseUrl());
}
