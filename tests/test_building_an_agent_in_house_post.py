"""PAC-307: the "Building an agent in-house?" Resources post.

The PDF is the one-pager pinned from Maya's copy of the letter (sha256 below).
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
# Maya's letter PDF, created 2026-11-06, one page. Do not replace without Will's OK.
PDF_SHA256 = "7a4cd2be311413bdfe13d00e8737240ba0f8707eb4897d07a6cc0968cda007d4"
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
