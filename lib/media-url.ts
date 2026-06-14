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
      return doc.url.trim();
    }
  }

  if (typeof legacyPath === "string" && legacyPath.trim()) {
    const s = legacyPath.trim();
    if (s.startsWith("http://") || s.startsWith("https://")) {
      return s;
    }
    return s.startsWith("/") ? s : `/${s.replace(/^\/+/, "")}`;
  }

  return null;
}

export function isS3StorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_STORAGE_BUCKET?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim()
  );
}
