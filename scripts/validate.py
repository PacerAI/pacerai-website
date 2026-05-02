#!/usr/bin/env python3
"""
Pre-deploy validation for getpacerai.com pages.
Catches common issues before they go live on WordPress.

Usage:
    python3 scripts/validate.py                          # Validate all src/ pages
    python3 scripts/validate.py src/homepage/index-build.html  # Validate one file
    python3 scripts/validate.py --strict                 # Treat WARNs as FAILs
"""
import re
import sys
import os
import glob

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAR_LIMIT = 67000  # 1K buffer under 68K hard limit
HOMEPAGE_FILE = "src/homepage/index-build.html"

# All deployable src files
DEFAULT_FILES = [
    "src/homepage/index-build.html",
    "src/solutions/arr-snowball.html",
    "src/solutions/customer-data-cube.html",
    "src/solutions/transaction-readiness.html",
    "src/solutions/revops-transformation-pkg.html",
    "src/solutions/gtm-transformation-pkg.html",
    "src/solutions/fpanda-transformation-pkg.html",
    "src/platform/overview.html",
    "src/team/team-page.html",
    "src/team/about.html",
    "src/team/contact.html",
    "src/blog/index-build.html",
]


def validate_file(filepath, strict=False):
    """Run all validation checks on a single file. Returns (passes, warnings, failures)."""
    rel = os.path.relpath(filepath, REPO)
    is_homepage = rel == HOMEPAGE_FILE

    with open(filepath) as f:
        content = f.read()

    passes = []
    warnings = []
    failures = []

    # 1. Character count
    char_count = len(content)
    if char_count > CHAR_LIMIT:
        failures.append(f"CHAR COUNT: {char_count:,} chars (limit {CHAR_LIMIT:,}, over by {char_count - CHAR_LIMIT:,})")
    else:
        headroom = CHAR_LIMIT - char_count
        passes.append(f"CHAR COUNT: {char_count:,} chars ({headroom:,} headroom)")

    # 2. Forbidden id= attributes
    ids = re.findall(r' id="([^"]+)"', content)
    allowed = {"pacerai-homepage", "pacerai-post", "pacerai-blog"}
    bad_ids = [i for i in ids if i not in allowed and not i.startswith("wp-")]
    if bad_ids:
        warnings.append(f"ID ATTRIBUTES: {len(bad_ids)} non-standard ids found: {bad_ids[:5]}")
    else:
        passes.append("ID ATTRIBUTES: OK")

    # 3. HTML comments (WordPress block parser issue)
    comments = re.findall(r'<!--(?!.*wp:).*?-->', content, re.DOTALL)
    if comments:
        warnings.append(f"HTML COMMENTS: {len(comments)} comments found (WordPress may choke)")
    else:
        passes.append("HTML COMMENTS: None (OK)")

    # 4. Local image paths
    local_imgs = re.findall(r'src="(?:img/|/01_Foundation/|/Users/)[^"]*"', content)
    if local_imgs:
        failures.append(f"LOCAL IMAGES: {len(local_imgs)} local paths found (won't work on WordPress): {local_imgs[:3]}")
    else:
        passes.append("LOCAL IMAGES: None (OK)")

    # 5. LinkedIn URL check
    bad_linkedin = re.findall(r'linkedin\.com/team/', content)
    if bad_linkedin:
        failures.append(f"LINKEDIN URL: {len(bad_linkedin)} instances of linkedin.com/team/ (should be /company/)")
    else:
        passes.append("LINKEDIN URL: OK (/company/)")

    # 6. Nav consistency
    old_nav = content.count("/#investor-questions")
    if old_nav:
        failures.append(f"NAV LINK: {old_nav} instances of /#investor-questions (should be /#use-cases)")
    else:
        passes.append("NAV LINK: OK (/#use-cases)")

    # 7. Footer consistency
    footer_cols = content.count("footer-col-head")
    # Subtract CSS definition occurrences (look for rules not HTML)
    css_refs = len(re.findall(r'\.footer-col-head\s*\{', content))
    html_cols = footer_cols - css_refs
    if html_cols < 4:
        warnings.append(f"FOOTER: Only {html_cols} column headers (expected 4: Use Cases, Solutions, Team, Connect)")
    else:
        passes.append(f"FOOTER: {html_cols} columns (OK)")

    # 8. Inline CSS size check (homepage only)
    if is_homepage:
        style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
        if style_match:
            css_size = len(style_match.group(1))
            if css_size > 30000:
                warnings.append(f"INLINE CSS: {css_size:,} chars in homepage (consider WPCode externalization)")
            else:
                passes.append(f"INLINE CSS: {css_size:,} chars (OK)")

    # 9. Check for empty/missing footer
    if "<footer>" not in content:
        failures.append("FOOTER MISSING: No <footer> tag found")
    elif "</footer>" not in content:
        failures.append("FOOTER BROKEN: <footer> found but no </footer>")
    else:
        passes.append("FOOTER STRUCTURE: OK")

    # 10. Check for empty/missing nav
    if "<nav>" not in content:
        failures.append("NAV MISSING: No <nav> tag found")
    else:
        passes.append("NAV STRUCTURE: OK")

    return passes, warnings, failures


def main():
    strict = "--strict" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if args:
        files = [os.path.join(REPO, f) if not os.path.isabs(f) else f for f in args]
    else:
        files = [os.path.join(REPO, f) for f in DEFAULT_FILES]

    total_pass = 0
    total_warn = 0
    total_fail = 0

    print("=" * 60)
    print("PRE-DEPLOY VALIDATION — getpacerai.com")
    print("=" * 60)

    for filepath in files:
        if not os.path.exists(filepath):
            print(f"\n  SKIP  {os.path.relpath(filepath, REPO)} (file not found)")
            continue

        rel = os.path.relpath(filepath, REPO)
        passes, warnings, failures = validate_file(filepath, strict)

        status = "FAIL" if failures else ("WARN" if warnings else "PASS")
        icon = {"PASS": "✅", "WARN": "⚠️ ", "FAIL": "❌"}[status]

        print(f"\n{icon} {rel}")
        for p in passes:
            print(f"     ✓ {p}")
        for w in warnings:
            print(f"     ⚠ {w}")
        for f in failures:
            print(f"     ✗ {f}")

        total_pass += len(passes)
        total_warn += len(warnings)
        total_fail += len(failures)

    print(f"\n{'=' * 60}")
    print(f"SUMMARY: {total_pass} passed, {total_warn} warnings, {total_fail} failures")

    if total_fail > 0:
        print("STATUS: ❌ BLOCKED — fix failures before deploying")
        sys.exit(1)
    elif total_warn > 0 and strict:
        print("STATUS: ⚠️  BLOCKED (--strict mode) — fix warnings before deploying")
        sys.exit(1)
    elif total_warn > 0:
        print("STATUS: ⚠️  OK to deploy (warnings only)")
        sys.exit(0)
    else:
        print("STATUS: ✅ All clear — safe to deploy")
        sys.exit(0)


if __name__ == "__main__":
    main()
