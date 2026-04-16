# Product Requirements Document — Homepage v3 (Long Page)

**Version:** 3.0
**Date:** April 3, 2026
**Status:** In Progress — Updating from March version incrementally
**Design Source:** `docs/design/index-build-long_page_2026_04_03.html`

---

## 0. WordPress.com Deployment Constraints (CRITICAL)

These constraints were discovered during the April 3, 2026 deployment attempt. Any implementation MUST follow these rules.

| Constraint | Detail | Impact |
|---|---|---|
| **Content size limit** | **68,000 characters max** per `<!-- wp:html -->` block (hard WordPress.com limit) | CSS must be minified. See Section 0.1 for per-page budget. Two wp:html blocks can be used if needed. |
| **`<section>` tags** | WordPress.com strips `<section>` elements from rendered output | Use `<section>` tags (they work in the March version) — do NOT replace with `<div>`. The March version's 8 section tags render fine. |
| **`id=` attributes** | WordPress.com strips most `id=` attributes except on the outermost wrapper | Only `id="pacerai-homepage"` and `id="overview"` survived. Anchor navigation (`#arr-growth`, `#faq`, etc.) will NOT work. Use JavaScript-based smooth scrolling with `data-` attributes or class-based targeting instead. |
| **HTML comments** | `<!-- ... -->` comments inside `wp:html` may confuse the block parser | Remove all HTML comments before deploying. |
| **Images** | Local `img/` paths don't work on WordPress | All images must be uploaded to WordPress media library first, then referenced by full URL (`https://getpacerai.com/wp-content/uploads/...`). |
| **External CSS `<link>`** | WordPress.com moves `<link>` tags from head into body content, may not load | Keep CSS inline in `<style>` block. Minify aggressively to stay under size limit. |
| **Google Fonts** | Loaded by WordPress theme — no `<link>` tags needed in page HTML | Do not add Google Fonts link tags. |

### Size Budget

| Component | March (working) | v3 Target | Notes |
|---|---|---|---|
| CSS (minified) | ~28K | ~30K max | Minify: remove comments, collapse whitespace, shorten where possible |
| HTML body | ~38K | ~35K max | Remove comments, minimal indentation |
| JavaScript | ~2K | ~2K | Counter animation + mobile nav |
| **Total** | **~68K** | **~67K max** | Leave 2K buffer under the ~69K limit |

## 0.1 Per-Page Character Budget (as of 2026-04-06)

> ⚠️ **CRITICAL:** Homepage has only **146 characters of headroom**. It is effectively FULL. Any additions must remove equivalent content first.

### Character usage by page

| Page | WP ID | Source file | Total | Headroom | Status |
|---|---|---|---|---|---|
| **Home** | 25 | `src/homepage/index-build.html` | **67,854** | **146** | 🔴 FULL |
| Transaction Readiness | 554 | `src/solutions/transaction-readiness.html` | 54,516 | 13,484 | 🟡 TIGHT |
| Team | 366 | `src/team/team-page.html` | 48,707 | 19,293 | 🟡 TIGHT |
| Customer Data Cube | 373 | `src/solutions/customer-data-cube.html` | 45,260 | 22,740 | 🟡 TIGHT |
| ARR Snowball | 372 | `src/solutions/arr-snowball.html` | 43,272 | 24,728 | 🟡 TIGHT |
| Platform Overview | 371 | `src/platform/overview.html` | 39,159 | 28,841 | 🟢 OK |
| About | 374 | `src/team/about.html` | 37,110 | 30,890 | 🟢 OK |
| Blog Index | 230 | `src/blog/index-build.html` | 36,715 | 31,285 | 🟢 OK |
| Build vs Hire Blog | 491 | `src/blog/posts/491-build.html` | 34,903 | 33,097 | 🟢 OK |
| Contact | 375 | `src/team/contact.html` | 30,841 | 37,159 | 🟢 OK |

**Totals:** ~438,337 chars across 10 pages.

Status legend: 🔴 FULL (<500 headroom) · 🟡 TIGHT (>40,000) · 🟢 OK (<40,000)

### Component breakdown (snapshot, homepage + tight pages)

