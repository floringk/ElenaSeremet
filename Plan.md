1) Aliniere cu clientul

Confirmi obiectivele: conversii (lead), brand, “design improved”

Alegi 1 din cele 5 stiluri UI + reguli (culori, fonturi, spacing, butoane)

Confirmi lista de pagini + ce rămâne template

2) Inventar și mapare conținut

Listezi toate URL-urile curente (din sitemap / crawl)

Grupați conținutul pe tipuri: pagini unice, pagini template, servicii

Decizi formatul nou: MDX/JSON/CMS (pentru servicii + blog)

3) Setup noul proiect

Next.js + Vercel

Structură rute (Home / Despre / Servicii / Prețuri / Program / Contact)

Setări env + deploy preview

4) Construire UI (design system minimal)

Aplici tokens (culori, fonturi, radius)

Componente comune: header, footer, butoane, carduri, formulare

Secțiuni: hero, servicii, pricing, program, echipă, testimoniale/FAQ (dacă vrei)

5) Migrare conținut

Rulezi scriptul de Python pentru extragere

Cureți și normalizezi (heading-uri, liste, imagini)

Populezi în noua structură (pagini + servicii)

6) Lead form (email)

Form pe /contact → endpoint serverless pe Vercel

Trimitere email prin Zoho (SMTP) + anti-spam (honeypot + rate limit)

Mesaje UX (success / error)

7) SEO și compatibilitate URL

Meta title/description per pagină

OG tags + favicon + canonical

Schema.org (LocalBusiness/FitnessStudio)

sitemap.xml + robots.txt

301 redirects (WP → nou) ca să păstrezi SEO

8) Tracking

GA4 + GTM (dacă există)

Evenimente minime: page_view, lead_submitted, click_tel/mail

9) Performanță și QA

Optimizare imagini (lazy/next-image)

Lighthouse (mobile first)

Test pe mobil/desktop, cross-browser

Verificare linkuri, 404, redirects, form

10) Go-live

DNS către Vercel

Verificare Search Console + sitemap

Monitorizare 1–2 zile: erori 404, form, tracking