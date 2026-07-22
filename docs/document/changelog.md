# Changelog — website-PacerAI

All deployments logged here in reverse chronological order.

Versioning: from v3.0.0 onward, releases are semver-tagged (`vX.Y.Z`, annotated git tags +
top-level `VERSION` file). Entries below the v3.0.0 block are the pre-semver date-headed history
(preserved, not renumbered). One `2026-04-06` block sits out of order at the very bottom.

---

## v3.0.0 — 2026-07-21 — Claude-bone homepage redesign (initial ship)

- **Status:** built on branch `feat/bone-redesign-v3`; **NOT yet deployed** — gated on Will's
  approval + voice/visual pass + manual WordPress prep (below).
- **Approved by:** Will Sullivan (plan approval 2026-07-21)
- **Deployed by:** _(pending)_
- **Semver:** first semver-tagged release. Added top-level `VERSION` = `3.0.0`; tag `v3.0.0` to
  be applied on merge. MAJOR bump (full homepage redesign; continues the informal v1/v2/v3 line).
- **Launch goal:** ship the light **Claude-bone** (`#F5F4EF`) homepage with the HTML demo-video
  iframe (Claude-over-Tahoe) displaying. Copy/section polish + blog + inner-page conversion
  iterate as `v3.0.x` follow-ups.
- **Changes (in this PR):**
  - **Homepage (WP 25) — full replacement:** ported the bone design from
    `pacerai-platform-claude-native/demo-site/index.html`, WordPress-adapted — `#pacerai-homepage`
    wrapper, TT4 chrome hidden with `background:#F5F4EF`, all inner `id=` → `data-section` +
    `_s()` smooth-scroll injector, CSS inlined (~16K, no WPCode Header CSS needed), JS moved to
    the WPCode footer. Sections: hero (rotor) → social proof → **demo showcase iframe** → How It
    Works pipeline → value tiles → Use Cases → Team → Pricing → FAQ → CTA. Validates 12/12 clean.
  - **Nav (flat, centered, 5 items):** Revenue Modeling Agent · Use Cases · Pricing · Team ·
    Resources + Log In. Solutions dropdown removed. Resources → `/blog/`. Pricing → `/#pricing`.
  - **Team section:** single line per Will — "Founded by an operator turned M&A advisor — Will
    Sullivan, a former PwC M&A advisor, search fund operator, and West Point graduate." + link to
    `/team/`.
  - **FAQ pricing answer** reworded to voice-compliant alignment-based pricing (drops banned
    "utilize"): "Pacer AI uses an alignment-based pricing model to align Pacer AI with its
    clients' goals."
  - **Footer:** Solutions column retired → Use Cases · Company · Resources · Connect.
  - **WPCode footer JS** (`src/wpcode/footer.js`): added hero rotor, logo marquee duplication,
    bone pipeline number-stream (sections 6–8). Preserves the Research-waitlist handler.
  - **Canonical partials** `src/nav-headers.html` + `src/footer/footer.html` updated to bone.
  - **`scripts/validate.py`** check #7 message updated for the new footer columns.
  - **Archived** the dark homepage/nav/footer + the 37K WPCode dark CSS under
    `docs/design/homepage/archive/` + `docs/design/nav_headers/archive/` (README supersession note).
- **Demo hosting (built 2026-07-22):** the ~160K demo can't be a WP page, so it's served by a
  Cloudflare Worker in this repo — **`infra/pacer-demo-worker/`** — at
  `https://pacer-demo-worker.will-078.workers.dev/`. The homepage showcase iframe points there
  (no longer a placeholder). One-time deploy: `cd infra/pacer-demo-worker && npm install && npx
  wrangler login && npm run deploy`. Optional custom domain `demo.getpacerai.com` documented in
  that worker's README (needs the zone on Cloudflare DNS).
