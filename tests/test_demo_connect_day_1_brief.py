"""PAC-105, door 1: the demo-connect page's Day 1 brief hero, and the tag the button carries into the connector.
Spec: docs/plan/2026-11-10-demo-connect-day-1-brief-spec.md

The footer script is run under Node (tests/harness_footer.mjs), because the tag is added in the browser: WordPress
strips scripts from page HTML. The headline slide is compared with the PDF page itself, rendered by poppler.
"""
import html
import json
import pathlib
import re
import shutil
import subprocess
import tempfile
from urllib.parse import parse_qs, urlsplit

import pytest

REPO = pathlib.Path(__file__).resolve().parent.parent
PAGE = REPO / "src" / "demo-connect.html"
FOOTER = REPO / "src" / "wpcode" / "footer.js"
HARNESS = REPO / "tests" / "harness_footer.mjs"
PDF = REPO / "src" / "blog" / "assets" / "october-2026-day-1-sales-review.pdf"
SLIDE = REPO / "img" / "demo-connect" / "day-1-brief-headline-slide.png"
SLIDE_UPLOAD = "pacer-ai-demo-connect-day-1-brief-headline-slide.png"
HEADLINE_PAGE = 2  # The PAC-221 post's outline calls page 2 "The headline".
PROMPT = "Build my Day 1 brief"

DOOR_2 = (
    "https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Pacer%20AI%20-%20Demo"
    "&connectorUrl=https%3A%2F%2Fdemo.getpacerai.com%2Fmcp"
)
LINKEDIN = {"utm_source": "linkedin", "utm_medium": "social", "utm_campaign": "day1-brief"}
ADD_LINK = re.compile(r'<a\b[^>]*href="([^"]*claude\.ai/customize/connectors[^"]*)"', re.IGNORECASE)


def squash(text):
    return " ".join(text.split())


def text_of(fragment):
    return squash(html.unescape(re.sub(r"<[^>]+>", " ", fragment)))


@pytest.fixture(scope="module")
def page():
    return PAGE.read_text(encoding="utf-8")


@pytest.fixture(scope="module")
def hero(page):
    found = re.search(r'<section class="hero"[^>]*>(.*?)</section>', page, re.DOTALL)
    assert found, 'src/demo-connect.html has no <section class="hero">.'
    return found.group(1)


@pytest.fixture(scope="module")
def hero_href(hero):
    links = ADD_LINK.findall(hero)
    assert links, "The hero has no Add-to-Claude link."
    return html.unescape(links[0])


@pytest.fixture(scope="module")
def headline():
    pdftotext = shutil.which("pdftotext")
    assert pdftotext, "pdftotext isn't on PATH (brew install poppler)."
    text = subprocess.run(
        [pdftotext, "-f", str(HEADLINE_PAGE), "-l", str(HEADLINE_PAGE), str(PDF), "-"],
        capture_output=True, text=True, check=True,
    ).stdout
    return squash(next(line for line in text.splitlines() if line.strip()))


def footer(url, anchors=(), call=(), referrer=""):
    node = shutil.which("node")
    assert node, "node isn't on PATH, so the footer script can't be run."
    payload = {"footer": str(FOOTER), "url": url, "referrer": referrer, "anchors": list(anchors), "call": list(call)}
    result = subprocess.run([node, "--no-warnings", str(HARNESS)], input=json.dumps(payload),
                            capture_output=True, text=True, timeout=60)
    assert result.returncode == 0, result.stderr[-1500:]
    return json.loads(result.stdout)


def connector_url(href):
    """The connector URL inside a claude.ai add link, and the link's other parameters."""
    query = parse_qs(urlsplit(href).query, keep_blank_values=True)
    assert query.get("connectorUrl"), f"No connectorUrl in {href}"
    return query.pop("connectorUrl")[0], query


# ---------------------------------------------------------------- the hero


def test_hero_shows_the_prompt_to_type(hero):
    assert PROMPT.lower() in text_of(hero).lower(), f'The hero doesn\'t give the prompt, "{PROMPT}".'


def test_hero_has_one_primary_action_above_its_image(hero):
    links = ADD_LINK.findall(hero)
    assert len(links) == 1, f"The hero should have exactly one Add-to-Claude button, not {len(links)}."
    image = re.search(r"<img\b", hero)
    assert image, "The hero has no image."
    button = ADD_LINK.search(hero).start()
    prompt = text_of(hero[: image.start()]).lower().find(PROMPT.lower())
    assert button < image.start(), "The button comes after the hero image, so on a phone it falls below it."
    assert prompt != -1, "The prompt isn't above the hero image."


