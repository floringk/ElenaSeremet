"use client";

import { useEffect } from "react";
import "./globals.css";
import { reportRuntimeError } from "@/app/actions/report-runtime-error";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
    void reportRuntimeError({
      message: error.message || "Unknown error",
      digest: error.digest,
      pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
      stack: error.stack,
      scope: "root"
    });
  }, [error]);

  return (
    <html lang="ro">
      <body className="global-error-body">
        <main className="global-error-main">
          <h1>Eroare critica</h1>
          <p>
            Aplicatia nu a putut continua. Verifica conexiunea si incearca din nou. Daca problema persista, revino mai
            tarziu.
          </p>
          <button type="button" className="btn btn-primary focus-ring" onClick={() => reset()}>
            Reincarca
          </button>
        </main>
      </body>
    </html>
  );
}
