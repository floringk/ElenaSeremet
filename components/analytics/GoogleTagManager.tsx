"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const STORAGE_KEY = "es-cookie-consent";

type GoogleTagManagerProps = {
  gtmId: string;
};

export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    function sync() {
      try {
        setEnabled(window.localStorage.getItem(STORAGE_KEY) === "accepted");
      } catch {
        setEnabled(false);
      }
    }
    sync();
    window.addEventListener("cookie-consent-accepted", sync);
    return () => window.removeEventListener("cookie-consent-accepted", sync);
  }, []);

  if (!enabled || !gtmId) {
    return null;
  }

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">{`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `}</Script>
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