- **Manual WordPress prep required before deploy (Will-gated):**
  - Deploy `pacer-demo-worker` (above) so the showcase iframe resolves.
  - Upload `tahoe-bg.jpg` to WP media; relink the showcase background.
  - **Blank the WPCode Header CSS snippet** (old 37K dark CSS) — the bone CSS is now inline.
  - Paste the updated `src/wpcode/footer.js` into the WPCode Footer snippet.
  - **301 redirects:** 6 `/solutions/*` → homepage; legacy `/pricing/` (WP 111) → `/#pricing`;
    audit + redirect any other orphans.
  - **⚠ Blog → Resources rename (round 3):** change WP page 230 slug `blog` → `resources`, then
    301 `/blog/` → `/resources/` **and** each `/blog/<slug>/` → `/resources/<slug>/` (posts move
    with the parent). Source now links to `/resources/…` everywhere (nav, footer, article links,
    homepage case-study card) and the blog filter pills are deep-links (`/resources#case-study`).
    This is a slug/permalink change — **flagged for Will**; do the slug change + redirects at deploy.
- **Deploy (after prep):** `deploy.py 25` → verify 200 + demo iframe renders (launch gate).
- **v3.0.x done (2026-07-22, cont.):** Team page + all **14 blog post pages** converted to bone
  (token remap + bone nav/footer + `/resources/` links); homepage r2/r3 (Calendly CTAs, trimmed
  Security, hero rotor inline + new phrases, "On-Pace to Plan"); blog **/resources rename**
  (see `docs/deploy/blog-to-resources-rename.md` for the WP slug + 301 steps). **Blog posts pass
  all structural checks but have pre-existing article-body voice-lint hits** — need Will's voice
  pass (or `--force`) before deploy; the bone conversion itself is complete.
