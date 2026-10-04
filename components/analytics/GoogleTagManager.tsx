"use client";

import Script from "next/script";
import { useEffect } from "react";

import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/cookie-consent";
import {
  applyConsentDefaults,
  readStoredAnalyticsGranted,
  syncConsentMode
} from "@/lib/data-layer";

type GoogleTagManagerProps = {
  gtmId: string;
};

/**
 * Consent Mode defaults → optional restore from localStorage → GTM container.
 * GTM loads even before Accept; tags that need analytics wait for consent update.
 */
export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  useEffect(() => {
    applyConsentDefaults();
    syncConsentMode(readStoredAnalyticsGranted());

    function onConsentChange() {
      syncConsentMode(hasAnalyticsConsent());
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    window.addEventListener("storage", onConsentChange);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
      window.removeEventListener("storage", onConsentChange);
    };
  }, []);

  if (!gtmId) {
    return null;
  }

  // Inline bootstrap must run before gtm.js. Keep as one Script so order is guaranteed.
  const bootstrap = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500
    });
    try {
      var raw = localStorage.getItem('es-cookie-consent');
      var analytics = false;
      if (raw === 'accepted') { analytics = true; }
      else if (raw) {
        var parsed = JSON.parse(raw);
        analytics = !!(parsed && parsed.version === 1 && parsed.analytics === true);
      }
      if (analytics) {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
    } catch (e) {}
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;

  return (
    <>
      <Script id="gtm-consent-bootstrap" strategy="afterInteractive">
        {bootstrap}
      </Script>
      <noscript>
        <iframe
          title="Google Tag Manager"
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
