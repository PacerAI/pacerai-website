"""PAC-105, the fallback: "Send me October's brief as a PDF" on the PAC-221 post, served and handled by the demo Worker.
Spec: docs/plan/2026-11-10-demo-connect-day-1-brief-spec.md

The Worker runs under Node (tests/harness_worker.mjs) against an in-memory D1, with every outbound call answered
locally and recorded, so nothing reaches Turnstile, Resend, Slack or Apollo. Addresses use the reserved .example TLD.
"""
import json
import pathlib
import re
import shutil
import subprocess

import pytest

REPO = pathlib.Path(__file__).resolve().parent.parent
WORKER = REPO / "infra" / "pacer-demo-worker" / "src" / "index.ts"
HARNESS = REPO / "tests" / "harness_worker.mjs"
POST = REPO / "src" / "blog" / "posts" / "content-what-a-day-1-brief-contains.html"
ROUTE = "/day-1-brief-pdf"
WIDGET = "https://pacer-demo-worker.will-078.workers.dev" + ROUTE
PDF_LINK = "https://getpacerai.com/day-1-brief-pdf/"
SITE_KEY = "test-site-key"

ENV = {
    "TURNSTILE_SITE_KEY": SITE_KEY,
    "TURNSTILE_SECRET": "test-secret",
    "RESEND_API_KEY": "re_test_key",
    "ORDER_FROM": "Pacer AI <orders@mail.getpacerai.com>",
    "ORDER_NOTIFY_TO": "owner@getpacerai.com",
    "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/T000/B000/test",
}
BUYER = {"email": "cro@buyer.example", "company": "Buyer Example Co", "token": "turnstile-ok",
         "utm_source": "linkedin", "utm_medium": "social", "utm_campaign": "day1-brief",
         "page": "/resources/what-a-day-1-brief-contains/"}


def worker(requests, turnstile=True, optouts=(), env=None):
    node = shutil.which("node")
    assert node, "node isn't on PATH, so the Worker can't be run."
    payload = {"worker": str(WORKER), "env": env or ENV, "turnstile": turnstile, "optouts": list(optouts),
               "requests": requests}
    result = subprocess.run([node, "--no-warnings", str(HARNESS)], input=json.dumps(payload),
                            capture_output=True, text=True, timeout=120)
    assert result.returncode == 0, result.stderr[-1500:]
    return json.loads(result.stdout)


def submit(body):
    return {"method": "POST", "path": ROUTE, "body": body}


def sends(run, to=None):
    """The Resend calls the Worker made, optionally only those addressed to `to`."""
    calls = [json.loads(f["body"]) for f in run["fetches"] if "api.resend.com" in f["url"]]
    if to is None:
        return calls
    return [c for c in calls if to in (c.get("to") if isinstance(c.get("to"), list) else [c.get("to")])]


def slack(run):
    return [f["body"] for f in run["fetches"] if "hooks.slack.com" in f["url"]]


def pdf_rows(run):
    return [row for row in run["leads"] if row["asset_slug"] == "day-1-brief-pdf"]


# ---------------------------------------------------------------- the widget


def test_worker_serves_the_form():
    run = worker([{"method": "GET", "path": ROUTE}])
    response = run["responses"][0]
    assert response["status"] == 200
    assert response["headers"].get("content-type", "").startswith("text/html")
    page = response["body"]
    assert re.search(r'<input\b[^>]*type="email"', page), "The widget has no email field."
    assert re.search(r'<input\b[^>]*name="company"', page), "The widget has no company field."
    assert SITE_KEY in page, "The widget doesn't carry the Turnstile site key, so there's no bot check."
    assert re.search(r"send me october(?:'|&rsquo;|’|&#39;)s brief as a pdf", page, re.IGNORECASE), (
        "The widget's button doesn't read \"Send me October's brief as a PDF\"."
    )
    assert "frame-ancestors https://getpacerai.com" in response["headers"].get("content-security-policy", ""), (
        "The widget is framed by the post, so it needs the Worker's FRAME_HEADERS."
    )


def test_post_frames_the_widget_and_has_no_form_of_its_own():
    post = POST.read_text(encoding="utf-8")
    frames = re.findall(r'<iframe\b[^>]*src="([^"]+)"', post)
    assert WIDGET in frames, f"The post doesn't frame {WIDGET}. Frames: {frames}"
    assert "<form" not in post, "The form lives in the Worker's widget, not the post (PAC-221's rule)."


BUILD = REPO / "src" / "blog" / "posts" / "what-a-day-1-brief-contains-build.html"
PHONE_HEIGHT = 600  # The widget stacks email and company below 420px and comes to about 560-580px there.


@pytest.mark.parametrize("page", [POST, BUILD], ids=["content", "build"])
def test_the_frame_is_tall_enough_for_the_widget_on_a_phone(page):
    tag = re.search(r'<iframe\b[^>]*src="[^"]*day-1-brief-pdf"[^>]*>', page.read_text(encoding="utf-8"))
    assert tag, f"{page.name} doesn't frame the PDF widget."
    height = int(re.search(r'\sheight="(\d+)"', tag.group(0)).group(1))
    assert height >= PHONE_HEIGHT, (
        f"{page.name} frames the widget at {height}px, so on a phone the check, the send button and the status "
        f"text fall below the frame. It needs {PHONE_HEIGHT}px or more."
    )


