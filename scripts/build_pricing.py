#!/usr/bin/env python3
"""Build /pricing/ (WP page 111) from the Price Book. Every number on the page comes from the Price Book.

    python3 scripts/build_pricing.py                  # writes the two outputs below
    python3 scripts/build_pricing.py --check          # exit 1 if either output is stale
    python3 scripts/build_pricing.py --price-book F   # read another copy (default: the foundation submodule)

Reads  foundation/pricing/product-pricing-price-book.md, specifically its "Price list" and "Packages" tables
Writes src/pricing/pricing-build.html            the page: src/pricing/pricing-template.html with prices filled
                                                  in, plus src/pricing/pricing.js inlined into an <img onerror>,
                                                  because WordPress strips <script> from page content
       infra/pacer-demo-worker/src/price-book.json the same prices for the Worker. Phase 2's order capture
                                                  recomputes totals server-side from this file.

Fails loudly in four cases, so a typo in the Price Book never reaches the site:
  - a table or row it needs is missing;
  - a package price is not the sum of its agents;
  - an annual contract value is not 12 × the 12-month price;
  - a {{placeholder}} is left unfilled.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PRICE_BOOK = REPO / "foundation" / "pricing" / "product-pricing-price-book.md"
TEMPLATE = REPO / "src" / "pricing" / "pricing-template.html"
JS = REPO / "src" / "pricing" / "pricing.js"
OUT_HTML = REPO / "src" / "pricing" / "pricing-build.html"
OUT_JSON = REPO / "infra" / "pacer-demo-worker" / "src" / "price-book.json"


class PriceBookError(ValueError):
    pass


def money(cell: str) -> int:
    m = re.search(r"\$([\d,]+)", cell)
    if not m:
        raise PriceBookError(f"no $ amount in {cell!r}")
    return int(m.group(1).replace(",", ""))


def table(md: str, heading: str) -> list[dict[str, str]]:
    """The first Markdown table under `## <heading>`, as one dict per row keyed by the header cells."""
    m = re.search(rf"^## {re.escape(heading)}\s*$(.*?)(?=^## |\Z)", md, re.M | re.S)
    if not m:
        raise PriceBookError(f"section '## {heading}' not found")
    rows = [l.strip() for l in m.group(1).splitlines() if l.strip().startswith("|")]
    if len(rows) < 3:
        raise PriceBookError(f"'## {heading}' has no table rows")
    cells = lambda r: [c.strip() for c in r.strip("|").split("|")]
    head = cells(rows[0])
    return [dict(zip(head, cells(r))) for r in rows[2:]]


def parse(md: str) -> dict:
    version = re.search(r"\*\*Version:\*\*\s*(v[\d.]+)", md)
    if not version:
        raise PriceBookError("**Version:** line not found")
    prices = table(md, "Price list")
    packages = table(md, "Packages")

    def price(offering: str, term: str) -> int:
        hits = [r for r in prices if r["Offering"] == offering and r["Contract term"] == term]
        if len(hits) != 1:
            raise PriceBookError(f"expected one Price list row for {offering} / {term}, found {len(hits)}")
        return money(hits[0]["Price"])

    def rate(offering: str, term: str) -> int:
        row = next(r for r in prices if r["Offering"] == offering and r["Contract term"] == term)
        m = re.search(r"\$([\d,]+)/hr", row["Notes"])
        if not m:
            raise PriceBookError(f"no $/hr rate in the Notes for {offering} / {term}")
        return int(m.group(1).replace(",", ""))

    def package(name: str) -> dict:
        row = next((r for r in packages if r["Package"] == name), None)
        if row is None:
            raise PriceBookError(f"package {name!r} not in the Packages table")
        return {"m": money(row["1 month"]), "a": money(row["12 months"]), "acv": money(row["Annual contract value"])}

    included = re.search(r"(\d+) users included", next(r["Notes"] for r in prices if r["Offering"] == "Pacing Agent"))
    if not included:
        raise PriceBookError("'N users included' not found in the Pacing Agent notes")

    pb = {
        "version": version.group(1),
        "included_users": int(included.group(1)),
        "agents": {
            "pacing": {"m": price("Pacing Agent", "1 month"), "a": price("Pacing Agent", "12 months")},
            "planning": {"m": price("Planning Agent", "1 month"), "a": price("Planning Agent", "12 months")},
        },
        "user_license": {"m": price("User license", "1 month"), "a": price("User license", "12 months")},
        "packages": {
            "sales_pacing": {"name": "Sales Pacing", "agents": ["pacing"], **package("Sales Pacing")},
            "pacing_planning": {"name": "Sales Pacing & Planning", "agents": ["pacing", "planning"],
                                **package("Sales Pacing & Planning")},
        },
        "services": {
            "integration": price("Installation & integration", "One-time"),
            "monthly_block": {"m": price("Monthly 5-hr block", "1 month"), "a": price("Monthly 5-hr block", "12 months"),
                              "hours": 5, "rate": rate("Monthly 5-hr block", "1 month")},
            "block_5": {"price": price("5-hr block", "One-time"), "hours": 5, "rate": rate("5-hr block", "One-time")},
            "block_20": {"price": price("20-hr block", "One-time"), "hours": 20, "rate": rate("20-hr block", "One-time")},
            "block_40": {"price": price("40-hr block", "One-time"), "hours": 40, "rate": rate("40-hr block", "One-time")},
        },
    }
    for key, pkg in pb["packages"].items():
        for term in ("m", "a"):
            agents = sum(pb["agents"][a][term] for a in pkg["agents"])
            if pkg[term] != agents:
                raise PriceBookError(f"{pkg['name']} {term} price {pkg[term]} is not the sum of its agents ({agents})")
        if pkg["acv"] != pkg["a"] * 12:
            raise PriceBookError(f"{pkg['name']} annual contract value {pkg['acv']} is not 12 x {pkg['a']}")
    mb = pb["services"]["monthly_block"]
    if mb["m"] != mb["a"] or mb["m"] != mb["hours"] * mb["rate"]:
        raise PriceBookError("the monthly 5-hr block must cost hours x rate on both terms (the page shows one price)")
    for b in ("block_5", "block_20", "block_40"):
        s = pb["services"][b]
        if s["price"] != s["hours"] * s["rate"]:
            raise PriceBookError(f"{b} price {s['price']} is not {s['hours']} x ${s['rate']}")
    return pb


def fmt(n: int) -> str:
    return f"${n:,}"


def save_pct(pb: dict) -> int:
    pcts = {round(100 * (p["m"] - p["a"]) / p["m"]) for p in pb["packages"].values()}
    if len(pcts) != 1:
        raise PriceBookError(f"the packages save different amounts on annual ({sorted(pcts)}%); the toggle shows one")
    return pcts.pop()


def inline_js(src: str) -> str:
    """pricing.js as one escaped HTML attribute value. Comments go; the file uses no // comments and no ASI."""
    js = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    if re.search(r"(^|[^:])//", js):
        raise PriceBookError("pricing.js has a // comment or URL; it cannot be collapsed onto one line")
    js = " ".join(l.strip() for l in js.splitlines() if l.strip())
    return js.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def render(pb: dict, template: str, js: str) -> str:
    sp, pp, s = pb["packages"]["sales_pacing"], pb["packages"]["pacing_planning"], pb["services"]
    values = {
        "version": pb["version"], "included": pb["included_users"], "save_pct": save_pct(pb),
        "seat_a": pb["user_license"]["a"], "seat_m": pb["user_license"]["m"],
        "seat_a_fmt": fmt(pb["user_license"]["a"]), "seat_m_fmt": fmt(pb["user_license"]["m"]),
        "sp_a": sp["a"], "sp_m": sp["m"], "sp_a_fmt": fmt(sp["a"]), "sp_acv_fmt": fmt(sp["acv"]),
        "pp_a": pp["a"], "pp_m": pp["m"], "pp_a_fmt": fmt(pp["a"]), "pp_acv_fmt": fmt(pp["acv"]),
        "block_mo": s["monthly_block"]["a"], "block_mo_fmt": fmt(s["monthly_block"]["a"]),
        "rate_block_mo_fmt": fmt(s["monthly_block"]["rate"]),
        "integration_fmt": fmt(s["integration"]),
        "b5_fmt": fmt(s["block_5"]["price"]), "rate_b5_fmt": fmt(s["block_5"]["rate"]),
        "b20_fmt": fmt(s["block_20"]["price"]), "rate_b20_fmt": fmt(s["block_20"]["rate"]),
        "b40_fmt": fmt(s["block_40"]["price"]), "rate_b40_fmt": fmt(s["block_40"]["rate"]),
        "pricing_js": inline_js(js),
    }
    out = re.sub(r"\{\{(\w+)\}\}", lambda m: str(values[m.group(1)]) if m.group(1) in values else m.group(0), template)
    left = re.findall(r"\{\{\w+\}\}", out)
    if left:
        raise PriceBookError(f"unfilled placeholders: {sorted(set(left))}")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--price-book", type=Path, default=PRICE_BOOK)
    ap.add_argument("--check", action="store_true", help="exit 1 if an output differs from a fresh build")
    args = ap.parse_args()
    if not args.price_book.exists():
        print(f"✗ Price Book not found: {args.price_book}", file=sys.stderr)
        return 1
    try:
        pb = parse(args.price_book.read_text(encoding="utf-8"))
        html = render(pb, TEMPLATE.read_text(encoding="utf-8"), JS.read_text(encoding="utf-8"))
    except PriceBookError as e:
        print(f"✗ {e}", file=sys.stderr)
        return 1
    data = json.dumps(pb, indent=2) + "\n"
    if args.check:
        stale = [p for p, body in ((OUT_HTML, html), (OUT_JSON, data))
                 if not p.exists() or p.read_text(encoding="utf-8") != body]
        for p in stale:
            print(f"✗ stale: {p.relative_to(REPO)} (run scripts/build_pricing.py)", file=sys.stderr)
        return 1 if stale else 0
    OUT_HTML.write_text(html, encoding="utf-8")
    OUT_JSON.write_text(data, encoding="utf-8")
    print(f"✓ {OUT_HTML.relative_to(REPO)} ({len(html):,} chars) and {OUT_JSON.relative_to(REPO)} from Price Book {pb['version']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
