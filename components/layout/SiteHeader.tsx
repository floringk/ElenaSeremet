"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { navLinks } from "@/lib/site-data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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
          className="menu-btn focus-ring"
          aria-expanded={open}
          aria-label="Deschide meniul"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`main-nav ${open ? "open" : ""}`} aria-label="Navigatie principala">
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
