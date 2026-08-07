#!/usr/bin/env python3
"""
Fetch freely-licensed portrait photographs of the real actors who played the
Game of Thrones characters, from Wikimedia Commons.

WHY THIS SCRIPT EXISTS / PROVENANCE
-----------------------------------
The site shows real photos of real people. That is only legally defensible if
every image is genuinely free-licensed and correctly attributed. So:

  * The ONLY source is Wikimedia Commons. No IMDb (ToS forbids scraping), no
    HBO publicity stills (copyright HBO), no arbitrary web/image search.
  * Only these licenses are accepted:  CC0, Public Domain, CC BY (any ver),
    CC BY-SA (any ver).  Anything non-free / fair-use / "all rights reserved"
    / missing license metadata is REJECTED.
  * Author, license and the Commons file-page URL are recorded for EVERY
    downloaded image. CC BY and CC BY-SA legally require attribution; the
    site renders it at #/credits and in CREDITS.md.

MATCHING SAFETY
---------------
A wrong face on a character is worse than no face, so matching is deliberately
conservative and two-tiered:

  1. Preferred: ask the English Wikipedia for the actor's article and take its
     lead image (`pageimages`). We only accept it if the article's intro text
     actually describes an actor/actress, which rules out same-name articles
     about e.g. footballers.
  2. Fallback: Commons full-text file search, accepting a file only if EVERY
     token of the actor's name appears in the file title.

Anything that fails both tiers is left without a photo; the site falls back to
its generative SVG portrait art for those characters.

USAGE
-----
    python3 tools/fetch_actor_photos.py            # full run
    python3 tools/fetch_actor_photos.py --limit 5  # smoke test

Writes:  assets/actors/<character-id>.jpg
         js/actor-photos.js            (generated, committed)
         tools/actor-photos.provenance.json
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS = os.path.join(ROOT, "js", "data.js")
OUT_DIR = os.path.join(ROOT, "assets", "actors")
OUT_JS = os.path.join(ROOT, "js", "actor-photos.js")
OUT_PROV = os.path.join(ROOT, "tools", "actor-photos.provenance.json")

USER_AGENT = (
    "GoT-Reference-Site/1.0 (https://github.com/Kaushik27/game-of-thrones; "
    "static fan reference site) python-urllib"
)

# Accepted license short-names, normalised to lowercase-no-space for matching.
LICENSE_ALLOW_PATTERNS = [
    r"^cc0",
    r"^public\s*domain",
    r"^pd(-|$)",
    r"^cc\s*by(\s*-?\s*sa)?\s*[\d.]*$",
    r"^cc\s*by\s*[\d.]+$",
    r"^cc\s*by-sa\s*[\d.]+$",
]

# Titles containing any of these are never portraits of a person.
TITLE_BLOCKLIST = [
    "signature", "autograph", "logo", "poster", "coat of arms", "sigil",
    "map ", "diagram", "screenshot", "cover", "book", "font", "icon",
]

MAX_EDGE = 400  # px on the long edge


def log(*a):
    print(*a, file=sys.stderr, flush=True)


# ---------------------------------------------------------------- data.js ---
CHAR_RE = re.compile(
    r'\{\s*id:\s*"(?P<id>[^"]+)"'          # id
    r'.*?name:\s*"(?P<name>(?:[^"\\]|\\.)*)"'   # name (may contain \" escapes)
    r'.*?actor:\s*"(?P<actor>[^"]*)"',      # actor
    re.S,
)


def load_characters():
    """Extract (id, name, actor) triples straight out of js/data.js."""
    with open(DATA_JS, encoding="utf-8") as fh:
        src = fh.read()
    # Only the `characters` array — stop before the relations array.
    start = src.index("const characters = [")
    end = src.index("const relations", start) if "const relations" in src else len(src)
    block = src[start:end]
    out = []
    for m in CHAR_RE.finditer(block):
        actor = m.group("actor").strip()
        out.append({
            "id": m.group("id"),
            "name": m.group("name").replace('\\"', '"'),
            "actor": actor,
        })
    return out


# ------------------------------------------------------------------ http ---
def api_get(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as exc:  # noqa: BLE001 - network flakiness is expected
            if attempt == retries - 1:
                log(f"    ! request failed: {exc}")
                return None
            time.sleep(1.5 * (attempt + 1))
    return None


def download(url, dest, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            with open(dest, "wb") as fh:
                fh.write(data)
            return True
        except Exception as exc:  # noqa: BLE001
            if attempt == retries - 1:
                log(f"    ! download failed: {exc}")
                return False
            time.sleep(1.5 * (attempt + 1))
    return False


# --------------------------------------------------------------- license ---
def license_ok(short_name):
    if not short_name:
        return False
    s = re.sub(r"\s+", " ", short_name.strip().lower())
    s = s.replace("–", "-").replace("—", "-")
    for pat in LICENSE_ALLOW_PATTERNS:
        if re.match(pat, s):
            return True
    return False


def strip_html(value):
    if not value:
        return ""
    text = re.sub(r"<[^>]+>", " ", value)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def commons_fileinfo(file_title):
    """Given 'File:Foo.jpg', return dict with url/license/author/source, or None."""
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&format=json"
        "&prop=imageinfo&iiprop=url%7Cextmetadata%7Cmime"
        "&titles=" + urllib.parse.quote(file_title)
    )
    data = api_get(url)
    if not data:
        return None
    pages = data.get("query", {}).get("pages", {})
    for _, page in pages.items():
        infos = page.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        meta = info.get("extmetadata", {}) or {}
        lic = strip_html((meta.get("LicenseShortName") or {}).get("value", ""))
        if not license_ok(lic):
            return {"rejected_license": lic or "(none)"}
        return {
            "title": page.get("title", file_title),
            "url": info.get("url", "").split("?")[0],
            "mime": info.get("mime", ""),
            "license": lic,
            "credit": strip_html((meta.get("Artist") or {}).get("value", "")) or "Unknown",
            "source": info.get("descriptionurl", ""),
        }
    return None


# ------------------------------------------------------- candidate lookup ---
def name_tokens(actor):
    return [t for t in re.split(r"[^A-Za-z]+", actor) if len(t) > 1]


def looks_like_person_photo(title):
    low = title.lower()
    if low.endswith(".svg") or low.endswith(".gif") or low.endswith(".webm") or low.endswith(".ogv"):
        return False
    return not any(bad in low for bad in TITLE_BLOCKLIST)


def via_wikipedia(actor):
    """Tier 1: the actor's English Wikipedia article lead image."""
    url = (
        "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1"
        "&prop=pageimages%7Cextracts&piprop=name&exintro=1&explaintext=1"
        "&titles=" + urllib.parse.quote(actor)
    )
    data = api_get(url)
    if not data:
        return None
    pages = data.get("query", {}).get("pages", {})
    for pid, page in pages.items():
        if str(pid) == "-1":
            return None
        extract = (page.get("extract") or "").lower()
        # The article must actually be about a performer, else a same-name
        # article (footballer, politician...) would give us the wrong face.
        if not re.search(r"\b(actor|actress|performer)\b", extract[:600]):
            return None
        fname = page.get("pageimage")
        if not fname:
            return None
        if not looks_like_person_photo(fname):
            return None
        return "File:" + fname
    return None


