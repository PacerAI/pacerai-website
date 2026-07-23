# Architecture — getpacerai.com

**Date:** March 2026 (updated 2026-03-10)
**Approach:** Multi-page WordPress deployment via REST API

> **v3.0.0 (2026-07-21) — Claude-bone homepage.** The homepage (WP 25) now ships on the
> "Claude-bone" light palette (bone `#F5F4EF`, surface `#FAFAF7`, navy `#1F3864`, teal `#2E7D74`)
> with its CSS **inline in the page** (the old WPCode Header CSS snippet is blanked). **Inner pages
> and the blog remain on the legacy dark theme (`#080E1C`)** pending their v3.0.x bone conversion —
> do not assume a page is bone until converted. Nav is now flat/centered (Solutions dropdown
> removed); the 6 `/solutions/*` pages are 301-redirected to the homepage and legacy `/pricing/`
> redirects to `/#pricing`.

---

## Deployment Architecture

```
Claude Code (local)
    │
    ├── reads  → docs/design/, docs/plan/site-tree-and-build-prompts.md
    ├── writes → src/{section}/{page}.html  (source files)
    │
    └── deploys via WordPress REST API (Python requests)
            │
            └── POST /wp-json/wp/v2/pages/{ID}
                    │
                    └── getpacerai.com (WordPress.com hosted)
                            ├── Theme: Twenty Twenty-Four (default, overridden)
                            ├── Yoast SEO (manages <head> meta)
                            └── Google Site Kit (GA4 + Search Console)
```

---

## Page Architecture

Every page is a single `<!-- wp:html -->` Gutenberg block containing:

```
<style>
  ├── TT4 theme overrides (hide header/footer/title, dark bg, full-width)
  ├── CSS variables (:root)
  ├── Component styles (nav, hero, sections, footer)
  ├── Page-specific styles
  ├── Mobile responsive (@media max-width: 768px)
  └── Tablet responsive (@media max-width: 1024px)
</style>

<div id="pacerai-homepage">
  ├── <nav>              — Fixed top nav with logo, dropdown menus, CTA buttons
  │                        Mobile: hamburger menu with full-screen overlay
  ├── [page content]     — Page-specific sections
  └── <footer>           — 5-column footer with legal bar
</div>

<script>
  └── Mobile nav: hamburger toggle + dropdown expand/collapse
</script>
```

### Shared Elements (duplicated in every page file)

| Element | Description |
|---------|-------------|
| TT4 override CSS | Hides theme chrome, forces dark bg, removes container constraints, hides `.wp-block-post-title` and `.wp-block-spacer` |
| CSS variables | Full brand color system (`:root` block) |
| Nav HTML | Fixed nav with dropdowns, mobile hamburger, SVG logo |
| Footer HTML | 5-column grid (Brand, Platform, Use Cases, Comparisons, Company) |
| Nav JS | Mobile hamburger toggle + dropdown expand/collapse |
| Responsive CSS | Breakpoints at 768px (mobile) and 1024px (tablet) |

**Important:** Changes to shared elements must be applied to ALL page files and redeployed.

### Page-Specific Content by File

| File | Key Sections |
|------|-------------|
| `homepage/index-build.html` | Hero, dashboard preview, logo strip, use cases (9 items), how-it-works (4 steps), platform pillars, empathy section, testimonial, CTA |
| `platform/overview.html` | Hero, architecture flow diagram, 3 capability pillars, integration grid, CTA |
| `solutions/arr-snowball.html` | AEO definition, problem grid, Pacer solution, ARR components breakdown, dashboard mockup, personas, testimonial, FAQ (JSON-LD schema), CTA |
| `solutions/customer-data-cube.html` | AEO definition, problem grid, 6-dimension grid, use cases, dashboard mockup, FAQ (JSON-LD schema), CTA |
| `company/about.html` | Mission card, old-way/new-way contrast grid, founder section, 4 values cards, tech partners strip, CTA |
| `company/contact.html` | 2-column layout: contact form + sidebar cards (Calendly, email, partnerships), CTA |
| `blog/index-build.html` | Blog index with featured post + card grid, category pill filters (JS), newsletter CTA |
| `blog/posts/{id}-build.html` | Individual blog posts (5 total, generated from `post-template.html`) |

---

## Theme: Twenty Twenty-Four

WordPress default theme — fully overridden by inline CSS in each page.

**TT4 overrides in content CSS:**
```css
/* Hide theme chrome */
.wp-site-blocks > header, .wp-site-blocks > footer,
header.wp-block-template-part, footer.wp-block-template-part,
.wp-block-template-part:first-child { display: none !important; }

/* Hide WordPress page title and spacer (creates gap on non-homepage pages) */
.wp-block-post-title, .wp-block-spacer { display: none !important; }

/* Force dark background */
html, body, .wp-site-blocks { background: #080E1C !important; }  /* legacy dark pages; v3 bone homepage uses #F5F4EF */

/* Remove content container constraints */
.wp-site-blocks, .wp-site-blocks > main,
.is-layout-constrained, .has-global-padding, .entry-content {
  max-width: none !important;
  padding: 0 !important;
  margin: 0 !important;
}
```

