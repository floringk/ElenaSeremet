export const COOKIE_CONSENT_STORAGE_KEY = "es-cookie-consent";
export const COOKIE_CONSENT_EVENT = "cookie-consent-changed";

export type CookieConsentPreferences = {
  version: 1;
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

export function createConsentPreferences(analytics: boolean): CookieConsentPreferences {
  return {
    version: 1,
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString()
  };
}

export function parseConsentPreferences(raw: string | null): CookieConsentPreferences | null {
  if (!raw) return null;

  // Legacy: previous banner stored only "accepted"
  if (raw === "accepted") {
    return createConsentPreferences(true);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
    if (parsed?.version !== 1 || typeof parsed.analytics !== "boolean") {
      return null;
    }
    return {
      version: 1,
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function readConsentPreferences(): CookieConsentPreferences | null {
  try {
    return parseConsentPreferences(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeConsentPreferences(preferences: CookieConsentPreferences): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: preferences }));
}

export function hasAnsweredConsent(): boolean {
  return readConsentPreferences() !== null;
}

export function hasAnalyticsConsent(): boolean {
  return readConsentPreferences()?.analytics === true;
}
