#!/usr/bin/env python3
"""
Pull content from elenaseremet.ro for rebrand migration.
Crawls the site by following internal links, extracts text/structure/images/forms,
and writes JSON per page plus a site manifest. Optionally downloads images.
"""
import argparse
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://elenaseremet.ro"
USER_AGENT = "ESSite-Rebrand-ContentPull/1.0 (+https://github.com/essite)"
REQUEST_DELAY_SEC = 1.5
MAX_PAGES = 150
OUTPUT_RAW_DIR = "content/raw"
OUTPUT_IMAGES_DIR = "content/images"
MANIFEST_PATH = "content/site_manifest.json"

# Common WordPress/theme main content selectors (first match wins)
MAIN_CONTENT_SELECTORS = [
    "[class*='entry-content']",
    "[class*='post-content']",
    "main",
    "article",
    "[role='main']",
    ".content",
    "#content",
]


def normalize_url(url: str, base: str = BASE_URL) -> str | None:
    """Normalize URL: same host, no fragment, optional trailing slash strip."""
    try:
        parsed = urlparse(url)
        if not parsed.scheme and not parsed.netloc:
            url = urljoin(base, url)
            parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return None
        base_parsed = urlparse(base)
        if parsed.netloc and parsed.netloc.lower() != base_parsed.netloc.lower():
            return None
        if not parsed.netloc:
            parsed = parsed._replace(netloc=base_parsed.netloc, scheme=base_parsed.scheme)
        path = (parsed.path or "/").rstrip("/") or "/"
        normalized = urlunparse((parsed.scheme, parsed.netloc, path, "", "", ""))
        return normalized
    except Exception:
        return None


def should_skip_url(url: str) -> bool:
    """Skip wp-admin, anchors, tel, mailto, common non-content paths."""
    path = urlparse(url).path.lower()
    if "/wp-admin/" in path or path.startswith("/wp-admin"):
        return True
    if path.startswith("/wp-") and "/wp-json" not in path:
        return True
    if any(path.endswith(x) for x in (".xml", ".rss", ".json", ".pdf", ".zip")):
        return True
    return False


def collect_internal_links(soup: BeautifulSoup, page_url: str) -> set[str]:
    """Extract internal links from the page."""
    seen = set()
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
            continue
        norm = normalize_url(href, page_url)
        if norm and not should_skip_url(norm):
            seen.add(norm)
    return seen


def extract_blocks(soup: BeautifulSoup) -> list[dict]:
    """Extract content blocks (headings, paragraphs, lists, links) in order."""
    blocks = []
    for el in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li"]):
        if el.name in ("h1", "h2", "h3", "h4", "h5", "h6"):
            blocks.append({"type": el.name, "text": el.get_text(strip=True)})
        elif el.name == "p":
            text = el.get_text(strip=True)
            if text:
                blocks.append({"type": "p", "text": text})
        elif el.name in ("ul", "ol"):
            items = [li.get_text(strip=True) for li in el.find_all("li", recursive=False) if li.get_text(strip=True)]
            if items:
                blocks.append({"type": el.name, "items": items})
        elif el.name == "li" and not el.find_parent(["ul", "ol"], recursive=False):
            text = el.get_text(strip=True)
            if text:
                blocks.append({"type": "li", "text": text})
    return blocks


def get_main_content(soup: BeautifulSoup) -> BeautifulSoup:
    """Return the main content subtree, or body if not found."""
    for sel in MAIN_CONTENT_SELECTORS:
        node = soup.select_one(sel)
        if node:
            return node
    return soup.find("body") or soup


def extract_images(soup: BeautifulSoup, page_url: str) -> list[dict]:
    """Collect img src, alt, and optional local path placeholder."""
    images = []
    for img in soup.find_all("img", src=True):
        src = img["src"].strip()
        if src.startswith("data:"):
            continue
        full_url = urljoin(page_url, src)
        images.append({"src": full_url, "alt": img.get("alt") or ""})
    return images


def extract_forms(soup: BeautifulSoup, page_url: str) -> list[dict]:
    """Extract form action, method, and input names/labels."""
    forms = []
    for form in soup.find_all("form"):
        action = form.get("action")
        if action:
            action = urljoin(page_url, action)
        method = (form.get("method") or "get").lower()
        inputs = []
        for inp in form.find_all(["input", "textarea", "select"]):
            name = inp.get("name")
            if not name:
                continue
            inp_type = inp.get("type", "text") if inp.name == "input" else inp.name
            label = ""
            if inp.get("id"):
                lbl = form.find_previous("label", attrs={"for": inp["id"]}) or inp.find_previous("label")
                if lbl:
                    label = lbl.get_text(strip=True)
            inputs.append({"name": name, "type": inp_type, "label": label})
        forms.append({"action": action, "method": method, "inputs": inputs})
    return forms


