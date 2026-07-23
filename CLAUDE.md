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

**Category (canonical):** Pacer AI is the **GTM Financial Modeling Agent** — built for CROs / Sales Leaders (CFOs secondary). "Revenue Modeling Agent" is retained only as a nav-label synonym.

**Target:** recurring-revenue companies ($10M–$1B, often PE/sponsor-backed, including non-tech: payroll, healthcare, services). Buyer personas: CROs, Sales Leaders, RevOps, CFOs, and PE Portfolio Ops. *(The prior "PE-backed SaaS" framing was removed site-wide in v3.0.x.)*

## Stack

- **CMS:** WordPress.com (hosted, no SSH/WP-CLI access)
- **Theme:** Twenty Twenty-Four (WordPress default — fully overridden by inline CSS)
- **Deploy method:** WordPress REST API + Application Password (Python `requests` library)
- **No build tools** for the pages — no npm, no bundler, no framework. Pure HTML/CSS, vanilla JS for mobile nav only. *(Exception: `infra/pacer-demo-worker/` is a self-contained Cloudflare Worker — its own npm + wrangler — that serves the v3 homepage's demo-video iframe. It is website infra, isolated from page authoring; see its README.)*
- **Font loading:** Google Fonts loaded by WordPress — no `<link>` tags needed in page HTML.

## WordPress Page Registry

All pages are deployed as WordPress Pages via REST API. Each page's HTML source file is the source of truth.

> **v3.0.x (2026-07-23) — LIVE.** PR #20 merged; **v3.0.0 tagged**. The bone rebuild is deployed:
> homepage (25), Resources hub (230), all **12 blog articles**, Team (366), and Contact (375) are all
> **bone (`#F5F4EF`)**. Only legacy/redirected URLs remain non-bone.
> The 6 `/solutions/*` pages are **retired from nav + homepage and 301-redirected to the homepage**
> (source files kept for archive/rollback; do not redeploy their content). Legacy `/pricing/` (111)
> **301-redirects to `/#pricing`**. Homepage nav is flat/centered (Revenue Modeling Agent · Use Cases ·
> Team · Pricing · Resources). The Blog (230) WP page title is renamed **"Blog" → "Resources"** (slug
> already `resources`; posts auto-301, `/blog/` → `/resources/` redirect live; runbook
> `docs/deploy/blog-to-resources-rename.md`). "Resources" nav → `/resources/`.
> **Redirects (301, Redirection plugin):** `/team/about/` → `/#about`, `/platform/overview/` → `/#how-it-works`,
> `/team/contact/` → `/contact/`, `/what-is-an-arr-waterfall/` → `/resources/what-is-an-arr-waterfall/`,
> plus `/about/` and `/overview/`; earlier `/solutions/*` → `/` and `/pricing/` → `/#pricing`.

| Page | WP ID | Slug | Parent | Source File |
|------|-------|------|--------|-------------|
| **Home** | 25 | `no-title` | — | `src/homepage/index-build.html` |
| **Resources** (hub, was "Blog") | 230 | `resources` | — | `src/blog/index-build.html` |
| Platform (parent) | 362 | `platform` | — | *(placeholder — no content)* |
| **Platform Overview** | 371 | `overview` | 362 | `src/platform/overview.html` *(legacy — 301 → `/#how-it-works`)* |
| Solutions (parent) | 364 | `solutions` | — | *(placeholder — no content)* |
| **ARR Snowball** | 372 | `arr-snowball-board-reporting` | 364 | `src/solutions/arr-snowball.html` |
| **Customer Data Cube** | 373 | `customer-data-cube` | 364 | `src/solutions/customer-data-cube.html` |
| **Exit Readiness** | 554 | `transaction-readiness` | 364 | `src/solutions/transaction-readiness.html` |
| **RevOps Transformation** | 651 | `revops-transformation-pkg` | 364 | `src/solutions/revops-transformation-pkg.html` |
| **GTM Transformation** | 650 | `gtm-transformation-pkg` | 364 | `src/solutions/gtm-transformation-pkg.html` |
| **FP&A Transformation** | 652 | `fpanda-transformation-pkg` | 364 | `src/solutions/fpanda-transformation-pkg.html` |
| **Team** (parent) | 366 | `team` | — | `src/team/team-page.html` |
| **About** | 374 | `about` | 366 | `src/team/about.html` *(legacy — 301 → `/#about`)* |
| **Contact** | 375 | `contact` | — | `src/team/contact.html` *(bone; moved to top-level `/contact/`; was parent 366)* |
| Pricing | 111 | `pricing` | — | *(legacy — v3: 301 → `/#pricing`)* |
| Login | 134 | `login` | — | *(legacy — not managed by this repo)* |

**Blog articles (all 12 bone + live, parent 230; deploy with `--force` — pre-existing prose voice-debt trips `validate.py`):**

| Page | WP ID | Slug | Source File |
|------|-------|------|-------------|
| Build vs Hire | 491 | `build-customer-data-cube-in-house-or-hire` | `src/blog/posts/491-build.html` |
| What is an ARR Snowball | 378 | `what-is-an-arr-snowball-understanding-revenue-growth` | `src/blog/posts/227-build.html` |
| Prevent Churn in High-Value Accounts | 376 | `prevent-churn-in-high-value-accounts-with-arr-snowball` | `src/blog/posts/236-build.html` |
| ARR Snowball Analysis | 368 | `arr-snowball-analysis-find-your-expansion-drivers` | `src/blog/posts/244-build.html` |
| Using AI to Enable RevOps | 360 | `using-ai-to-enable-revops-without-breaking-your-gtm` | `src/blog/posts/264-build.html` |
| Why ARR Waterfall Models Matter | 358 | `why-arr-waterfall-models-matter-for-saas-growth` | `src/blog/posts/288-build.html` |
| Why LLMs Can't Build Your ARR Snowball | 441 | `why-llms-cant-build-your-arr-snowball-from-operational-data` | `src/blog/posts/441-build.html` |
| Board-Quality ARR Snowballs | 781 | `board-quality-arr-snowballs` | `src/blog/posts/board-quality-arr-snowballs-build.html` |
| What Companies Build vs What Boards Need | 591 | `what-most-companies-build-vs-what-boards-need` | `src/blog/posts/comparison-build-vs-need.html` |
| Semrush-Adobe Case Study | 888 | `semrush-adobe-acquisition-case-study` *(root URL)* | `src/blog/posts/semrush-adobe-case-study-build.html` |
| What is an ARR Waterfall | 850 | `what-is-an-arr-waterfall` *(canonical `/resources/`; root dupe 873 301→ this)* | `src/blog/posts/what-is-an-arr-waterfall-build.html` |
| What is cRPO (Current Performance Obligation) | 865 | `what-is-current-performance-obligation` | `src/blog/posts/crpo-build.html` |

*(The Jan-2026 batch — 227/236/244/288/264 = WP 378/376/368/358/360 — got fixed+completed FAQPage + Article(+Person author=Will Sullivan) schema.)*

**Live URLs:**
- https://getpacerai.com/
- https://getpacerai.com/resources/
- https://getpacerai.com/resources/what-is-an-arr-waterfall/
- https://getpacerai.com/resources/what-is-current-performance-obligation/
- https://getpacerai.com/semrush-adobe-acquisition-case-study/
- https://getpacerai.com/solutions/arr-snowball-board-reporting/
- https://getpacerai.com/solutions/customer-data-cube/
- https://getpacerai.com/team/
- https://getpacerai.com/contact/

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
│   ├── seo-table.csv + seo-table.html  # SEO data emitted by scripts/build_seo_table.py
│   ├── jan2026-batch-aeo-seo-plan.md   # AEO/SEO plan for the 5 weak Jan-2026 posts
│   ├── website_bone_v3_recommendations.md  # Full site review
│   └── pre-deploy-backup-*.json        # Backups before each deploy
├── document/
│   ├── changelog.md                    # Deploy log
│   └── Internal_Documentation.md       # Messaging, positioning, site tree, SEO strategy
└── deploy/
    ├── runbook.md                      # Deploy instructions
    ├── wp-admin-actions.md             # Organization/Person WPCode schema snippet + redirect runbook
    └── yoast-worklist.md               # Per-page Yoast title/meta worklist (WP Admin only)

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
python3 scripts/deploy.py 25 --force          # Skip validation (used for the 12 blog articles — prose voice-debt)

# Regenerate the SEO data tables (holds the per-page Yoast SEO data)
python3 scripts/build_seo_table.py            # Emits docs/review/seo-table.csv + docs/review/seo-table.html
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
| Yoast SEO title + meta description NOT REST-writable on WordPress.com | REST API silently ignores `yoast_head` / Yoast title/meta fields — no error, no change | Set Yoast title/meta **in WP Admin** (browser). Per-page worklist: `docs/deploy/yoast-worklist.md`. Excerpts remain a fallback for meta desc only. |
| WPCode Footer snippet is fragile — a malformed closing tag once broke ALL footer JS | Every footer-injected script (rotor, marquee, pipeline) dies silently site-wide | Homepage animations (hero rotor w/ 13 phrases, logo marquee, pipeline numbers) moved to the inline `<img onerror>` injector in `src/homepage/index-build.html` (bypasses WP script-stripping), guarded by `window.__paRotor` / `window.__paPipe` so they never double-run if the WPCode footer is later fixed. |

**Design reference (v3 bone homepage):** `docs/design/homepage/index-build-bone_v3_2026-07-22.html` — self-contained, browser-openable copy of the v3 homepage (page CSS/HTML + inlined WPCode JS). Diff live CSS against it. *(Legacy dark reference archived at `docs/design/homepage/archive/`.)*
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
- Force background: v3 bone homepage → `html, body, .wp-site-blocks { background: #F5F4EF }`; legacy dark pages → `#080E1C`
- Remove container constraints: `.is-layout-constrained, .has-global-padding { max-width: none; padding: 0 }`

## Brand Constraints

<!-- SOURCE: pacerai-foundation/brand/ and pacerai-foundation/commercial/cta-language.yml -->

- **Category term (canonical):** **GTM Financial Modeling Agent** (built for CROs / Sales Leaders; CFOs secondary). "Revenue Modeling Agent" survives only as a nav-label synonym; "ARR Modeling Agent" is a schema `alternateName`. The "PE-backed SaaS" framing was removed site-wide — the market is recurring-revenue companies ($10M–$1B, often PE/sponsor-backed, including non-tech: payroll, healthcare, services).
- **Fonts:** DM Sans (body), Cormorant Garamond (legacy headings). The v3 bone homepage uses DM Sans (weight 800) for headings per the approved demo design.
- **Background (v3.0.x, "Claude-bone"):** bone `#F5F4EF` (surface `#FAFAF7`). **ALL pages are now bone** — homepage, Resources hub, all 12 blog articles, Team, and Contact. Only legacy/redirected URLs remain non-bone.
- **Legacy dark background (retired — only on redirected legacy URLs):** Dark navy (#080E1C)
- **Primary accent:** Teal — bone: `#2E7D74` / `#70C49C`; legacy dark: `#27899A` / `#70C49C`
- **v3 bone tokens:** `--bone:#F5F4EF --surface:#FAFAF7 --navy:#1F3864 --teal:#2E7D74 --ink:#20242B --muted:#5F5A50 --line:#E6E1D6`
- **Aesthetic:** Minimal, financial-professional. Subtle teal accents. No playful illustrations or rounded pill buttons.
- **CTA language:** "Request a Demo", "See a Live ARR Demo", "Talk to a RevOps Expert" — never "Get Started Free"
- **Voice:** Confident, precise. Never use "leverage" or "utilize."

**Canonical source:** `PacerAI/pacerai-foundation/` — see brand/, strategy/, and commercial/ for full definitions.

## Known Issues

- **Homepage slug is `no-title`** — needs Will's review before changing (affects permalink)
- **Yoast title + meta descriptions** — NOT writable via the WordPress.com REST API; set in WP Admin (browser) per page. v3.0.x: Yoast title + meta rebranded across **all 21 indexed pages** to the "GTM Financial Modeling Agent for CROs" message; per-page worklist at `docs/deploy/yoast-worklist.md`. Homepage `og:title` corrected to "Pacer AI — The GTM Financial Modeling Agent for CROs". Organization + Person schema added via a WPCode JSON-LD snippet (founder Will Sullivan, foundingDate 2023-05, sameAs linkedin.com/company/getpacerai + linkedin.com/in/will-sullivan98 + youtube.com/@PacerAI, alternateName ["Revenue Modeling Agent","ARR Modeling Agent"]) — see `docs/deploy/wp-admin-actions.md`.

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
