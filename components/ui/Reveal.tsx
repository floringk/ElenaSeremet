"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay steps (uses CSS transition-delay). */
  delay?: 0 | 1 | 2 | 3 | 4;
};

export function Reveal({ children, className = "", delay }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "-32px 0px -32px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
