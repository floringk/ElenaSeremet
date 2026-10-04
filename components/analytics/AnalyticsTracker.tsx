"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/cookie-consent";
import { trackMarketingEvent } from "@/lib/data-layer";
import { getStoredUtm } from "@/lib/utm";

/**
 * Internal Supabase page_events + GTM dataLayer page/click events (after consent).
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function sync() {
      setAllowed(hasAnalyticsConsent());
    }
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // SPA page views → /api/track + dataLayer (GA4 History Change / custom trigger)
  useEffect(() => {
    if (!allowed || !pathname) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "page_view",
        path: pathname,
        referrer: document.referrer || ""
      })
    }).catch(() => {
      // Fire-and-forget
    });

    trackMarketingEvent("virtual_page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
      ...getStoredUtm()
    });
  }, [allowed, pathname]);

  // Delegated clicks: tel + /inscriere CTAs
  useEffect(() => {
    if (!allowed) return;

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      if (href.startsWith("tel:")) {
        trackMarketingEvent("tel_click", {
          link_url: href,
          link_text: (anchor.textContent || "").trim().slice(0, 80)
        });
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname === "/inscriere" || url.pathname.startsWith("/inscriere/")) {
          trackMarketingEvent("inscriere_click", {
            link_url: url.pathname + url.hash,
            link_text: (anchor.textContent || "").trim().slice(0, 80),
            page_path: window.location.pathname
          });
        }
      } catch {
        /* ignore invalid href */
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [allowed]);

  return null;
}
