"""A blog post body is checked as copy, not as a page.

src/blog/posts/content-*.html is pasted into WordPress, which supplies the nav and footer, so validate.py must not
fail it for having none. Every other file still must have them.
"""
import importlib.util
import pathlib

REPO = pathlib.Path(__file__).resolve().parent.parent
POSTS_DIR = REPO / "src" / "blog" / "posts"

spec = importlib.util.spec_from_file_location("validate", REPO / "scripts" / "validate.py")
validate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validate)

PAGE_CHROME = ("NAV MISSING", "FOOTER MISSING", "FOOTER BROKEN", "FOOTER:")


def _chrome_findings(path):
    _, warnings, failures = validate.validate_file(str(path), strict=True)
    return [m for m in warnings + failures if m.startswith(PAGE_CHROME)]


def test_every_post_body_skips_the_nav_and_footer_checks():
    bodies = sorted(POSTS_DIR.glob("content-*.html"))
    assert bodies
    for body in bodies:
        assert _chrome_findings(body) == [], body.name


def test_a_page_without_nav_or_footer_still_fails(tmp_path):
    page = tmp_path / "content-not-a-post.html"
    page.write_text("<p>No nav, no footer.</p>")
    findings = _chrome_findings(page)
    assert any(m.startswith("NAV MISSING") for m in findings)
    assert any(m.startswith("FOOTER MISSING") for m in findings)
