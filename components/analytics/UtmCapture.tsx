"use client";

import { useEffect } from "react";

import { captureFirstTouchUtm } from "@/lib/utm";

/** Persists first-touch UTM/gclid in sessionStorage (no Google tokens required). */
export function UtmCapture() {
  useEffect(() => {
    captureFirstTouchUtm();
  }, []);

  return null;
}
