#!/usr/bin/env python3
"""
One-shot: create the new "What is cRPO?" blog page on getpacerai.com.

This is a NEW-page-creation deploy (not an update of an existing page),
because crpo-build.html has no WP ID yet. After this runs successfully,
the returned WP ID needs to be added to:
  - CLAUDE.md page registry
  - scripts/deploy.py PAGE_REGISTRY + PAGE_NAMES dicts
  - docs/document/changelog.md
…so future updates to this post can use the regular deploy.py flow.

Usage (run from the pacerai-website repo root, with env vars set):
    source ~/.zshrc 2>/dev/null
    python3 scripts/deploy-crpo.py [--dry-run]

Required env vars: WP_BASE_URL, WP_USER, WP_APP_PASSWORD
"""
import ssl
import urllib.request
import base64
import json
import os
import sys
from datetime import datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_FILE = os.path.join(REPO, "src/blog/posts/crpo-build.html")

# Page payload — adjust here if title/slug/parent need tweaking
TITLE = "What is cRPO? The Operator's Guide to Current Remaining Performance Obligations"
SLUG = "crpo"
PARENT_ID = 230  # Blog parent
STATUS = "publish"


def main():
    dry_run = "--dry-run" in sys.argv

    base_url = os.environ.get("WP_BASE_URL")
    wp_user = os.environ.get("WP_USER", "willsullivan5e7f50183a")
    wp_pass = os.environ.get("WP_APP_PASSWORD")

    if not base_url or not wp_pass:
        print("ERROR: WP_BASE_URL and/or WP_APP_PASSWORD not set.")
        print("Run: source ~/.zshrc 2>/dev/null  (or set them inline)")
        sys.exit(1)

    if not os.path.exists(SOURCE_FILE):
        print(f"ERROR: source file not found: {SOURCE_FILE}")
        sys.exit(1)

    with open(SOURCE_FILE) as f:
        html = f.read()

    content = f"<!-- wp:html -->{html}<!-- /wp:html -->"

    payload = {
        "title": TITLE,
        "slug": SLUG,
        "parent": PARENT_ID,
        "status": STATUS,
        "content": content,
    }

    print("=" * 64)
    print(f"{'DRY RUN' if dry_run else 'DEPLOY'} — Create new WP Page")
    print("=" * 64)
    print(f"  Source:   {os.path.relpath(SOURCE_FILE, REPO)}")
    print(f"  Size:     {len(html):,} chars (wrapped: {len(content):,})")
    print(f"  Title:    {TITLE}")
    print(f"  Slug:     {SLUG}")
    print(f"  Parent:   {PARENT_ID} (Blog)")
    print(f"  Status:   {STATUS}")
    print(f"  Endpoint: {base_url}/wp-json/wp/v2/pages")
    print()

    if dry_run:
        print("DRY RUN complete — no API call made.")
        sys.exit(0)

    # SSL context — matches deploy.py for parity
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    creds = base64.b64encode(f"{wp_user}:{wp_pass}".encode()).decode()

    url = f"{base_url}/wp-json/wp/v2/pages"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        method="POST",
    )
    req.add_header("Authorization", f"Basic {creds}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            result = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"ERROR: HTTP {e.code}")
        print(body[:500])
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    new_id = result.get("id")
    link = result.get("link", "")
    status_resp = result.get("status", "")

    print("✓ Page created")
    print(f"  WP ID:   {new_id}")
    print(f"  Link:    {link}")
    print(f"  Status:  {status_resp}")
    print()
    print("NEXT STEPS — register the new WP ID so future updates use deploy.py:")
    print(f"  1. CLAUDE.md page registry — add row:")
    print(
        f'     | **cRPO Blog** | {new_id} | `crpo` | 230 | `src/blog/posts/crpo-build.html` |'
    )
    print(f"  2. scripts/deploy.py — add to PAGE_REGISTRY and PAGE_NAMES:")
    print(f'     PAGE_REGISTRY[{new_id}] = "src/blog/posts/crpo-build.html"')
    print(f'     PAGE_NAMES[{new_id}] = "cRPO Blog"')
    print(f"  3. docs/document/changelog.md — append a deploy line for today.")

    # Try to write a backup of the new page right away
    try:
        ctx_b = ssl.create_default_context()
        ctx_b.check_hostname = False
        ctx_b.verify_mode = ssl.CERT_NONE
        backup_url = f"{base_url}/wp-json/wp/v2/pages/{new_id}?context=edit"
        req_b = urllib.request.Request(backup_url)
        req_b.add_header("Authorization", f"Basic {creds}")
        with urllib.request.urlopen(req_b, context=ctx_b) as r:
            backup_data = json.loads(r.read().decode())
        ts = datetime.now().strftime("%Y%m%d-%H%M")
        backup_dir = os.path.join(REPO, "docs/review")
        os.makedirs(backup_dir, exist_ok=True)
        backup_path = os.path.join(
            backup_dir, f"pre-deploy-backup-{new_id}-{ts}.json"
        )
        with open(backup_path, "w") as f:
            json.dump(backup_data, f, indent=2)
        print(
            f"  ✓ Backup saved → {os.path.relpath(backup_path, REPO)}"
        )
    except Exception as e:
        print(f"  ⚠ Backup write failed (non-fatal): {e}")


if __name__ == "__main__":
    main()
