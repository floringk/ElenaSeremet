"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { navLinks } from "@/lib/site-data";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => {
      menuButtonRef.current?.focus();
    });
  }, []);

  const toggleMenu = useCallback(() => {
    setOpen((wasOpen) => {
      const next = !wasOpen;
      if (!next) {
        requestAnimationFrame(() => {
          menuButtonRef.current?.focus();
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const nav = navRef.current;
    if (!nav) return;

    const list = getFocusableElements(nav);
    if (list[0]) {
      list[0].focus();
    }

    function onKeyDownNav(event: KeyboardEvent) {
      if (event.key !== "Tab" || list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    nav.addEventListener("keydown", onKeyDownNav);
    return () => nav.removeEventListener("keydown", onKeyDownNav);
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
            sizes="180px"
            priority
          />
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-btn focus-ring"
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? "Inchide meniul" : "Deschide meniul"}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          ref={navRef}
          id={navId}
          className={`main-nav ${open ? "open" : ""}`}
          aria-label="Navigatie principala"
        >
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring" onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
