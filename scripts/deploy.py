#!/usr/bin/env python3
"""
Deploy getpacerai.com pages to WordPress via REST API.
Runs pre-deploy validation, backs up current live content, deploys, and verifies.

Usage:
    python3 scripts/deploy.py 25                    # Deploy homepage
    python3 scripts/deploy.py 372 373               # Deploy multiple pages
    python3 scripts/deploy.py all                    # Deploy all pages
    python3 scripts/deploy.py 25 --dry-run           # Show what would happen
    python3 scripts/deploy.py 25 --force             # Skip validation
    python3 scripts/deploy.py 25 --skip-backup       # Skip backup step
"""
import ssl
import urllib.request
import base64
import json
import os
import sys
import re
from datetime import datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Page registry: WP ID -> source file (relative to REPO)
PAGE_REGISTRY = {
    25:  "src/homepage/index-build.html",
    230: "src/blog/index-build.html",
    371: "src/platform/overview.html",
    372: "src/solutions/arr-snowball.html",
    373: "src/solutions/customer-data-cube.html",
    554: "src/solutions/transaction-readiness.html",
    651: "src/solutions/revops-transformation-pkg.html",
    650: "src/solutions/gtm-transformation-pkg.html",
    652: "src/solutions/fpanda-transformation-pkg.html",
    366: "src/team/team-page.html",
    374: "src/team/about.html",
    375: "src/team/contact.html",
    865: "src/blog/posts/crpo-build.html",
    # --- v3 bone blog posts (voice-debt in original prose → deploy with --force until a voice pass) ---
    491: "src/blog/posts/491-build.html",
    378: "src/blog/posts/227-build.html",
    376: "src/blog/posts/236-build.html",
    368: "src/blog/posts/244-build.html",
    360: "src/blog/posts/264-build.html",
    358: "src/blog/posts/288-build.html",
    441: "src/blog/posts/441-build.html",
    781: "src/blog/posts/board-quality-arr-snowballs-build.html",
    591: "src/blog/posts/comparison-build-vs-need.html",
    888: "src/blog/posts/semrush-adobe-case-study-build.html",
    850: "src/blog/posts/what-is-an-arr-waterfall-build.html",
}

PAGE_NAMES = {
    25: "Homepage", 230: "Blog Index", 371: "Platform Overview",
    372: "ARR Snowball", 373: "Customer Data Cube", 554: "Transaction Readiness",
    651: "RevOps Transformation", 650: "GTM Transformation", 652: "FP&A Transformation",
    366: "Team Page", 374: "About", 375: "Contact",
    865: "cRPO Blog",
    491: "Blog: Build vs Hire", 378: "Blog: What is ARR Snowball", 376: "Blog: Prevent Churn",
    368: "Blog: ARR Snowball Analysis", 360: "Blog: AI for RevOps", 358: "Blog: Why ARR Waterfalls Matter",
    441: "Blog: Why LLMs Can't Build Snowball", 781: "Blog: Board-Quality Snowballs",
    591: "Blog: Build vs Boards Need", 888: "Blog: Semrush-Adobe", 850: "Blog: What is ARR Waterfall",
}


def get_credentials():
    wp_user = os.environ.get("WP_USER", "willsullivan5e7f50183a")
    wp_pass = os.environ.get("WP_APP_PASSWORD")
    if not wp_pass:
        print("ERROR: WP_APP_PASSWORD not set. Run: source ~/.zshrc")
        sys.exit(1)
    return wp_user, wp_pass


def wp_request(url, data=None, method="GET"):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    wp_user, wp_pass = get_credentials()
    creds = base64.b64encode(f"{wp_user}:{wp_pass}".encode()).decode()

    if data:
        payload = json.dumps(data).encode()
    else:
        payload = None

    req = urllib.request.Request(url, data=payload, method=method)
    req.add_header("Authorization", f"Basic {creds}")
    if data:
        req.add_header("Content-Type", "application/json")

    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read().decode())


def backup_page(wp_id):
    """Fetch current live page and save as backup JSON."""
    base_url = os.environ.get("WP_BASE_URL", "https://getpacerai.com")
    url = f"{base_url}/wp-json/wp/v2/pages/{wp_id}?context=edit"
    result = wp_request(url)

    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    backup_dir = os.path.join(REPO, "docs/review")
    os.makedirs(backup_dir, exist_ok=True)
    backup_path = os.path.join(backup_dir, f"pre-deploy-backup-{wp_id}-{timestamp}.json")

    with open(backup_path, "w") as f:
        json.dump(result, f, indent=2)

    return backup_path


def deploy_page(wp_id, source_file, dry_run=False):
    """Deploy a single page to WordPress."""
    base_url = os.environ.get("WP_BASE_URL", "https://getpacerai.com")

    with open(source_file) as f:
        html = f.read()

    content = f"<!-- wp:html -->{html}<!-- /wp:html -->"

    if dry_run:
        print(f"  DRY RUN: Would deploy {len(html):,} chars to page {wp_id}")
        return True

    url = f"{base_url}/wp-json/wp/v2/pages/{wp_id}"
    try:
        result = wp_request(url, data={"content": content}, method="POST")
        return True
    except Exception as e:
        print(f"  DEPLOY ERROR: {e}")
        return False


