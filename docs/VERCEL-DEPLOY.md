# Deploy pe Vercel — checklist

## Poți publica acum?

**Da**, pentru **preview** (`*.vercel.app`). Nu există blocker tehnic major dacă urmezi pașii de mai jos.

Pentru **domeniul live** `elenaseremet.ro` — același deploy, plus DNS (etapă separată).

---

## Impedimente / atenții

| Subiect | Situație |
|---------|----------|
| **Variabile de mediu** | Obligatorii la build **și** runtime. Fără ele, `npm run build` pe Vercel eșuează (vezi lista). |
| **SMTP** | Opțional pentru funcționare: formularele se salvează în DB fără email. Poți lăsa SMTP gol sau placeholder la preview. |
| **Imagini** | Site-ul servește multe fișiere din `mockups/content/images/` — repo mare, primul deploy poate dura mai mult. |
| **Payload CMS** | Funcționează pe Vercel dacă setezi `PAYLOAD_SECRET` + `PAYLOAD_DATABASE_URL` (Supabase Postgres). |
| **`.env` local** | Nu se urcă pe Git — copiezi manual în Vercel → Settings → Environment Variables. |
| **Secrets în Git** | Nu comite `.env`. |

---

## Variabile minime (Vercel → Production + Preview)

Copiază din `.env` local sau `.env.example`:

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
```

> La **preview**, SMTP poate fi placeholder (formularele merg în DB, fără email).

### Recomandate (CMS + conținut)

```
PAYLOAD_SECRET=...         # generezi tu (random 32+ chars)
PAYLOAD_DATABASE_URL=...   # connection string Postgres Supabase
CONTENT_SOURCE=auto        # CMS dacă e configurat, altfel JSON
```

### Opționale

```
INTERNAL_ALERT_KEY=
SITE_SAME_AS=
```

---

## Pași deploy (prima dată)

1. **Git** — push pe GitHub/GitLab (branch `main`).
2. **Vercel** — [vercel.com/new](https://vercel.com/new) → Import repo `ESSite`.
3. **Framework** — Next.js (detectat automat; există `vercel.json`).
4. **Environment Variables** — adaugă lista de mai sus (Production + Preview).
5. **Deploy** — aștepți build verde → **Visit**.
6. **Smoke test**:
   - `/` — hero + navigare
   - `/pilates-mat` — pagină serviciu + formular înscriere
   - `/contact` — trimite mesaj → verifică Supabase / admin
   - `/cms/login` — admin CMS (dacă Payload e configurat)
   - `/sitemap.xml`, `/robots.txt`

---

## După deploy

- **CMS**: `https://<proiect>.vercel.app/cms` — user din `payload.users` (nu din `.env` direct).
- **Admin analytics**: `https://<proiect>.vercel.app/admin` — `ADMIN_USER` / `ADMIN_PASSWORD`.
- **Import pagini** (o dată, local sau script): `npm run import:pages` (cu aceleași env DB).

---

## Când vrei domeniul real

1. Vercel → Project → **Domains** → adaugi `elenaseremet.ro` (+ `www`).
2. La DNS (provider domeniu) — înregistrările indicate de Vercel (A/CNAME).
3. Aștepți propagare (min–ore).
4. Opțional: redirect `www` → apex sau invers.

---

## Comenzi locale înainte de push

```bash
npm run lint
npm run typecheck
npm run build
npm run validate:content
```

Dacă `build` trece local cu env complet, șanse mari să treacă și pe Vercel.
