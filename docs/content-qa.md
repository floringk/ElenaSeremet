# Content QA checklist

Inventory is driven by [`mockups/content/site_manifest.json`](../mockups/content/site_manifest.json) plus static App Router pages (`/contact` is a dedicated React page, not legacy JSON).

## Automated validation

From repo root:

```bash
npm run validate:content
```

Fix any reported drift before deploy.

## Per-page verification

For each slug below (and `/`), confirm:

- Title and meta description match intent (no duplicate boilerplate).
- Canonical URL and OG/Twitter image resolve (`buildPageMetadata` in [`lib/seo.ts`](../lib/seo.ts)); default OG is `/og-default.jpg` when no hero.
- Hero image loads (no broken `/content/...` paths).
- Inline images in blocks load.
- Internal links resolve (no 404s); legacy redirects in [`next.config.mjs`](../next.config.mjs) cover common aliases.
- Romanian copy reads cleanly (no obvious broken HTML imports).

## Routes (from manifest)

| Slug | Notes |
| --- | --- |
| `index` | `/` — home |
| `preturi` | Pricing |
| `gabriela-ostafe` | Team/bio |
| `pilates-props` | Content page |
| `abcpilates` | Content page |
| `healthy-spine` | Content page |
| `tonifiere` | Service-style |
| `yogalates-stretching` | Service-style |
| `fit-pilates` | Content page |
| `servicii` | Services hub |
| `postural` | Service-style |
| `instructori` | Team listing |
| `adelina-csolti` | Bio |
| `personal-training` | Content page |
| `inregistrare-clienti` | Registration |
| `schedules` | Program |
| `pilates-mat` | Service — heavier imagery candidate |
| `elastic-band` | Content page |
| `despre-noi` | About |
| `yoga` | Service-style |
| `contact` | Legacy JSON exists; live `/contact` uses [`app/contact/page.tsx`](../app/contact/page.tsx) |
| `total-body` | Content page |
| `yoga-3` | Service-style |
| `sedinte-private` | Service-style |
| `circuit` | Content page |
| `elena-seremet` | Bio |
| `masaj-si-drenaj` | Service-style |
| `pilates-reformer` | Service-style |

## Static / non-manifest routes

- `/contact` — contact form client page.
- `/admin`, `/admin/login` — dashboard (auth required).
- `/cms`, `/cms/*` — Payload admin when configured.
- `/sitemap.xml`, `/robots.txt` — SEO endpoints.

## QA status

Last structured pass: **2026-05** — `npm run validate:content` clean (0 warnings). **Hero images:** each manifest page has a random photo from `mockups/content/images/new/` (see `npm run images:assign-random`) — alt text marked *temporar, de revizuit*; replace via `docs/image-map.csv` after human review. Spot-check heroes on `/`, `/despre-noi`, `/pilates-reformer`, `/servicii`. Replace this paragraph after each full manual audit.