- **v3.0.x done (2026-07-22):** blog (WP 230) restyled to bone (token remap + bone nav/footer,
  matches the homepage); homepage review round 1 (centered How-It-Works, 3-line hero, nav reorder
  + Free Diagnostic CTA, new #case-studies/#integrations/#security/#value sections); demo hosting
  Worker (`infra/pacer-demo-worker/`); repeatable preview loop (`scripts/build_preview.py`).
- **v3.0.x follow-ups (still tracked):** full bone conversion + new-nav adoption for
  platform/team/about/contact; voice/content pass on the 4 draft homepage sections; positioning
  review ("Revenue Modeling Agent" framing); delete orphan scratch `src/homepage/demo/`.
- **Backup:** `deploy.py` writes `docs/review/pre-deploy-backup-25-*.json` at deploy time.

---

## 2026-04-19 — Site Cleanup: Redirects, Anchor Rename, Blog Re-parenting, Meta Descriptions

- **Pages deployed:** All 14 managed pages + redirects for 2 parent pages
- **Deployed by:** Claude Code
- **Changes:**
  - **Anchor rename:** `#pacerai-pipeline` → `#pacer-ai-platform` across all 23 HTML source files (CSS selectors, HTML ids, nav links)
  - **Parent page redirects:** `/solutions/` (364) redirects to `/#solutions`, `/platform/` (362) redirects to `/team/#pacer-ai-platform`
  - **Blog re-parenting:** 6 orphaned root-level blog posts re-parented under Blog (230). URLs changed from `/{slug}/` to `/blog/{slug}/`
  - **Yoast excerpts:** Set page excerpts for all 12 managed pages as meta description fallback. Yoast `_yoast_wpseo_metadesc` not writable via REST API on WordPress.com — requires WP Admin.
  - **Jetpack sitemap disabled:** Toggled off by Will in WP Admin. Yoast sitemap (`/sitemap_index.xml`) is now sole sitemap.

---

## 2026-04-19 — SEO Structured Data + AI Context Center

- **Pages modified:** Home (25), ARR Snowball (372), Customer Data Cube (373), Transaction Readiness (554), RevOps Transformation (651), GTM Transformation (650), FP&A Transformation (652)
- **Deployed by:** Claude Code
- **Changes:**
  - **Homepage JSON-LD:** Updated Organization description to enumerate all 7 products. Added `hasOfferCatalog` with `OfferCatalog` containing 7 `Service` entries with names, descriptions, and URLs. Updated WebPage description to list all products.
  - **Solution pages JSON-LD:** Added `Service` and `WebPage` schema to all 6 solution pages. Pages that had only `FAQPage` schema (Customer Data Cube, Transaction Readiness) now use `@graph` with Service + WebPage + FAQPage. Pages with no schema (RevOps, GTM, FP&A Transformation) now have Service + WebPage schema. ARR Snowball Organization schema replaced with Service + WebPage.
  - **New folder:** `pacerai-context/` with `pacerai.md` (canonical company context) and `apollo_ai.md` (Apollo.io AI Context Center paste-ready document with schema explanation).
- **Why:** Apollo.io's AI agent only scraped 3 products from the homepage because the JSON-LD description was too narrow and no Service schema existed. These changes ensure AI scrapers discover all 7 products from structured data alone.
- **Note:** Pages are NOT deployed yet — source files updated, deploy via REST API required.

---

## 2026-04-07 — Typed Hero Rotation + CTA Update (Homepage)
- **Pages deployed:** Home (25)
- **Deployed by:** Will Sullivan
- **Changes:**
  - **Typed hero rotation:** Hero last line now cycles through 4 phrases character-by-character: Board Reporting → Operational Cadence → Sales Strategy → Due Diligence
  - **CTA updated:** Changed from "Your next board meeting starts here" to "Pacer AI keeping you on pace to transact"
  - **CTA cleanup:** Removed "See how..." paragraph from CTA section
  - **JS delivery method:** JavaScript delivered via WPCode Lite Header & Footer plugin (footer injection), not inline `<script>` — WordPress strips inline scripts from page content
  - **Minified JS pitfall discovered:** WordPress inserts line breaks into minified JS in WPCode footer, breaking tokens like `setTimeout` and `el.textContent`. Fixed by using non-minified JS with proper line breaks.
  - **HTML markup:** `<span class="typed-line"></span><span class="type-cursor"></span>` added inside h1
  - **CSS added to page:** `@keyframes blink` for cursor, `.typed-line` color (teal-light), `.type-cursor` styles
- **Deployment guide:** `01_Foundation/brand/components/typing_feature_instructions.md`

---

## 2026-04-05 — Exit Readiness Launch (First Populated Solution Page) ⭐
- **Pages created:** Exit Readiness (WP ID 554) — new page under Solutions parent (364)
- **Pages redeployed:** Home (25), Blog (230), Platform Overview (371), ARR Snowball (372), Customer Data Cube (373), About (374), Contact (375) — nav link update
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Live URL:** https://getpacerai.com/solutions/exit-readiness/
- **Changes:**
  - **NEW page:** `src/solutions/exit-readiness.html` (54,920 chars) — first real solution page built from the canonical `_template.html` shell. Proves the 9-section customer-centric narrative arc and the 4D Defend framework end-to-end.
  - **Framework:** Transaction Solutions → Diagnose → Design → Deploy → **Defend** (maps to the existing Q1–Q4 Exit Readiness framework from `01_Foundation/products/transaction-readiness/`)
  - **Content sources (all traceable to Foundation):**
    - §1 Hero: `products/transaction-readiness/messaging_Exit-Readiness.md` (Variant A "Exit Ready")
    - §2 Pain: `customers/icp-problems.yml` (arr-not-diligence-ready, inconsistent-arr-definitions, late-stage-data-requests) + LinkedIn Article 1 opening
    - §3 Foresight: `products/transaction-readiness/linkedin-articles_Exit-Readiness.md` Article 3 ($25M valuation erosion)
    - §4 Expert: Two-firm row (Pacer AI + Veach AI) — both ex-PwC TMT, QoR + QoE partnership
    - §5 4D Method: `products/transaction-readiness/exit-readiness.md` 4-quarter framework mapped 1:1 to DIAGNOSE→DESIGN→DEPLOY→DEFEND
    - §6 Deliverables: 6 cards from product master doc (Data Cube, ARR Snowball Waterfall, EBITDA Walk, 3-Way NRR, Full QoE Report, Exit Readiness Score 0–100)
    - §7 Proof: `content_library/Customer Case Study - Helped healthtech company grow to 105 NRR .md` — **exact Inven.io signal match** (PE-backed healthcare, end of hold period, ready to exit)
    - §8 FAQ: 5 plain-text Q&As feeding AEO + objection handling (pricing ranges disclosed per sales playbook)
    - §9 CTA: "Request an Exit Readiness Assessment" → Calendly
  - **Nav update:** "Transaction Readiness pkg." in the Solutions mega-dropdown now links to `/solutions/exit-readiness/` (was placeholder `/` or `#`). Applied across all 7 existing pages.
  - **Apollo wiring ready:** Every email in `email-sequence_CFO_Exit-Readiness.md` can now pull directly from page sections — signal-perfect alignment with Inven.io "4+ years since last transaction" → Exit Readiness sequence.
  - **Size:** 54,920 chars (14,080 char buffer under 69K limit)
  - **Backup:** `docs/review/post-deploy-exit-readiness-20260405-1019.json`

This is the **Phase 2 validation run** of the canonical solution page template. Template proven end-to-end. Phase 3 (retrofit ARR Snowball + Customer Data Cube) and Phase 4 (ship remaining 3 Transformation pages with the Drive variant) unlocked.

---

## 2026-04-05 — Solution Page Design Spec + Canonical Template Shell (docs only, no deploy)
- **Pages deployed:** None (internal scaffolding only)
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Changes:**
  - **NEW doc:** `docs/plan/solution_page_design.md` — canonical 9-section customer-centric narrative arc (empathy → foresight → authority → method → proof → CTA), with full section-by-section content requirements, placeholder token convention, component reuse map, and Apollo sequence mapping
  - **Two delivery frameworks defined:**
    - **Transaction Solutions → Diagnose → Design → Deploy → Defend** (Customer Data Cube, ARR Snowball, Transaction Readiness Package, Exit Readiness)
    - **Transformation Solutions → Diagnose → Design → Deploy → Drive** (RevOps, GTM, FP&A Transformation)
  - **NEW template shell:** `src/solutions/_template.html` (54,152 chars, 87 `{{TOKEN}}` placeholders) — drop-in copy of the production nav/footer/CSS from `arr-snowball.html` with the 9-section content body replaced by tokenized placeholders ready for LLM population
  - **Framework purpose clarified:** 4D is the *delivery* backend — the public page is customer-centric and reveals 4D only in Section 5 after building empathy (§2), foresight (§3), and authority (§4)
  - **Apollo sequencing alignment:** Every solution page section maps to one email in an outreach sequence; section 5 (4D method) provides the 4-step teaching cadence for signal-based enrollment (e.g., Inven.io "4+ years since last transaction" → Exit Readiness sequence)
  - **No live deploy** — template is internal scaffolding. Phase 2 will populate one real solution page (recommended: Exit Readiness as the validation run).

---

## 2026-04-05 — Resources Data Model + Blog Filter Deep-Links
- **Pages deployed:** Home (25), Blog (230), Platform Overview (371), ARR Snowball (372), Customer Data Cube (373), About (374), Contact (375)
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Changes:**
  - **NEW doc:** Created `docs/plan/resources_data_model.md` — canonical ICP → Problem → Content Pillar → Solution → Resource mapping drawing from `01_Foundation/customers/`, `01_Foundation/strategy/content-pillars.yml`, and `01_Foundation/products/`. Includes 27-row data model table and 8-item Resources taxonomy.
  - **Blog:** Added new "Model Templates" filter pill next to ARR Snowballs, Frameworks, RevOps, AI & Agents
  - **Blog:** Added URL query param auto-select (e.g., `/blog/?filter=arr-snowballs` auto-clicks the ARR Snowballs pill on page load)
  - **Blog:** Added "Coming soon" empty-state message for filter categories with 0 posts (Frameworks, Model Templates, AI & Agents)
  - **Nav (all 7 pages):** Replaced 5-item Resources dropdown with new 7-item structure:
    - Blog (`/blog/`)
    - ARR Snowballs (`/blog/?filter=arr-snowballs`) — replaces "ARR Snowball Guide" placeholder
    - Frameworks (`/blog/?filter=frameworks`) — replaces "Templates & Frameworks"
    - Model Templates (`/blog/?filter=model-templates`) — NEW
    - Newsletter (Substack, new tab) — renamed from "Agents of Insight Newsletter"
    - YouTube (`@PacerAI`, new tab)
    - For RevOps (`/blog/?filter=revops`) — NEW persona hub
  - **Deferred:** AI Prompt & Skill Library documented in data model but NOT added to WordPress nav (Phase 2 decision on how to surface `04_GTM/prompt-library/`)
  - Updated `docs/plan/prd.md` Resources row + `docs/design/index-build-long_page_2026_04_03.html` dropdown

---

## 2026-04-05 — Resources Dropdown Update
- **Pages deployed:** Home (25), Blog (230), Platform Overview (371), ARR Snowball (372), Customer Data Cube (373), About (374), Contact (375)
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Changes:**
  - Resources dropdown: "Agents of Insight Newsletter" → links to https://agentsofinsight.substack.com/ (opens in new tab)
  - Resources dropdown: "Webinars" renamed to "YouTube" → links to https://www.youtube.com/@PacerAI (opens in new tab)
  - Resources dropdown: "Documentation" removed
  - Updated design reference (`docs/design/index-build-long_page_2026_04_03.html`) and PRD to match

---

## 2026-04-04 — Nav Rebuild + Use Cases Pill + Cross-Page Sync
- **Pages deployed:** All 7 active pages
- **Changes:**
  - Replaced old `<ul class="nav-dropdown">` nav with mega-dropdown `<div class="dropdown">` structure across all 7 pages
  - Added teal "Use Cases" pill anchor before question sections on homepage
  - Solutions dropdown links to real WP pages (`/solutions/customer-data-cube/`, `/solutions/arr-snowball-board-reporting/`)
  - Sub-page nav links use WP URLs instead of `data-scroll-to` (since in-page anchors only exist on homepage)
  - Added inline `_s()` helper via `<img onerror>` (WP strips `<script>` tags) to handle smooth scroll + URL hash update + hash-on-load
  - Removed "Use Cases" cards section and "DIY Challenges" section from homepage (redundant / moved to blog)
  - Fixed blog mobile nav selector (`#pacerai-homepage` → `#pacerai-blog`)

---

## 2026-04-03 — Homepage v3 Deploy + Nav/Footer Update + New Blog Post
- **Pages deployed:** Homepage (25), Blog (230), Platform Overview (371), ARR Snowball (372), Customer Data Cube (373), About (374), Contact (375), new blog post (491)
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Changes:**
  - Deployed homepage v3 (Phases 1-3 combined): updated hero, 6 use-case question cards, 6 detailed use-case sections with AEO snippets, comparison section, DIY challenges section, "What is Pacer AI?" with expert card, 6-card solutions grid, updated nav/footer, KPI counters with animation, smooth-scroll JS via data-section attributes
  - Updated nav and footer across all 6 other page files to match new homepage nav/footer
  - Batch deployed all pages — all return HTTP 200
  - Published Phase 4 AEO blog post: "Should I Build a Customer Data Cube In-House or Hire Someone?" (page 491, slug: build-customer-data-cube-in-house-or-hire)
  - Added blog card to blog listing page (230) — new post as featured
  - Fixed build-posts.py repo path (04_PacerAI_GTM -> PacerAI/04_GTM)
  - Updated blog post template nav/footer
- **Backup:** `docs/review/pre-deploy-backup-20260403-1415.json`
- **New source files:**
  - `src/blog/posts/content-491.html`, `src/blog/posts/491-build.html`
- **Homepage size:** 63,276 chars (5.7K buffer under 69K limit)

---

## 2026-03-10 — New Blog Post + Yoast SEO + Featured Image Fix
- **Pages deployed:** New blog post (441), updated blog listing (230)
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Changes:**
  - Published "Why LLMs Can't Build Your ARR Snowball from Operational Data" (page 441)
  - Set Yoast meta descriptions and page titles on all 18 published pages via MCP `wp_update_post_meta`
  - Set parent placeholder pages (362, 364, 366) and Login (134) to `noindex`
  - Removed featured image (media 433) from all 18 pages — TT4 was rendering it above content
  - Created `/blog-post` skill with draft preview and two review gates
  - Updated `/blog-post` skill with content voice preferences (plain language, linking requirements)
  - Homepage JSON-LD added (Organization, WebSite, WebPage schemas)
  - Blog post FAQ schema added (FAQPage with Q&A pairs per post)
  - SEO/AEO audit run, report saved to `docs/review/seo-audit-getpacerai-20260310.md`
- **Issues resolved:** #2 (missing meta descriptions), #3 (generic page title), #6 (featured image above content)
- **New source files:**
  - `src/blog/posts/content-441.html`, `src/blog/posts/441-build.html`
  - `.claude/skills/blog-post/SKILL.md`
  - `docs/deploy/blog-post-guide.md`
  - `docs/review/seo-audit-getpacerai-20260310.md`

---

## 2026-03-10 — Blog System: JSON-LD Schema + Category Filtering + BB Cleanup
- **Pages deployed:** Blog listing (230), 5 blog posts (358, 360, 368, 376, 378)
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Changes:**
  - Added JSON-LD structured data to all blog pages (Article schema on posts, CollectionPage + ItemList on listing)
  - Added client-side category pill filtering (vanilla JS, `data-category` attributes)
  - Confirmed no Beaver Builder CSS remains in any source files
  - Only 1 BB plugin remains: "Ultimate Addons for Beaver Builder - Lite" (needs manual deactivation)
  - Created SEO/AEO audit Claude Skill (now at `~/.claude/skills/seo-aeo-audit/`)
- **Schema types deployed:**
  - Blog posts: `Article` with headline, datePublished, author (Organization), publisher with logo, articleSection
  - Blog listing: `CollectionPage` + `ItemList` with 5 ListItems
- **Issues:** Will to deactivate "Ultimate Addons for BB - Lite" plugin in WP admin

---

## 2026-03-10 — P1 Site Expansion: 5 New Pages + Cross-Linking + Blog Update
- **Pages deployed:**
  - Platform Overview (ID 371) → https://getpacerai.com/platform/overview/
  - ARR Snowball Board Reporting (ID 372) → https://getpacerai.com/solutions/arr-snowball-board-reporting/
  - Customer Data Cube (ID 373) → https://getpacerai.com/solutions/customer-data-cube/
  - About (ID 374) → https://getpacerai.com/company/about/
  - Contact (ID 375) → https://getpacerai.com/company/contact/
- **Parent pages created:** Platform (362), Solutions (364), Company (366) — empty placeholders for URL hierarchy
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Changes:**
  - Built 5 P1 pages as standalone HTML files with inline CSS matching homepage design system
  - Each page follows shared pattern: TT4 overrides, CSS variables, nav, page content, footer, mobile JS
  - Cross-linked all 7 pages (homepage, blog, platform, ARR snowball, customer data cube, about, contact) at nav, footer, and content-level CTAs/links
  - Added `.wp-block-post-title, .wp-block-spacer { display: none }` to all page files to fix TT4 page title gap
  - Updated blog nav/footer links to match P1 cross-linking
  - Redeployed homepage (ID 25) and blog (ID 230) with updated cross-links
  - Fixed Solutions/Company parent page titles (were "usolutions"/"ucompany" from sed issue)
- **New source files:**
  - `src/platform/overview.html`
  - `src/solutions/arr-snowball.html`
  - `src/solutions/customer-data-cube.html`
  - `src/company/about.html`
  - `src/company/contact.html`
- **Documentation updated:** CLAUDE.md, AGENTS.md, README.md, architecture.md, runbook.md, changelog.md, Internal_Documentation.md, overview.md
- **Issues:** Yoast SEO metadata not yet set for new pages

---

## 2026-03-09 — Mobile Responsive + Clean Theme Migration (v3)
- **Page ID:** 25
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Changes:**
  - Switched theme from Beaver Builder to Twenty Twenty-Four
  - Added TT4 override CSS (hide theme header/footer, force dark background, remove container constraints)
  - Added nav HTML (with hamburger menu for mobile) and footer HTML from design mockup
  - Fixed nav dropdown hover gap with invisible bridge pseudo-element
  - Full mobile responsive overhaul: nav hamburger menu, stacked hero CTAs, single-column grids for use cases/steps/pillars/empathy, 3-col use case menu strip, 2-col footer, tablet breakpoint
  - Fixed backdrop-filter containing block issue that trapped mobile menu inside 56px nav
- **Issues:** Will to deactivate/delete BB plugins and BB theme in WP admin
- **Backup:** docs/review/pre-deploy-backup-20260309-v2.json
- **Live URL:** https://getpacerai.com

---

## 2026-03-09 — Remove Beaver Builder CSS Hacks (v2)
- **Page ID:** 25
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Content size:** 52,349 → 50,238 characters
- **Changes:** Removed 30 lines of Beaver Builder override CSS (.fl-post-header hide, #pacerai-homepage breakout hack, .fl-post-content/fl-content-full/fl-page-content overrides). All design CSS and HTML preserved — only BB fight code removed. Prepares for BB plugin deactivation.
- **Issues:** Will needs to deactivate BB plugins in WP admin: Beaver Builder Lite, Beaver Builder Starter, Beaver Themer, Ultimate Addons for BB. Optionally deactivate Classic Editor.
- **Backup:** docs/review/pre-deploy-backup-20260309-v2.json
- **Live URL:** https://getpacerai.com

---

## 2026-03-09 — Homepage Refresh v1
- **Page ID:** 25
- **Deployed by:** Claude Code
- **Approved by:** Will Sullivan
- **Content size:** 16,117 → 52,349 characters
- **Changes:** Full homepage redesign from approved design mockup. New hero ("Your ARR Snowball Report. Automated. Board-Ready."), nav (Platform, Solutions, Resources, Partners, Customers, Company), ARR Snowball section, platform pillars, use cases, how-it-works steps, testimonial, founder section, CTA, and full footer. Replaced base64 data URI with WP CDN image (media ID 327). Log In button linked to app.getpacerai.com auth. DM Sans + Cormorant Garamond fonts. Inline CSS included.
- **Issues:** Yoast page title and meta description still need to be set in WP admin (see docs/review/Issues.md)
- **Backup:** docs/review/pre-deploy-backup-20260309.json
- **Live URL:** https://getpacerai.com
## 2026-04-06 — Homepage + Team Page Updates

**Homepage (ID 25):**
- Solution cards now clickable links to solution pages (Customer Data Cube, ARR Snowball, Transaction Readiness, RevOps/GTM/FP&A Transformation)
- Solution cards have hover animation (border brightens + lift)
- Homepage at 67,854 chars — 146 chars under 68K limit (FULL — no room for additions)
- Renamed all exit-readiness → transaction-readiness across nav/footer links
- Fixed Team nav dropdown: "About the Team, Contact" → "Mission, Team, Partners, Agent Team"

**Team Page (ID 366):**
- Added partner headshots (Veach, Hodell, Pae, Westerink) — uploaded to WP media library
- Added Will Sullivan headshot
- Added pipeline animation component ("Pacer AI Platform" section) between Mission and Team sections
- Updated pipeline text: "Revenue Data to Revenue Intelligence built for diligence"
- Updated mission section with new hierarchy from `01_Foundation/strategy/mission.md`
- Added partner headlines (Veach.AI — QoE, Inside Consulting — Strategic Purchasing, Charlie Mike — RevOps, Modern Revenue — Sales Comp)
- Added name/website/LinkedIn under each partner avatar
- Team page at 48,707 chars

**Rename: exit-readiness → transaction-readiness:**
- Renamed Foundation folder: `products/exit-readiness/` → `products/transaction-readiness/`
- Renamed spec file: `exit-readiness.md` → `transaction-readiness.md`
- Updated 103+ references across 36 files
- WordPress page 554 slug changed from `exit-readiness` to `transaction-readiness`
- All 9 HTML pages redeployed with updated nav links

**Foundation files created:**
- `01_Foundation/products/delivery_framework.md` — The Pacer Method (4D framework)
- `01_Foundation/products/AGENTS.md` — Products folder operating instructions
- `01_Foundation/products/_content_brief_template.md` — Template for expert voice content
- `01_Foundation/brand/voice_samples.md` — Voice calibration (GOOD vs BAD examples)
- `01_Foundation/strategy/mission.md` — Mission, pillars, tagline hierarchy
- `01_Foundation/team/team.md` — Canonical team and partner info
- `01_Foundation/products/arr-snowball/content_brief.md` — (template, needs Will's content)
- `01_Foundation/products/customer-data-cube/content_brief.md` — (template)
- `01_Foundation/products/fpa-transformation/content_brief.md` — (template)

**New files:**
- `04_GTM/website-PacerAI/website-development-dash.html` — Interactive development dashboard
- `04_GTM/website-PacerAI/docs/plan/product-enabled-services.md` — Site build plan with checkboxes
- `04_GTM/website-PacerAI/docs/design/team/team-page-v2.html` — Team page design (v2)
- `04_GTM/website-PacerAI/docs/design/AEO-Row-Text-and-Image.md` — Design spec
- `04_GTM/website-PacerAI/docs/design/Grid-of-Cards.md` — Design spec

**Backup:** `docs/review/pre-deploy-backup-366-20260405-1117.json` (and others)
