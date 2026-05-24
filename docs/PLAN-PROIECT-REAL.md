# Plan – Proiectul pe bune (site nou)

## Ce avem deja

- **Conținut:** `content/raw/*.json` + `content/images/` + `site_manifest.json` (28 pagini: acasă, despre, servicii, prețuri, program, contact, instructori, pagini servicii etc.)
- **Design:** 6 mockups HTML; clientul alege 1 stil (sau o combinație) → devine design system-ul
- **Deploy:** Vercel configurat; mockups-urile merg pe Vercel

---

## Ce e nevoie (pe scurt)

| Ce | Detaliu |
|----|--------|
| **1. Alegere design** | Un model (1–6) sau reguli clare (culori, fonturi) din `Mockups.md` |
| **2. Stack** | Next.js (App Router) + TypeScript, host pe Vercel |
| **3. Structură site** | Pagini: Acasă, Despre noi, Servicii (listă + pagini individuale), Prețuri, Program, Contact, Instructori (+ profiluri) |
| **4. Conținut în proiect** | JSON-urile din `content/raw/` mutate/importate în Next (date statice sau CMS ulterior) |
| **5. Form contact** | Form pe /contact → serverless (API route) → email (ex. Zoho SMTP) |
| **6. SEO & live** | Meta per pagină, sitemap, robots, (opțional) redirects de la domeniul vechi |

---

## Plan pe pași (ordine logică)

### Faza 1 – Decizie și setup (înainte de cod)

1. **Alegere model UI** – Clientul confirmă 1 din cele 6 modele (sau mix). Notezi culori + fonturi din `Mockups.md`.
2. **Listă pagini finale** – Ce rute vrei exact (ex: `/`, `/despre-noi`, `/servicii`, `/servicii/[slug]`, `/preturi`, `/program`, `/contact`, `/instructori`, `/instructori/[slug]`). Poți folosi `content/site_manifest.json` ca bază.
3. **Setup proiect Next.js** – În repo (subfolder sau repo nou): `npx create-next-app@latest` (App Router, TypeScript, fără Tailwind dacă vrei CSS propriu, sau cu Tailwind). Conectezi repo-ul la Vercel (același sau alt proiect).

### Faza 2 – Design system și layout

4. **Design system minimal** – Tokens (culori, fonturi, spacing) pe baza modelului ales; componente: Header, Footer, butoane, carduri, inputuri.
5. **Layout și rute goale** – Layout principal (header + footer), pagini pentru fiecare rută (conținut placeholder dacă e nevoie).

### Faza 3 – Conținut și pagini

6. **Încărcare conținut** – Citești JSON-urile din `content/raw/` (la build sau din `/content` copiat în proiect). Poți folosi `site_manifest.json` pentru lista de pagini.
7. **Pagini principale** – Acasă, Despre, Servicii (grid + [slug]), Prețuri, Program, Contact, Instructori (+ [slug]) – fiecare cu datele din JSON-uri.
8. **Imagini** – Folosești `content/images/` și eventual `Assets/`; în Next: `next/image`, optimizare, path-uri corecte.

### Faza 4 – Form și SEO

9. **Form contact** – Form pe `/contact`; API Route (serverless) care trimite email (Zoho sau alt SMTP); mesaje success/error; opțional honeypot/rate limit.
10. **SEO** – Meta title/description per pagină, OG tags, favicon, `sitemap.xml`, `robots.txt`. Opțional: Schema.org (LocalBusiness).

### Faza 5 – Live

11. **Domeniu** – DNS către Vercel; verificare SSL.
12. **Redirects (dacă există site vechi)** – Reguli 301 de la URL-uri WordPress (sau alte) către noile rute, păstrate în `vercel.json` sau în Next.
13. **Verificări** – Lighthouse, test form, linkuri, 404; Search Console + sitemap.

---

## Tehnologii recomandate

| Scop | Opțiune |
|------|--------|
| Framework | **Next.js 14+** (App Router) |
| Limbaj | **TypeScript** |
| Styling | **Tailwind CSS** (rapid) sau CSS modules + variabile (ca în mockups) |
| Hosting | **Vercel** (deja folosit) |
| Email (form) | **API Route** + Nodemailer sau Zoho SMTP |
| Conținut (acum) | **JSON static** din `content/`; mai târziu poți trece la CMS (Sanity, etc.) |

---

## Următorul pas concret

1. **Alege modelul** (1–6) și confirmă rutele (poți lista aici: Acasă, Despre, Servicii, …).
2. După asta se poate face: **creare proiect Next.js** în repo (ex. folder `site/` sau repo nou) + **design tokens** pe baza modelului ales + **Layout + prima pagină (Acasă)** cu conținut din `content/raw/index.json`.

Dacă vrei, următorul pas pe care îl putem face împreună este: **setup Next.js + structura de foldere + prima pagină Acasă** folosind conținutul și unul dintre modele.
