# Analytics · SEO · SEM — status & mapă fișiere

Document de lucru: ce e făcut, unde trăiește în cod, ce rămâne (manual Google / Ads).

---

## Legendă

| Status | Sens |
|--------|------|
| ✅ | Implementat în repo |
| 🔧 | Config manual — **necesită token / acces Google** |
| ⏳ | Următorul pas după tokeni (sau date lipsă: geo, social) |

---

## Stop-line (fără tokeni analytics)

**Tot ce trebuia în cod, fără GTM/GA/Ads, e gata.**  
Site-ul funcționează cu `NEXT_PUBLIC_GTM_ID` gol (GTM nu se încarcă; consent + tracker intern + UTM rămân active).

### Când primești acces — doar atât:

| # | Acțiune | Env / UI |
|---|---------|----------|
| 1 | Pune container GTM pe Vercel Production | `NEXT_PUBLIC_GTM_ID=GTM-…` |
| 2 | În GTM: tag **GA4 Configuration** (`G-…`) | GTM UI |
| 3 | Trigger Custom Event → GA4 Event pentru: `virtual_page_view`, `contact_submit`, `tel_click`, `inscriere_click` | GTM UI |
| 4 | Search Console: verify (HTML tag sau DNS) + submit sitemap | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=…` sau DNS |
| 5 | (opțional) `SITE_SAME_AS`, `SITE_GEO_LAT` / `SITE_GEO_LNG` | Vercel env |
| 6 | (ulterior SEM) Google Ads conversion pe aceleași evenimente + categorie Marketing în banner | Ads + cod |

Nu e nevoie de alte schimbări de aplicație pentru pașii 1–4.

---

## 1. Cookie consent & Consent Mode v2

| Item | Status | Unde |
|------|--------|------|
| Banner Accept tot / Doar necesare / Preferințe | ✅ | `components/analytics/CookieConsent.tsx` |
| Categorii: Necesare (locked) + Analiză | ✅ | același + CSS în `app/globals.css` (`.cookie-*`) |
| Storage preferințe | ✅ | `lib/cookie-consent.ts` → `localStorage` key `es-cookie-consent` |
| Redeschidere preferințe | ✅ | buton flotant „Cookie” |
| Politică cookie (pagină) | ✅ | `app/(site)/politica-cookie/page.tsx` + link footer |
| Consent Mode v2 default denied | ✅ | `lib/data-layer.ts` + bootstrap în `GoogleTagManager.tsx` |
| `analytics_storage` update la Accept/Refuz | ✅ | `syncConsentMode()` + event `cookie-consent-changed` |
| `ad_*` storage | ✅ denied | pregătit SEM; **fără** categorie marketing încă |
| Reload la revoke analytics | ✅ | `CookieConsent` |

---

## 2. Google Analytics / GTM

| Item | Status | Unde |
|------|--------|------|
| GTM container după Consent Mode bootstrap | ✅ | `components/analytics/GoogleTagManager.tsx` (no-op dacă lipsește ID) |
| Env ID | 🔧 | `NEXT_PUBLIC_GTM_ID` |
| GA4 Configuration tag în GTM | 🔧 | după acces GTM |
| Link GA4 ↔ Search Console | 🔧 | după acces |
| Tracker intern (Supabase `page_events`) | ✅ | `AnalyticsTracker.tsx` → `POST /api/track` |
| Layout wiring | ✅ | `app/(site)/layout.tsx` |

### Evenimente `dataLayer`

| Event name | Când | Unde |
|------------|------|------|
| `virtual_page_view` | navigare SPA după consent | `AnalyticsTracker.tsx` (+ UTM dacă există) |
| `contact_submit` | formular contact OK | `ContactForm.tsx` |
| `tel_click` | click pe `tel:` | `AnalyticsTracker.tsx` |
| `inscriere_click` | click link `/inscriere` | `AnalyticsTracker.tsx` |

Helper: `trackMarketingEvent()` în `lib/data-layer.ts`.

---

## 3. SEO (fără tokeni — gata)

| Item | Status | Unde |
|------|--------|------|
| Metadata / canonical / OG | ✅ | `lib/seo.ts`, `lib/page-metadata.ts`, layout |
| `robots.txt` pe `siteUrl` | ✅ | `app/robots.ts` |
| `sitemap.xml` pe `siteUrl` (+ `/politica-cookie`) | ✅ | `app/sitemap.ts` |
| JSON-LD Organization + LocalBusiness + program | ✅ | `lib/seo.ts` |
| Geo LocalBusiness | ✅ hook | `SITE_GEO_LAT` / `SITE_GEO_LNG` (gole până ai coordonate) |
| Search Console meta verify | ✅ hook | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` |
| `SITE_SAME_AS` (social) | ⏳ env | când ai URL-uri Instagram/FB |
| Submit sitemap în GSC | 🔧 | după verify |
| Audit copy title/description | ⏳ | CMS / conținut (nu blochează analytics) |

---

## 4. SEM prep (fără Ads token)

| Item | Status | Note |
|------|--------|------|
| Conversion events în `dataLayer` | ✅ | aceleași ca GA4 |
| First-touch UTM / gclid (sessionStorage) | ✅ | `lib/utm.ts`, `UtmCapture.tsx` |
| UTM pe `source_page` la contact | ✅ | `ContactForm` → CRM/admin |
| Google Ads tag în GTM | 🔧 | după cont Ads |
| Categorie cookie „Marketing” + `ad_storage` | ⏳ | când rulezi ads/remarketing |

---

## 5. Env-uri relevante

```bash
# Deja utile fără tokeni
NEXT_PUBLIC_SITE_URL=https://elenaseremet.ro
SITE_SAME_AS=                 # opțional
SITE_GEO_LAT=                 # opțional
SITE_GEO_LNG=                 # opțional

# Stop-line — completezi când ai acces
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

---

## 6. Fișiere cheie

```
lib/cookie-consent.ts
lib/data-layer.ts
lib/utm.ts
lib/seo.ts
components/analytics/CookieConsent.tsx
components/analytics/GoogleTagManager.tsx
components/analytics/AnalyticsTracker.tsx
components/analytics/UtmCapture.tsx
components/contact/ContactForm.tsx
app/(site)/politica-cookie/
app/(site)/layout.tsx
app/sitemap.ts
app/robots.ts
docs/ANALYTICS-SEO-SEM.md
```

---

*Ultima actualizare: prep complet fără tokeni; stop-line documentat pentru GTM/GSC/Ads.*
