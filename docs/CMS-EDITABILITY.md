# CMS editability — hartă & status

Ce poate edita studio-ul din `/cms`, fără redeploy (cu Payload + DB configurate).

---

## Legendă

| Status | Sens |
|--------|------|
| ✅ | Editabil din CMS, wired pe site |
| 🔧 | Necesită env / SQL o dată (Storage) |
| ↩ | Fallback din cod / JSON dacă CMS e gol |

---

## Colecții & globals

| Resursă | Status | Unde pe site |
|---------|--------|--------------|
| **Media** (upload) | ✅ (+ 🔧 S3) | Hero, OG, inline, echipă, galerie |
| **Pagini** | ✅ | Copy, SEO, hero upload, `contentImages`, `pageType` |
| **Albume galerie** | ✅ | `/galerie`, `/galerie/[slug]` (↩ FS `mockups/.../new` dacă CMS gol) |
| **Settings** | ✅ | SEO rute fixe + OG upload |
| **Studio** | ✅ | Adresă, telefon, carduri home, echipă |
| **Navigare** | ✅ | Header + footer links (↩ `site-data` dacă gol) |
| **Prețuri** | ✅ | `/preturi`, înscriere |
| **Program** | ✅ | Calendar + ore footer/contact |
| **Submissions / Membership** | ✅ | Inbox |

---

## Imagini (upload)

1. Rulează `scripts/supabase-storage-setup.sql`
2. Setează env S3 (vezi `.env.example`)
3. Redeploy → în `/cms` apare **Media** + upload pe pagini

Fără S3: Media scrie local în `media/` (ok pe local; pe Vercel ephemeral — configurează S3 pentru production).

Path-uri legacy `/content/images/...` rămân ca fallback pe câmpurile `*Path`.

---

## Fișiere cheie

```
payload.config.ts              # schema + s3Storage plugin
lib/media-url.ts               # resolve URL + S3 helpers
lib/content.ts                 # normalize pages + contentImages
lib/cms-studio.ts              # studio chrome
lib/cms-navigation.ts          # nav links
lib/cms-gallery.ts             # albums CMS → site
lib/cms-program.ts / pricing / settings
components/layout/SiteHeader.tsx / SiteFooter.tsx
app/(site)/[slug]/page.tsx     # getAllSlugsMerged + dynamicParams
```

---

## Fallback-uri

| Zonă | Dacă CMS e gol |
|------|----------------|
| Nav / footer / contact hours | `lib/site-data.ts` + Program default |
| Servicii / echipă home | `site-data` services/team |
| Galerie | foldere `mockups/content/images/new` |
| Conținut pagină | JSON legacy (`CONTENT_SOURCE=auto`) |

---

## Ops (nu e „lipsă CMS”)

- SMTP contact pe production
- Seed Media din path-uri existente (opțional: `cms:sync-hero-paths`)
- Completare globals Studio / Navigare / Albume după go-live

## Seed ready-for-use (local)

```bash
npm run import:pages      # pagini din JSON legacy
npm run cms:seed-ready    # Media + Studio/Nav/Program/Pricing + albume galerie
```

Re-rulează oricând; e idempotent (update pe existente).

## Local / Vercel — conexiune DB

Payload citește DB din (în ordine): `PAYLOAD_DATABASE_URL` → `POSTGRES_URL_NON_POOLING` → `POSTGRES_URL`.

| Problemă | Fix |
|----------|-----|
| `.env` arată spre proiect vechi `nuqdmsmq…` (DNS ENOTFOUND) | Folosește proiectul live `mzqgwmsmoifxjjrptmwi` (ca pe Vercel / `.env.local`) |
| Pe Vercel există `POSTGRES_*` dar `/cms` crapă | Redeploy după fallback-ul de mai sus; sau setează explicit `PAYLOAD_DATABASE_URL` = `POSTGRES_URL_NON_POOLING` |
| Bucket upload | `node scripts/setup-cms-storage.mjs` (sau SQL din `scripts/supabase-storage-setup.sql`) + chei S3 |
| Admin user | `npm run cms:create-admin` după ce DB răspunde |

---

*Implementare: Media + S3, contentImages, studio/nav/team, gallery CMS, rute din slug-uri CMS.*
