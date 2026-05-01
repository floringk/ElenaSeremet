# Scripts

## Asset locations & handoff

See the root **[README.md](../README.md) — Assets (site chrome)** for:

- **`public/`** — favicon, OG default, apple touch icon, manifest (URLs are stable once published).
- **`mockups/content/images/`** — hero and inline imagery served under `/content/images/...`.
- Naming, formats, sizes, and what to send the developer (alt text, routes).

Regenerate default chrome images from `mockups/content/images/Elena-scaled.jpg`:

```bash
node scripts/bootstrap-public-assets.mjs
```

---

## Content pull script

### Running the script on Windows

If `python` is not found, use the **Python Launcher** instead:

```powershell
# From repo root (ESSite)
py -m pip install -r scripts/requirements.txt
py scripts/pull_content.py
```

**Text/structure only (no image download):**

```powershell
py scripts/pull_content.py --no-download
```

**Optional:** To make `python` work in PowerShell, reorder PATH so your real Python comes before the Windows Store alias, or use:

```powershell
& "C:\Users\florin.ostafe\AppData\Local\Programs\Python\Python311\python.exe" scripts/pull_content.py
```

(Adjust the path if you use Anaconda: `...\anaconda3\python.exe`.)

## Performance baseline (2026-04-30)

Quick local baseline sampled with `next dev` on:
- `/`
- `/despre-noi`
- `/contact`

Measured via repeated `Invoke-WebRequest` runs (5 samples each):

- `/` avg: ~685ms (cold: ~2937ms, warm: 112-136ms)
- `/despre-noi` avg: ~360ms (cold: ~1078ms, warm: 137-269ms)
- `/contact` avg: ~166ms (cold: ~420ms, warm: 95-114ms)

HTML payload sizes:
- `/`: 31,298 bytes
- `/despre-noi`: 29,841 bytes
- `/contact`: 22,473 bytes

Top bottlenecks / opportunities identified:
1. Cold route compilation dominates first request latency in development.
2. Legacy content block normalization repeated text regex transforms during render.
3. Mobile navigation interaction can keep menu state and body scroll open longer than needed.

## Lighthouse (staging / production URL)

Run **Chrome DevTools → Lighthouse** (or PageSpeed Insights) against the **deployed** site — local `next dev` is not representative.

Suggested URLs:

- `/` — home LCP (hero uses `priority`).
- `/pilates-mat` or `/servicii` — heavier legacy imagery.
- `/contact` — form + layout.

Record scores after deploy (mobile is the launch bar):

| URL | Mobile perf | Mobile accessibility | Best practices | Notes |
| --- | --- | --- | --- | --- |
| `/` | *TBD* | *TBD* | *TBD* | Fill in after staging run |
| `/pilates-mat` | *TBD* | *TBD* | *TBD* | |
| `/contact` | *TBD* | *TBD* | *TBD* | |

**Targeted fixes applied in repo (2026-05):** slug routes pass `heroPriority` when a hero exists (LCP); header logo uses explicit `sizes`; default OG moved to `/og-default.jpg` in `public/`.