**Why TT4:** Minimal, respects static front page setting, WordPress core team maintained. Our content is fully self-contained with inline CSS — theme only provides the document shell.

---

## Deploy Method: REST API

All deploys use the WordPress REST API with HTTP Basic Auth.

```python
import requests, os

base_url = os.environ['WP_BASE_URL']
auth = (os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])

with open('src/platform/overview.html') as f:
    html = f.read()

content = f"<!-- wp:html -->{html}<!-- /wp:html -->"
resp = requests.post(f"{base_url}/wp-json/wp/v2/pages/371", json={"content": content}, auth=auth)
```

### API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/wp-json/wp/v2/pages?per_page=100` | List all pages (audit) |
| GET | `/wp-json/wp/v2/pages/{ID}` | Read page content |
| GET | `/wp-json/wp/v2/pages/{ID}?context=edit` | Read raw content (for backups) |
| POST | `/wp-json/wp/v2/pages/{ID}` | Update existing page |
| POST | `/wp-json/wp/v2/pages` | Create new page |
| GET | `/wp-json/wp/v2/settings` | Check `page_on_front` setting |

### Authentication
- HTTP Basic Auth with Application Password
- Variables: `WP_USER`, `WP_APP_PASSWORD`, `WP_BASE_URL` (set in `~/.zshrc`)
- Key name in WP admin: `claude-code`

---

## WordPress Page Hierarchy

```
getpacerai.com/
├── / (Home)                                    → ID 25
├── /blog/                                      → ID 230
├── /platform/                                  → ID 362 (parent placeholder)
│   └── /platform/overview/                     → ID 371
├── /solutions/                                 → ID 364 (parent placeholder)
│   ├── /solutions/arr-snowball-board-reporting/ → ID 372
│   └── /solutions/customer-data-cube/          → ID 373
├── /company/                                   → ID 366 (parent placeholder)
│   ├── /company/about/                         → ID 374
│   └── /company/contact/                       → ID 375
├── /why-arr-waterfall-models-matter-.../         → ID 358 (blog post)
├── /using-ai-to-enable-revops-.../              → ID 360 (blog post)
├── /arr-snowball-analysis-.../                  → ID 368 (blog post)
├── /prevent-churn-.../                          → ID 376 (blog post)
├── /what-is-an-arr-snowball-.../                → ID 378 (blog post)
├── /pricing/                                   → ID 111 (legacy)
└── /login/                                     → ID 134 (legacy)
```

Parent pages (362, 364, 366) exist solely for URL hierarchy. They have no content.

---

## Cross-Linking

All P1 pages are cross-linked via nav dropdowns, footer columns, and contextual CTAs:

| Link Target | Path |
|-------------|------|
| Platform Overview | `/platform/overview/` |
| ARR Snowball | `/solutions/arr-snowball-board-reporting/` |
| Customer Data Cube | `/solutions/customer-data-cube/` |
| About | `/company/about/` |
| Contact | `/company/contact/` |
| Blog | `/blog/` |
| Log In | `https://app.getpacerai.com/.auth/login/aad` |
| Request Demo | `https://calendly.com/pacerai` |

Links to pages not yet built remain as `href="#"`.

---

## Asset Handling

- Existing uploads at `https://getpacerai.com/wp-content/uploads/`
- Inline SVG preferred for icons (logo, chevrons, decorative elements)
- **Do not:** reference external CDNs, localhost paths, or data URIs for large images

---

## File Map

```
src/
├── homepage/
│   ├── index-build.html            # Homepage (WP ID 25)
│   └── index-build-backup-*.html   # Pre-deploy backups
├── blog/
│   ├── index-build.html            # Blog index (WP ID 230)
│   ├── post-template.html          # Blog post template
│   └── posts/                      # Individual blog posts
├── platform/
│   └── overview.html               # Platform Overview (WP ID 371)
├── solutions/
│   ├── arr-snowball.html           # ARR Snowball (WP ID 372)
│   └── customer-data-cube.html     # Customer Data Cube (WP ID 373)
└── company/
    ├── about.html                  # About (WP ID 374)
    └── contact.html                # Contact (WP ID 375)
```

---

## Known Constraints

| Constraint | Impact |
|---|---|
| WordPress.com (no SSH) | Cannot edit theme PHP files — content-only updates |
| No WP-CLI access | Cannot flush object cache programmatically |
| Yoast SEO active | Must preserve `yoast_head` — do not overwrite meta fields |
| TT4 theme | Overrides needed to hide chrome, page title, and spacer |
| Shared elements | Nav/footer/CSS duplicated in each file — changes require batch redeploy |
| `backdrop-filter` | Creates containing block — disabled on mobile nav |
| Blog as Pages | WordPress Posts strip `<style>` tags — blog posts deployed as Pages with HTML-only categories |
| JSON-LD schema | Article schema on blog posts, CollectionPage/ItemList on blog listing, FAQ on solutions pages |
