"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { navLinks } from "@/lib/site-data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo-link focus-ring">
          <Image
            src="/content/images/logo-moto-pilates-mat-9.png"
            alt="Pilates Studio Elena Seremet"
            className="logo"
            width={180}
            height={49}
            priority
          />
        </Link>
        <button
          type="button"
          className="menu-btn focus-ring"
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? "Inchide meniul" : "Deschide meniul"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id={navId} className={`main-nav ${open ? "open" : ""}`} aria-label="Navigatie principala">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
