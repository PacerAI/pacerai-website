# CLAUDE.md

@foundation/first_principles.md
@foundation/pricing/product-pricing-portfolio.md
@foundation/pricing/product-pricing-tiers.md

<!-- pacerai-foundation/pricing/product-pricing-funnel.md intentionally NOT @-imported; reference on demand. Per spec #34 / agent-repo-foundation-wiring.md pricing matrix. -->
<!-- pacerai-foundation/pricing/product-pricing-rationale.md intentionally NOT @-imported; reference on demand. Per spec #34 / agent-repo-foundation-wiring.md pricing matrix. -->
<!-- pacerai-foundation/pricing/product-pricing-customer-maturity-mapping.md intentionally NOT @-imported; reference on demand. Per spec #34 / agent-repo-foundation-wiring.md pricing matrix. -->

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

Marketing website repo for [getpacerai.com](https://getpacerai.com). WordPress.com hosted site deployed via the WordPress REST API. No local dev server — content is authored as standalone HTML files and pushed to WordPress as Pages.

**Target:** PE-backed SaaS operators (Operating Partners, CFOs, RevOps leaders at $50M-$1B ARR companies).

## Stack

- **CMS:** WordPress.com (hosted, no SSH/WP-CLI access)
- **Theme:** Twenty Twenty-Four (WordPress default — fully overridden by inline CSS)
- **Deploy method:** WordPress REST API + Application Password (Python `requests` library)
- **No build tools** — no npm, no bundler, no framework. Pure HTML/CSS, vanilla JS for mobile nav only.
- **Font loading:** Google Fonts loaded by WordPress — no `<link>` tags needed in page HTML.

## WordPress Page Registry

All pages are deployed as WordPress Pages via REST API. Each page's HTML source file is the source of truth.

| Page | WP ID | Slug | Parent | Source File |
|------|-------|------|--------|-------------|
| **Home** | 25 | `no-title` | — | `src/homepage/index-build.html` |
| **Blog** | 230 | `blog` | — | `src/blog/index-build.html` |
| Platform (parent) | 362 | `platform` | — | *(placeholder — no content)* |
| **Platform Overview** | 371 | `overview` | 362 | `src/platform/overview.html` |
| Solutions (parent) | 364 | `solutions` | — | *(placeholder — no content)* |
| **ARR Snowball** | 372 | `arr-snowball-board-reporting` | 364 | `src/solutions/arr-snowball.html` |
| **Customer Data Cube** | 373 | `customer-data-cube` | 364 | `src/solutions/customer-data-cube.html` |
| **Exit Readiness** | 554 | `transaction-readiness` | 364 | `src/solutions/transaction-readiness.html` |
| **RevOps Transformation** | 651 | `revops-transformation-pkg` | 364 | `src/solutions/revops-transformation-pkg.html` |
| **GTM Transformation** | 650 | `gtm-transformation-pkg` | 364 | `src/solutions/gtm-transformation-pkg.html` |
| **FP&A Transformation** | 652 | `fpanda-transformation-pkg` | 364 | `src/solutions/fpanda-transformation-pkg.html` |
| **Team** (parent) | 366 | `team` | — | `src/team/team-page.html` |
| **About** | 374 | `about` | 366 | `src/team/about.html` |
| **Contact** | 375 | `contact` | 366 | `src/team/contact.html` |
| **Build vs Hire Blog** | 491 | `build-customer-data-cube-in-house-or-hire` | 230 | `src/blog/posts/491-build.html` |
| Pricing | 111 | `pricing` | — | *(legacy — not managed by this repo)* |
| Login | 134 | `login` | — | *(legacy — not managed by this repo)* |

**Live URLs:**
- https://getpacerai.com/
- https://getpacerai.com/blog/
- https://getpacerai.com/platform/overview/
- https://getpacerai.com/solutions/arr-snowball-board-reporting/
- https://getpacerai.com/solutions/customer-data-cube/
- https://getpacerai.com/team/
- https://getpacerai.com/team/about/
- https://getpacerai.com/team/contact/

## Environment Variables (Required for REST API deploys)

```bash
WP_BASE_URL=https://getpacerai.com
WP_USER=willsullivan5e7f50183a
WP_APP_PASSWORD=[set in shell — ask Will]
```

Verify: `source ~/.zshrc && echo $WP_BASE_URL && echo $WP_USER && echo ${WP_APP_PASSWORD:0:4}...`

## Repository Structure

```
src/
├── homepage/
│   └── index-build.html                # Homepage (WP ID 25)
├── blog/
│   ├── index-build.html                # Blog index (WP ID 230)
│   ├── post-template.html              # Blog post template
│   └── posts/                          # Individual blog post build files
├── platform/
│   └── overview.html                   # Platform Overview (WP ID 371)
├── solutions/
│   ├── arr-snowball.html               # ARR Snowball (WP ID 372)
│   └── customer-data-cube.html         # Customer Data Cube (WP ID 373)
└── company/
    ├── about.html                      # About (WP ID 374)
    └── contact.html                    # Contact (WP ID 375)

docs/
├── plan/
│   ├── overview.md                     # Project goals, scope, success criteria
│   ├── prd.md                          # Product requirements document
│   └── site-tree-and-build-prompts.md  # Full site tree + build prompts for every page
├── design/
│   ├── pacerai-homepage_by_Claude_030526_1522.html   # Original v1 design mockup
│   └── pacerai-homepage-v2_2026-03-09.html           # v2 design (current)
├── build/
│   └── architecture.md                 # Technical decisions, deploy methods, page structure
├── review/
│   ├── checklist.md                    # QA checklist
│   ├── Issues.md                       # Known issues
│   └── pre-deploy-backup-*.json        # Backups before each deploy
├── document/
│   ├── changelog.md                    # Deploy log
│   └── Internal_Documentation.md       # Messaging, positioning, site tree, SEO strategy
└── deploy/
    └── runbook.md                      # Deploy instructions

pacerai-context/
├── pacerai.md                          # Canonical company context (products, personas, differentiation)
└── apollo_ai.md                        # Apollo.io AI Context Center paste-ready document
```

## Local Development Scripts

```bash
# Preview locally (simulates WordPress rendering — strips scripts, injects WPCode CSS)
python3 scripts/preview.py                    # http://localhost:5500/src/homepage/index-build.html

# Validate before deploy (char count, broken links, footer/nav consistency)
python3 scripts/validate.py                   # All pages
python3 scripts/validate.py src/homepage/index-build.html  # Single file

# Deploy with built-in validation + backup + verification
python3 scripts/deploy.py 25                  # Deploy homepage
python3 scripts/deploy.py all                 # Deploy all pages
python3 scripts/deploy.py 25 --dry-run        # Preview what would happen
python3 scripts/deploy.py 25 --force          # Skip validation
```

## Key Workflows

### Deploying a single page
```python
import requests, os

base_url = os.environ['WP_BASE_URL']
auth = (os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])

with open('src/platform/overview.html') as f:
    html = f.read()

content = f"<!-- wp:html -->{html}<!-- /wp:html -->"
resp = requests.post(f"{base_url}/wp-json/wp/v2/pages/371", json={"content": content}, auth=auth)
print(f"{'OK' if resp.status_code == 200 else 'FAILED'} — HTTP {resp.status_code}")
```

### Deploying all pages (batch)
```python
pages = [
    {"id": 25,  "file": "src/homepage/index-build.html"},
    {"id": 230, "file": "src/blog/index-build.html"},
    {"id": 371, "file": "src/platform/overview.html"},
    {"id": 372, "file": "src/solutions/arr-snowball.html"},
    {"id": 373, "file": "src/solutions/customer-data-cube.html"},
    {"id": 374, "file": "src/company/about.html"},
    {"id": 375, "file": "src/company/contact.html"},
]
for p in pages:
    with open(p['file']) as f:
        html = f.read()
    content = f"<!-- wp:html -->{html}<!-- /wp:html -->"
    resp = requests.post(f"{base_url}/wp-json/wp/v2/pages/{p['id']}", json={"content": content}, auth=auth)
    print(f"  {'OK' if resp.status_code == 200 else 'FAIL'} ID {p['id']}")
```

### Creating a new page
```python
# 1. Create the HTML source file in the appropriate src/ subdirectory
# 2. Create the WP page with correct parent and slug:
resp = requests.post(f"{base_url}/wp-json/wp/v2/pages", json={
    "title": "Page Title",
    "slug": "page-slug",
    "parent": 364,  # parent page ID (e.g., Solutions)
    "status": "publish",
    "content": f"<!-- wp:html -->{html}<!-- /wp:html -->"
}, auth=auth)
# 3. Record the new page ID in this CLAUDE.md page registry
```

### Deploy sequence
1. Edit source HTML file in `src/` → 2. Push via REST API → 3. Verify live URL returns 200 → 4. Log to `docs/document/changelog.md`

See `docs/deploy/runbook.md` for full instructions.

### Reading a live page
```bash
source ~/.zshrc && curl -s -u "$WP_USER:$WP_APP_PASSWORD" \
  "$WP_BASE_URL/wp-json/wp/v2/pages/371?context=edit&_fields=id,title,slug,content,link"
```

### Lighthouse Audit
```bash
npx lighthouse https://getpacerai.com --output=json --output-path=docs/review/lighthouse-$(date +%Y%m%d).json
```
Targets: Performance >= 85, SEO >= 90, Accessibility >= 90, Best Practices >= 90.

## Critical Rules

- **Backup before deploy** — always save current content before updating
- **Preserve Yoast SEO** — never overwrite `yoast_head` or SEO metadata fields
- **Stop on API errors** — if any REST call returns non-2xx, stop and report
- **Always read before writing** — fetch current live page before modifying
- **Update all pages when changing shared elements** — nav, footer, and base CSS are duplicated across all page files. Changes to these must be applied to all files and redeployed.
- **Page registry** — when creating new WP pages, record the ID in the registry table above

## WordPress.com CSS/JS Pitfalls (Discovered April 2026)

These are silent failures — WordPress won't error, but your styles/scripts won't work:

| Pitfall | What Happens | Fix |
|---------|-------------|-----|
| `#pacerai-homepage *` resets margin/padding | Component margins and padding silently zeroed | Add `!important` to all component-level margin/padding |
| Inline `<script>` tags stripped | Counter animations, smooth scroll, mobile nav JS removed | Use WPCode plugin; set fallback text in HTML |
| `.question-body p` vs `p.question-body` | CSS selector doesn't match when element IS the tag | Match selector to actual HTML structure; verify with DevTools |
| Eyebrow/H2 inside grid column | Image aligns with eyebrow, not below heading | Keep eyebrow + H2 outside `.q-section-layout` grid |
| CSS changes look right in source | WordPress cache or theme CSS overrides silently | Always verify computed styles via browser DevTools after deploy |
| `src/company/` path in docs | Files are actually at `src/team/about.html` and `src/team/contact.html` | Use `src/team/` paths |
| Blog post deployed as WP Post | `<style>` tags stripped by WordPress Posts | Deploy blog posts as Pages (parent=230) using build system |
| Minified JS in WPCode footer gets line breaks inserted | WordPress inserts line breaks mid-token (e.g. `set\nTimeout`, `el.tex\ntContent`), breaking minified code silently | Use non-minified JS with proper line breaks in WPCode Header & Footer; WordPress won't break properly formatted code |
| Homepage CSS too large for inline `<style>` | Homepage CSS is ~37K chars — inline would push page over 68K limit | CSS externalized to WPCode Header injection. Source: `src/homepage/wpcode-homepage-css.css`. Update WPCode snippet in WP Admin when CSS changes. |

**Design reference:** `docs/design/index-build-long_page_2026_04_03.html` — always diff live CSS against this file when styles don't match.
**AEO Row spec:** `docs/design/AEO-Row-Text-and-Image.md` — copy-paste-ready CSS for text+image sections.

## Page Architecture

Every page follows the same pattern:

```html
<!-- wp:html -->
<style>
  /* TT4 theme overrides (hide chrome, force dark bg, remove constraints) */
  /* Hide WP page title and spacer */
  .wp-block-post-title, .wp-block-spacer { display: none !important; }
  /* CSS variables, component styles, responsive breakpoints */
</style>
<div id="pacerai-homepage">
  <nav>...</nav>           <!-- Shared nav — identical across all pages -->
  <!-- Page-specific content sections -->
  <footer>...</footer>     <!-- Shared footer — identical across all pages -->
</div>
<script>/* Mobile nav JS */</script>
<!-- /wp:html -->
```

**Key CSS overrides for WordPress TT4:**
- Hide theme header/footer: `.wp-site-blocks > header, .wp-site-blocks > footer { display: none }`
- Hide WP page title: `.wp-block-post-title, .wp-block-spacer { display: none }`
- Force dark background: `html, body, .wp-site-blocks { background: #080E1C }`
- Remove container constraints: `.is-layout-constrained, .has-global-padding { max-width: none; padding: 0 }`

## Brand Constraints

<!-- SOURCE: pacerai-foundation/brand/ and pacerai-foundation/commercial/cta-language.yml -->

- **Fonts:** DM Sans (body), Cormorant Garamond (headings) — approved by Will
- **Background:** Dark navy (#080E1C)
- **Primary accent:** Teal (#27899A), Teal Light (#70C49C)
- **Aesthetic:** Minimal, financial-professional. Subtle teal accents. No playful illustrations or rounded pill buttons.
- **CTA language:** "Request a Demo", "See a Live ARR Demo", "Talk to a RevOps Expert" — never "Get Started Free"
- **Voice:** Confident, precise. Never use "leverage" or "utilize."

**Canonical source:** `PacerAI/pacerai-foundation/` — see brand/, strategy/, and commercial/ for full definitions.

## Known Issues

- **Homepage slug is `no-title`** — needs Will's review before changing (affects permalink)
- **Yoast meta descriptions** — Cannot be set via REST API on WordPress.com. Must be set in WP Admin per page. Excerpts have been set as fallback. Pages needing Yoast meta: Transaction Readiness (554), RevOps (651), GTM (650), FP&A (652). Homepage (25), ARR Snowball (372), Customer Data Cube (373), Team (366) already have Yoast descriptions.
- **Yoast page title** — should be "Pacer AI — ARR Intelligence for PE-Backed SaaS" (already set for homepage)

## Resolved Issues (April 2026)

- **Jetpack sitemap disabled** — Yoast sitemap is now sole sitemap source
- **Empty parent pages** — `/solutions/` and `/platform/` now redirect to homepage sections
- **Orphaned blog posts** — 6 root-level posts re-parented under `/blog/`
- **Anchor rename** — `#pacerai-pipeline` renamed to `#pacer-ai-platform` across all pages
- **JSON-LD structured data** — All pages now have Service schema for AI scraper discoverability

## SEO & Structured Data

All pages now include `Service` schema.org markup in JSON-LD for AI scraper discoverability:

| Page | Schema Types |
|------|-------------|
| Homepage | Organization (with OfferCatalog of 7 Services), WebSite, WebPage |
| ARR Snowball | Service, WebPage |
| Customer Data Cube | Service, WebPage, FAQPage |
| Transaction Readiness | Service, WebPage, FAQPage |
| RevOps Transformation | Service, WebPage |
| GTM Transformation | Service, WebPage |
| FP&A Transformation | Service, WebPage |

**AI Context Center:** `pacerai-context/apollo_ai.md` contains the paste-ready document for Apollo.io's AI agent. Update this file when products or positioning change.

## Claude Code Skill

This repo includes a project-level skill: `.claude/skills/webdev-getpacerai/SKILL.md`

Invoke with `/webdev-getpacerai [action]` — includes page registry, deploy workflows, brand constraints, and operating rules.

Also symlinked to `~/.claude/skills/webdev-getpacerai` for cross-session availability. Edit the project-level file — the symlink points here.

## Flag for Human Review

- Changes to navigation structure or page slug/permalink
- New image assets that need uploading
- Creating new WordPress pages (record ID in registry)
- Plugin installation or theme changes