| Page | CSS | JS | HTML body |
|---|---|---|---|
| Home | 36,860 (54%) | 2,841 (4%) | 29,003 (42%) |
| Customer Data Cube | 21,555 (47%) | 2,498 (5%) | 21,873 (48%) |
| ARR Snowball | 22,312 (51%) | 2,220 (5%) | 19,406 (44%) |

### Duplication across pages (~58,500 wasted chars)

- **Shared `<nav>`** (6 files): ~6,485 chars each → **38,910 chars** duplicated
- **Shared `<footer>`** (all 8 files): ~2,448 chars each → **19,584 chars** duplicated
- Every file repeats identical `@media` breakpoints and reset CSS (~5–10K additional dedup opportunity if externalized)

### Prioritization rules for Claude when adding content

When Claude is asked to add or modify content on any page, follow these rules in order:

1. **Check the target file's current total** (`wc -c <file>`) before adding anything. If adding N chars would push total over **67,000** (1K safety buffer), STOP and ask Will whether to (a) remove existing content, (b) minify CSS, or (c) split into a second `<!-- wp:html -->` block.
2. **Never exceed 68,000 chars.** This is a hard WordPress.com limit — content above that gets silently truncated on deploy.
3. **Prefer HTML body > CSS > JS** for new content. Content that serves AEO/SEO (copy, snippets, structured data) has higher value per character than new CSS animations or decorative styles.
4. **Reuse existing CSS classes.** Do not introduce new utility classes if an existing one works. Every new selector costs ~40–80 chars including the rule body.
5. **Minify as you add.** New inline styles should be written in minified form (no whitespace, short property names where possible).
6. **For new sections on tight pages, remove or condense an old one.** If the page is over 60,000 chars, net-zero additions are the default.
7. **Homepage is full — read-only for additions.** Until the −713 deficit is resolved, the homepage should only receive edits that net negative (remove more than they add).
8. **Avoid HTML comments.** WordPress's block parser may choke on them, and they cost chars. Strip all `<!-- ... -->` before deploy.
9. **Check for duplication.** Before adding CSS, grep the file to see if a similar rule already exists. Before adding a section, check if similar copy already exists elsewhere.

### Immediate action items (homepage recovery)

To get the homepage back under budget (need to remove ≥713 chars, ideally 1,500+ to restore a buffer):

- **Minify the inline `<style>` block** (36,860 → ~30,000 est.) — largest single lever
- **Remove HTML comments** in the body (search `<!--`, delete)
- **Collapse duplicate `@media` queries** into shared breakpoints
- **Consolidate similar CSS rules** (e.g., merge shared button properties)
- **Last resort:** move nav/footer CSS to a separate `<!-- wp:html -->` block (WordPress accepts multiple blocks per page)

---

### Anchor Navigation Workaround

