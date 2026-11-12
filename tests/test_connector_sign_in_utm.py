"""PAC-262: a connector sign-in carries the visitor's utm tag onto the lead. Spec: docs/plan/2026-11-10-connector-sign-in-utm-spec.md

The Worker runs under Node (tests/harness_worker.mjs) against an in-memory D1, with every outbound call answered
locally and recorded, so nothing reaches Slack or Apollo. Addresses use the reserved .example TLD.
"""
import json
import pathlib
import re
import shutil
import subprocess

import pytest

REPO = pathlib.Path(__file__).resolve().parent.parent
WORKER = REPO / "infra" / "pacer-demo-worker" / "src" / "index.ts"
ROUTE_SOURCE = REPO / "infra" / "pacer-demo-worker" / "src" / "connector-sign-in.ts"
HARNESS = REPO / "tests" / "harness_worker.mjs"
ROUTE = "/internal/connector-sign-in"
TOKEN = "test-connector-token"
LIMIT = 100  # The spec's cap on each utm value, in characters.
TAG_FIELDS = ("utm_source", "utm_medium", "utm_campaign")

ENV = {
    "CONNECTOR_SIGNIN_TOKEN": TOKEN,
    "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/T000/B000/test",
}
# What the sign-in page sends today, before the platform half of PAC-261 ships.
TODAY = {"client_id": "claude-ai", "book": "hubspot", "ip": "203.0.113.9"}
# The LinkedIn DM link: utm_source=linkedin&utm_medium=dm&utm_campaign=day1-brief
DM_TAG = {"utm_source": "linkedin", "utm_medium": "dm", "utm_campaign": "day1-brief"}


def sign_ins(bodies):
    """POST each body to the route in one Worker run. Returns, per body: (reply status, reply JSON, D1 row, Slack text).

    Each body needs its own email: Slack fires only on an email the Worker hasn't seen.
    """
    node = shutil.which("node")
    assert node, "node isn't on PATH, so the Worker can't be run."
    requests = [{"method": "POST", "path": ROUTE, "headers": {"authorization": f"Bearer {TOKEN}"}, "body": b}
                for b in bodies]
    payload = {"worker": str(WORKER), "env": ENV, "requests": requests}
    result = subprocess.run([node, "--no-warnings", str(HARNESS)], input=json.dumps(payload),
                            capture_output=True, text=True, timeout=120)
    assert result.returncode == 0, result.stderr[-1500:]
    run = json.loads(result.stdout)
    slack = [json.loads(f["body"])["text"] for f in run["fetches"] if "hooks.slack.com" in f["url"]]
    out = []
    for body, response in zip(bodies, run["responses"]):
        email = body["email"]
        rows = [r for r in run["leads"] if r["email"] == email]
        assert len(rows) == 1, f"expected one D1 row for {email}, found {len(rows)}"
        texts = [t for t in slack if f"*Email:* {email}" in t]
        assert len(texts) == 1, f"expected one Slack alert for {email}, found {len(texts)}"
        out.append((response["status"], json.loads(response["body"]), rows[0], texts[0]))
    return out


def came_from(slack_text):
    lines = [line for line in slack_text.splitlines() if line.startswith("*Came from:*")]
    return lines[0] if lines else None


# ------------------------------------------------------------------ AC-2: a tagged sign-in carries the tag

def test_tagged_sign_in_writes_the_tag_to_the_lead_row():
    [(status, reply, row, _)] = sign_ins([{"email": "cro@tagged.example", **TODAY, **DM_TAG}])
    assert status == 200 and reply.get("ok") is True, reply
    assert {k: row[k] for k in TAG_FIELDS} == DM_TAG


def test_tagged_sign_in_shows_the_tag_in_slack():
    [(_, _, _, text)] = sign_ins([{"email": "cro@slacked.example", **TODAY, **DM_TAG}])
    line = came_from(text)
    assert line, f"the Slack alert has no *Came from:* line:\n{text}"
    for value in DM_TAG.values():
        assert value in line, f"{value!r} is missing from the Slack line {line!r}"


def test_tag_values_are_trimmed():
    padded = {k: f"  {v}\t" for k, v in DM_TAG.items()}
    [(status, _, row, _)] = sign_ins([{"email": "cro@padded.example", **TODAY, **padded}])
    assert status == 200
    assert {k: row[k] for k in TAG_FIELDS} == DM_TAG


