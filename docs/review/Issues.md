# Issues — Homepage Refresh v1

Identified during PLAN phase (2026-03-09). Must be addressed before or during DEPLOY.

---

## 1. Slug is `no-title`

- **Impact:** SEO — the page slug should ideally be `/` or a meaningful slug, not `no-title`
- **Action:** Flag for Will. Changing the slug would alter the permalink. Must be done in WP admin.
- **Status:** Pending human review

## 2. Yoast meta description is missing

- **Impact:** SEO — Yoast head includes the admin notice: "this page does not show a meta description because it does not have one."
- **PRD specifies:** "Pacer AI turns CRM, ERP, and HRIS data into board-ready ARR Snowball reports and AI agent intelligence. Built for Operating Partners and SaaS CFOs."
- **Action:** Set via MCP `wp_update_post_meta` with `_yoast_wpseo_metadesc` key.
- **Status:** RESOLVED (2026-03-10) — Meta descriptions set on all 18 published pages via MCP.

## 3. Page title is generic ("Home")

- **Impact:** SEO — current `<title>` renders as "Home - Get Pacer AI"
- **PRD specifies:** "Pacer AI — ARR Intelligence for PE-Backed SaaS"
- **Action:** Set via MCP `wp_update_post_meta` with `_yoast_wpseo_title` key.
- **Status:** RESOLVED (2026-03-10) — Title set to "Pacer AI — ARR Intelligence for PE-Backed SaaS" via MCP.

## 4. CTA says "Learn more" instead of "Request a Demo"

- **Impact:** Conversion — PRD requires "Request a Demo" as primary CTA
- **Action:** Will be fixed in BUILD phase when new design is applied.
- **Status:** Will be resolved in build

## 5. Current content is long-form prose (16,117 chars)

- **Impact:** The entire page content will be replaced by the approved design mockup.
- **Action:** Current content saved to `docs/old_content.md` for reference. Pre-deploy backup will also be created per runbook.
- **Status:** Archived

## 6. Featured image (media 433) rendering above page content

- **Impact:** TT4 theme renders the WordPress featured image above page content. The Pacer AI OG image (media ID 433) was set as featured image on all 18 pages, causing a large logo graphic to display above the nav on every page.
- **Action:** Removed featured images from all pages via REST API (`featured_media: 0`). Our pages use inline CSS for all visuals — no WordPress featured images needed.
- **Status:** RESOLVED (2026-03-10)
- **Note:** Do not set featured images on Pacer AI pages. The OG image for social sharing is handled by Yoast (`_yoast_wpseo_opengraph-image`) and does not require a featured image.

## 7. Inline `<script>` tags stripped by WordPress block parser

- **Impact:** Scripts for smooth-scroll, `data-scroll-to` click handlers, and mobile nav toggle silently disappeared from deployed pages. The Overview dropdown links and "See How It Works" hero CTA appeared broken because the click handlers never registered.
- **Discovered:** 2026-04-04 during nav rebuild — verified via `document.querySelectorAll('script')` in devtools returning 0 scripts containing `data-scroll-to`.
- **Action:** Replaced `<script>` helper with an `<img onerror>` attribute that assigns `window._s` on load. Inline event-handler attributes survive WordPress filtering where standalone `<script>` tags do not. Each `data-scroll-to` link also got an inline `onclick="_s(event,'name')"` handler.
- **Status:** RESOLVED (2026-04-04)
- **Note:** For any future interactive JS on these pages, prefer inline event handlers (`onclick`, `onerror`, `onload` on `<img>` or `<svg>`) over standalone `<script>` tags. See `src/homepage/index-build.html` line ~43 for the helper pattern.

## 8. Native smooth scroll blocked in WordPress runtime

- **Impact:** `window.scrollTo({behavior:'smooth'})` and `element.scrollIntoView({behavior:'smooth'})` both silently fail on the live page — scroll position does not change. Instant scroll (`window.scrollTo(0, y)`) works normally.
- **Root cause (hypothesized):** `#pacerai-homepage` has `overflow: hidden auto` which creates a scroll container, but `scrollHeight === clientHeight` so the wrapper isn't actually scrollable. The nearest scroll ancestor confusion causes `scrollIntoView` to no-op.
- **Action:** Helper function uses instant `window.scrollTo(0, y)` — still jumps cleanly to the target section but skips the animation. URL hash is updated via `history.pushState` so the navigation is shareable.
- **Status:** ACCEPTED (2026-04-04) — not worth deeper fix given WordPress constraints.
- **Follow-up:** If smooth scroll becomes important, options are (a) remove `overflow:hidden auto` from the wrapper, or (b) implement custom rAF-based animation. Both should be tested in the real WP environment, not via remote control (which itself throttles rAF).

## 9. Resources dropdown placeholder links pointed to `#` or `/`

- **Impact:** "ARR Snowball Guide" and "Templates & Frameworks" in the Resources dropdown were `href="#"` (homepage) or `href="/"` (sub-pages) — clicking them did nothing or sent users back to the homepage.
- **Action:** Rebuilt the Resources dropdown with 7 working links that deep-link into the blog via `?filter=<slug>` query params. Added URL query param auto-select to the blog's filter JS so the correct category activates on page load.
- **Status:** RESOLVED (2026-04-05)
- **See also:** `docs/plan/resources_data_model.md` for the full taxonomy and `docs/review/resources-nav-and-data-model-20260405.md` for the deploy review.

## 10. Empty blog filter categories with no UX affordance

- **Impact:** Clicking "Frameworks", "Model Templates", or "AI & Agents" in the blog category bar filtered to 0 posts with no explanation — user sees a blank grid.
- **Action:** Added a `<div id="blog-empty-state">` element that displays "Coming soon / New posts on the way" when a filter returns 0 cards (except for the "All Posts" filter which shouldn't show the empty state). Styled with teal eyebrow + links to the full blog and newsletter.
- **Status:** RESOLVED (2026-04-05)
- **Follow-up:** Seed Frameworks, Model Templates, and AI & Agents with 1–3 posts each. Priority: Frameworks first (most prominent in the Resources dropdown).

## 11. Homepage size budget tightening

- **Impact:** Homepage is now 67,983 chars (vs. ~67,546 before this session) — ~1,017 chars under the hard 69,000 WordPress limit. Any significant future additions risk truncation.
- **Action:** Preserved all functionality while keeping under the limit by (a) shortening label "Agents of Insight Newsletter" → "Newsletter", (b) dropping `rel="noopener"` from `target="_blank"` links (modern browsers add implicit `noopener` for `target="_blank"`), (c) removing the unused `.diy-challenges` CSS rule.
- **Status:** MONITORED (2026-04-05)
- **Follow-up:** Before adding new sections to the homepage, run a CSS audit for dead selectors from previously removed sections (investor-questions, DIY challenges, question-nav-grid). Those are probably still lurking in the minified CSS block.
