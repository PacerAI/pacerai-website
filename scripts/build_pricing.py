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

Fails loudly, so a typo in the Price Book never reaches the site, when:
  - a table or row it needs is missing;
  - a 12-month price is not ten months of the monthly price (seats, Startup, Advisor, package bands);
  - the services do not share one "from" price;
  - a {{placeholder}} is left unfilled.

Price Book v2.0 (2026-11-10, PAC-164): the page shows the three per-seat licenses and the services
(installation, then the three from $15,000). Seats are pure: installation is a service. Company-size bands,
Startup, Advisor, bulk rates, the small team rate and the pilot program are sales-led and stay off the page
(Will, 2026-11-10); price-book.json still carries them for the Worker.
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
# Choose opens this order card (pacer-demo-worker GET /order). --no-order builds a page whose Choose only records
# the click, for a page deploy that goes out before the Worker route does.
ORDER_URL = "https://pacer-demo-worker.will-078.workers.dev/order"


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


SEATS = (("rep", "Rep pacing"), ("manager", "Manager pacing"), ("slt", "SLT pacing and planning"))
BANDS = ("Under $100M", "$100M to $500M", "$500M and up")


def parse(md: str) -> dict:
    version = re.search(r"\*\*Version:\*\*\s*(v[\d.]+)", md)
    if not version:
        raise PriceBookError("**Version:** line not found")
    prices = table(md, "Price list")
    packages = table(md, "Packages")

    def row(offering: str, term: str) -> dict:
        hits = [r for r in prices if r["Offering"] == offering and r["Contract term"] == term]
        if len(hits) != 1:
            raise PriceBookError(f"expected one Price list row for {offering} / {term}, found {len(hits)}")
        return hits[0]

    def term_pair(offering: str) -> dict:
        m, a = money(row(offering, "1 month")["Price"]), money(row(offering, "12 months")["Price"])
        if a != 10 * m:
            raise PriceBookError(f"{offering}: the 12-month price {a} is not ten months of {m}")
        return {"m": m, "a": a}

    seats = {}
    for key, name in SEATS:
        connects = row(name, "1 month")["Notes"]
        if not connects.startswith("Connects to "):
            raise PriceBookError(f"{name}: Notes should say 'Connects to ...', found {connects!r}")
        seats[key] = {"name": name, "connects": connects[len("Connects to "):], **term_pair(name)}

    services = {}
    for key, name in (("planning_reporting", "Planning & Reporting"),
                      ("ai", "AI Engineering, Agents & AI Transformation"), ("ma", "M&A Services")):
        r = next((r for r in prices if r["Offering"] == name), None)
        if r is None:
            raise PriceBookError(f"service {name!r} not in the Price list")
        services[key] = {"name": name, "from": money(r["Price"]), "term": r["Contract term"]}
    froms = {s["from"] for s in services.values()}
    if len(froms) != 1:
        raise PriceBookError(f"services start at different prices {sorted(froms)}; the page says one 'from' price")

    bands = []
    for name in BANDS:
        r = next((r for r in packages if r["Package"] == name), None)
        if r is None:
            raise PriceBookError(f"package {name!r} not in the Packages table")
        if "talk to sales" in r["1 month"].lower():
            bands.append({"name": name, "talk": True})
            continue
        lo, hi = [int(x.replace(",", "")) for x in re.findall(r"\$([\d,]+)", r["1 month"])]
        alo, ahi = [int(x.replace(",", "")) for x in re.findall(r"\$([\d,]+)", r["Annual contract value"])]
        if (alo, ahi) != (10 * lo, 10 * hi):
            raise PriceBookError(f"{name}: annual contract value {alo}-{ahi} is not ten months of {lo}-{hi}")
        bands.append({"name": name, "talk": False, "m_lo": lo, "m_hi": hi, "acv_lo": alo, "acv_hi": ahi})

    return {
        "version": version.group(1),
        "seats": seats,
        "setup": {"slt": money(row("Initial setup, SLT pacing and planning", "One-time")["Price"])},
        "startup": term_pair("Startup"),
        "advisor": term_pair("Advisor"),
        "services": services,
        "services_from": froms.pop(),
        "bands": bands,
    }


def fmt(n: int) -> str:
    return f"${n:,}"


def inline_js(src: str) -> str:
    """pricing.js as one escaped HTML attribute value. Comments go; the file uses no // comments and no ASI."""
    js = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    if re.search(r"(^|[^:])//", js):
        raise PriceBookError("pricing.js has a // comment or URL; it cannot be collapsed onto one line")
    js = " ".join(l.strip() for l in js.splitlines() if l.strip())
    return js.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


# The selection the page opens with: one Rep pacing seat and one Manager pacing seat, month to month.
DEFAULT = {"rep": 1, "manager": 1, "slt": 0}


def render(pb: dict, template: str, js: str, order_url: str = ORDER_URL) -> str:
    seats = pb["seats"]
    values = {
        "version": pb["version"], "pricing_js": inline_js(js), "order_url": order_url,
        "setup_slt_fmt": fmt(pb["setup"]["slt"]),
        "services_from_fmt": fmt(pb["services_from"]),
        "default_total_fmt": fmt(sum(DEFAULT[k] * seats[k]["m"] for k in seats)),
    }
    for k, s in seats.items():
        values.update({f"{k}_m": s["m"], f"{k}_a": s["a"], f"{k}_m_fmt": fmt(s["m"]), f"{k}_a_fmt": fmt(s["a"]),
                       f"{k}_connects": s["connects"].replace("&", "&amp;"), f"{k}_n": DEFAULT[k]})
    out = re.sub(r"\{\{(\w+)\}\}", lambda m: str(values[m.group(1)]) if m.group(1) in values else m.group(0), template)
    left = re.findall(r"\{\{\w+\}\}", out)
    if left:
        raise PriceBookError(f"unfilled placeholders: {sorted(set(left))}")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--price-book", type=Path, default=PRICE_BOOK)
    ap.add_argument("--check", action="store_true", help="exit 1 if an output differs from a fresh build")
    ap.add_argument("--no-order", action="store_true", help="Choose records the click only (no order card)")
    args = ap.parse_args()
    if not args.price_book.exists():
        print(f"✗ Price Book not found: {args.price_book}", file=sys.stderr)
        return 1
    try:
        pb = parse(args.price_book.read_text(encoding="utf-8"))
        html = render(pb, TEMPLATE.read_text(encoding="utf-8"), JS.read_text(encoding="utf-8"),
                      "" if args.no_order else ORDER_URL)
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
