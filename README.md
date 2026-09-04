# ElenaSeremet
Redesign of Elena Seremet website.

## Tech stack

- Next.js (App Router) + React
- TypeScript
- Global styling in `app/globals.css`

## Local development

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Open:
   - `http://localhost:3000`
4. Validate content consistency:
   - `npm run validate:content`
5. Configure backend env:
   - copy `.env.example` to `.env.local` and fill values
6. (Optional) After Postgres is running, import legacy JSON into Payload:
   - `npm run import:pages`
7. Open the CMS:
   - `http://localhost:3000/cms` (separate from the custom analytics dashboard at `/admin`)

## App structure (layouts)

- **`app/(site)/`** — public site (header, footer, preview banner). Own root `<html>` / `<body>`.
- **`app/(payload)/`** — Payload CMS at `/cms`. Own root document via `@payloadcms/next` `RootLayout` (do not wrap with site chrome).
- There is **no** top-level `app/layout.tsx` so the admin panel is not nested inside `<main>`.

## Routes

- `/` Home
- `/despre-noi`
- `/servicii`
- `/preturi`
- `/schedules`
- `/contact`

Dynamic legacy slugs are generated from `mockups/content/site_manifest.json` and rendered from `mockups/content/raw/*.json` (or from Payload `pages` when `PAYLOAD_SECRET` + `PAYLOAD_DATABASE_URL` are set; see `CONTENT_SOURCE` in `.env.example`).

## Legacy compatibility

- `/content/*` paths are static files from `public/content` (copied from `mockups/content` at `npm run build` / `npm run dev`).
- Redirect aliases are configured in `next.config.mjs` (for example `/despre` -> `/despre-noi` and `/program` -> `/schedules`).

## Assets (site chrome)

Files in **`public/`** are served at the site root (`/favicon.ico`, `/og-default.jpg`, etc.). Page-level imagery stays under **`mockups/content/images/`** and is copied to **`public/content/images/`** at build, then served at **`/content/images/...`**.

| File | Purpose |
| --- | --- |
| `public/favicon.ico` | Browser tab icon |
| `public/apple-touch-icon.png` | iOS “Add to Home Screen” (180×180) |
| `public/og-default.jpg` | Default Open Graph / Twitter image when a page has no hero |
| `public/manifest.webmanifest` | Minimal install/manifest metadata |

Regenerate chrome raster assets from the legacy hero source image:

```bash
node scripts/bootstrap-public-assets.mjs
```

### Designer handoff — what to send

- **Site chrome / brand** → replace files in **`public/`** (keep filenames/URLs stable once live).
- **Hero and inline images** → **`mockups/content/images/`** (referenced from JSON or CMS).
- **Naming:** lowercase kebab-case, ASCII only (e.g. `pilates-mat-hero.jpg`).
- **Formats & sizes (targets):**
  - Favicon: `.ico` (multi-size) or PNG 32×32 at `public/favicon.ico`.
  - Apple touch: 180×180 PNG.
  - OG default: 1200×630 JPG/PNG, ~150–300 KB.
  - Hero images: ~1600×900 or 16∶9, JPG/WebP, ~250–500 KB.
  - Inline section images: max ~1200 px wide, JPG/WebP.
  - Logos: SVG preferred; PNG with transparency as fallback.
- **With each asset:** intended use (e.g. “OG default”, “Servicii hero”), route(s) where it appears, and **alt text in Romanian**.

Pointers for scripts and performance notes: [`scripts/README.md`](scripts/README.md).

**Front-end finish & client handoff (before production DevOps):** [`docs/PLAN-FRONT-CLIENT-HANDOFF.md`](docs/PLAN-FRONT-CLIENT-HANDOFF.md) — design, image mapping (`docs/image-map.csv`), responsive QA, Vercel preview for non-technical approval.

### SEO editable in Payload CMS (`/cms`)

When `PAYLOAD_SECRET` and `PAYLOAD_DATABASE_URL` are set:

- **Pages** collection — per slug: `metaTitle`, `description`, `ogImagePath`, `noIndex`, plus content fields.
- **Globals → Site Settings** — `defaultDescription` and **SEO — rute fixe** for `/contact`, `/galerie`, `/inscriere`, etc.

