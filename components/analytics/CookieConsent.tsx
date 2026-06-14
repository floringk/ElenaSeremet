"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "es-cookie-consent";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("cookie-consent-accepted", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("cookie-consent-accepted", onStoreChange);
  };
}

function getConsentPending(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "accepted";
  } catch {
    return true;
  }
}

export function CookieConsent() {
  const visible = useSyncExternalStore(subscribe, getConsentPending, () => false);

  if (!visible) {
    return null;
  }

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("cookie-consent-accepted"));
  }

  return (
    <div className="cookie-consent" role="dialog" aria-label="Consimțământ cookie">
      <div className="container cookie-consent-inner">
        <p>
          Folosim cookie-uri pentru analiză trafic (Google Analytics). Continuând, accepți utilizarea
          lor.
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  );
}
