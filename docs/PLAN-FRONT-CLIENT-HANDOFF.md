# Plan: front-end finalization & client handoff

**Project:** Elena Seremet Pilates — site redesign (`ESSite`)  
**Goal:** A polished, responsive, image-complete site for **client visual approval** — **before** SMTP, Supabase production, Payload CMS, or full DevOps.  
**Audience for this doc:** Developer finishing the UI; later, a **non-technical owner** who gives design feedback and checks the live preview on Vercel.

---

## 1. Scope — what is in / out

### In scope (this phase)

| Area | Deliverable |
|------|-------------|
| **Design** | **Refine** the existing teal/lime theme (keep current colors & fonts) — spacing, templates, cards, heroes, typography rhythm — not a new mockup model |
| **Images** | Every page has intentional hero + inline images (no duplicate placeholders); gallery curated |
| **All pages** | 28 manifest routes + `/contact`, `/galerie`, `/galerie/[album]`, `/inscriere` — content readable, hierarchy clear |
| **Responsive** | Mobile-first layouts; tested at standard breakpoints |
| **Client review** | Stable **preview URL** on Vercel; simple feedback process |
| **Repository** | Git initialized, pushed to GitHub (or GitLab); Vercel connected |

### Out of scope (later — “production DevOps” phase)

Do **not** block front-end work on these; stub or hide UI if they distract the client:

- SMTP / contact email delivery
- Supabase analytics & form storage (production keys)
- Payload CMS setup & `import:pages`
- DNS cutover to `elenaseremet.ro`
- Admin dashboard (`/admin`) as a client-facing tool
- Lighthouse tuning on production infra (optional light check on preview is fine)
- `npm audit` remediation beyond safe minor bumps

**Contact & înscriere forms:** Keep visible for layout/UX review. Use success/error **mock states** or a banner: *“Formularul nu trimite email încă — doar previzualizare.”* Disable `POST` only if needed to avoid confusion; document in preview.

**Local / preview build without SMTP:** For `npm run build` and Vercel, set minimal env (see §8) — same values CI uses in `.github/workflows/ci.yml`.

---

## 2. Success criteria (definition of “front is done”)

The client (or proxy) can say **“da, așa vreau site-ul”** when all are true:

1. **Design** — One chosen direction (from mockups or client brief); no obvious “legacy WordPress” feel; header/footer/CTAs consistent.
2. **Images** — No repeated stock placeholder on multiple unrelated pages; heroes feel specific to each service/team page.
3. **Pages** — Every URL in the checklist (§6) opens without broken images or layout breaks.
4. **Mobile** — iPhone-width (~390px) and tablet (~768px) usable: nav, hero, text, cards, gallery, contact form.
5. **Desktop** — Wide screens (1280px+) do not look empty or stretched; images sharp, max-width controlled.
6. **Preview** — Client has one link (e.g. `https://elena-seremet-site.vercel.app`) and knows how to request changes.
7. **Handoff** — Repo on remote; Vercel project documented; short guide for non-technical owner (§10).

---

## 3. Phased work plan

### Phase A — Refine existing design (not a new theme)

**Direction (confirmed):** Keep current palette (`:root` in `globals.css`), **Inter + Lora**, teal primary + lime accents. Improve layout quality, not replace the brand.

**Input**

- Current site + `docs/Mockups.md` only if client asks for a specific section tweak
- Client feedback on spacing, hero size, card density, mobile nav

**Actions**

1. **Do not** swap color models or heading fonts unless client explicitly requests it.
2. Tune tokens only where needed: spacing scale, radius, shadows, section padding (same hues).
3. List components to refine (priority order):
   - `SiteHeader` / `SiteHeaderNav`
   - `SiteFooter`
   - `HomeTemplate`
   - `Hero`, `PageBlocks`, `ServiceGrid`, `PricingCards`, `ScheduleBlock`
   - `RichLegacyTemplate`, `AboutTemplate`, `TeamTemplate`, `ServiciiHubTemplate`, `PricingTemplate`
   - `ContactTemplate`, `ContactForm`, gallery (`AlbumMasonry`)
   - `Button`, `Card`, `Reveal`

**Out of scope for A:** Changing Romanian copy unless client requests it.

#### 3.1 Design lock (fill when decided)