Import legacy JSON into CMS: `npm run import:pages`. Public site uses CMS when `CONTENT_SOURCE=auto` (default) or `cms`.

**CMS login** (`/cms/login`) — separate from `/admin` (which uses `ADMIN_USER` / `ADMIN_PASSWORD`):

- `PAYLOAD_ADMIN_EMAIL` / `PAYLOAD_ADMIN_PASSWORD` in `.env` are **only** for the setup scripts below — they are **not** checked when you type a password in the browser.
- CMS accounts live in Postgres schema **`payload`**, table **`users`**. Supabase Table Editor defaults to **`public`** (`form_submissions`, `page_events`, …) — switch the schema dropdown to **`payload`** to see CMS tables.

1. Set `PAYLOAD_SECRET`, `PAYLOAD_DATABASE_URL`, `PAYLOAD_ADMIN_EMAIL`, `PAYLOAD_ADMIN_PASSWORD` in `.env`.
2. Run `npm run cms:create-admin` once (creates `payload.*` tables if missing, then the first user).
3. Sign in at `http://localhost:3000/cms/login` with the **same** email/password you put in step 1.

If login fails or an old user exists (`admin@admin.com`, etc.): `npm run cms:reset-admin` — deletes all CMS users and recreates one from your `.env` values.

## Content QA

Checklist and route inventory: [`docs/content-qa.md`](docs/content-qa.md). After content edits run `npm run validate:content`.

## Pre-launch checklist (runbook)

Use this before DNS cutover or public announcement:

- [ ] **Vercel env (production):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, full SMTP set, `ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`; optional `PAYLOAD_SECRET`, `PAYLOAD_DATABASE_URL`, `CONTENT_SOURCE`, `INTERNAL_ALERT_KEY`, `SITE_SAME_AS`.
- [ ] **DNS:** apex + `www` → hosting; HTTPS valid.
- [ ] **CI:** `main` / `master` green — lint, TypeScript, production build.
- [ ] **Smoke on deployed URL:** `/`, a heavy or representative slug (e.g. `/pilates-mat`), `/contact`, `/admin` (login flow), `/sitemap.xml`, `/robots.txt`; confirm `POST /api/track` in Network tab on navigation.
- [ ] **Contact:** submission sends mail; if Payload DB is live, check `submissions` via `/admin` or CMS.
- [ ] **Runtime alerts:** in production only, verify error alerting path once (see [`app/actions/report-runtime-error.ts`](app/actions/report-runtime-error.ts)); remove any temporary throw route afterward.
- [ ] **Lighthouse (mobile):** acceptable scores on `/`, one heavy slug, `/contact` — record in [`scripts/README.md`](scripts/README.md).
- [ ] **`npm audit`:** triage current findings (see **Dependency audits**); no blind `npm audit fix --force`.

### Git publish (release)

1. Review `git status`; commit in logical groups (assets, SEO/layout, security/docs, content).
2. Confirm remote: `git remote -v`.
3. Push: `git push -u origin <branch>` — do **not** force-push rewritten shared history.
4. Tag when ready: `git tag -a v1.0.0 -m "Initial launch"` then `git push origin v1.0.0`.

## Release boundaries

