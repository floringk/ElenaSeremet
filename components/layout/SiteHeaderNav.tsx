"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavServiceGroup } from "@/lib/nav-services";
import { navLinks } from "@/lib/site-data";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
  );
}

type SiteHeaderNavProps = {
  serviceGroups: NavServiceGroup[];
};

export function SiteHeaderNav({ serviceGroups }: SiteHeaderNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileSvcOpen, setMobileSvcOpen] = useState(false);
  const navId = useId();
  const megaId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const megaWrapRef = useRef<HTMLLIElement>(null);

  const closeMenu = useCallback(() => {
    setDrawerOpen(false);
    setMegaOpen(false);
    setMobileSvcOpen(false);
    requestAnimationFrame(() => {
      menuButtonRef.current?.focus();
    });
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((wasOpen) => {
      const next = !wasOpen;
      if (!next) {
        setMobileSvcOpen(false);
        requestAnimationFrame(() => {
          menuButtonRef.current?.focus();
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!drawerOpen && !megaOpen && !mobileSvcOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (megaOpen) {
        setMegaOpen(false);
        return;
      }
      if (mobileSvcOpen) {
        setMobileSvcOpen(false);
        return;
      }
      closeMenu();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, megaOpen, mobileSvcOpen, closeMenu]);

  useEffect(() => {
    function onResize() {
      setMegaOpen(false);
      setMobileSvcOpen(false);
    }
    const mq = window.matchMedia("(max-width: 1024px)");
    mq.addEventListener("change", onResize);
    return () => mq.removeEventListener("change", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
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
  }, [drawerOpen]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!megaOpen) return;
    function onDocMouseDown(event: MouseEvent) {
      const el = megaWrapRef.current;
      if (!el?.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [megaOpen]);

  const serviciiLink = navLinks.find((l) => l.href === "/servicii");
  const flatLinks = navLinks.filter((l) => l.href !== "/servicii");

  const toggleMega = () => {
    setMegaOpen((v) => !v);
  };

  const toggleMobileSvc = () => {
    setMobileSvcOpen((v) => !v);
  };

  return (
    <>
      {drawerOpen ? (
        <button
          type="button"
          className="nav-drawer-backdrop"
          aria-label="Închide meniul"
          onClick={closeMenu}
        />
      ) : null}
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""} ${drawerOpen ? "site-header--menu-open" : ""}`}>
        <div className="container header-inner">
          <Link href="/" className="logo-link focus-ring" onClick={closeMenu}>
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
            className={`menu-btn focus-ring ${drawerOpen ? "menu-btn--open" : ""}`}
            aria-expanded={drawerOpen}
            aria-controls={navId}
            aria-label={drawerOpen ? "Închide meniul" : "Deschide meniul"}
            onClick={toggleDrawer}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            ref={navRef}
            id={navId}
            className={`main-nav ${drawerOpen ? "open" : ""}`}
            data-open={drawerOpen ? "true" : undefined}
            aria-label="Navigație principală"
          >
            <ul className="main-nav-list">
              {flatLinks.slice(0, 2).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="main-nav-link focus-ring" onClick={closeMenu}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li ref={megaWrapRef} className="nav-item-mega">
                <button
                  type="button"
                  className={`main-nav-trigger focus-ring ${megaOpen ? "is-active" : ""}`}
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                  aria-controls={megaId}
                  id={`${megaId}-trigger`}
                  onClick={() => {
                    toggleMega();
                  }}
                >
                  {serviciiLink?.label ?? "Servicii"}
                  <span className="nav-mega-chevron" aria-hidden />
                </button>
                {megaOpen ? (
                  <div
                    id={megaId}
                    className="nav-mega-panel"
                    role="region"
                    aria-labelledby={`${megaId}-trigger`}
                  >
                    <div className="nav-mega-inner container">
                      <Link
                        href="/servicii"
                        className="nav-mega-overview focus-ring"
                        onClick={() => {
                          setMegaOpen(false);
                          closeMenu();
                        }}
                      >
                        <span className="nav-mega-overview-title">Toate serviciile</span>
                        <span className="nav-mega-overview-sub">Prezentare generală</span>
                      </Link>
                      <div className="nav-mega-columns">
                        {serviceGroups.map((group) => (
                          <div key={group.label} className="nav-mega-col">
                            <p className="nav-mega-col-label">{group.label}</p>
                            <ul className="nav-mega-links">
                              {group.items.map((item) => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    className="nav-mega-link focus-ring"
                                    onClick={() => {
                                      setMegaOpen(false);
                                      closeMenu();
                                    }}
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className={`nav-mobile-services nav-mobile-only ${mobileSvcOpen ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="nav-mobile-svc-toggle focus-ring"
                    aria-expanded={mobileSvcOpen}
                    onClick={toggleMobileSvc}
                  >
                    {serviciiLink?.label ?? "Servicii"}
                    <span className={`nav-mega-chevron nav-mega-chevron--mob ${mobileSvcOpen ? "is-open" : ""}`} aria-hidden />
                  </button>
                  {mobileSvcOpen ? (
                    <div className="nav-mobile-svc-panel">
                      <Link href="/servicii" className="nav-mobile-overview focus-ring" onClick={closeMenu}>
                        Toate serviciile →
                      </Link>
                      {serviceGroups.map((group) => (
                        <div key={group.label} className="nav-mobile-group">
                          <p className="nav-mobile-group-label">{group.label}</p>
                          <ul className="nav-mobile-group-list">
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <Link href={item.href} className="focus-ring" onClick={closeMenu}>
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
              {flatLinks.slice(2).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="main-nav-link focus-ring" onClick={closeMenu}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <div className="intro-strip">
        <div className="container intro-strip-inner">
          <p className="intro-strip-text">
            Studioul nostru oferă un ambient curat și primitor.{" "}
            <Link href="/despre-noi" className="intro-strip-link focus-ring">
              Despre noi
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