| Item | Choice |
|------|--------|
| Base model | _e.g. Model 1 — Calm Premium_ |
| Background / text / primary / accent | _hex codes_ |
| Heading font | _e.g. Playfair Display_ |
| Body font | _e.g. Inter_ |
| Button style | _solid / outline / radius_ |
| Hero pattern | _split / full-bleed / centered_ |
| Client sign-off date | _YYYY-MM-DD_ |

---

### Phase B — Image mapping (2–4 days)

**How images work today**

- Page content: `mockups/content/raw/<slug>.json` → `images[]` with `local_path` (e.g. `images/foo.jpg`).
- Runtime URL: `/content/images/foo.jpg` via `app/content/[...path]/route.ts`.
- Hero: first suitable raster in `images[]` (see `lib/content.ts` → `getPrimaryImagePath`).
- New shoots: `mockups/content/images/new/<Album Name>/*.jpg` — used by `/galerie`, **not** auto-linked to pages.

**Problem to fix**

- Many pages share the same `iStock-*.jpg` placeholder (copy of `Elena-scaled.jpg`).
- `schedules` uses `images/placeholder.png`.
- Rich studio photos in `images/new/` are underused on service pages.

**Workflow**

1. **Create inventory** — spreadsheet `docs/image-map.csv` (template below).
2. **Per page:** pick 1 hero + 0–3 inline images from:
   - `mockups/content/images/new/Elena Seremet Pilates Studio/`
   - `mockups/content/images/new/Shooting Elena Reformere/`
   - Existing `mockups/content/images/` (legacy)
3. **Rename / export** — lowercase kebab-case, ASCII; target widths per README (hero ~1600×900, inline ≤1200px).
4. **Update JSON** — edit `local_path` and `alt` (Romanian, descriptive) in each `raw/<slug>.json`.
5. **Validate** — `npm run validate:content` (must stay 0 warnings).
6. **Optional script** — later: small script to read `image-map.csv` and patch JSON (not required for v1).

**Image map CSV template** (`docs/image-map.csv`)

```csv
slug,page_title,template_kind,hero_filename,hero_alt,inline_1,inline_1_alt,inline_2,inline_2_alt,notes,client_ok
index,Acasă,home,elena-seremet-pilates-studio-0120.jpg,Studio Pilates Elena Seremet,,,,,,
pilates-mat,Pilates Mat,rich-service,reformere-0056-retouched.jpg,Clasă Pilates mat,,,,,,
```

**Suggested hero themes (starting point — adjust with client)**

| Slug / group | Suggested source album | Notes |
|--------------|------------------------|--------|
| `index`, `despre-noi` | Elena Seremet Pilates Studio | Studio wide / welcome |
| `servicii`, service slugs (`pilates-mat`, `pilates-reformer`, `yoga`, …) | Shooting Elena Reformere or studio | Match activity in filename |
| `instructori`, `elena-seremet`, `adelina-csolti`, `gabriela-ostafe` | Portraits from studio or existing team assets | Faces visible, consistent crop |
| `preturi`, `schedules` | Studio or schedule graphic | Replace `placeholder.png` on schedules |
| `contact` | App page — optional hero in `app/contact/` layout | May use static image in component |

**Gallery (`/galerie`)**

- Keep albums as folders under `images/new/`.
- Decide with client: link “Galerie” in main nav? (recommended for rich photo proof).
- Curate album **cover** image = first file alphabetically today — rename e.g. `_cover.jpg` prefix if you add cover logic later.

---

### Phase C — Design implementation (5–10 days)

**Principles**

- Change **tokens + shared components** first; then templates.
- One PR-sized chunk per area (header → home → services → rest) so client can review incrementally on preview branch.
- Remove dead CSS classes (e.g. unused `model5-*` if switching model).

**Tasks checklist**

- [ ] Replace `:root` palette and typography in `globals.css`
- [ ] Update `app/layout.tsx` font imports
- [ ] Redesign header: logo area, nav, mobile drawer, services mega-menu
- [ ] Redesign footer: contact, social, legal
- [ ] Home: hero, services strip, team teaser, CTA band
- [ ] Service pages: hero + sidebar/CTA (`ServiceLeadCta`), readable body (`PageBlocks`)
- [ ] Pricing & schedule: tables/cards legible on mobile
- [ ] Team grid: consistent card aspect ratio
- [ ] Contact & înscriere: form fields, focus states, spacing
- [ ] Gallery: masonry/grid polish, lightbox optional (nice-to-have)
- [ ] `not-found` + `error` pages on-brand
- [ ] Favicon / OG — run `npm run assets:bootstrap` after final hero chosen

