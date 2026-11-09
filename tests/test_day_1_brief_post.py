"""PAC-221: the "What a Day 1 brief contains" post. Spec: docs/plan/2026-11-08-day-1-brief-post-spec.md

The outline, the headlines and the figures are checked against the PDF itself rather than a typed copy of it, so
the test can't agree with a list that has drifted from the file a reader downloads. Needs poppler's pdftotext.
"""
import hashlib
import html.parser
import importlib.util
import json
import pathlib
import re
import shutil
import subprocess
import sys
from urllib.parse import parse_qs, urlsplit

import pytest

REPO = pathlib.Path(__file__).resolve().parent.parent
POSTS_DIR = REPO / "src" / "blog" / "posts"
SLUG = "what-a-day-1-brief-contains"
CONTENT = POSTS_DIR / f"content-{SLUG}.html"
BUILD = POSTS_DIR / f"{SLUG}-build.html"
PDF = REPO / "src" / "blog" / "assets" / "october-2026-day-1-sales-review.pdf"
PDF_SHA256 = "81becec205e6cf00e2b882477e66f5150d214d5d3bb178d9ca4f8e7d3aee9d0f"  # The file Will cleared, 2026-11-08.
PDF_LINK = "/day-1-brief-pdf/"
CAMPAIGN = "day1-brief"
PAGES = 13

FIGURE = re.compile(r"\$\d[\d,]*(?:\.\d+)?[KMB]?")
# Names and notes from inside the build, which a buyer-facing page has no reason to carry.
INTERNAL = re.compile(
    r"report[_-]day1|as_of|\b(?:grain|only|by|period|movement)=|revenue_plan|movement_deals|rep_attainment"
    r"|arr_product_waterfall|top_movers|new_bookings|deals_in_pipe|deal_detail|whitespace_detail|pipeline_bridge"
    r"|cold[- ]run|\btraps?\b|open items?",
    re.IGNORECASE,
)


def squash(text):
    return " ".join(text.split())


class Section:
    def __init__(self, heading=""):
        self.heading = heading
        self.text = ""
        self.ordered_lists = []


class Article(html.parser.HTMLParser):
    """The body split at its H2s, with each section's ordered lists and all the body's links."""

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.sections = [Section()]
        self.links = []  # [href, text]
        self.forms = 0
        self._in_h2 = False
        self._in_link = False
        self._lists = []  # The open lists, innermost last.
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        if tag == "h2":
            self.sections.append(Section())
            self._in_h2 = True
        elif tag == "form":
            self.forms += 1
        elif tag == "a":
            self.links.append([dict(attrs).get("href") or "", ""])
            self._in_link = True
        elif tag in ("ol", "ul"):
            if tag == "ol" and not self._lists:
                self.sections[-1].ordered_lists.append([])
            self._lists.append(tag)
        elif tag == "li" and self._lists == ["ol"]:
            self.sections[-1].ordered_lists[-1].append("")

    def handle_endtag(self, tag):
        if tag == "h2":
            self._in_h2 = False
        elif tag == "a":
            self._in_link = False
        elif tag in ("ol", "ul") and self._lists:
            self._lists.pop()

    def handle_data(self, data):
        section = self.sections[-1]
        if self._in_h2:
            section.heading += data
        section.text += data
        if self._in_link:
            self.links[-1][1] += data
        if self._lists and self._lists[0] == "ol" and section.ordered_lists and section.ordered_lists[-1]:
            section.ordered_lists[-1][-1] += data

    def section(self, pattern):
        found = [s for s in self.sections if re.search(pattern, s.heading, re.IGNORECASE)]
        assert found, (
            f"No H2 matches /{pattern}/. Headings: {[squash(s.heading) for s in self.sections if s.heading]}"
        )
        return found[0]

    def demo_connect_links(self):
        return [href for href, _ in self.links if urlsplit(href).path.rstrip("/").endswith("/demo-connect")]


@pytest.fixture(scope="module")
def content():
    assert CONTENT.is_file(), f"{CONTENT.relative_to(REPO)} isn't there yet."
    return CONTENT.read_text(encoding="utf-8")


@pytest.fixture(scope="module")
def article(content):
    return Article(content)


@pytest.fixture(scope="module")
def build():
    assert BUILD.is_file(), f"{BUILD.relative_to(REPO)} isn't there yet."
    return BUILD.read_text(encoding="utf-8")


@pytest.fixture(scope="module")
def json_ld(build):
    return re.findall(r'<script type="application/ld\+json">(.*?)</script>', build, re.DOTALL)


@pytest.fixture(scope="module")
def published_text(content, json_ld):
    """What a reader or a search engine gets from this post: the body and the structured data, FAQ included."""
    return "\n".join([content, *json_ld])


@pytest.fixture(scope="module")
def deck_pages():
    assert PDF.is_file(), f"{PDF.relative_to(REPO)} isn't there yet."
    pdftotext = shutil.which("pdftotext")
    assert pdftotext, "pdftotext isn't on PATH (brew install poppler), so the PDF can't be read."
    text = subprocess.run([pdftotext, str(PDF), "-"], capture_output=True, text=True, check=True).stdout
    pages = text.split("\f")
    return pages[:-1] if not pages[-1].strip() else pages