def test_a_partial_tag_stores_what_was_sent():
    [(status, _, row, _)] = sign_ins([{"email": "cro@partial.example", **TODAY, "utm_source": "linkedin"}])
    assert status == 200
    assert row["utm_source"] == "linkedin"
    assert row["utm_medium"] is None and row["utm_campaign"] is None


# ------------------------------------------------------------------ AC-3: an untagged sign-in behaves as today

def test_untagged_sign_in_still_gets_200_with_null_tag_fields():
    [(status, reply, row, text)] = sign_ins([{"email": "cro@untagged.example", **TODAY}])
    assert status == 200 and reply.get("ok") is True, reply
    assert all(row[k] is None for k in TAG_FIELDS), {k: row[k] for k in TAG_FIELDS}
    assert came_from(text) is None, f"an untagged sign-in grew a *Came from:* line:\n{text}"
    assert row["asset_slug"] == "connector-sign-in" and row["page_url"] == "connector-sign-in"


def test_email_only_sign_in_still_gets_200_with_null_tag_fields():
    [(status, reply, row, _)] = sign_ins([{"email": "cro@bare.example"}])
    assert status == 200 and reply.get("ok") is True, reply
    assert all(row[k] is None for k in TAG_FIELDS)


# ------------------------------------------------------------------ AC-1 and AC-4: bad values don't break a sign-in

def test_overlong_values_are_cut_to_the_limit():
    long_tag = {k: (k[4] * (LIMIT + 50)) for k in TAG_FIELDS}  # "sss…", "mmm…", "ccc…"
    [(status, reply, row, _)] = sign_ins([{"email": "cro@long.example", **TODAY, **long_tag}])
    assert status == 200 and reply.get("ok") is True, reply
    for k in TAG_FIELDS:
        assert row[k] == long_tag[k][:LIMIT], f"{k} stored as {len(row[k] or '')} characters, not {LIMIT}"


WRONG = [42, 3.5, True, ["linkedin"], {"v": "linkedin"}, "", "   "]


@pytest.mark.parametrize("value", WRONG, ids=[type(v).__name__ + (repr(v) if isinstance(v, str) else "")
                                               for v in WRONG])
def test_wrong_type_or_blank_values_are_stored_as_null(value):
    bodies = [{"email": f"cro{i}@wrongtype.example", **TODAY, **DM_TAG, field: value}
              for i, field in enumerate(TAG_FIELDS)]
    for field, (status, reply, row, _) in zip(TAG_FIELDS, sign_ins(bodies)):
        assert status == 200 and reply.get("ok") is True, (field, reply)
        assert row[field] is None, f"{field}={value!r} was stored as {row[field]!r}"
        for other in TAG_FIELDS:
            if other != field:
                assert row[other] == DM_TAG[other], f"a bad {field} disturbed {other}"


def test_other_new_fields_are_ignored():
    extra = {"utm_content": "variant-b", "utm_term": "cro", "landing": "/demo-connect/", "page_url": "/elsewhere/",
             "asset_slug": "something-else", "company": "Injected Co"}
    [(status, reply, row, _)] = sign_ins([{"email": "cro@extra.example", **TODAY, **DM_TAG, **extra}])
    assert status == 200 and reply.get("ok") is True, reply
    assert {k: row[k] for k in TAG_FIELDS} == DM_TAG
    assert row["asset_slug"] == "connector-sign-in" and row["page_url"] == "connector-sign-in"
    assert row["company"] is None


# ------------------------------------------------------------------ AC-5: the header documents the request shape

def test_header_comment_lists_the_tag_fields():
    source = ROUTE_SOURCE.read_text(encoding="utf-8")
    header = re.match(r"\s*/\*\*(.*?)\*/", source, re.DOTALL)
    assert header, "connector-sign-in.ts has no header comment."
    request = re.search(r"Request:(.*?)Replies:", header.group(1), re.DOTALL)
    assert request, "the header comment has no Request: ... Replies: block."
    for field in TAG_FIELDS:
        assert field in request.group(1), f"the header's request shape doesn't list {field}."
