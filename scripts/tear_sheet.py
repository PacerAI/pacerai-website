#!/usr/bin/env python3
"""
Tear Sheet publisher for getpacerai.com.

The Tear Sheet is a PDF in the WordPress media library. Every link to it points at the
short link https://getpacerai.com/tear-sheet/, a Redirection-plugin 302 to the current
PDF: the site nav + footer (all pages) and the Apollo demo-signup + beta-tester emails.
Publishing a new version = upload the PDF + repoint that redirect. No link ever changes.

Usage:
    python3 scripts/tear_sheet.py status
    python3 scripts/tear_sheet.py publish <file.pdf> [--note "what changed"] [--dry-run]
    python3 scripts/tear_sheet.py rollback [<media_id>]   # default: the version before current

History lives in docs/tear-sheet/versions.json. The PDF's source is the claude.ai Design
canvas "Pacer AI One-Pager" — see .claude/skills/tear-sheet/SKILL.md.

Needs WP_USER / WP_APP_PASSWORD (source ~/.zshrc).
"""
import base64
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSIONS = os.path.join(REPO, "docs", "tear-sheet", "versions.json")
BASE = os.environ.get("WP_BASE_URL", "https://getpacerai.com")
SHORT_PATH = "/tear-sheet/"
SHORT_LINK = f"{BASE}{SHORT_PATH}"
MAX_BYTES = 15 * 1024 * 1024
EXPECTED_PAGES = 3
UA = "Mozilla/5.0 (pacerai tear_sheet.py)"


# ── HTTP ─────────────────────────────────────────────────────────────────────
# urllib's own default HTTPS context only: a custom SSLContext changes the TLS
# fingerprint and trips WordPress.com's bot challenge (see scripts/deploy.py).

def _auth():
    user = os.environ.get("WP_USER", "willsullivan5e7f50183a")
    pw = os.environ.get("WP_APP_PASSWORD")
    if not pw:
        sys.exit("ERROR: WP_APP_PASSWORD not set. Run: source ~/.zshrc")
    return "Basic " + base64.b64encode(f"{user}:{pw}".encode()).decode()


def wp(path, data=None, method="GET", raw=None, headers=None):
    """Authenticated WordPress REST call. `raw` sends bytes as-is (media upload)."""
    body = raw if raw is not None else (json.dumps(data).encode() if data is not None else None)
    req = urllib.request.Request(f"{BASE}/wp-json{path}", data=body, method=method)
    req.add_header("Authorization", _auth())
    req.add_header("User-Agent", UA)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"ERROR: {method} {path} -> HTTP {e.code}: {e.read().decode()[:300]}")


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def peek(url, follow=False):
    """(status, headers) for a public URL; no auth. follow=False reports the redirect itself."""
    opener = urllib.request.build_opener() if follow else urllib.request.build_opener(_NoRedirect)
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": UA})
    try:
        with opener.open(req) as resp:
            return resp.status, resp.headers
    except urllib.error.HTTPError as e:
        return e.code, e.headers


# ── State ────────────────────────────────────────────────────────────────────

def load():
    with open(VERSIONS) as f:
        return json.load(f)


def save(state):
    with open(VERSIONS, "w") as f:
        json.dump(state, f, indent=2)
        f.write("\n")


def find_redirect():
    items = wp("/redirection/v1/redirect?per_page=200").get("items", [])
    hits = [r for r in items if r.get("url") == SHORT_PATH]
    if len(hits) != 1:
        sys.exit(f"ERROR: expected exactly one Redirection entry for {SHORT_PATH}, found {len(hits)}")
    return hits[0]


def repoint(redirect, target):
    """Point the short link at `target`, keeping every other field of the redirect."""
    payload = {
        "url": redirect["url"],
        "title": redirect.get("title", ""),
        "match_type": redirect["match_type"],
        "action_type": redirect["action_type"],
        "action_code": 302,  # never 301: browsers cache 301s and would keep the old PDF
        "action_data": {"url": target},
        "group_id": redirect["group_id"],
        "match_data": redirect.get("match_data", {}),
        "regex": bool(redirect.get("regex", False)),
        "position": redirect.get("position", 0),
    }
    wp(f"/redirection/v1/redirect/{redirect['id']}", data=payload, method="POST")
    after = find_redirect()
    got = (after.get("action_data") or {}).get("url")
    if got != target:
        sys.exit(f"ERROR: redirect did not update (still {got})")


def verify(target, expected_bytes=None):
    """The short link 302s to `target`, and `target` serves the PDF."""
    code, h = peek(SHORT_LINK)
    loc = h.get("Location") if h else None
    ok = code == 302 and loc == target
    print(f"  {SHORT_LINK} -> {code} {loc}  {'OK' if ok else 'MISMATCH'}")
    code2, h2 = peek(target, follow=True)
    size = int(h2.get("Content-Length") or 0) if h2 else 0
    pdf = (h2.get("Content-Type") or "").startswith("application/pdf") if h2 else False
    size_ok = expected_bytes is None or size == expected_bytes
    print(f"  {target} -> {code2} {h2.get('Content-Type') if h2 else ''} {size} bytes  "
          f"{'OK' if code2 == 200 and pdf and size_ok else 'MISMATCH'}")
    if not (ok and code2 == 200 and pdf and size_ok):
        sys.exit("ERROR: verification failed — check the redirect in WP Admin → Tools → Redirection")