Since `id=` attributes are stripped, implement scroll-to navigation using:
```html
<!-- In nav links, use data attributes -->
<a href="#" data-scroll-to="arr-growth">Where is Revenue Accelerating?</a>

<!-- On target sections, use data attributes -->
<section class="section" data-section="arr-growth">
```
```javascript
// JS to handle smooth scrolling via data attributes
document.querySelectorAll('[data-scroll-to]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(`[data-section="${link.dataset.scrollTo}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
```

---

## 1. Navigation

### Header Menu (Desktop)
```
[Logo: Pacer AI]   Overview ▾   Solutions ▾   Resources ▾   Team ▾   [Log In]  [Request Demo]
```

| Nav Item | Type | Dropdown Contents |
|---|---|---|
| **Overview** | In-page anchors | Use Cases, About, Solutions |
| **Solutions** | Mix of WP pages + in-page | Customer Data Cube (`/solutions/customer-data-cube/`), ARR Snowball Reporting (`/solutions/arr-snowball-board-reporting/`), Transaction Readiness (in-page), RevOps Transformation (in-page), GTM Transformation (in-page), FP&A Transformation (in-page) |
| **Resources** | WP pages + blog filters + external | Blog (`/blog/`), ARR Snowballs (`/blog/?filter=arr-snowballs`), Frameworks (`/blog/?filter=frameworks`), Model Templates (`/blog/?filter=model-templates`), Newsletter (→ Substack, new tab), YouTube (→ `@PacerAI`, new tab), For RevOps (`/blog/?filter=revops`). *AI Prompt & Skill Library defined in `docs/plan/resources_data_model.md` but deferred from WP nav pending Phase 2.* |
| **Team** | WP pages + in-page | Purpose & Mission (in-page), Team (`/team/`), Partners (in-page), Agent Team (`/team/`) |

### Header Menu (Mobile)
```
[Logo: Pacer AI]   [Request Demo]   [☰ Hamburger]
```

### Footer Structure
```
Brand (logo + tagline)  |  Use Cases           |  Solutions              |  Team              |  Connect
                        |  Revenue Accel.      |  Customer Data Cube    |  Purpose & Mission |  LinkedIn
                        |  Expansion Drivers   |  ARR Snowball          |  Team              |  Schedule a Call
                        |  Cohort Intelligence |  Transaction Readiness |  Partners          |  Blog
                        |  Gross Retention     |  RevOps Transformation |  Contact           |  Log In
                        |  Net Retention       |  GTM Transformation    |
                        |  Whitespace          |  FP&A Transformation   |

Bottom bar: © 2026 Predictive Analytics Partners LLC · getpacerai.com  |  Privacy · Terms · LinkedIn
```

Footer grid: `grid-template-columns: 260px 1fr 1fr 1fr 1fr;`

---

## 2. Hero Section

**Eyebrow:** ARR Intelligence · Built for PE-Backed B2B SaaS
**Headline:** M&A Grade, Customer Data Cubes and ARR Snowball Board Reporting.
**Proof Points:**
- Primary: "30 minutes, not 30 hours."
- Secondary: "Updated daily for the pace of operations."

**Subheadline:** M&A-grade ARR clarity for CFOs, CROs, and Operating Partners — built by ex-PwC M&A advisors and AI engineers at a fraction of Big 4 cost.

**CTAs:**
- Primary: "Get a Sample Board Package →" → `https://calendly.com/pacerai`
- Secondary: "See How It Works" → scrolls to Use Cases

**Logo Strip:** "Trusted by revenue teams and investors at"
- Brandwatch, Fortis Life Science, Platinum Equity (larger: `height:110px !important`), Semrush, Summit Partners

**KPI Proof Points (animated counters):**
- $2B+ ARR analyzed across portfolio companies
- 40+ Customer data cubes built from raw source data
- "Days" (typewriter) To board-ready — not months
- "Big 4" (typewriter) Financial Due Diligence methodology (PwC TMT)

---

## 3. Use Cases Section

**Eyebrow:** Use Cases
**Headline:** Built for investors' questions. *Defensible in diligence.*
**Description:** The questions boards and buyers ask in every diligence process, board meeting, and fundraise — answered continuously.

**6 Question Cards (clickable, scroll to corresponding section):**

| # | Question | Eyebrow | Image |
|---|---|---|---|
| 1 | Where is Revenue accelerating? | Helping CFOs find | ARR Waterfall cross-sell growth |
| 2 | What is driving our expansion ARR? | Helping CROs understand | Market Analysis expansion drivers |
| 3 | Which cohort is our primary business driver? | Cohort Intelligence | Cohort by market by account size |
| 4 | How can we improve our Gross Retention? | Retention Drivers | Vintage GRR from first purchase |
| 5 | How can we improve our Net Retention? | Net Retention | Vintage NRR from first purchase |
| 6 | How much whitespace opportunity is there? | Whitespace Opportunity | Expansion whitespace by market |

Each section has:
- Eyebrow + H2 heading
- AEO-optimized snippet paragraph (featured snippet target)
- Body copy paragraph
- Product image (uploaded to WordPress media library)

### Images (WordPress URLs)

| Image | WordPress URL |
|---|---|
| ARR Waterfall cross-sell growth | `https://getpacerai.com/wp-content/uploads/2026/04/arr-waterfall-cross-sell-growth.png` |
| Market Analysis expansion drivers | `https://getpacerai.com/wp-content/uploads/2026/04/market-analysis-expansion-drivers.png` |
| Cohort by market/account size | `https://getpacerai.com/wp-content/uploads/2026/04/cohort-market-acct-size.png` |
| Vintage GRR from first purchase | `https://getpacerai.com/wp-content/uploads/2026/04/gross-retention-vintage.png` |
| Vintage NRR from first purchase | `https://getpacerai.com/wp-content/uploads/2026/04/net-retention-vintage.png` |
| Expansion whitespace by market | `https://getpacerai.com/wp-content/uploads/2026/04/expansion-whitespace-by-market.png` |

---

## 4. Comparison Section

**Eyebrow:** The Real Challenge
**Headline:** What most companies build vs. what boards *actually need*

Two-column comparison grid:
- **Left (old-way, red accent):** 5 items with ✕ icons and strikethrough text
- **Right (new-way, green accent):** 5 items with ✓ icons

**Pull Quote:** "The biggest challenges are not technical. They are knowing the reporting and operating implications of every decision you make in the model." — CFO, $100M B2B SaaS

---

## 5. DIY Challenges Section

**Eyebrow:** Challenges
**Headline:** What to expect if you try *a DIY approach*

6-card grid (2×3):
1. **Time** — 6+ months just to build the data cube
2. **Team Size** — 6+ members, including rare ARR expertise
3. **Output** — a table is not a board report
4. **Non-Operational** — insights never impact sales
5. **Deep Expertise** — hierarchy, architecture, presentation
6. **New lens** — a new way of seeing your business, with no guide

---

## 6. What is Pacer AI Section

**Eyebrow:** The Firm
**Headline:** What is Pacer AI?

**Core Definition (AEO snippet):** "Pacer AI is an AI-native consulting firm built on a proprietary data transformation platform. We take operational data from CRM, billing, and ERP systems and make it AI-ready — for users, agents, dashboards, and diligence. Founded by ex-PwC M&A advisors, we combine transaction experience with enterprise data engineering and AI agents to make SaaS companies always ready for boards, buyers, and investors."

**Pipeline Visual:** CRM → Billing → ERP → HRIS → [Pacer AI / Microsoft Fabric] → Power BI, Excel, Claude AI

**Expert Card:**
- **Header:** Built by Will Sullivan, Ex-PwC, West Point graduate.
- **M&A Credibility:** Over $25B+ in SaaS M&A transactions while in PwC's TMT Financial Due Diligence and Analytics practice. Built and defended sell-side diligence and conducted buy-side for some of the largest PE funds.
- **Track Record:** 40+ customer data cubes built for advanced GTM sales planning, ARR forecasting, and operationalized for weekly Sales & RevOps cadences.
- **Technology:** Proprietary data AI intelligence platform built on Microsoft Fabric, the only Excel-native data warehouse connector, to leverage AI-ready data in Excel with Claude and our trained Analyst Agent.

---

## 7. Solutions Grid

**Eyebrow:** Solutions
**Headline:** Solutions to help SaaS companies operate *transaction-ready*

6-card grid (3×2):

| Row | Card 1 | Card 2 | Card 3 |
|---|---|---|---|
| **Top** | M&A Grade, Customer Data Cube (Foundation) | ARR Snowball Reporting & Dashboard Package (Reporting) | Transaction Readiness / QoR, QoE, CDD, TDD (Transaction) |
| **Bottom** | RevOps Transformation (Operations) | GTM Transformation (Growth) | FP&A Transformation (Finance) |

---

## 8. Detailed Solution Sections

### Customer Data Cube
- What You Get (5 checkmarks)
- Product image: customer-product-data-cube.png

### ARR Snowball Reporting Package
- 3 steps: Build Data Cube → Build Dashboards → Stream to Excel + AI
- Service pills: Platform · Dashboards · Advisory · Ongoing

### Transaction-Ready Package
- 3 components: Quality of Revenue, Quality of Earnings (Veach.Co), Tech Due Diligence

### RevOps / Accelerating Revenue Maturity
- 5-phase maturity ladder: Instinct Led → Quota Led → Market Led → Motion Led → Revenue Motion Led

---

## 9. Testimonials

3 rotating testimonials (carousel):
1. CFO, Series C B2B SaaS · $85M ARR
2. VP Finance, PE-Backed SaaS · $120M ARR
3. Operating Partner, Growth Equity · 12 Portfolio Companies

**Note:** These are placeholder testimonials. Replace with real quotes when available.

---

## 10. FAQ Section

6 questions:
1. What size companies do you work with?
2. How long does the initial setup take?
3. What systems do you connect to?
4. How is this different from FP&A tools?
5. What does pricing look like? (5 bps / 0.05% for 6-month, 4 bps / 0.04% for 12-month)
6. Do you work with PE funds directly?

---

## 11. Final CTA

**Headline:** Stop preparing for diligence. Be *ready* for it.
**Body:** Schedule a 30-minute conversation. We'll show you what M&A-grade ARR reporting looks like with your data.
**CTAs:** Schedule a Conversation → | Talk to a RevOps Expert

---

## 12. SEO / AEO Requirements

| Field | Value |
|---|---|
| Page Title | Pacer AI — ARR Intelligence for PE-Backed SaaS |
| Meta Description | Pacer AI turns CRM, ERP, and HRIS data into board-ready ARR Snowball reports and AI agent intelligence. Built for Operating Partners and SaaS CFOs. |
| Primary Keyword | ARR Snowball reporting |
| Secondary Keywords | PE portfolio reporting, SaaS board reporting, customer data cube, M&A due diligence |
| Schema Type | Organization (JSON-LD in page) |

Each Use Case section's AEO snippet targets a featured-snippet question.

---

## 13. Technical Requirements

- **CMS:** WordPress.com hosted, Twenty Twenty-Four theme
- **Deploy:** WordPress REST API (Python `requests`) — see `docs/deploy/runbook.md`
- **Content format:** Single `<!-- wp:html -->` block, inline CSS, <69K chars total
- **Fonts:** DM Sans (body) + Cormorant Garamond (headings) — loaded by WordPress
- **JavaScript:** Vanilla JS only — counter animation, typewriter, mobile nav, smooth scroll
- **Images:** Hosted on `getpacerai.com/wp-content/uploads/`
- **Mobile responsive:** Breakpoints at 768px and 1024px
- **No `id=` attributes** on inner elements (WordPress.com strips them)
- **Anchor nav:** Use `data-section` attributes + JS smooth scroll
- **Lighthouse targets:** Performance >= 85, SEO >= 90, Accessibility >= 90

---

## 14. Implementation Plan

### Approach: Incremental update from working March version

The March version (`docs/design/index-build-2026-march.html`) is the last known working deployment at ~68K chars. Update it incrementally, testing each change against WordPress.com's sanitizer.

### Phase 1: Core Content Updates (stay under 69K)
1. Update hero text (headline, subheadline, proof points)
2. Update logo strip (text + Platinum Equity sizing)
3. Replace existing use case sections with new 6-question structure
4. Replace images with WordPress-hosted URLs
5. Update "What is Pacer AI" section text
6. Update FAQ pricing answer
7. **Test deploy** — verify all content renders

### Phase 2: Add New Sections (may require CSS optimization)
1. Add Comparison section
2. Add DIY Challenges section
3. Update Solutions grid (6 cards instead of 4)
4. Update expert card (3-category proof structure)
5. Minify CSS to stay under 69K
6. **Test deploy** — verify size is under limit

### Phase 3: Nav & Footer
1. Update nav: Overview | Solutions | Resources | Team
2. Update footer: Use Cases | Solutions | Team | Connect
3. Implement `data-section` based anchor navigation (replace `id=` attributes)
4. Update all other page files with new nav/footer
5. **Deploy all pages**

### Phase 4: Blog Post
1. Write AEO blog post: "Should I Build a Customer Data Cube In-House or Hire Someone?"
2. Deploy to WordPress

### Verification
- All pages return HTTP 200
- Visual check on desktop and mobile
- All images render
- Nav dropdowns work
- Anchor scrolling works
- KPI counters animate
- Log to `docs/document/changelog.md`

---

## 15. File Registry

| File | Purpose |
|---|---|
| `src/homepage/index-build.html` | **Production** — deployed to WordPress page ID 25 |
| `src/homepage/homepage-v2.css` | External CSS (on GitHub, served via jsdelivr CDN if needed) |
| `docs/design/index-build-2026-march.html` | Archive: March version (last working deployment) |
| `docs/design/index-build_long_page_2026-march-GPTs-strategy.html` | Archive: Modified March version |
| `docs/design/index-build-long_page_2026_04_03.html` | Archive: Full v2 design (reference for all content) |
| `docs/design/2026-04-03-website-update.md` | Deployment plan from April 3 session |