def verify_page(wp_id):
    """Quick verification of deployed page."""
    base_url = os.environ.get("WP_BASE_URL", "https://getpacerai.com")
    url = f"{base_url}/wp-json/wp/v2/pages/{wp_id}?_fields=content,link"
    try:
        result = wp_request(url)
        content = result.get("content", {}).get("rendered", "")
        checks = {
            "footer-cols": content.count("footer-col-head"),
            "old-nav": content.count("investor-questions"),
            "bad-linkedin": content.count("linkedin.com/team/"),
        }
        return checks, result.get("link", "")
    except Exception:
        return None, ""


def main():
    dry_run = "--dry-run" in sys.argv
    force = "--force" in sys.argv
    skip_backup = "--skip-backup" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if not args:
        print("Usage: python3 scripts/deploy.py <page_id|all> [--dry-run] [--force] [--skip-backup]")
        print(f"\nAvailable pages:")
        for wp_id, name in sorted(PAGE_NAMES.items()):
            print(f"  {wp_id:>4}  {name:<25} {PAGE_REGISTRY[wp_id]}")
        sys.exit(0)

    # Resolve page IDs
    if "all" in args:
        page_ids = list(PAGE_REGISTRY.keys())
    else:
        page_ids = [int(a) for a in args if a.isdigit()]

    if not page_ids:
        print("ERROR: No valid page IDs provided")
        sys.exit(1)

    # Step 1: Validate (unless --force)
    if not force:
        print("=" * 60)
        print("STEP 1: PRE-DEPLOY VALIDATION")
        print("=" * 60)

        from validate import validate_file
        has_failures = False
        for wp_id in page_ids:
            source = os.path.join(REPO, PAGE_REGISTRY[wp_id])
            if not os.path.exists(source):
                print(f"  ❌ {PAGE_NAMES[wp_id]}: source file not found ({PAGE_REGISTRY[wp_id]})")
                has_failures = True
                continue

            passes, warnings, failures = validate_file(source)
            status = "❌" if failures else ("⚠️ " if warnings else "✅")
            print(f"  {status} {PAGE_NAMES[wp_id]} ({len(passes)} pass, {len(warnings)} warn, {len(failures)} fail)")
            for f in failures:
                print(f"       ✗ {f}")
            if failures:
                has_failures = True

        if has_failures:
            print(f"\n❌ VALIDATION FAILED — fix issues above or use --force to bypass")
            sys.exit(1)
        print(f"\n✅ Validation passed")

    # Step 2: Backup (unless --skip-backup or --dry-run)
    if not skip_backup and not dry_run:
        print(f"\n{'=' * 60}")
        print("STEP 2: BACKING UP CURRENT LIVE PAGES")
        print("=" * 60)
        for wp_id in page_ids:
            try:
                backup_path = backup_page(wp_id)
                print(f"  ✓ Page {wp_id} ({PAGE_NAMES[wp_id]}) → {os.path.relpath(backup_path, REPO)}")
            except Exception as e:
                print(f"  ⚠ Page {wp_id} backup failed: {e}")

    # Step 3: Deploy
    print(f"\n{'=' * 60}")
    print(f"STEP 3: {'DRY RUN' if dry_run else 'DEPLOYING'}")
    print("=" * 60)

    results = {}
    for wp_id in page_ids:
        source = os.path.join(REPO, PAGE_REGISTRY[wp_id])
        name = PAGE_NAMES[wp_id]

        if not os.path.exists(source):
            print(f"  SKIP {name}: source file not found")
            results[wp_id] = False
            continue

        success = deploy_page(wp_id, source, dry_run=dry_run)
        icon = "✓" if success else "✗"
        print(f"  {icon} {name} (ID {wp_id})")
        results[wp_id] = success

    # Step 4: Verify (unless dry run)
    if not dry_run:
        print(f"\n{'=' * 60}")
        print("STEP 4: POST-DEPLOY VERIFICATION")
        print("=" * 60)
        for wp_id in page_ids:
            if not results.get(wp_id):
                continue
            checks, link = verify_page(wp_id)
            if checks:
                issues = []
                if checks["old-nav"] > 0:
                    issues.append(f"{checks['old-nav']} old nav links")
                if checks["bad-linkedin"] > 0:
                    issues.append(f"{checks['bad-linkedin']} bad LinkedIn URLs")
                status = "✓" if not issues else "⚠"
                detail = f"footer-cols={checks['footer-cols']}"
                if issues:
                    detail += f", issues: {', '.join(issues)}"
                print(f"  {status} {PAGE_NAMES[wp_id]}: {detail}")
            else:
                print(f"  ? {PAGE_NAMES[wp_id]}: verification failed")

    # Summary
    ok = sum(1 for v in results.values() if v)
    fail = sum(1 for v in results.values() if not v)
    print(f"\n{'=' * 60}")
    print(f"{'DRY RUN ' if dry_run else ''}COMPLETE: {ok} deployed, {fail} failed")
    print("=" * 60)


if __name__ == "__main__":
    main()