# ── PDF checks ───────────────────────────────────────────────────────────────

def inspect_pdf(path):
    with open(path, "rb") as f:
        blob = f.read()
    if not blob.startswith(b"%PDF-"):
        sys.exit(f"ERROR: {path} is not a PDF")
    if len(blob) > MAX_BYTES:
        sys.exit(f"ERROR: {len(blob):,} bytes is over the {MAX_BYTES:,} limit")
    pages = len(re.findall(rb"/Type\s*/Page[^s]", blob))
    return blob, pages, hashlib.sha256(blob).hexdigest()


# ── Commands ─────────────────────────────────────────────────────────────────

def cmd_status():
    state = load()
    r = find_redirect()
    target = (r.get("action_data") or {}).get("url")
    current = next((v for v in state["versions"] if v["url"] == target), None)
    print(f"Short link : {SHORT_LINK}  (Redirection #{r['id']}, {r['action_code']})")
    print(f"Points to  : {target}")
    print(f"Version    : {current['version'] if current else 'UNRECORDED — not in versions.json'}")
    print(f"Source     : {state['source_canvas']}")
    print("History:")
    for v in state["versions"]:
        mark = "  <- live" if v["url"] == target else ""
        print(f"  v{v['version']}  {v['date']}  media {v['media_id']}  {v['pages']}p  "
              f"{v['bytes']:,} B  {v.get('note', '')}{mark}")
    verify(target)


def cmd_publish(path, note, dry_run):
    state = load()
    blob, pages, sha = inspect_pdf(path)
    print(f"PDF: {path}\n  {len(blob):,} bytes, {pages} pages, sha256 {sha[:12]}…")
    if pages != EXPECTED_PAGES:
        print(f"  WARNING: expected {EXPECTED_PAGES} pages, got {pages}")
    dupe = next((v for v in state["versions"] if v.get("sha256") == sha), None)
    if dupe:
        sys.exit(f"ERROR: identical to v{dupe['version']} ({dupe['date']}) — nothing to publish")
    stamp = date.today().isoformat()
    filename = f"pacer-ai-tear-sheet-{stamp}.pdf"
    redirect = find_redirect()
    print(f"  upload as {filename}; repoint Redirection #{redirect['id']}")
    if dry_run:
        print("DRY RUN — nothing uploaded or changed.")
        return
    media = wp("/wp/v2/media", method="POST", raw=blob, headers={
        "Content-Type": "application/pdf",
        "Content-Disposition": f"attachment; filename={filename}",
    })
    wp(f"/wp/v2/media/{media['id']}", data={"title": f"Pacer AI Tear Sheet ({stamp})"}, method="POST")
    url = media["source_url"]
    print(f"  uploaded: media {media['id']} → {url}")
    repoint(redirect, url)
    verify(url, len(blob))
    state["versions"].append({
        "version": max(v["version"] for v in state["versions"]) + 1,
        "date": stamp,
        "media_id": media["id"],
        "url": url,
        "pages": pages,
        "bytes": len(blob),
        "sha256": sha,
        "note": note or "",
        "published_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    })
    save(state)
    print(f"Published v{state['versions'][-1]['version']}. Recorded in docs/tear-sheet/versions.json.")


def cmd_rollback(media_id):
    state = load()
    redirect = find_redirect()
    live = (redirect.get("action_data") or {}).get("url")
    if media_id is not None:
        target = next((v for v in state["versions"] if v["media_id"] == media_id), None)
        if not target:
            sys.exit(f"ERROR: media {media_id} is not in versions.json")
    else:
        older = [v for v in state["versions"] if v["url"] != live]
        if not older:
            sys.exit("ERROR: no other version to roll back to")
        target = older[-1]
    print(f"Repointing {SHORT_LINK} → v{target['version']} ({target['date']}, media {target['media_id']})")
    repoint(redirect, target["url"])
    verify(target["url"], target["bytes"])
    print("Done. versions.json is unchanged — it records what was published, not what is live.")


def main(argv):
    import argparse
    p = argparse.ArgumentParser(description="Publish the getpacerai.com Tear Sheet.")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("status", help="show the live version, history, and verify the short link")
    pub = sub.add_parser("publish", help="upload a new PDF and repoint the short link")
    pub.add_argument("pdf")
    pub.add_argument("--note", default="", help="what changed in this version")
    pub.add_argument("--dry-run", action="store_true")
    rb = sub.add_parser("rollback", help="repoint the short link to an earlier version")
    rb.add_argument("media_id", nargs="?", type=int)
    a = p.parse_args(argv)
    if a.cmd == "status":
        cmd_status()
    elif a.cmd == "publish":
        cmd_publish(os.path.expanduser(a.pdf), a.note, a.dry_run)
    else:
        cmd_rollback(a.media_id)


if __name__ == "__main__":
    main(sys.argv[1:])
