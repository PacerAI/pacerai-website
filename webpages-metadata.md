# Website Metadata Audit — getpacerai.com

Last audited: 2026-04-20

## Current Metadata Status

### Solution Pages

| ID | Page | URL | Yoast Title | Yoast Meta Desc | OG Image | Index |
|----|------|-----|-------------|-----------------|----------|-------|
| 25 | Homepage | `/` | Pacer AI — ARR Intelligence for PE-Backed SaaS | SET | YES | index |
| 372 | ARR Snowball | `/solutions/arr-snowball-board-reporting/` | ARR Snowball Board Reporting — Pacer AI | SET | YES | index |
| 373 | Customer Data Cube | `/solutions/customer-data-cube/` | Customer Data Cube — Pacer AI | SET | NO | index |
| 554 | Transaction Readiness | `/solutions/transaction-readiness/` | Exit Readiness - Get Pacer AI | **NOT SET** | NO | index |
| 651 | RevOps Transformation | `/solutions/revops-transformation-pkg/` | RevOps Transformation - Get Pacer AI | **NOT SET** | YES | index |
| 650 | GTM Transformation | `/solutions/gtm-transformation-pkg/` | GTM Transformation - Get Pacer AI | **NOT SET** | YES | index |
| 652 | FP&A Transformation | `/solutions/fpanda-transformation-pkg/` | FP&A Transformation - Get Pacer AI | **NOT SET** | YES | index |

### Platform & Team Pages

| ID | Page | URL | Yoast Title | Yoast Meta Desc | OG Image | Index |
|----|------|-----|-------------|-----------------|----------|-------|
| 371 | Platform Overview | `/platform/overview/` | Platform Overview — Pacer AI | SET | NO | index |
| 366 | Team | `/team/` | Company — Pacer AI | SET | YES | **noindex** |
| 374 | About | `/team/about/` | About — Pacer AI | SET | NO | index |
| 375 | Contact | `/team/contact/` | Contact — Pacer AI | SET | NO | index |

### Blog Pages

| ID | Page | URL | Yoast Title | Yoast Meta Desc | OG Image | Index |
|----|------|-----|-------------|-----------------|----------|-------|
| 230 | Blog Index | `/blog/` | Blog — Pacer AI \| ARR Intelligence & RevOps Insights | SET | NO | index |
| 358 | Why ARR Waterfall Models Matter | `/blog/why-arr-waterfall-models-matter-for-saas-growth/` | SET | SET | NO | index |
| 360 | Using AI to Enable RevOps | `/blog/using-ai-to-enable-revops-without-breaking-your-gtm/` | SET | SET | NO | index |
| 368 | Find Your Expansion Drivers | `/blog/arr-snowball-analysis-find-your-expansion-drivers/` | SET | SET | YES | index |
| 376 | Prevent Churn in High-Value Accounts | `/blog/prevent-churn-in-high-value-accounts-with-arr-snowball/` | SET | SET | NO | index |
| 378 | What Is an ARR Snowball | `/blog/what-is-an-arr-snowball-understanding-revenue-growth/` | SET | SET | YES | index |
| 441 | Why LLMs Can't Build ARR Snowballs | `/blog/why-llms-cant-build-your-arr-snowball-from-operational-data/` | SET | SET | NO | index |
| 491 | Build vs Hire Customer Data Cube | `/blog/build-customer-data-cube-in-house-or-hire/` | SET | **NOT SET** | NO | index |
| 591 | What Companies Build vs Boards Need | `/blog/what-most-companies-build-vs-what-boards-need/` | SET | **NOT SET** | NO | index |
| 781 | Board Quality ARR Snowballs | `/blog/board-quality-arr-snowballs/` | SET | **NOT SET** | YES | index |

### Redirect / Utility Pages

| ID | Page | URL | Status | Notes |
|----|------|-----|--------|-------|
| 362 | Platform (parent) | `/platform/` | noindex | Redirects to `/team/#pacer-ai-platform` |
| 364 | Solutions (parent) | `/solutions/` | noindex | Redirects to `/#solutions` |
| 111 | Pricing | `/pricing/` | index | Legacy page, not managed by repo |
| 134 | Login | `/login/` | noindex | Legacy page, not managed by repo |