Use separate commits for:
- content-model/data-layer changes (`lib/content.ts`, validators)
- rendering/composition changes (`app/`, `components/`)
- SEO/metadata changes (`app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, redirects)
- QA/docs updates (`scripts/`, `README.md`)

## Backend stack

- Form API: `POST /api/contact`
- Analytics API: `POST /api/track`
- Admin dashboard: `/admin` (login at `/admin/login`)
- Email sending: SMTP via `nodemailer`
- Storage: Supabase Postgres

### Supabase setup

1. Create a Supabase project.
2. Run SQL from `scripts/supabase-schema.sql` in SQL Editor.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.

### SMTP setup

Configure:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `MAIL_TO`

### Admin credentials

Set:
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### Payload CMS

- `PAYLOAD_SECRET` — random long string for sessions/crypto
- `PAYLOAD_DATABASE_URL` — Postgres connection string (see `@payloadcms/db-postgres`)
- `CONTENT_SOURCE` — `auto` (default), `cms` (Payload only), or `legacy` (JSON files only)

Contact form submissions are stored in Payload `submissions` when Payload DB env vars are set; otherwise they stay in Supabase `form_submissions`. Page analytics remain in Supabase `page_events`.

### Error alerts and SEO extras (optional)

- Runtime errors trigger **SMTP email alerts** to `MAIL_TO` in **production** only (same mailer as contact; see [`lib/alerts.ts`](lib/alerts.ts), [`app/actions/report-runtime-error.ts`](app/actions/report-runtime-error.ts)).
- Server-to-server alerts: `POST /api/internal/alert` with header `Authorization: Bearer <INTERNAL_ALERT_KEY>` (set in `.env`).
- Optional `SITE_SAME_AS` — comma-separated profile URLs for Organization JSON-LD (`sameAs`).

## Vercel deployment

The project is configured for Next.js deployment on [Vercel](https://vercel.com).

### Environment variables (production / preview)

In the Vercel project, set the same keys as in [`.env.example`](.env.example) (at minimum `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, full SMTP set, and admin session variables). The app reads these at **build** and **runtime** for server modules (for example `lib/server-env.ts`), so missing values can break the build. Optional Payload keys are only required if you use the CMS and contact storage in Payload.

### Smoke checklist (after deploy)

- [ ] Open `/` — home renders without errors
- [ ] Open a dynamic page (for example `/despre-noi`) — content and hero load
- [ ] Submit `/contact` — success or clear error; if using Payload, check delivery status in `/admin` or `/cms` as applicable
- [ ] Confirm analytics: browser network shows `POST /api/track` on navigation (or verify rows in Supabase `page_events`)
- [ ] `/admin` login works with configured credentials (staging or production)

### Continuous integration

On push/PR to `main` / `master`, GitHub Actions runs lint, TypeScript check, and production build (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)). The workflow removes `.next` before build so stale generated types under `.next/dev` cannot break the TypeScript step (if a local `next build` fails after route changes, delete `.next` and rebuild).

Commands: `npm run lint`, `npm run typecheck`, `npm run build` (set env vars like in CI if the build imports server modules).

### Security notes

- **Supabase service role** is used only in **server** code ([`lib/supabase-server.ts`](lib/supabase-server.ts), API routes, and server components). It must **never** be exposed to the browser or committed. If you add a public client, use the anon key and **RLS** policies instead.
- **Secrets modules** ([`lib/server-env.ts`](lib/server-env.ts), [`lib/supabase-server.ts`](lib/supabase-server.ts), [`lib/payload.ts`](lib/payload.ts), [`lib/alerts.ts`](lib/alerts.ts)) are server-only; client components must not import them or read secret env vars.
- **Admin session** uses an HMAC-signed cookie ([`lib/admin-auth.ts`](lib/admin-auth.ts)): `httpOnly`, `secure`, `sameSite: lax`. Keep `ADMIN_SESSION_SECRET` long (≥32 random bytes recommended) and private; rotate if leaked.
- **Internal alert API** ([`app/api/internal/alert/route.ts`](app/api/internal/alert/route.ts)) requires `INTERNAL_ALERT_KEY`; returns 503 if unset, 401 if the Bearer token does not match.
- **Rate limiting** on `POST /api/contact` is in-memory per process (see [`app/api/contact/route.ts`](app/api/contact/route.ts)) — for multi-instance production, add an edge or Redis-backed limiter if needed.
- **Response headers** ([`next.config.mjs`](next.config.mjs)): `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`. No CSP yet (avoid pre-launch regressions).

### Analytics retention

`page_events` can grow indefinitely. Optional: run [`scripts/prune-old-page-events.sql`](scripts/prune-old-page-events.sql) on a schedule in Supabase (e.g. monthly) or adjust the interval in that script.

### Dependency audits

Run `npm audit` periodically. **Snapshot (2026-05):** reports typically show **~16 moderate** issues, mostly **transitive** (Payload / Drizzle / editor toolchain). Do **not** run `npm audit fix --force` blindly — it can pin incompatible versions. Prefer upgrading direct dependencies (`next`, `payload`, `@payloadcms/*`) when maintainers release patched releases, then re-run `npm audit`.
