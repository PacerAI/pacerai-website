---
name: website-char-count
description: Analyze character usage for getpacerai.com WordPress pages. Breaks down any source HTML file by component (CSS, nav, footer, sections, JS, JSON-LD) and reports headroom against the WordPress 68,000 character limit. Use when planning content additions, diagnosing deploy failures, or prioritizing what to add/remove.
disable-model-invocation: true
argument-hint: [page] — e.g. "homepage", "all", or a source file path. Defaults to "homepage".
---

# Website Character Count — getpacerai.com

Analyze character usage across WordPress-deployed pages so that content additions can be prioritized against the 68,000 char limit.

## WordPress.com Size Limitation (CRITICAL)

WordPress.com imposes a **hard 68,000 character limit** per `<!-- wp:html -->` block. Pages exceeding this are silently truncated on deploy. Key constraints:

| Constraint | Rule |
|---|---|
| **Hard limit** | 68,000 chars per `<!-- wp:html -->` block |
| **Safe working limit** | 67,000 chars (1K safety buffer) |
| **Tight threshold** | 60,000 chars — start being frugal, prefer net-zero additions |
| **Multiple blocks** | WordPress accepts multiple `<!-- wp:html -->` blocks per page (use as last-resort escape valve) |
| **Silent failures** | Over-limit content gets truncated without error — must self-check before deploy |

Full constraints documented in `docs/plan/prd.md` Section 0 + 0.1.

## WordPress Page Registry

All 8 deployable pages tracked by this skill:

| Page | WP ID | Source File |
|---|---|---|
| Home | 25 | `src/homepage/index-build.html` |
| Blog Index | 230 | `src/blog/index-build.html` |
| Platform Overview | 371 | `src/platform/overview.html` |
| ARR Snowball | 372 | `src/solutions/arr-snowball.html` |
| Customer Data Cube | 373 | `src/solutions/customer-data-cube.html` |
| About | 374 | `src/team/about.html` |
| Contact | 375 | `src/team/contact.html` |
| Build vs Hire Blog | 491 | `src/blog/posts/491-build.html` |

If files move, read the authoritative registry from `CLAUDE.md`.

## Usage

```
/website-char-count                   # defaults to homepage
/website-char-count homepage          # homepage component breakdown
/website-char-count customer-data-cube
/website-char-count all               # summary table for all 8 pages
/website-char-count src/path/file.html  # arbitrary file
```

## What this skill does

For a **single page**, produce a component-level character breakdown showing:

1. **Top-level components:**
   - `<style>` CSS block(s)
   - `<script>` JS block(s) (excluding JSON-LD)
   - JSON-LD schema (SEO structured data)
   - `<nav>` (header + dropdowns)
   - `<footer>` (columns + bottom bar)
   - Wrapper/doctype/whitespace
2. **Content sections** — every `<section>` block with:
   - data-section ID or class
   - First H1/H2 heading (for identification)
   - Character count
   - % of total file
3. **Totals row** at the bottom of each table
4. **Headroom** vs 68,000 limit with status flag (🔴/🟡/🟢)
5. **Prioritization recommendations** — what to minify, consolidate, or remove

For `all`, produce a summary table of all 8 pages with total/headroom/status **and a TOTAL row at the bottom** summing all pages.

## Implementation

### Single-file analysis

Run this Python script (via Bash) to analyze a single file:

```python
import re, sys

path = sys.argv[1]
with open(path) as f:
    content = f.read()
total = len(content)
LIMIT = 68000

# Extract major blocks
jsonld_m = re.search(r'<script type="application/ld\+json">.*?</script>', content, re.DOTALL)
jsonld_len = len(jsonld_m.group(0)) if jsonld_m else 0

style_blocks = re.findall(r'<style.*?</style>', content, re.DOTALL)
style_total = sum(len(s) for s in style_blocks)

scripts = re.findall(r'<script(?!\s+type="application/ld).*?</script>', content, re.DOTALL)
script_total = sum(len(s) for s in scripts)

nav_m = re.search(r'<nav.*?</nav>', content, re.DOTALL)
nav_len = len(nav_m.group(0)) if nav_m else 0

footer_m = re.search(r'<footer.*?</footer>', content, re.DOTALL)
footer_len = len(footer_m.group(0)) if footer_m else 0

sections = re.findall(r'<section[^>]*>.*?</section>', content, re.DOTALL)

# Header
print(f"File: {path}")
print(f"TOTAL: {total:,} chars  |  Limit: {LIMIT:,}  |  Headroom: {LIMIT - total:+,}")
status = "🔴 OVER" if total > LIMIT else ("🟡 TIGHT" if total > 60000 else "🟢 OK")
print(f"Status: {status}")
print()

def row(label, n):
    print(f"{label:<55} {n:>10,} {100*n/total:>7.1f}%")

# ── Table 1: Top-level components ──
print(f"{'Component':<55} {'Chars':>10} {'%':>8}")
print("-" * 75)
row("<style> CSS block(s)", style_total)
row("<nav> (header)", nav_len)
row("<footer>", footer_len)
row("JSON-LD schema", jsonld_len)
row("<script> JS (non-schema)", script_total)
# Sections rollup
section_total_1 = sum(len(s) for s in sections)
row("All <section> content blocks", section_total_1)
# Other
accounted = jsonld_len + style_total + script_total + nav_len + footer_len + section_total_1
other = total - accounted
row("Other markup (doctype, wrappers, whitespace)", other)
print("-" * 75)
row("TOTAL", total)
print()

# ── Table 2: Section-level breakdown ──
print(f"{'Section':<55} {'Chars':>10} {'%':>8}")
print("-" * 75)
section_total = 0
for s in sections:
    ds = re.search(r'data-section="([^"]+)"', s[:300])
    cls = re.search(r'class="([^"]+)"', s[:300])
    h = re.search(r'<h[12][^>]*>(.*?)</h[12]>', s[:2000], re.DOTALL)
    heading = re.sub(r'<[^>]+>', '', h.group(1)).strip()[:40] if h else ''
    parts = []
    if ds: parts.append(f"data-section={ds.group(1)}")
    elif cls: parts.append(f"class={cls.group(1)[:25]}")
    if heading: parts.append(f'"{heading}"')
    label = "  " + " • ".join(parts)[:51]
    row(label, len(s))
    section_total += len(s)
print("-" * 75)
row("SECTIONS TOTAL", section_total)
```