def via_commons_search(actor):
    """Tier 2: Commons file search, requiring every name token in the title."""
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&format=json"
        "&generator=search&gsrnamespace=6&gsrlimit=15"
        "&prop=imageinfo&iiprop=url%7Cextmetadata%7Cmime"
        "&gsrsearch=" + urllib.parse.quote(f'"{actor}"')
    )
    data = api_get(url)
    if not data:
        return None
    pages = list((data.get("query", {}).get("pages", {}) or {}).values())
    tokens = [t.lower() for t in name_tokens(actor)]
    scored = []
    for page in pages:
        title = page.get("title", "")
        low = title.lower()
        if not looks_like_person_photo(title):
            continue
        if not all(t in low for t in tokens):
            continue
        infos = page.get("imageinfo") or []
        if not infos:
            continue
        info = infos[0]
        meta = info.get("extmetadata", {}) or {}
        lic = strip_html((meta.get("LicenseShortName") or {}).get("value", ""))
        if not license_ok(lic):
            continue
        if not info.get("mime", "").startswith("image/"):
            continue
        score = 0
        if "crop" in low:
            score += 5          # cropped files are usually tight headshots
        if "portrait" in low or "headshot" in low:
            score += 4
        if low.endswith(".jpg") or low.endswith(".jpeg"):
            score += 2
        # Prefer recent-ish convention photos over tiny thumbnails
        score += min(int(page.get("index", 99)), 20) * -0.1
        scored.append((score, title, info, meta, lic))
    if not scored:
        return None
    scored.sort(key=lambda x: -x[0])
    _, title, info, meta, lic = scored[0]
    return {
        "title": title,
        "url": info.get("url", "").split("?")[0],
        "mime": info.get("mime", ""),
        "license": lic,
        "credit": strip_html((meta.get("Artist") or {}).get("value", "")) or "Unknown",
        "source": info.get("descriptionurl", ""),
    }


