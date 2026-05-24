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
        <h1>Ceva nu a funcționat</h1>
        <p>
          Ne pare rău, a apărut o eroare la afișarea acestei pagini. Poți încerca din nou sau te poți întoarce la
          pagina principală.
        </p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary focus-ring" onClick={() => reset()}>
            Încearcă din nou
          </button>
          <Link href="/" className="btn btn-secondary focus-ring">
            Mergi la Acasă
          </Link>
        </div>
      </div>
    </section>
  );
}