def test_the_build_page_keeps_the_phone_height_and_shortens_only_wider_screens():
    css = BUILD.read_text(encoding="utf-8")
    rules = re.findall(r'iframe\[src\*="day-1-brief-pdf"\]\s*\{([^}]*)\}', css)
    assert rules, "No CSS sizes the PDF frame, so the height attribute alone decides."
    base = int(re.search(r"height:\s*(\d+)px", rules[0]).group(1))
    assert base >= PHONE_HEIGHT, f"The frame's base height is {base}px, which cuts the widget off on a phone."
    wide = re.search(r"@media \(min-width:\s*(\d+)px\)\s*\{\s*[^{]*iframe\[src\*=\"day-1-brief-pdf\"\]\s*\{[^}]*height:\s*(\d+)px",
                     css)
    assert wide, "The frame isn't shortened for wide screens by a min-width rule."
    assert int(wide.group(1)) >= 481, "The wide-screen height starts below 481px, which includes phones."
    assert "<form" not in BUILD.read_text(encoding="utf-8")


# ---------------------------------------------------------------- a request


def test_a_request_sends_the_pdf_link_and_logs_the_lead():
    run = worker([submit(BUYER)])
    assert run["responses"][0]["status"] == 200, run["responses"][0]["body"][:300]

    rows = pdf_rows(run)
    assert len(rows) == 1, f"Expected one leads row for the request: {run['leads']}"
    row = rows[0]
    assert row["email"] == BUYER["email"] and row["company"] == BUYER["company"]
    assert row["source"] == "resource"
    assert row["lead_class"] == "valid_lead"
    assert row["utm_campaign"] == "day1-brief"

    mail = sends(run, to=BUYER["email"])
    assert len(mail) == 1, f"Expected one email to the visitor: {sends(run)}"
    body = " ".join(str(mail[0].get(k) or "") for k in ("html", "text"))
    assert PDF_LINK in body, "The email doesn't link the PDF by its short link."
    assert not re.search(r"https?://\S+\.pdf\b", body, re.IGNORECASE), "Link the short link, never the PDF file."

    alerts = slack(run)
    assert alerts, "No Slack alert for the lead."
    assert BUYER["email"] in alerts[0] and BUYER["company"] in alerts[0]


def test_a_pdf_request_is_not_demo_access():
    run = worker([submit(BUYER)])
    assert run["responses"][0]["status"] == 200, run["responses"][0]["body"][:300]
    assert not run["kv_puts"], f"A PDF request wrote to DEMO_SIGNUPS: {run['kv_puts']}"


@pytest.mark.parametrize(
    "change, status",
    [
        ({"email": "not-an-email"}, 400),
        ({"company": ""}, 400),
        ({"company": None}, 400),
        ({"token": ""}, 400),
        ({"email": "someone@mailinator.com"}, 400),
    ],
    ids=["bad email", "blank company", "no company", "no bot check", "disposable"],
)
def test_a_refused_request_sends_and_logs_nothing(change, status):
    body = {**BUYER, **change}
    body = {k: v for k, v in body.items() if v is not None}
    run = worker([submit(body)])
    assert run["responses"][0]["status"] == status, run["responses"][0]["body"][:300]
    assert not sends(run), "A refused request sent an email."
    assert not pdf_rows(run), "A refused request was logged as a lead."


def test_a_failed_bot_check_is_refused():
    run = worker([submit(BUYER)], turnstile=False)
    assert run["responses"][0]["status"] == 403, run["responses"][0]["body"][:300]
    assert not sends(run) and not pdf_rows(run)


# ---------------------------------------------------------------- limits and opt-outs


def test_a_repeat_within_ten_minutes_sends_once_and_logs_both():
    run = worker([submit(BUYER), submit(BUYER)])
    assert [r["status"] for r in run["responses"]] == [200, 200]
    assert len(sends(run, to=BUYER["email"])) == 1, "A repeat request within 10 minutes sent a second email."
    assert len(pdf_rows(run)) == 2, "Every request gets its row, repeats included."


def test_a_repeat_still_posts_to_slack_and_is_marked_as_one():
    run = worker([submit(BUYER), submit(BUYER)])
    alerts = slack(run)
    assert len(alerts) == 2, f"Every accepted request posts to Slack, repeats included. Got {len(alerts)}."
    first, repeat = (json.loads(a)["text"] for a in alerts)
    assert BUYER["email"] in repeat and BUYER["company"] in repeat
    assert "repeat request, no email sent" in repeat, "The repeat's alert doesn't say it is a repeat."
    assert "repeat" not in first.lower(), "The first request's alert is marked as a repeat."


def test_an_opted_out_address_gets_no_email_and_the_answer_does_not_say_so():
    sent = worker([submit(BUYER)])
    held = worker([submit(BUYER)], optouts=[BUYER["email"]])
    assert held["responses"][0]["status"] == 200, held["responses"][0]["body"][:300]
    assert sends(sent, to=BUYER["email"]), "The baseline request sent nothing, so this test can't tell."
    assert not sends(held, to=BUYER["email"]), "An address on email_optouts was sent the PDF."

    def answer(run):  # Ids differ per request by design; everything else must match.
        body = json.loads(run["responses"][0]["body"])
        return {k: v for k, v in body.items() if not k.endswith("id")}

    assert answer(held) == answer(sent), (
        "The response differs for an opted-out address, which tells a stranger who is on the list."
    )