---

## Issues Found

### CRITICAL: Broken OG Descriptions (Nav HTML leaking)

These pages have their OG description filled with raw navigation HTML instead of a real description. This is what social media previews and AI scrapers see:

| ID | Page | Issue |
|----|------|-------|
| 491 | Build vs Hire | og_description contains nav menu HTML |
| 591 | What Companies Build vs Boards Need | og_description contains nav menu HTML |
| 781 | Board Quality ARR Snowballs | og_description contains nav menu HTML |

**Fix:** Set Yoast meta description in WP Admin. Yoast uses meta desc as og_description when set.

### Missing Yoast Meta Descriptions (7 pages)

These pages have no Yoast meta description. Google will auto-generate one from page content (usually poorly).

| ID | Page | Recommended Meta Description |
|----|------|------------------------------|
| 554 | Transaction Readiness | Get diligence-ready in 4 quarters. Quality of Revenue, Quality of Earnings, Commercial and Technical Due Diligence for PE-backed SaaS companies at $50M-$1B ARR. |
| 651 | RevOps Transformation | Operationalize your data for weekly sales and RevOps cadences. Segmentation, territory design, pipeline analytics, and revenue motion alignment. |
| 650 | GTM Transformation | Territory planning, ICP scoring, and pipeline intelligence powered by an agent chain. Automated sales and marketing operations built on your customer data cube. |
| 652 | FP&A Transformation | Variance analysis, forecast modeling, and scenario planning powered by the unified data layer. Replaces spreadsheet-driven FP&A with automated financial intelligence. |
| 491 | Build vs Hire | Should you build a customer data cube in-house or hire a specialist? Compare timelines, costs, and outcomes for PE-backed SaaS companies. |
| 591 | What Companies Build vs Boards Need | Most SaaS companies build reporting that satisfies operators but fails the board. Learn what board-quality ARR reporting actually requires. |
| 781 | Board Quality ARR Snowballs | Understand your ARR growth drivers before your acquirers do. A guide to delivering M&A-grade ARR driver insights with ARR Snowball analysis. |

### Missing OG Images (11 pages)

OG images appear in social media shares (LinkedIn, Twitter) and some AI search results. Pages without one show a generic WordPress placeholder or nothing.

| ID | Page | Action |
|----|------|--------|
| 230 | Blog Index | Add branded blog OG image |
| 358 | Why ARR Waterfall Models Matter | Add post-specific or default blog OG image |
| 360 | Using AI to Enable RevOps | Add post-specific or default blog OG image |
| 371 | Platform Overview | Add platform diagram as OG image |
| 373 | Customer Data Cube | Add solution-specific OG image |
| 374 | About | Add team/founder photo as OG image |
| 376 | Prevent Churn | Add post-specific or default blog OG image |
| 441 | Why LLMs Can't Build ARR Snowballs | Add post-specific or default blog OG image |
| 491 | Build vs Hire | Add post-specific or default blog OG image |
| 554 | Transaction Readiness | Add solution-specific OG image |
| 591 | What Companies Build vs Boards Need | Add post-specific or default blog OG image |

**Recommended approach:** Create 3 default OG images (1200x630px):
1. **Solutions default** — branded with "Pacer AI | [Solution Name]" overlay
2. **Blog default** — branded with "Pacer AI Blog" overlay
3. **Company default** — branded with logo + tagline

### Inconsistent Yoast Titles

Some pages use "— Pacer AI" suffix, others use "- Get Pacer AI". Should be consistent.

| ID | Page | Current Title | Recommended Title |
|----|------|--------------|-------------------|
| 554 | Transaction Readiness | Exit Readiness - Get Pacer AI | Transaction Readiness — Pacer AI |
| 650 | GTM Transformation | GTM Transformation - Get Pacer AI | GTM Transformation — Pacer AI |
| 651 | RevOps Transformation | RevOps Transformation - Get Pacer AI | RevOps Transformation — Pacer AI |
| 652 | FP&A Transformation | FP&A Transformation - Get Pacer AI | FP&A Transformation — Pacer AI |
| 491 | Build vs Hire | Should I Build a Customer Data Cube In-House or Hire Someone? - Get Pacer AI | Build or Hire: Customer Data Cube — Pacer AI |
| 591 | What Companies Build vs Boards Need | What Most Companies Build vs. What Boards Actually Need - Get Pacer AI | What Companies Build vs. What Boards Need — Pacer AI |
| 781 | Board Quality ARR Snowballs | Board Quality ARR Snowballs: Understand Your ARR... - Get Pacer AI | Board Quality ARR Snowballs — Pacer AI |