**Drastic design = measurable shifts**

- New font pairing and scale (clear h1/h2/body rhythm)
- Strong hero photography (not small side image)
- Consistent card elevation and section backgrounds
- Micro-interactions only where they help (`Reveal` — respect `prefers-reduced-motion`)
- Accessible contrast (WCAG AA for body text on backgrounds)

---

### Phase D — Responsive & cross-page QA (2–3 days)

**Breakpoints to test** (Chrome DevTools device mode + one real phone)

| Width | Label | Focus |
|-------|--------|--------|
| 320px | Small phone | Nav, overflow, font size |
| 390px | iPhone 14 | Primary mobile target |
| 768px | Tablet | Nav collapse, grids → 2 col |
| 1024px | Laptop | Hero split |
| 1280px+ | Desktop | Max container, image quality |

**Per-page pass** — for each URL in §6:

- [ ] No horizontal scroll
- [ ] Hero image crops acceptably (`object-fit`)
- [ ] Headings not orphaned awkwardly
- [ ] Tap targets ≥ 44px (buttons, nav links)
- [ ] Images use `next/image` with sensible `sizes` where applicable
- [ ] Long Romanian words wrap (pricing tables, schedules)

**Expand CSS media queries** — today `globals.css` has few `@media` blocks; add systematic sections:

- Header / mobile menu
- Home hero (stack on mobile)
- Service grid (1 → 2 → 3 columns)
- Pricing cards
- Gallery masonry
- Footer columns

**Regression command**

```bash
npm run validate:content
npm run typecheck
npm run lint
```

For production build locally, use §8 env vars then `npm run build`.

---

### Phase E — Client validation loop (ongoing, ~1 week calendar)

**Preview environment**

- Vercel **Preview** deployments on every push to a branch (e.g. `preview` or PR).
- Optional: lock **one** stable URL — Vercel “Production” branch = `preview` until launch, then switch to `main`.

**Review rounds**

| Round | Focus | Client action |
|-------|--------|----------------|
| R1 | Home + nav + footer | Approve structure & colors |
| R2 | Services hub + 3 sample services | Approve imagery & templates |
| R3 | Prețuri, program, contact | Approve tables/forms layout |
| R4 | Team + bios + gallery | Approve portraits & gallery |
| R5 | Full site sweep | Final “DA” |

**Feedback format for non-technical client** (copy to email/WhatsApp):

```
Pagină: [lipsește sau lipește URL din browser]
Ce nu e bine: [prea mic / culoare / poză greșită / text]
Ce vreau: [descriere simplă]
Prioritate: [urgent / poate aștepta]
```

Developer translates into: CSS change, JSON image path, or copy tweak — **not** open-ended “make it prettier.”

---

### Phase F — Git + Vercel (after visual sign-off)

**When:** Client R5 = approved (§2).

#### F1 — Git repository

```bash
cd ESSite
git init
git add .
git commit -m "Front-end ready for client-approved preview"
```

Create remote (GitHub recommended), push:

```bash
git remote add origin https://github.com/<org>/elena-seremet-site.git
git branch -M main
git push -u origin main
```

**`.gitignore`** must include: `node_modules/`, `.next/`, `.env`, `.env.local` (never commit secrets).

#### F2 — Vercel project

