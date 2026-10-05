#!/usr/bin/env python3
"""Put the Pacing Agent demo video's annual chart on the homepage ("Why Pacer AI exists").

    python3 scripts/build_pacing_chart.py                 # from the sibling platform repo's build output
    python3 scripts/build_pacing_chart.py --from <svg>    # from a specific pace_annual.svg
    python3 scripts/build_pacing_chart.py --no-png        # skip the headless-Chrome PNG

The chart is NOT drawn here. It is the `pace_annual` MCP tool's own renderer (`svg_pace`), run on the
illustrative dataset by `pacerai-platform-claude-native/demo-site/build_pacing_video.py`, so the homepage
and the demo video show the same chart and the same numbers. Rebuild that first when the data changes.

Website-only tweaks (Will, 2026-10-05), each asserted to apply exactly once:
  * the booked value label sits to the RIGHT of the point (left of it, it sat on the plan line)
  * the legend says "Plan", not "Plan (even monthly)" (the legend is re-centred to match)
  * the subtitle ends " · illustrative data"
  * the SVG fills its figure (width:100%) and carries a <title> for screen readers

Outputs:
  img/pacing/fy26-annual-pacing.svg   the homepage chart (single line, safe for WordPress content)
  img/pacing/fy26-annual-pacing.png   2x raster for decks / social (needs Google Chrome)
  src/homepage/index-build.html       SVG inlined into <figure class="pace-fig"> (no ids or comments)
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLATFORM_OUT = ROOT.parent / "pacerai-platform-claude-native" / "demo-site" / "out" / "pacing-agent"
SVG_OUT = ROOT / "img/pacing/fy26-annual-pacing.svg"
PNG_OUT = ROOT / "img/pacing/fy26-annual-pacing.png"
HOMEPAGE = ROOT / "src/homepage/index-build.html"
START, END = '<figure class="pace-fig">', "</figure>"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LEGEND_CHAR_W = 6.3                     # demo_pace._legend_centered's per-character width estimate


def once(pattern, repl, s, flags=0):
    assert len(re.findall(pattern, s, flags)) == 1, f"expected exactly one match for {pattern!r}"
    return re.sub(pattern, repl, s, count=1, flags=flags)


def website_tweaks(svg: str) -> str:
    # booked value label: right of the point, vertically centred on it
    svg = once(r'<text x="([\d.]+)" y="([\d.]+)"( font-size="12" font-family="[^"]+" font-weight="700" '
               r'fill="#1B365D") text-anchor="end">(\$[\d.]+M)</text>',
               lambda m: (f'<text x="{float(m[1]) + 18:.1f}" y="{float(m[2]) + 12:.1f}"{m[3]} '
                          f'text-anchor="start">{m[4]}</text>'), svg)
    # legend: shorter "Plan" label, and shift the whole legend so it stays centred
    i = svg.index('<rect x="', svg.index('font-weight="700">PACING AGENT'))
    j = svg.index("Plan (even monthly)</text>") + len("Plan (even monthly)</text>")
    dx = (len("Plan (even monthly)") - len("Plan")) * LEGEND_CHAR_W / 2
    legend = svg[i:j].replace("Plan (even monthly)</text>", "Plan</text>")
    svg = svg[:i] + f'<g transform="translate({dx:.1f},0)">{legend}</g>' + svg[j:]
    # subtitle provenance
    svg = once(r'(forecast \$[\d.]+M)</text>', r'\1<tspan fill="#718096"> · illustrative data</tspan></text>', svg)
    # fill the figure; accessible name
    svg = once(r'style="max-width:100%;height:auto;', 'role="img" style="width:100%;height:auto;display:block;', svg)
    title = re.search(r">(Pace to plan — [^<]+)</text>", svg)[1]
    svg = once(r'(<svg [^>]+>)', lambda m: m[1] + f"<title>{title} (illustrative data)</title>", svg)
    return svg


def render_png(svg: str):
    if not Path(CHROME).exists():
        print("  skip PNG: Google Chrome not found")
        return
    page = ('<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?'
            'family=DM+Sans:wght@400;700&family=Cormorant+Garamond:wght@700&family=JetBrains+Mono:wght@400;700'
            '&display=swap" rel="stylesheet"><style>html,body{margin:0;background:#fff}svg{width:960px}'
            f'</style></head><body>{svg}</body></html>')
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "chart.html"
        src.write_text(page)
        subprocess.run([CHROME, "--headless=new", "--hide-scrollbars", "--window-size=960,440",
                        "--force-device-scale-factor=2", "--virtual-time-budget=4000",
                        f"--screenshot={PNG_OUT}", src.as_uri()], check=True, capture_output=True)
    print(f"  wrote {PNG_OUT.relative_to(ROOT)}")


def inline(svg: str):
    page = HOMEPAGE.read_text()
    head, rest = page.split(START, 1)
    _, tail = rest.split(END, 1)
    HOMEPAGE.write_text(f"{head}{START}{svg}{END}{tail}")
    print(f"  inlined into {HOMEPAGE.relative_to(ROOT)}")


if __name__ == "__main__":
    src = Path(sys.argv[sys.argv.index("--from") + 1]) if "--from" in sys.argv else PLATFORM_OUT / "pace_annual.svg"
    svg = src.read_text().strip()
    numbers = src.with_name("numbers.json")
    if numbers.exists():                               # tie-out: the label we keep is the video's number
        booked = json.loads(numbers.read_text())["year"]["booked_arr"]
        assert f"${booked / 1e6:.1f}M</text>" in svg, "pace_annual.svg and numbers.json disagree — rebuild"
    svg = website_tweaks(svg)
    SVG_OUT.write_text(svg + "\n")
    print(f"  wrote {SVG_OUT.relative_to(ROOT)} (from {src})")
    if "--no-png" not in sys.argv:
        render_png(svg)
    inline(svg)