def infer_page_type(path: str) -> str:
    """Infer page type from path for manifest."""
    path = path.strip("/").lower()
    if not path or path == "acasa":
        return "home"
    if path == "despre-noi":
        return "despre-noi"
    if path == "preturi":
        return "preturi"
    if path in ("program", "schedules"):
        return "program"
    if path in ("instructori", "echipa"):
        return "echipa"
    if path == "contact":
        return "contact"
    if "inregistrare" in path or "clienti" in path:
        return "inregistrare"
    if any(s in path for s in ("pilates-mat", "reformer", "yogalates", "tonifiere", "sedinte-private", "masaj", "postural", "yoga", "drenaj")):
        return "servicii"
    return "page"


def fetch_page(session: requests.Session, url: str) -> requests.Response | None:
    """Fetch a single page with UTF-8 and polite headers."""
    try:
        r = session.get(url, timeout=15)
        r.raise_for_status()
        r.encoding = r.apparent_encoding or "utf-8"
        return r
    except requests.RequestException as e:
        print(f"  Error fetching {url}: {e}", file=sys.stderr)
        return None


def slug_from_url(url: str) -> str:
    """Generate a filesystem-safe slug from URL path (flat, no subdirs)."""
    path = urlparse(url).path.strip("/") or "index"
    slug = re.sub(r"[^\w\-]", "_", path.lower().replace("/", "_"))
    slug = re.sub(r"_+", "_", slug).strip("_")
    return slug or "index"


def download_image(session: requests.Session, src: str, out_dir: Path) -> str | None:
    """Download image to out_dir; return relative path or None."""
    try:
        r = session.get(src, timeout=10, stream=True)
        r.raise_for_status()
        # Derive filename from URL
        path = urlparse(src).path
        name = path.split("/")[-1] or "image"
        if "." not in name:
            name = name + ".jpg"
        safe = re.sub(r"[^\w.\-]", "_", name)[:120]
        out_path = out_dir / safe
        if out_path.exists():
            return f"images/{safe}"
        with open(out_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        return f"images/{safe}"
    except Exception:
        return None


def run(
    base_url: str = BASE_URL,
    output_dir: Path | None = None,
    raw_dir: Path | None = None,
    images_dir: Path | None = None,
    manifest_path: Path | None = None,
    download_images: bool = True,
    max_pages: int = MAX_PAGES,
    delay: float = REQUEST_DELAY_SEC,
) -> None:
    script_dir = Path(__file__).resolve().parent
    root = script_dir.parent
    output_dir = output_dir or root / "content"
    raw_dir = raw_dir or output_dir / "raw"
    images_dir = images_dir or output_dir / "images"
    manifest_path = manifest_path or output_dir / "site_manifest.json"

    raw_dir.mkdir(parents=True, exist_ok=True)
    if download_images:
        images_dir.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "ro,en;q=0.9"})

    to_visit = {normalize_url(base_url)}
    visited = set()
    manifest = {"base_url": base_url, "pages": []}

    while to_visit and len(visited) < max_pages:
        url = to_visit.pop()
        if url in visited:
            continue
        visited.add(url)
        print(f"Crawling {url}")

        time.sleep(delay)
        resp = fetch_page(session, url)
        if not resp:
            continue

        soup = BeautifulSoup(resp.text, "lxml")
        main = get_main_content(soup)

        # Discover more links
        for link in collect_internal_links(soup, url):
            if link not in visited:
                to_visit.add(link)

        title = soup.title.get_text(strip=True) if soup.title else ""
        meta_desc = ""
        meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
        if meta and meta.get("content"):
            meta_desc = meta["content"].strip()

        blocks = extract_blocks(main)
        images = extract_images(soup, url)
        forms = extract_forms(soup, url)

        if download_images and images:
            for im in images:
                rel = download_image(session, im["src"], images_dir)
                if rel:
                    im["local_path"] = rel

        path = urlparse(url).path or "/"
        page_type = infer_page_type(path)
        slug = slug_from_url(url)

        page_data = {
            "url": url,
            "title": title,
            "meta": {"description": meta_desc},
            "blocks": blocks,
            "images": images,
            "forms": forms,
        }
        raw_file = raw_dir / f"{slug}.json"
        with open(raw_file, "w", encoding="utf-8") as f:
            json.dump(page_data, f, ensure_ascii=False, indent=2)

        manifest["pages"].append({"url": url, "slug": slug, "type": page_type, "file": f"raw/{slug}.json"})

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"Done. Visited {len(visited)} pages. Manifest: {manifest_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pull content from elenaseremet.ro for rebrand migration.")
    parser.add_argument("--no-download", action="store_true", help="Do not download images; only extract text/structure.")
    parser.add_argument("--max-pages", type=int, default=MAX_PAGES, help=f"Max pages to crawl (default {MAX_PAGES}).")
    parser.add_argument("--delay", type=float, default=REQUEST_DELAY_SEC, help=f"Delay between requests in seconds (default {REQUEST_DELAY_SEC}).")
    parser.add_argument("--base-url", default=BASE_URL, help=f"Base URL to crawl (default {BASE_URL}).")
    args = parser.parse_args()
    run(download_images=not args.no_download, max_pages=args.max_pages, delay=args.delay, base_url=args.base_url)


if __name__ == "__main__":
    main()