def test_hero_image_is_the_headline_slide(hero, headline):
    images = re.findall(r"<img\b[^>]*>", hero)
    assert images, "The hero has no image."
    src = re.search(r'src="([^"]+)"', images[0]).group(1)
    assert urlsplit(src).path.endswith("/" + SLIDE_UPLOAD), f"The hero image should be {SLIDE_UPLOAD}: {src}"
    alt = re.search(r'alt="([^"]*)"', images[0])
    assert alt and headline in squash(html.unescape(alt.group(1))), (
        f"The hero image's alt should give the slide's headline, {headline!r}."
    )


def test_static_button_is_door_two(hero_href):
    # Without the footer script, both doors add the same connector under the same name.
    assert hero_href == DOOR_2


# ---------------------------------------------------------------- the slide image


def test_headline_slide_is_page_two_of_the_deck():
    from PIL import Image, ImageChops, ImageStat

    assert SLIDE.is_file(), f"{SLIDE.relative_to(REPO)} isn't there yet."
    slide = Image.open(SLIDE).convert("RGB")
    width, height = slide.size
    assert width >= 1600, f"The slide is {width}px wide; the hero needs at least 1600px for a sharp image."
    assert abs(width / height - 16 / 9) < 0.01, f"The slide is {width}x{height}, not 16:9 like the deck."

    pdftoppm = shutil.which("pdftoppm")
    assert pdftoppm, "pdftoppm isn't on PATH (brew install poppler)."
    distance = {}
    with tempfile.TemporaryDirectory() as tmp:
        for page in (1, HEADLINE_PAGE, 3):
            out = pathlib.Path(tmp) / f"p{page}"
            subprocess.run([pdftoppm, "-f", str(page), "-l", str(page), "-png", "-singlefile",
                            "-scale-to-x", str(width), "-scale-to-y", str(height), str(PDF), str(out)], check=True)
            rendered = Image.open(f"{out}.png").convert("RGB").resize(slide.size)
            distance[page] = sum(ImageStat.Stat(ImageChops.difference(slide, rendered)).mean) / 3
    assert distance[HEADLINE_PAGE] == min(distance.values()), f"The image looks more like another page: {distance}"
    assert distance[HEADLINE_PAGE] < 8, f"The image isn't page {HEADLINE_PAGE} as rendered: {distance}"


# ---------------------------------------------------------------- the tag rides into the connector


def test_button_carries_the_linkedin_tag_into_the_connector_url(hero_href):
    run = footer("https://getpacerai.com/demo-connect/?" + "&".join(f"{k}={v}" for k, v in LINKEDIN.items()),
                 call=[hero_href])
    assert run["has_function"], "footer.js has no window.pacerConnectorHref."
    tagged, rest = connector_url(run["called"][0])
    _, door_2_rest = connector_url(DOOR_2)
    assert rest == door_2_rest, "Only connectorUrl may change; the modal and the connector's name stay as they are."
    parts = urlsplit(tagged)
    assert (parts.scheme, parts.netloc, parts.path) == ("https", "demo.getpacerai.com", "/mcp"), tagged
    assert {k: v[0] for k, v in parse_qs(parts.query).items()} == LINKEDIN, f"The tag didn't survive: {tagged}"


def test_footer_tags_every_add_link_on_the_page(hero_href):
    run = footer("https://getpacerai.com/demo-connect/?" + "&".join(f"{k}={v}" for k, v in LINKEDIN.items()),
                 anchors=[hero_href, hero_href])
    for href in run["anchors"]:
        tagged, _ = connector_url(href)
        assert parse_qs(urlsplit(tagged).query).get("utm_campaign") == ["day1-brief"], (
            f"An Add-to-Claude link on the page wasn't tagged when the footer ran: {href}"
        )


def test_the_blog_posts_tag_is_carried_too(hero_href):
    run = footer("https://getpacerai.com/demo-connect/?utm_source=getpacerai&utm_medium=blog&utm_campaign=day1-brief",
                 call=[hero_href])
    assert run["has_function"], "footer.js has no window.pacerConnectorHref."
    tagged, _ = connector_url(run["called"][0])
    query = {k: v[0] for k, v in parse_qs(urlsplit(tagged).query).items()}
    assert query.get("utm_source") == "getpacerai" and query.get("utm_medium") == "blog", (
        f"The button credited the wrong source: {tagged}"
    )


def test_a_visitor_with_no_tag_gets_door_two_unchanged(hero_href):
    run = footer("https://getpacerai.com/demo-connect/", anchors=[hero_href], call=[hero_href])
    assert run["has_function"], "footer.js has no window.pacerConnectorHref."
    assert run["called"] == [DOOR_2]
    assert run["anchors"] == [DOOR_2]
