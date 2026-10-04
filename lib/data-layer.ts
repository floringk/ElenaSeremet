import {
  COOKIE_CONSENT_STORAGE_KEY,
  hasAnalyticsConsent,
  parseConsentPreferences
} from "@/lib/cookie-consent";

export type DataLayerObject = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Ensure dataLayer + gtag stub exist (Consent Mode / GTM). */
export function ensureDataLayer(): void {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(..._args: unknown[]) {
      // Match Google's snippet: dataLayer.push(arguments)
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
}

/**
 * Consent Mode v2 defaults — call as early as possible, before GTM.
 * Ads stay denied until we add a marketing category; analytics follows banner.
 */
export function applyConsentDefaults(): void {
  ensureDataLayer();
  window.gtag?.("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });
}

/** Sync Consent Mode with stored preferences (analytics on/off). */
export function syncConsentMode(analyticsGranted?: boolean): void {
  ensureDataLayer();
  const granted = analyticsGranted ?? hasAnalyticsConsent();
  const value = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    analytics_storage: value,
    // No ads/marketing category yet — keep denied for SEM readiness without firing ad tags.
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
}

/** Read localStorage during bootstrap (inline script + client). */
export function readStoredAnalyticsGranted(): boolean {
  try {
    return (
      parseConsentPreferences(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY))?.analytics ===
      true
    );
  } catch {
    return false;
  }
}

export function pushDataLayer(payload: DataLayerObject): void {
  ensureDataLayer();
  window.dataLayer?.push(payload);
}

/** Custom events for GTM → GA4 / Ads (only after analytics consent). */
export function trackMarketingEvent(event: string, params: DataLayerObject = {}): void {
  if (!hasAnalyticsConsent()) return;
  pushDataLayer({
    event,
    ...params
  });
}
