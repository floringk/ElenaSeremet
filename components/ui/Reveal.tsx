"use client";

import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay steps (uses CSS transition-delay). */
  delay?: 0 | 1 | 2 | 3 | 4;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return true;
}

export function Reveal({ children, className = "", delay }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [intersected, setIntersected] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "-32px 0px -32px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const visible = prefersReducedMotion || intersected;

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-in" : ""} ${className}`.trim()}
      data-reveal-delay={delay != null && delay > 0 ? String(delay) : undefined}
    >
      {children}
    </div>
  );
}