def find_photo(actor):
    file_title = via_wikipedia(actor)
    if file_title:
        info = commons_fileinfo(file_title)
        if info and "rejected_license" not in info and info.get("url"):
            if info.get("mime", "").startswith("image/") and looks_like_person_photo(info["title"]):
                info["tier"] = "wikipedia-lead"
                return info
        if info and "rejected_license" in info:
            log(f"    - wikipedia lead image license rejected: {info['rejected_license']}")
    info = via_commons_search(actor)
    if info:
        info["tier"] = "commons-search"
    return info


# ----------------------------------------------------------------- image ---
def normalise_image(path):
    """Resize to MAX_EDGE on the long edge and force JPEG, using macOS sips."""
    try:
        subprocess.run(
            ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "72",
             "-Z", str(MAX_EDGE), path, "--out", path],
            check=True, capture_output=True,
        )
        return True
    except Exception as exc:  # noqa: BLE001
        log(f"    ! sips failed: {exc}")
        return False


# ------------------------------------------------------------------ main ---
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="only process N characters")
    ap.add_argument("--only", default="", help="comma-separated character ids")
    args = ap.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    chars = load_characters()
    log(f"parsed {len(chars)} characters from data.js")

    if args.only:
        wanted = set(args.only.split(","))
        chars = [c for c in chars if c["id"] in wanted]
    if args.limit:
        chars = chars[: args.limit]

    # Many characters share an actor spelling only by coincidence, but caching
    # by actor name avoids hammering the API for duplicates.
    actor_cache = {}
    results = {}
    misses = []

    for i, ch in enumerate(chars, 1):
        actor = ch["actor"]
        if not actor or actor.lower().startswith("actor unknown") or actor.lower() == "unknown":
            misses.append((ch["id"], "no actor recorded"))
            continue
        log(f"[{i}/{len(chars)}] {ch['name']}  <-  {actor}")

        if actor in actor_cache:
            info = actor_cache[actor]
        else:
            info = find_photo(actor)
            actor_cache[actor] = info
            time.sleep(0.25)  # be polite to the API

        if not info or not info.get("url"):
            log("    · no free-licensed photo found")
            misses.append((ch["id"], "no match"))
            continue

        dest = os.path.join(OUT_DIR, ch["id"] + ".jpg")
        if not download(info["url"], dest):
            misses.append((ch["id"], "download failed"))
            continue
        if not normalise_image(dest):
            os.remove(dest)
            misses.append((ch["id"], "resize failed"))
            continue

        results[ch["id"]] = {
            "file": f"assets/actors/{ch['id']}.jpg",
            "actor": actor,
            "credit": info["credit"],
            "license": info["license"],
            "source": info["source"],
            "commonsTitle": info["title"],
            "tier": info.get("tier", ""),
        }
        log(f"    OK  {info['license']}  ({info['tier']})")

    write_outputs(results, misses)


def write_outputs(results, misses):
    with open(OUT_PROV, "w", encoding="utf-8") as fh:
        json.dump({"photos": results, "misses": misses}, fh, indent=2, sort_keys=True)

    lines = [
        "// ==========================================================================",
        "// GENERATED FILE — do not edit by hand.",
        "// Produced by tools/fetch_actor_photos.py from Wikimedia Commons.",
        "//",
        "// Maps character id -> a freely-licensed photograph of the REAL ACTOR who",
        "// played that character. Every entry below is CC0 / Public Domain / CC BY /",
        "// CC BY-SA; `credit`, `license` and `source` carry the attribution those",
        "// licenses legally require, and are rendered at #/credits and in CREDITS.md.",
        "// Characters absent from this map fall back to the generative SVG portrait",
        "// art in js/avatars.js.",
        "// ==========================================================================",
        "",
        "const ACTOR_PHOTOS = {",
    ]
    for cid in sorted(results):
        r = results[cid]
        def esc(v):
            return json.dumps(v, ensure_ascii=False)
        lines.append(
            f"  {json.dumps(cid)}: {{ file: {esc(r['file'])}, actor: {esc(r['actor'])}, "
            f"credit: {esc(r['credit'])}, license: {esc(r['license'])}, source: {esc(r['source'])} }},"
        )
    lines.append("};")
    lines.append("")
    lines.append("function actorPhotoFor(characterId) {")
    lines.append("  return ACTOR_PHOTOS[characterId] || null;")
    lines.append("}")
    lines.append("")
    with open(OUT_JS, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))

    log("")
    log(f"=== {len(results)} photos written, {len(misses)} characters left on generative art ===")


if __name__ == "__main__":
    main()