@pytest.fixture(scope="module")
def outline(article):
    lists = [lst for s in article.sections if re.search(r"slide|outline", s.heading, re.I) for lst in s.ordered_lists]
    assert lists, "No <ol> under an H2 that names the slides or the outline."
    return [squash(item) for item in lists[0]]


def posts_entry():
    spec = importlib.util.spec_from_file_location("build_posts", REPO / "src" / "blog" / "build-posts.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    found = [post for post in module.POSTS if post["id"] == SLUG]
    assert found, f"build-posts.py's POSTS has no entry with id {SLUG}."
    return found[0]


def walk(node):
    """Every dict inside a JSON-LD block."""
    if isinstance(node, dict):
        yield node
        node = list(node.values())
    if isinstance(node, list):
        for child in node:
            yield from walk(child)


# ---------------------------------------------------------------- the PDF


def test_pdf_is_the_file_will_cleared():
    assert PDF.is_file(), f"{PDF.relative_to(REPO)} isn't there yet."
    assert hashlib.sha256(PDF.read_bytes()).hexdigest() == PDF_SHA256, (
        "This isn't the PDF Will confirmed was safe to publish. Copy it byte for byte."
    )


def test_pdf_has_thirteen_pages(deck_pages):
    assert len(deck_pages) == PAGES


def test_post_links_the_pdf_by_its_short_link(article):
    labels = [squash(text) for href, text in article.links if href == PDF_LINK]
    assert labels, f"No link to {PDF_LINK}, so the PDF can't be downloaded from the post."
    assert any("pdf" in label.lower() for label in labels), f"The download link doesn't say PDF: {labels}"


def test_post_never_links_the_pdf_file_itself(article):
    assert PDF_LINK in [href for href, _ in article.links], f"No link to {PDF_LINK} yet."
    direct = [href for href, _ in article.links if urlsplit(href).path.lower().endswith(".pdf")]
    assert not direct, f"Link the short link, not the file: {direct}"


# ---------------------------------------------------------------- the outline, page for page


def test_outline_has_one_entry_per_pdf_page(outline, deck_pages):
    assert len(outline) == len(deck_pages) == PAGES


@pytest.mark.parametrize("page", range(1, PAGES + 1))
def test_outline_entry_opens_with_that_pages_headline(outline, deck_pages, page):
    assert len(outline) >= page, f"The outline stops at {len(outline)} entries."
    headline = squash(next(line for line in deck_pages[page - 1].splitlines() if line.strip()))
    assert outline[page - 1].startswith(headline), (
        f"Entry {page} should open with page {page}'s headline, {headline!r}. It reads: {outline[page - 1]!r}"
    )


@pytest.mark.parametrize(
    "page, label",
    [
        (7, "top movers"),
        (8, "rep"),
        (9, "close"),
        (10, "pipe bridge"),
        (11, "appendix"),
        (12, "appendix"),
        (13, "appendix"),
    ],
)
def test_outline_keeps_the_decks_order(outline, page, label):
    assert len(outline) >= page, f"The outline stops at {len(outline)} entries."
    assert label in outline[page - 1].lower(), f"Entry {page} should say {label!r}. It reads: {outline[page - 1]!r}"


# ---------------------------------------------------------------- the units rule and the tie-outs


@pytest.mark.parametrize("example", ["$1M", "$1.53M", "$386K"])
def test_units_rule_states_the_threshold_and_shows_both_sides(article, example):
    assert example in article.section(r"\bunits?\b").text


def test_no_figure_under_a_million_prints_in_millions(published_text):
    wrong = re.findall(r"\$0\.\d+M", published_text)
    assert not wrong, f"The units rule prints these in $K: {wrong}"


@pytest.mark.parametrize(
    "tie, words, figures",
    [
        ("markets to company", ["market"], ["$950K", "$407K", "$173K", "$1.53M"]),
        ("segments to company", ["segment"], ["$1.08M", "$373K", "$78K", "$1.53M"]),
        ("bridge to Net New ARR", ["bridge"], ["$2.68M", "$1.15M", "$1.53M"]),
        ("movers card to its rows", ["mover"], []),
        ("reps to the team figure", ["rep"], []),
    ],
)
def test_tie_outs_are_worked_on_octobers_numbers(article, tie, words, figures):
    text = article.section(r"tie[- ]?outs?").text
    for word in words:
        assert word in text.lower(), f"The tie-outs don't cover {tie}: no {word!r}."
    for figure in figures:
        assert figure in text, f"The {tie} tie-out should show {figure}."


def test_every_dollar_figure_is_in_the_deck(published_text, deck_pages):
    deck = "".join(deck_pages)
    known = set(FIGURE.findall(deck)) | set(FIGURE.findall(re.sub(r"\s+", "", deck)))  # A table can wrap "$2.27 M".
    known.add("$1M")  # The units rule's threshold.
    cited = {figure.rstrip(",") for figure in FIGURE.findall(published_text)}
    invented = sorted(cited - known)
    assert not invented, f"These figures aren't in the PDF: {invented}"


def test_post_says_the_numbers_are_the_demo_books(article):
    text = squash(" ".join(section.text for section in article.sections))
    assert re.search(r"demo (book|data|company|portal)|fictional|sample data", text, re.IGNORECASE), (
        "A reader would take a 20% miss and named reps for a real company. Say they're the demo book's."
    )


# ---------------------------------------------------------------- the CTA


def test_cta_carries_the_campaign_and_reaches_demo_connect(article):
    links = article.demo_connect_links()
    assert links, "The article body has no link to /demo-connect/."
    for href in links:
        parts = urlsplit(href)
        assert parts.netloc in ("", "getpacerai.com", "www.getpacerai.com"), href
        assert parts.path == "/demo-connect/", href
        query = parse_qs(parts.query)
        assert query.get("utm_campaign") == [CAMPAIGN], f"Wrong or missing utm_campaign: {href}"
        assert query.get("utm_source") and query.get("utm_medium"), f"Not fully UTM-tagged: {href}"


def test_cta_names_the_prompt(article):
    text = squash(" ".join(section.text for section in article.sections))
    assert "build my day 1 brief" in text.lower()


# ---------------------------------------------------------------- what stays out


def test_internal_names_stay_out_of_the_post(published_text):
    found = sorted(set(INTERNAL.findall(published_text)))
    assert not found, f"This repo and this page are public. Write these as buyer-facing copy: {found}"


def test_internal_names_stay_out_of_the_pdf(deck_pages):
    found = sorted(set(INTERNAL.findall("".join(deck_pages))))
    assert not found, f"This repo and this PDF are public: {found}"


def test_no_form_on_this_post(article, build):
    # PAC-105 owns the demo-connect section and the "send me the PDF" form. A cloned shell brings its own form.
    assert article.forms == 0, "A form in the article body belongs to PAC-105."
    assert "<form" not in build, "The page's shell still carries a form, and PAC-105 owns this post's form."


def test_post_is_held_back_from_the_live_site(build, live_pages):
    # The post sends people to a prompt that doesn't work until PAC-104 ships: merge it, don't deploy it.
    # Delete this test in the change that deploys.
    assert build
    assert SLUG not in (REPO / "scripts" / "deploy.py").read_text(encoding="utf-8"), (
        "The post is in deploy.py's registry before it has a WordPress page."
    )
    for page, source in live_pages.items():
        for wired in (SLUG, PDF_LINK, CAMPAIGN):
            assert wired not in source, f"{page} is live and links {wired} before the post is deployed."


# ---------------------------------------------------------------- the page


def test_post_is_registered_with_its_title():
    assert posts_entry()["title"].lower() == "what a day 1 brief contains"


def test_page_carries_the_article_body_unchanged(content, build):
    assert squash(content) in squash(build), "The build's article has drifted from the content file."


def test_page_has_the_title_and_no_placeholders(build):
    headings = [squash(re.sub(r"<[^>]+>", " ", h1)) for h1 in re.findall(r"<h1[^>]*>(.*?)</h1>", build, re.DOTALL)]
    assert [h.lower() for h in headings] == ["what a day 1 brief contains"], headings
    assert "{{" not in build, "A template placeholder is still in the page."


def test_page_is_bone_and_no_other_post_went_dark(build):
    assert "#f5f4ef" in build.lower(), "Every page is bone (#F5F4EF)."
    dark = sorted(path.name for path in POSTS_DIR.glob("*-build.html") if "#080e1c" in path.read_text("utf-8").lower())
    assert not dark, f"These are dark, which is what build-posts.py's stale template does to them: {dark}"


def test_json_ld_describes_this_post(json_ld):
    blocks = [json.loads(block) for block in json_ld]
    nodes = [node for block in blocks for node in walk(block)]
    headlines = [node["headline"] for node in nodes if node.get("@type") == "Article"]
    assert [h.lower() for h in headlines] == ["what a day 1 brief contains"], headlines

    urls = re.findall(r"getpacerai\.com/resources/([a-z0-9-]+)", "\n".join(json_ld))
    assert SLUG in urls, f"The structured data never gives this post's URL, /resources/{SLUG}/."
    assert set(urls) == {SLUG}, f"The structured data still names other posts: {sorted(set(urls) - {SLUG})}"

    asked = {n["name"] for node in nodes if node.get("@type") == "FAQPage" for n in node.get("mainEntity", [])}
    assert asked == {item["q"] for item in posts_entry().get("faq", [])}, (
        "The FAQ in the structured data isn't this post's."
    )


def test_page_passes_the_strict_validator(build):
    assert build
    result = subprocess.run(
        [sys.executable, "scripts/validate.py", "--strict", str(BUILD.relative_to(REPO))],
        cwd=REPO,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stdout[-1500:]
