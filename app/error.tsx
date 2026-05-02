"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportRuntimeError } from "@/app/actions/report-runtime-error";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
    void reportRuntimeError({
      message: error.message || "Unknown error",
      digest: error.digest,
      pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
      stack: error.stack,
      scope: "route"
    });
  }, [error]);

  return (
    <section className="page-section error-shell">
      <div className="container">
        <h1>Ceva nu a functionat</h1>
        <p>
          Ne pare rau, a aparut o eroare la afisarea acestei pagini. Poti incerca din nou sau te poti intoarce la
          pagina principala.
        </p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary focus-ring" onClick={() => reset()}>
            Incearca din nou
          </button>
          <Link href="/" className="btn btn-secondary focus-ring">
            Mergi la Acasa
          </Link>
        </div>
      </div>
    </section>
  );
}