**Important:** both tables must end with a totals row. The component table ends with `TOTAL` (whole file). The sections table ends with `SECTIONS TOTAL` (sum of all `<section>` blocks).

### All-pages summary

For `all`, run this script:

```python
import os
pages = [
    ("Home", 25, "src/homepage/index-build.html"),
    ("Customer Data Cube", 373, "src/solutions/customer-data-cube.html"),
    ("ARR Snowball", 372, "src/solutions/arr-snowball.html"),
    ("Platform Overview", 371, "src/platform/overview.html"),
    ("About", 374, "src/team/about.html"),
    ("Blog Index", 230, "src/blog/index-build.html"),
    ("Build vs Hire Blog", 491, "src/blog/posts/491-build.html"),
    ("Contact", 375, "src/team/contact.html"),
]
LIMIT = 68000
print(f"{'Page':<22} {'WP ID':>6} {'Chars':>10} {'Headroom':>12} {'Status':>10}")
print("-" * 65)
grand_total = 0
grand_headroom = 0
for name, wid, path in pages:
    try:
        size = os.path.getsize(path)
    except FileNotFoundError:
        print(f"{name:<22} {wid:>6} {'MISSING':>10}")
        continue
    hr = LIMIT - size
    status = "🔴 OVER" if size > LIMIT else ("🟡 TIGHT" if size > 60000 else "🟢 OK")
    print(f"{name:<22} {wid:>6} {size:>10,} {hr:>+12,} {status:>10}")
    grand_total += size
    grand_headroom += hr
print("-" * 65)
print(f"{'TOTAL':<22} {'':>6} {grand_total:>10,} {grand_headroom:>+12,}")
```

Always end with a `TOTAL` row summing chars + headroom across all pages.

## Output expectations

After producing the breakdown, always include:

1. **Status flag** (🔴 OVER / 🟡 TIGHT / 🟢 OK)
2. **Totals row** at the bottom of every table
3. **Top 3 biggest levers** for size recovery (if over or tight)
4. **Prioritization guidance** per PRD Section 0.1 rules:
   - Never exceed 68,000 (hard WordPress.com limit)
   - Prefer HTML body > CSS > JS for new content
   - Reuse existing CSS classes
   - Homepage is read-only for additions until back under budget
   - Avoid HTML comments (parser issues + wasted chars)

## Typical size expectations (snapshot, 2026-04-05)

| Page | Current | Status |
|---|---:|---|
| Home | 68,713 | 🔴 OVER by 713 |
| Customer Data Cube | 46,147 | 🟡 TIGHT |
| ARR Snowball | 44,166 | 🟡 TIGHT |
| Platform Overview | 39,841 | 🟢 |
| About | 37,472 | 🟢 |
| Blog Index | 36,178 | 🟢 |
| Build vs Hire Blog | 34,903 | 🟢 |
| Contact | 31,410 | 🟢 |
| **TOTAL** | **338,830** | — |

Re-run the script to get live numbers — these decay quickly as content changes.

## Recovery playbook (when a page is over limit)

Apply in this order:

1. **Minify the `<style>` block** — largest lever, typically 15–25% savings. Remove whitespace, comments, shorten selectors.
2. **Remove HTML comments** — `<!-- ... -->` can confuse the WordPress block parser AND waste chars.
3. **Collapse duplicate `@media` queries** — consolidate breakpoints.
4. **Consolidate similar CSS rules** — merge shared properties (e.g., `.btn-lg` + `.btn-teal`).
5. **Move nav/footer to a separate `<!-- wp:html -->` block** — escape valve that preserves content.
6. **Remove low-value content** — pull-quotes, decorative sections. Only as last resort.

## Related files

- `docs/plan/prd.md` Section 0 + 0.1 — canonical WordPress constraints + per-page budget
- `CLAUDE.md` — page registry (source of truth for source file paths)
- `docs/deploy/runbook.md` — deploy workflow (size check should happen before every deploy)
