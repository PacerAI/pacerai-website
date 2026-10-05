#!/usr/bin/env python3
"""Build the homepage FY26 annual pacing chart from img/pacing/fy26-annual-pacing.json.

    python3 scripts/build_pacing_chart.py            # SVG + PNG + inline into the homepage
    python3 scripts/build_pacing_chart.py --no-png   # skip the headless-Chrome PNG render

Outputs:
  img/pacing/fy26-annual-pacing.svg   the chart (single line, safe for WordPress content)
  img/pacing/fy26-annual-pacing.png   2x raster for decks / social (needs Google Chrome)
  src/homepage/index-build.html       SVG inlined into <figure class="pace-fig"> (no ids or comments: validate.py --strict)

Style: matches the pace_annual MCP chart (svg_pace in pacerai-platform-claude-native's demo_pace.py).
"""
import html
import math
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "img/pacing/fy26-annual-pacing.json"
SVG_OUT = ROOT / "img/pacing/fy26-annual-pacing.svg"
PNG_OUT = ROOT / "img/pacing/fy26-annual-pacing.png"
HOMEPAGE = ROOT / "src/homepage/index-build.html"
START, END = '<figure class="pace-fig">', "</figure>"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Style mirrors svg_pace() in pacerai-platform-claude-native/mcp/pacer_intake_mcp/demo_pace.py, the
# chart the pace_annual MCP tool renders (reference: docs/roadmap/assets/pace_annual.png), so the
# homepage shows the same visual a prospect sees in Claude. Keep the two in step.
W, H, L, R, T, B = 960, 440, 70, 44, 128, 52
NAVY, NAVYL, TEAL = "#1B365D", "#2B4A7A", "#27899A"
TEXT, MUTED, GRID, BEHIND = "#1A202C", "#718096", "#E2E8F0", "#C05621"
FB = "'DM Sans',-apple-system,Segoe UI,Roboto,sans-serif"
FH = "'Cormorant Garamond',Georgia,'Times New Roman',serif"
FM = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace"


def money(v):
    """Same format as demo_pace._money: $7.9M, $831K."""
    a = abs(v)
    sign = "\u2212" if v < 0 else ""
    return f"{sign}${a / 1e6:.1f}M" if a >= 1e6 else f"{sign}${a / 1e3:.0f}K"


def legend_centered(o, cx, y, items):
    """demo_pace._legend_centered: (kind, color, opacity, label); kind 'rect' or 'dash'."""
    widths = [16 + 6 + len(lab) * 6.3 + 22 for _, _, _, lab in items]
    x = cx - sum(widths) / 2
    for (kind, c, op, lab), w in zip(items, widths):
        if kind == "rect":
            o.append(f'<rect x="{x:.1f}" y="{y - 10}" width="12" height="12" rx="2" fill="{c}" opacity="{op}"/>')
        else:
            o.append(f'<line x1="{x:.1f}" y1="{y - 4}" x2="{x + 12:.1f}" y2="{y - 4}" stroke="{c}" '
                     f'stroke-width="2" stroke-dasharray="5 4"/>')
        o.append(f'<text x="{x + 18:.1f}" y="{y}" font-size="11" fill="{TEXT}">{html.escape(lab)}</text>')
        x += w


