/** Resolve a public URL from a Payload media document, relation id, or legacy path. */
export type PayloadMediaLike = {
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
};

export function resolveMediaUrl(
  media: unknown,
  legacyPath?: string | null
): string | null {
  if (media && typeof media === "object") {
    const doc = media as PayloadMediaLike;
    if (typeof doc.url === "string" && doc.url.trim()) {
      return normalizePublicUrl(doc.url.trim());
    }
  }

  if (typeof legacyPath === "string" && legacyPath.trim()) {
    return normalizePublicUrl(legacyPath.trim());
  }

  return null;
}

export function resolveMediaAlt(media: unknown, fallback = ""): string {
  if (media && typeof media === "object") {
    const alt = (media as PayloadMediaLike).alt;
    if (typeof alt === "string" && alt.trim()) {
      return alt.trim();
    }
  }
  return fallback;
}

function normalizePublicUrl(s: string): string {
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) {
    return s;
  }
  return s.startsWith("/") ? s : `/${s.replace(/^\/+/, "")}`;
}

/** True when Supabase/S3 env is set — Payload uses @payloadcms/storage-s3. */
export function isS3StorageConfigured(): boolean {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || process.env.S3_BUCKET?.trim();
  return Boolean(
    bucket &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim() &&
      (process.env.S3_ENDPOINT?.trim() || process.env.SUPABASE_URL?.trim())
  );
}

export function getS3Bucket(): string {
  return (
    process.env.SUPABASE_STORAGE_BUCKET?.trim() ||
    process.env.S3_BUCKET?.trim() ||
    "cms-media"
  );
}

/** Build S3 endpoint for Supabase Storage when S3_ENDPOINT is omitted. */
export function getS3Endpoint(): string | undefined {
  const explicit = process.env.S3_ENDPOINT?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const supabaseUrl = process.env.SUPABASE_URL?.trim()?.replace(/\/$/, "");
  if (!supabaseUrl) return undefined;
  // https://<ref>.supabase.co → https://<ref>.storage.supabase.co/storage/v1/s3
  try {
    const u = new URL(supabaseUrl);
    const host = u.hostname.replace(".supabase.co", ".storage.supabase.co");
    return `${u.protocol}//${host}/storage/v1/s3`;
  } catch {
    return undefined;
  }
}
