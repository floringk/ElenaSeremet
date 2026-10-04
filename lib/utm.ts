const STORAGE_KEY = "es-utm-first-touch";

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid"
] as const;

function sanitize(value: string): string {
  return value.trim().slice(0, 120);
}

/** Read UTM / gclid from the current URL (if any). */
export function readUtmFromLocation(search: string): UtmParams | null {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const out: UtmParams = {};
  let found = false;
  for (const key of UTM_KEYS) {
    const raw = params.get(key);
    if (raw) {
      out[key] = sanitize(raw);
      found = true;
    }
  }
  return found ? out : null;
}

/** First-touch: store once per session when landing with UTMs. */
export function captureFirstTouchUtm(): UtmParams | null {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing) as UtmParams;
    }
    const fromUrl = readUtmFromLocation(window.location.search);
    if (fromUrl) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
  } catch {
    /* private mode / SSR */
  }
  return null;
}

export function getStoredUtm(): UtmParams | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UtmParams;
  } catch {
    return null;
  }
}

/** Append attribution query to a path for CRM (source_page), max ~200 chars. */
export function withUtmAttribution(path: string, utm: UtmParams | null = getStoredUtm()): string {
  const base = path.split("?")[0] || path;
  if (!utm || Object.keys(utm).length === 0) return base;

  const qs = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const value = utm[key];
    if (value) qs.set(key, value);
  }
  const query = qs.toString();
  if (!query) return base;

  const full = `${base}?${query}`;
  return full.length <= 200 ? full : base;
}
