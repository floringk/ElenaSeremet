# Deploy pe Vercel — checklist

## Poți publica acum?

**Da**, pentru **preview** (`*.vercel.app`). Nu există blocker tehnic major dacă urmezi pașii de mai jos.

Pentru **domeniul live** `elenaseremet.ro` — același deploy, plus DNS (etapă separată).

---

## Panou unificat CMS

| URL | Rol |
|-----|-----|
| `/cms` | **Sursă unică** — pagini, media, formulare contact, înscrieri, statistici trafic |
| `/admin` | Redirect → `/cms` (bookmark vechi) |
| `/admin/login` | Redirect → `/cms/login` |

**Login client:** user Payload creat cu `npm run cms:create-admin` (email + parolă setate în env la creare).

---

## Ghid rapid pentru client (non-tehnic)

1. Deschide **`/cms`** și autentifică-te.
2. **Pages** — editează text, titlu SEO, descriere; salvează.
3. **Imagini hero/OG** — câmpuri text cu path public (ex. `/content/images/NX6A7960-scaled.jpg`). Fișierele sunt în `mockups/content/images/`, sincronizate la build.
4. **Submissions** — mesaje formular contact.
5. **Membership Signups** — înscrieri abonament.
6. Dashboard sus — vizite 7/30 zile; link export CSV trafic.

**Previzualizare draft:** `https://site.ro/pagina?preview=true`

**Sync path-uri din CSV:** `npm run cms:sync-hero-paths` (citește `docs/image-map.csv`).

---

## Imagini (mod actual: path-uri)

- CMS: `heroImagePath`, `ogImagePath` — text, nu upload.
- Fișiere: `mockups/content/images/` → `public/content/` la build.
- Mapare pagini: [`docs/image-map.csv`](docs/image-map.csv).

### Storage Supabase + S3 (viitor, opțional)

Când vrei upload drag-and-drop în CMS:

1. Rulează [`scripts/supabase-storage-setup.sql`](scripts/supabase-storage-setup.sql)
2. Adaugă `@payloadcms/storage-s3` + colecția Media în Payload
3. Env: `SUPABASE_STORAGE_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`

---

## Impedimente / atenții

| Subiect | Situație |
|---------|----------|
| **Variabile de mediu** | Obligatorii la build **și** runtime. Fără ele, `npm run build` pe Vercel eșuează (vezi lista). |
| **SMTP** | Opțional: formularele se salvează în DB fără email. |
| **Imagini** | Path-uri `/content/images/...` în CMS; sync la build din `mockups/content/images/`. |
| **Payload CMS** | `PAYLOAD_SECRET` + `PAYLOAD_DATABASE_URL` (Supabase Postgres). |
| **`.env` local** | Nu se urcă pe Git — copiezi manual în Vercel. |

---

## Variabile minime (Vercel → Production + Preview)

### Obligatorii (build + site)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_HOST=localhost
SMTP_USER=preview
SMTP_PASS=preview
MAIL_FROM=preview@example.com
MAIL_TO=preview@example.com
ADMIN_USER=admin
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...   # min 32 caractere random
NEXT_PUBLIC_SITE_URL=https://elenaseremet.ro
```

### CMS (fără storage S3)

```
PAYLOAD_SECRET=
PAYLOAD_DATABASE_URL=
CONTENT_SOURCE=auto
```

### Marketing (opțional)

```
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
SITE_SAME_AS=https://instagram.com/...,https://facebook.com/...
```

---

## Pași deploy

1. Push pe GitHub → Vercel build automat.
2. Smoke test: `/`, `/preturi`, `/yoga`, `/contact`, `/inscriere`, `/cms`.
3. Editează o pagină în CMS → verifică pe site (fără redeploy).

---

## Go-live domeniu `elenaseremet.ro`

1. Vercel → **Domains** → adaugă `elenaseremet.ro` + `www`.
2. DNS la provider — A/CNAME conform Vercel.
3. `NEXT_PUBLIC_SITE_URL=https://elenaseremet.ro` pe Production.
4. **Google Search Console** — verifică domeniul, trimite sitemap: `https://elenaseremet.ro/sitemap.xml`.
5. Redirects WordPress vechi sunt în `next.config.mjs` (`redirects`).

---

## Comenzi locale

```bash
npm run lint
npm run typecheck
npm run build
npm run validate:content
npm run cms:sync-hero-paths   # path-uri hero din image-map.csv
npm run cms:import-membership # o dată, migrare istoric
```