**Standard format:** `[Page Title] — Pacer AI` (em dash, not hyphen)

### Team Page is noindex

ID 366 (`/team/`) has `robots: noindex`. This means Google won't index your team/company page. If intentional (because `/team/about/` is the real page), fine. If not, remove noindex in WP Admin → Yoast → Advanced → Allow search engines to show this page.

---

## SEO & AEO Improvements

### Already Implemented (April 2026)

- [x] JSON-LD `Organization` schema with `hasOfferCatalog` listing all 7 services (homepage)
- [x] JSON-LD `Service` schema on all 6 solution pages
- [x] JSON-LD `FAQPage` schema on Customer Data Cube, Transaction Readiness, ARR Snowball
- [x] JSON-LD `WebPage` schema on all solution pages
- [x] Page excerpts set for all 12 managed pages (meta description fallback)
- [x] Jetpack sitemap disabled, Yoast sitemap is sole source
- [x] Orphaned blog posts re-parented under `/blog/`
- [x] Empty parent pages redirect to relevant sections

### Recommended Next Steps

#### High Priority (SEO)

1. **Set missing Yoast meta descriptions** — 7 pages listed above. Must be done in WP Admin.
2. **Fix broken OG descriptions** — 3 blog posts have nav HTML leaking into og_description. Setting Yoast meta desc fixes this.
3. **Standardize Yoast titles** — Use `[Title] — Pacer AI` format consistently across all pages.
4. **Add OG images** — At minimum, create and set default OG images for solutions and blog posts.

#### Medium Priority (AEO — Answer Engine Optimization)

5. **Add FAQPage schema to remaining solution pages** — RevOps, GTM, FP&A Transformation pages lack FAQ schema. When these pages get full content (currently "Coming Soon"), add FAQ sections with JSON-LD.
6. **Add `HowTo` schema to Platform Overview** — The platform overview page explains a multi-step process (ingest → model → analyze → report). A HowTo schema would help AI engines understand the workflow.
7. **Add `Article` schema to blog posts** — Blog posts currently have no structured data. Adding Article schema with author, datePublished, and description improves AI citation.
8. **Add breadcrumb structured data** — Helps Google and AI engines understand the site hierarchy. Add `BreadcrumbList` schema to all non-homepage pages.

#### Lower Priority (Polish)

9. **Homepage slug** — Change from `no-title` to something meaningful (requires Will's review — affects permalink)
10. **Canonical URLs** — Verify all pages have correct canonical tags (Yoast handles this automatically, but verify for re-parented blog posts)
11. **Internal linking** — Solution pages should cross-link to related blog posts, and blog posts should link back to relevant solution pages
12. **Alt text audit** — Verify all images have descriptive alt text for accessibility and image search

---

## Structured Data Summary (Current State)

| Page | Organization | WebSite | WebPage | Service | FAQPage | Article | BreadcrumbList |
|------|:-----------:|:-------:|:-------:|:-------:|:-------:|:-------:|:--------------:|
| Homepage | YES | YES | YES | 7 (catalog) | — | — | — |
| ARR Snowball | — | — | YES | YES | — | — | — |
| Customer Data Cube | — | — | YES | YES | YES | — | — |
| Transaction Readiness | — | — | YES | YES | YES | — | — |
| RevOps Transformation | — | — | YES | YES | — | — | — |
| GTM Transformation | — | — | YES | YES | — | — | — |
| FP&A Transformation | — | — | YES | YES | — | — | — |
| Platform Overview | — | — | — | — | — | — | — |
| Blog posts | — | — | — | — | — | — | — |

**Target state:** All pages should have WebPage + BreadcrumbList. Solution pages should have Service + FAQPage. Blog posts should have Article.
