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

## Routes

- `/` Home
- `/despre-noi`
- `/servicii`
- `/preturi`
- `/schedules`
- `/contact`

Dynamic legacy slugs are generated from `mockups/content/site_manifest.json` and rendered from `mockups/content/raw/*.json` (or from Payload `pages` when `PAYLOAD_SECRET` + `PAYLOAD_DATABASE_URL` are set; see `CONTENT_SOURCE` in `.env.example`).

## Legacy compatibility

- `/content/*` paths are served from `mockups/content/*` by `app/content/[...path]/route.ts`.
- Redirect aliases are configured in `next.config.mjs` (for example `/despre` -> `/despre-noi` and `/program` -> `/schedules`).

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
- **Admin session** uses an HMAC-signed cookie ([`lib/admin-auth.ts`](lib/admin-auth.ts)). Keep `ADMIN_SESSION_SECRET` long and private; rotate if leaked.
- **Rate limiting** on `POST /api/contact` is in-memory per process (see [`app/api/contact/route.ts`](app/api/contact/route.ts)) — for multi-instance production, add an edge or Redis-backed limiter if needed.

### Analytics retention

`page_events` can grow indefinitely. Optional: run [`scripts/prune-old-page-events.sql`](scripts/prune-old-page-events.sql) on a schedule in Supabase (e.g. monthly) or adjust the interval in that script.

### Dependency audits

Run `npm audit` periodically. Some moderate findings may remain in **transitive** packages (for example the Payload / Drizzle / Monaco editor chain). Do **not** run `npm audit fix --force` blindly — it can pin incompatible versions. Prefer upgrading direct dependencies (`next`, `payload`, `@payloadcms/*`) when maintainers release patched releases.
