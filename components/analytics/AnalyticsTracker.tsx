"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "page_view",
        path: pathname,
        referrer: document.referrer || ""
      })
    }).catch(() => {
      // Fire-and-forget analytics event.
    });
  }, [pathname]);

  return null;
}
