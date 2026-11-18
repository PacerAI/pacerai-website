"""PAC-307: the "Building an agent in-house?" Resources post.

The PDF is the one-pager printed from src/blog/assets/building-an-agent-in-house-onepager.html
(Maya's letter, reprinted with public pricing per Will, Nov 18; sha256 below).
The post must link it by the short link, never the media file. No hub card yet.
"""
import hashlib
import pathlib
import re
import subprocess

import pytest

REPO = pathlib.Path(__file__).resolve().parent.parent
POSTS_DIR = REPO / "src" / "blog" / "posts"
SLUG = "building-an-agent-in-house"
CONTENT = POSTS_DIR / f"content-{SLUG}.html"
BUILD = POSTS_DIR / f"{SLUG}-build.html"
PDF = REPO / "src" / "blog" / "assets" / "building-an-agent-in-house.pdf"
# Maya's letter, reprinted 2026-11-18 with public pricing (Will, Nov 18), one page.
# Do not replace without Will's OK.
PDF_SHA256 = "8d33fd74ccc2977c638fb44bc20e75a99466f876801519eef3ea7b1b6735c3b0"
ONEPAGER = REPO / "src" / "blog" / "assets" / "building-an-agent-in-house-onepager.html"
PUBLIC_PRICES = ["Rep $100", "Manager $500", "SLT $1,000", "per user a month", "services from $15,000"]
CTA_URL = (
    "https://getpacerai.com/building-an-agent-in-house-pdf/"
    "?utm_source=linkedin&amp;utm_medium=social&amp;utm_campaign=build-vs-buy"
)
PDF_LINK = "/building-an-agent-in-house-pdf/"
PAGES = 1


def test_pdf_is_the_pinned_one_pager():
    assert PDF.is_file()
    sha = hashlib.sha256(PDF.read_bytes()).hexdigest()
    assert sha == PDF_SHA256
    if shutil_which_pdftotext():
        info = subprocess.check_output(["pdfinfo", str(PDF)], text=True)
        assert re.search(r"^Pages:\s+1\s*$", info, re.M)
        assert "Building an agent in-house?" in info


def shutil_which_pdftotext():
    from shutil import which
    return which("pdfinfo")


def test_content_and_build_link_the_short_link_only():
    content = CONTENT.read_text(encoding="utf-8")
    build = BUILD.read_text(encoding="utf-8")
    assert PDF_LINK in content
    assert PDF_LINK in build
    assert content.count(PDF_LINK) >= 2
    assert "wp-content/uploads" not in content
    assert "building-an-agent-in-house.pdf" not in content


def test_build_uses_current_nav_and_does_not_keep_the_day_1_post():
    build = BUILD.read_text(encoding="utf-8")
    assert "Building an Agent In-house? The AI Engineering Ladder" in build
    assert "Build vs buy" in build
    assert 'href="/pricing/"' in build
    assert 'href="/resources/"' in build
    assert ">Forecasting</a>" in build
    assert 'href="/compare/"' in build
    assert "Daily Pacing Agent" not in build
    assert "/#revenue-modeling-agent" not in build
    assert "what-a-day-1-brief-contains" not in build
    assert "day-1-brief-pdf" not in build
    # Stale template markers that the PAC-221 shell already left behind.
    assert 'href="/blog/"' not in build
    assert "/solutions/customer-data-cube/" not in build


def test_post_files_do_not_quote_retired_monthly_price():
    """Will, Nov 17: the retired monthly comparison figure must not appear in the post files."""
    needle = "1,800"
    files = [
        CONTENT,
        BUILD,
        REPO / "docs" / "plan" / "2026-11-17-building-an-agent-in-house-post.md",
        REPO / "src" / "blog" / "assets" / "building-an-agent-in-house-build.html",
        REPO / "src" / "blog" / "build-posts.py",
    ]
    for path in files:
        assert needle not in path.read_text(encoding="utf-8"), path


def test_hub_and_deploy_are_untouched():
    hub = (REPO / "src" / "blog" / "index-build.html").read_text(encoding="utf-8")
    deploy = (REPO / "scripts" / "deploy.py").read_text(encoding="utf-8")
    assert "building-an-agent-in-house" not in hub
    assert "building-an-agent-in-house" not in deploy


def test_one_pager_source_and_pdf_quote_public_pricing_only():
    """Will, Nov 18: public pricing on the one-pager; no retired figure, no Startup or Advisor tier."""
    src = ONEPAGER.read_text(encoding="utf-8")
    flat = re.sub(r"<[^>]+>", "", src)
    for price in PUBLIC_PRICES:
        assert price in flat, price
    for gone in ("1,800", "1800", "Startup", "Advisor"):
        assert gone not in src, gone
    from shutil import which
    if which("pdftotext"):
        text = subprocess.check_output(["pdftotext", str(PDF), "-"], text=True)
        squashed = " ".join(text.split())
        for price in PUBLIC_PRICES:
            assert price in squashed, price
        for gone in ("1,800", "1800", "Startup", "Advisor"):
            assert gone not in text, gone


def test_post_shows_no_pacer_prices():
    """Will, Nov 18: the post does not show Pacer AI prices."""
    for path in (CONTENT, BUILD, REPO / "src" / "blog" / "assets" / "building-an-agent-in-house-build.html"):
        text = path.read_text(encoding="utf-8")
        assert "What does Pacer AI cost?" not in text, path
        for needle in ("per user a month", "$100", "$500", "$1,000", "$15,000", "Priced per seat"):
            assert needle not in text, (path, needle)


def test_download_cta_carries_social_utm_tags():
    for path in (CONTENT, BUILD):
        text = path.read_text(encoding="utf-8")
        assert f'href="{CTA_URL}"' in text, path
        assert "utm_medium=social" in text and "utm_campaign=build-vs-buy" in text
