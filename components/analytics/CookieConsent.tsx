"use client";

import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore } from "react";

import {
  COOKIE_CONSENT_EVENT,
  createConsentPreferences,
  hasAnsweredConsent,
  readConsentPreferences,
  writeConsentPreferences
} from "@/lib/cookie-consent";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  };
}

function getConsentPending(): boolean {
  return !hasAnsweredConsent();
}

export function CookieConsent() {
  const pending = useSyncExternalStore(subscribe, getConsentPending, () => false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const titleId = useId();
  const prefsId = useId();

  useEffect(() => {
    const current = readConsentPreferences();
    if (current) {
      setAnalyticsEnabled(current.analytics);
      setManageOpen(false);
      return;
    }
    setAnalyticsEnabled(false);
  }, [pending, panelOpen]);

  function save(analytics: boolean) {
    const previous = readConsentPreferences();
    writeConsentPreferences(createConsentPreferences(analytics));
    setPanelOpen(false);
    setManageOpen(false);
    // Reload so already-injected GTM/GA scripts are fully unloaded on revoke.
    if (previous?.analytics && !analytics) {
      window.location.reload();
    }
  }

  // Floating control to reopen preferences after a choice was made
  if (!pending) {
    return (
      <>
        <button
          type="button"
          className="cookie-manage-trigger focus-ring"
          onClick={() => {
            setAnalyticsEnabled(readConsentPreferences()?.analytics ?? false);
            setPanelOpen(true);
            setManageOpen(true);
          }}
          aria-haspopup="dialog"
        >
          Cookie
        </button>
        {panelOpen ? (
          <div className="cookie-consent cookie-consent--panel" role="dialog" aria-labelledby={prefsId}>
            <div className="container cookie-consent-inner cookie-consent-inner--panel">
              <PreferencesPanel
                titleId={prefsId}
                analyticsEnabled={analyticsEnabled}
                onAnalyticsChange={setAnalyticsEnabled}
                onSave={() => save(analyticsEnabled)}
                onAcceptAll={() => save(true)}
                onReject={() => save(false)}
                onClose={() => setPanelOpen(false)}
                showClose
              />
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby={titleId} aria-modal="false">
      <div className="container cookie-consent-inner">
        {!manageOpen ? (
          <>
            <div className="cookie-consent-copy">
              <p id={titleId}>
                Folosim cookie-uri necesare pentru funcționarea site-ului și, cu acordul tău, cookie-uri
                de analiză (Google Analytics) pentru a înțelege cum e folosit site-ul.{" "}
                <Link href="/politica-cookie" className="cookie-consent-link">
                  Politica de cookie-uri
                </Link>
              </p>
            </div>
            <div className="cookie-consent-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => save(false)}>
                Doar necesare
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setManageOpen(true)}
              >
                Preferințe
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => save(true)}>
                Acceptă tot
              </button>
            </div>
          </>
        ) : (
          <PreferencesPanel
            titleId={titleId}
            analyticsEnabled={analyticsEnabled}
            onAnalyticsChange={setAnalyticsEnabled}
            onSave={() => save(analyticsEnabled)}
            onAcceptAll={() => save(true)}
            onReject={() => save(false)}
            onClose={() => setManageOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

type PreferencesPanelProps = {
  titleId: string;
  analyticsEnabled: boolean;
  onAnalyticsChange: (value: boolean) => void;
  onSave: () => void;
  onAcceptAll: () => void;
  onReject: () => void;
  onClose?: () => void;
  showClose?: boolean;
};

function PreferencesPanel({
  titleId,
  analyticsEnabled,
  onAnalyticsChange,
  onSave,
  onAcceptAll,
  onReject,
  onClose,
  showClose
}: PreferencesPanelProps) {
  return (
    <div className="cookie-prefs">
      <div className="cookie-prefs-header">
        <h2 id={titleId} className="cookie-prefs-title">
          Preferințe cookie
        </h2>
        {showClose && onClose ? (
          <button type="button" className="cookie-prefs-close focus-ring" onClick={onClose} aria-label="Închide">
            ×
          </button>
        ) : null}
      </div>
      <p className="cookie-prefs-intro">
        Alege ce categorii accepți. Cookie-urile necesare sunt mereu active. Detalii în{" "}
        <Link href="/politica-cookie" className="cookie-consent-link">
          politica de cookie-uri
        </Link>
        .
      </p>

      <ul className="cookie-prefs-list">
        <li className="cookie-prefs-item">
          <div className="cookie-prefs-item-text">
            <p className="cookie-prefs-item-title">Necesare</p>
            <p className="cookie-prefs-item-desc">
              Asigură funcționarea de bază (preferința ta de consimțământ, navigare). Nu pot fi dezactivate.
            </p>
          </div>
          <label className="cookie-switch">
            <input type="checkbox" checked disabled aria-label="Cookie-uri necesare, mereu active" />
            <span className="cookie-switch-ui" aria-hidden />
          </label>
        </li>
        <li className="cookie-prefs-item">
          <div className="cookie-prefs-item-text">
            <p className="cookie-prefs-item-title">Analiză</p>
            <p className="cookie-prefs-item-desc">
              Google Analytics / Tag Manager — statistici anonimizate despre trafic și pagini vizitate.
            </p>
          </div>
          <label className="cookie-switch">
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(event) => onAnalyticsChange(event.target.checked)}
              aria-label="Cookie-uri de analiză"
            />
            <span className="cookie-switch-ui" aria-hidden />
          </label>
        </li>
      </ul>

      <div className="cookie-consent-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onReject}>
          Doar necesare
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onSave}>
          Salvează preferințele
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onAcceptAll}>
          Acceptă tot
        </button>
      </div>
    </div>
  );
}