def build_svg(d):
    months = d["months"]
    nl_m, ex_m = d["monthly_actuals"]["new_logo"], d["monthly_actuals"]["expansion"]
    if len(nl_m) != len(ex_m):
        sys.exit("new_logo and expansion need the same number of months")
    ci = len(nl_m) - 1                      # index of the as-of month
    goal_nl, goal_ex = d["goals"]["new_logo"], d["goals"]["expansion"]
    tgt = goal_nl + goal_ex

    split, booked, a, b = [], [], 0.0, 0.0   # split = New Logo cumulative; booked = New + Expansion
    for x, y in zip(nl_m, ex_m):
        a, b = a + x, b + y
        split.append(a)
        booked.append(a + b)
    plan = [tgt * (i + 1) / 12 for i in range(12)]
    plan_now, booked_now = plan[ci], booked[ci]
    pace = booked_now - plan_now
    ahead = pace >= 0
    accent = TEAL if ahead else BEHIND

    lo, hi = 0.0, math.ceil(tgt * 1.05 / 5e6) * 5e6
    pw, ph = W - L - R, H - T - B
    X = lambda i: L + pw * i / 11
    Y = lambda v: T + ph * (1 - (v - lo) / (hi - lo))

    o = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" '
         f'style="width:100%;height:auto;display:block;background:#fff;font-family:{FB}">']
    verdict = f"{money(pace)} ahead of plan" if ahead else f"{money(-pace)} behind plan"
    o.append(f'<title>{d["fiscal_year"]} pace to plan, {months[ci]}</title>')
    o.append(f'<desc>{"Illustrative data. " if d.get("illustrative") else ""}Net New ARR booked '
             f'{money(booked_now)} (New Logo {money(split[ci])}, Expansion {money(b)}) vs plan {money(plan_now)}; '
             f'{verdict}. Target {money(tgt)}.</desc>')
    o.append(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')
    # header: eyebrow + serif title + verdict
    o.append(f'<text x="{L}" y="30" font-size="11" letter-spacing="2.5" fill="{TEAL}" '
             f'font-weight="700">PACING AGENT \u00b7 ANNUAL</text>')
    o.append(f'<text x="{L}" y="60" font-size="30" font-family="{FH}" font-weight="700" '
             f'fill="{TEXT}">Pace to plan \u2014 {months[ci]} {d["calendar_year"]}</text>')
    note = '<tspan fill="#718096"> \u00b7 illustrative data</tspan>' if d.get("illustrative") else ""
    o.append(f'<text x="{L}" y="82" font-size="13" fill="{MUTED}">'
             f'Booked <tspan fill="{TEXT}" font-weight="700">{money(booked_now)}</tspan> vs plan '
             f'{money(plan_now)} \u00b7 <tspan fill="{accent}" font-weight="700">{verdict}</tspan> \u00b7 '
             f'target {money(tgt)}{note}</text>')
    legend_centered(o, L + pw / 2, 106, [
        ("rect", TEAL, "0.30", f"New logos {money(split[ci])} of {money(goal_nl)}"),
        ("rect", NAVYL, "0.18", f"Net expansion (existing) {money(b)} of {money(goal_ex)}"),
        ("dash", MUTED, "1", "Plan")])
    # gridlines + $ axis
    step = (hi - lo) / 5
    for g in range(6):
        v = lo + step * g
        o.append(f'<line x1="{L}" y1="{Y(v):.1f}" x2="{W - R}" y2="{Y(v):.1f}" stroke="{GRID}"/>'
                 f'<text x="{L - 10}" y="{Y(v) + 4:.1f}" font-size="11" fill="{MUTED}" '
                 f'font-family="{FM}" text-anchor="end">${v / 1e6:.0f}M</text>')
    for i, lab in enumerate(months):
        wk = "700" if i == ci else "400"
        o.append(f'<text x="{X(i):.1f}" y="{H - B + 20}" font-size="10" fill="{MUTED}" '
                 f'font-weight="{wk}" text-anchor="middle">{lab}</text>')
    xs = list(range(ci + 1))

    def band(top, fill, op):
        pts = " ".join(f"{X(i):.1f},{Y(top[i]):.1f}" for i in xs)
        floor = " ".join(f"{X(i):.1f},{Y(lo):.1f}" for i in reversed(xs))
        return f'<polygon points="{pts} {floor}" fill="{fill}" opacity="{op}"/>'
    o.append(band(booked, NAVYL, "0.18"))       # expansion fills to booked
    o.append(band(split, TEAL, "0.30"))         # new logos fill to the split line (drawn over)
    pl = " ".join(f"{X(i):.1f},{Y(plan[i]):.1f}" for i in range(12))
    o.append(f'<polyline points="{pl}" fill="none" stroke="{MUTED}" stroke-width="2" stroke-dasharray="6 5"/>')
    o.append(f'<polyline points="{" ".join(f"{X(i):.1f},{Y(booked[i]):.1f}" for i in xs)}" '
             f'fill="none" stroke="{NAVY}" stroke-width="3"/>')
    # gap marker at the as-of month
    gx, yb, yp = X(ci), Y(booked_now), Y(plan_now)
    o.append(f'<line x1="{gx:.1f}" y1="{yb:.1f}" x2="{gx:.1f}" y2="{yp:.1f}" stroke="{accent}" stroke-width="2"/>')
    o.append(f'<circle cx="{gx:.1f}" cy="{yb:.1f}" r="4.5" fill="{NAVY}"/>')
    # value to the RIGHT of the point: the months after the as-of month are empty, so it never sits on
    # the plan line or the bands (left of the point it collided with the dashed plan)
    o.append(f'<text x="{gx + 10:.1f}" y="{yb + 4:.1f}" font-size="12" font-family="{FM}" font-weight="700" '
             f'fill="{NAVY}" text-anchor="start">{money(booked_now)}</text>')
    # target marker at Dec, label right-aligned inside the canvas
    o.append(f'<circle cx="{X(11):.1f}" cy="{Y(tgt):.1f}" r="3.5" fill="{MUTED}"/>')
    o.append(f'<text x="{W - 6}" y="{Y(tgt) - 8:.1f}" font-size="11" fill="{MUTED}" '
             f'text-anchor="end">target {money(tgt)}</text>')
    o.append("</svg>")
    return "".join(o)


def render_png(svg):
    if not Path(CHROME).exists():
        print("  skip PNG: Google Chrome not found")
        return
    page = ('<!doctype html><html><head><meta charset="utf-8">'
            '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Cormorant+Garamond:wght@700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">'
            f'<style>html,body{{margin:0;background:#fff}}</style></head><body>{svg}</body></html>')
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "chart.html"
        src.write_text(page)
        subprocess.run([CHROME, "--headless=new", "--hide-scrollbars", f"--window-size={W},{H}",
                        "--force-device-scale-factor=2", "--virtual-time-budget=4000",
                        f"--screenshot={PNG_OUT}", src.as_uri()],
                       check=True, capture_output=True)
    print(f"  wrote {PNG_OUT.relative_to(ROOT)}")


def inline(svg):
    page = HOMEPAGE.read_text()
    if START not in page or END not in page:
        print(f"  skip inline: no {START} markers in {HOMEPAGE.relative_to(ROOT)}")
        return
    head, rest = page.split(START, 1)
    _, tail = rest.split(END, 1)
    HOMEPAGE.write_text(f"{head}{START}{svg}{END}{tail}")
    print(f"  inlined into {HOMEPAGE.relative_to(ROOT)}")


if __name__ == "__main__":
    svg = build_svg(json.loads(DATA.read_text()))
    SVG_OUT.write_text(svg + "\n")
    print(f"  wrote {SVG_OUT.relative_to(ROOT)}")
    if "--no-png" not in sys.argv:
        render_png(svg)
    inline(svg)