1. Log in at [vercel.com](https://vercel.com) (account owned by studio or agency).
2. **Add New Project** → Import Git repository.
3. Framework: **Next.js** (auto-detected).
4. **Environment variables** (minimum for build — §8).
5. Deploy → copy **Production URL**.

#### F3 — Branch strategy for non-technical handoff

| Branch | Purpose | Who touches it |
|--------|---------|----------------|
| `main` | Approved preview / future production | Developer after client OK |
| `design-feedback` | Experiments from client rounds | Developer only |
| PRs optional | If a second dev joins | — |

**Owner does not need to use Git.** They only open the Vercel URL and send feedback to the developer.

---

## 4. Complete page checklist (manifest + app routes)

Use during Phase D. Mark: ✅ OK | ⚠️ minor | ❌ broken

### Core marketing

| URL | Slug | Template | Priority |
|-----|------|----------|----------|
| `/` | index | home | P0 |
| `/despre-noi` | despre-noi | about | P0 |
| `/servicii` | servicii | servicii-hub | P0 |
| `/preturi` | preturi | pricing | P0 |
| `/schedules` | schedules | rich-generic | P0 |
| `/contact` | — | React page | P0 |
| `/inscriere` | — | membership form | P1 |
| `/galerie` | — | gallery index | P1 |
| `/galerie/<album>` | — | album | P1 |

### Services (`pageType: servicii`)

| URL | Slug |
|-----|------|
| `/tonifiere` | tonifiere |
| `/yogalates-stretching` | yogalates-stretching |
| `/postural` | postural |
| `/pilates-mat` | pilates-mat |
| `/yoga` | yoga |
| `/yoga-3` | yoga-3 |
| `/sedinte-private` | sedinte-private |
| `/masaj-si-drenaj` | masaj-si-drenaj |
| `/pilates-reformer` | pilates-reformer |

### Team & bios

| URL | Slug |
|-----|------|
| `/instructori` | instructori |
| `/elena-seremet` | elena-seremet |
| `/adelina-csolti` | adelina-csolti |
| `/gabriela-ostafe` | gabriela-ostafe |

### Other content pages

| URL | Slug |
|-----|------|
| `/pilates-props` | pilates-props |
| `/abcpilates` | abcpilates |
| `/healthy-spine` | healthy-spine |
| `/fit-pilates` | fit-pilates |
| `/personal-training` | personal-training |
| `/elastic-band` | elastic-band |
| `/total-body` | total-body |
| `/circuit` | circuit |
| `/inregistrare-clienti` | inregistrare-clienti |

**Redirects to spot-check:** `/despre` → `/despre-noi`, `/program` → `/schedules`.

---

## 5. File map for developers

| Task | Primary files |
|------|----------------|
| Global design tokens | `app/globals.css`, `app/layout.tsx` |
| Page templates | `components/templates/*.tsx` |
| Sections | `components/sections/*.tsx` |
| Layout chrome | `components/layout/SiteHeader*.tsx`, `SiteFooter.tsx` |
| Page content & heroes | `mockups/content/raw/*.json`, `mockups/content/site_manifest.json` |
| Images on disk | `mockups/content/images/**` |
| Gallery logic | `lib/new-gallery.ts`, `app/galerie/**` |
| Contact UI | `app/contact/page.tsx`, `components/contact/ContactForm.tsx` |
| SEO (defer deep work) | `lib/seo.ts`, `app/sitemap.ts` |
| Mockup reference | `docs/Mockups.md`, `mockups/model-*.html` |

---

## 6. Minimal environment for preview builds (no real SMTP)

Copy to Vercel → **Settings → Environment Variables** (Production + Preview):

```
SUPABASE_URL=https://ci-placeholder.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ci-placeholder-service-role-key-for-builds-only
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=preview
SMTP_PASS=preview
MAIL_FROM=preview@example.com
MAIL_TO=preview@example.com
ADMIN_USER=admin
ADMIN_PASSWORD=preview-only-change-me
ADMIN_SESSION_SECRET=preview-admin-session-secret-min-32-chars-long
```

Do **not** give the client admin password. `/admin` is out of scope for their review.

Local: copy `.env.example` → `.env.local` with the same placeholder values if `npm run build` fails.

---

## 7. After front-end: production DevOps (separate project)

Hand this section to whoever owns launch **after** visual approval:

| Step | Action |
|------|--------|
| 1 | Real Supabase project + `scripts/supabase-schema.sql` |
| 2 | Real SMTP (Zoho / studio mail) |
| 3 | Replace placeholder env on Vercel |
| 4 | Test `POST /api/contact` and analytics |
| 5 | Optional Payload CMS + `npm run import:pages` |
| 6 | DNS: `elenaseremet.ro` → Vercel |
| 7 | README pre-launch checklist (`README.md`) |
| 8 | Search Console + sitemap submit |

Estimated effort: **2–4 days** for someone who knows Vercel/Supabase — independent of design work.

---

## 8. Guide for non-technical owner (Romanian — de trimis clientului)

### Ce este site-ul acum?

Este o **previzualizare** a noului site al studioului. Nu trimite încă emailuri din formularul de contact — doar arată cum va arăta.

### Cum văd site-ul?

Vi se trimite un link de tip:  
`https://…………vercel.app`  
Deschideți linkul pe **telefon** și pe **laptop**.

### Cum dau feedback?

Trimiteți mesaje structurate:

1. **Linkul paginii** (copiați din browser, ex. `…/pilates-mat`)
2. **Ce nu vă place** (ex. „poza prea întunecată”, „titlul prea mic pe telefon”)
3. **Ce vă doriți** (ex. „poză cu reformer”, „culoare mai caldă”)
4. **Urgență** (trebuie neapărat / poate aștepta)

### Când spunem „gata”?

Când toate paginile importante arată bine pe telefon și calculator, răspundeți explicit: **„Aprob previzualizarea”**. Abia apoi se face legarea la domeniul real `elenaseremet.ro` și formularele reale.

### Ce nu trebuie să faceți

- Nu editați fișiere pe computer
- Nu vă logați în Vercel decât dacă vi se cere doar să **deschideți** linkul de deploy
- Nu vă faceți griji pentru email / baze de date — vine într-o etapă următoare

---

## 9. Guide for inheriting non-technical owner (English)

You are **not expected to code**. Your role after the developer leaves:

1. **Review** the Vercel preview link when you receive design updates.
2. **Send structured feedback** (page URL + what’s wrong + what you want) to your contractor or agency.
3. **Say “approved”** once — in writing — when the look is final.
4. **Verify deployment** on Vercel (see below).

### Verifying deployment on Vercel (5 minutes)

Someone must add you to the Vercel team (**Viewer** is enough):

1. Open [vercel.com/dashboard](https://vercel.com/dashboard).
2. Click the project (e.g. `elena-seremet-site`).
3. **Deployments** tab → top row should be **Ready** (green).
4. Click **Visit** — same site you expect.
5. If the developer said they published today, check **Created** time matches.

If the site is broken (white screen, 500):

- Screenshot the error.
- Send the deployment URL to your developer — do not change settings yourself.

### When you need changes later

Always reference the **live preview URL** and the **page path**. Avoid “change the third button on the page about yoga” without the link.

---

## 10. Timeline estimate (solo developer)

| Phase | Duration | Depends on |
|-------|----------|------------|
| A — Design lock | 1–2 days | Client meeting |
| B — Image mapping | 2–4 days | Photo selection |
| C — Design build | 5–10 days | Scope of “drastic” |
| D — Responsive QA | 2–3 days | — |
| E — Client rounds | 5–7 calendar days | Client responsiveness |
| F — Git + Vercel | 0.5 day | — |
| **Total** | **~3–4 weeks** | Parallel client feedback |

---

## 11. Risk register

| Risk | Mitigation |
|------|------------|
| Client changes mind on colors after full build | Lock Phase A in writing; charge for major pivot |
| Same photo on many pages | Enforce `image-map.csv` review before JSON edits |
| Build fails on Vercel | Use §6 placeholder env; check build logs |
| Forms confuse client | Preview banner; disable submit or mock success |
| Owner edits Vercel env and breaks site | Viewer-only access; document “do not touch env” |
| Large images slow mobile | Compress WebP/JPEG before commit; target sizes in README |

---

## 12. Immediate next actions (developer)

1. [ ] Schedule **30 min design lock** with client → fill §3.1 table.
2. [ ] Create `docs/image-map.csv` from template in §3 Phase B.
3. [ ] Replace top 5 priority heroes: `index`, `despre-noi`, `servicii`, `pilates-mat`, `pilates-reformer`.
4. [ ] Implement new tokens in `globals.css` + header/footer.
5. [ ] Run `npm run dev` — mobile check home + contact.
6. [ ] Init git + push when R1 ready for client eyes.

---

## 13. Related docs

| Doc | Use |
|-----|-----|
| `README.md` | Tech stack, asset specs, eventual production checklist |
| `docs/Mockups.md` | Design models 1–6 |
| `docs/content-qa.md` | Per-slug content notes |
| `docs/PLAN-PROIECT-REAL.md` | Historical early plan (superseded by this doc for front-end) |
| `scripts/README.md` | Image sizes, Lighthouse after deploy |

---

*Document version: 2026-05-16 — front-end & handoff plan.*
