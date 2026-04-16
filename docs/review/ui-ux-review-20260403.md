# UI/UX Review — getpacerai.com Homepage
**Date:** April 3, 2026
**Reviewed by:** Claude Code with UI/UX Pro Max
**Live URL:** https://getpacerai.com/
**Source:** `src/homepage/index-build.html` (63,276 chars)
**Design Reference:** `docs/design/index-build-long_page_2026_04_03.html` (107,951 chars)
**Brand System:** `01_Foundation/brand/components/` (21 components)

---

## Executive Summary

The homepage deployed successfully with hero, 6 use-case sections, comparison, DIY challenges, "What is Pacer AI?", solutions grid, testimonials placeholder, and final CTA. However, **6 major sections from the design reference were cut** to stay under the 69K WordPress character limit. Additionally, several UI/UX improvements would strengthen the page's visual hierarchy, credibility signals, and conversion potential.

---

## Priority 1: CRITICAL Issues

### 1.1 Missing FAQ Section (Conversion Blocker)
**Impact:** HIGH — FAQ sections address buyer objections directly. For PE operators evaluating vendors, unanswered pricing and scope questions kill conversions.

**Missing content (from design reference):**
- What size companies do you work with?
- How long does the initial setup take?
- What systems do you connect to?
- How is this different from FP&A tools like Vena or Planful?
- What does pricing look like? (5 bps / 0.05% for 6-month, 4 bps / 0.04% for 12-month)
- Do you work with PE funds directly?

**Recommendation:** Add a compact FAQ accordion using `<details>/<summary>` elements (minimal CSS overhead, ~2-3K chars). Place between Solutions grid and Final CTA. The pricing question alone is worth the character cost — it pre-qualifies and accelerates the sales conversation.

**Character budget:** Can reclaim ~2-3K chars by minifying existing CSS further (removing remaining whitespace in style block).

### 1.2 Missing Testimonials (Trust Gap)
**Impact:** HIGH — The "Hero + Testimonials + CTA" landing pattern shows testimonials before CTA increases conversion. Currently, the site has zero social proof quotes from named customers.

**Design reference has 3 placeholder testimonials:**
- CFO, Series C B2B SaaS ($85M ARR)
- VP Finance, PE-Backed SaaS ($120M ARR)
- Operating Partner, Growth Equity (12 Portfolio Companies)

**Recommendation:** Even with placeholder attribution, add at least 1-2 testimonial quotes. Use the brand component `testimonial-carousel` pattern with glassmorphism card styling. A single testimonial card costs ~500 chars. Place after the Solutions grid.

### 1.3 Section Spacing Too Large
**Impact:** MEDIUM-HIGH — Between sections, there are ~80-120px gaps of pure navy space. On a 9,500px page, this creates a disconnected, sparse feel. Visitors may think the page ended.

**Recommendation:** Reduce inter-section padding from `padding: 100px 0` to `padding: 60px 0` (or `80px 0` for major transitions). Use subtle visual connectors between sections:
- A faint horizontal rule (1px solid rgba(39,137,154,0.15))
- Or alternate section backgrounds between `--navy` and `--navy-mid` to create visual rhythm

---

## Priority 2: HIGH Impact Improvements

### 2.1 Add `prefers-reduced-motion` Support
**Impact:** Accessibility compliance — KPI counter animations and smooth scrolling should respect user motion preferences.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```

Cost: ~150 chars. Critical for WCAG AA compliance.

### 2.2 Missing Solution Detail Sections
**Impact:** HIGH for SEO/AEO — The design reference includes 4 dedicated solution sections that would each be standalone AEO targets:
- Customer Data Cube (Foundation)
- ARR Snowball Reporting Package (Reporting)
- Transaction-Ready Package (Transaction)
- GTM/RevOps Maturity Model (Operations)

**Recommendation:** These won't fit in the 69K homepage. Instead:
- Link each Solutions grid card to its dedicated page (`/solutions/customer-data-cube/`, `/solutions/arr-snowball-board-reporting/`)
- Add a brief "Learn More" link on each card pointing to the subpage
- Build the GTM Maturity Model and Transaction Ready as new subpages (P2 priority from site tree)

### 2.3 Logo Strip Visibility
**Impact:** MEDIUM — The logo strip ("Trusted by revenue teams at...") with Brandwatch, Fortis, Platinum Equity, Semrush, Summit Partners is a key credibility signal. Ensure it renders visibly on all viewports.

**Recommendation:** Add a subtle top border or background tint (`background: rgba(15,25,41,0.4)`) to the logo strip section to visually separate it from the hero. Ensure Platinum Equity logo renders at 110px height as specified.

### 2.4 KPI Counter Animation Visibility
**Impact:** MEDIUM — The animated counters ($2B+, 40+, "Days", "Big 4") should trigger on scroll into view, not on page load. If they animate before the user scrolls to them, the impact is lost.

**Recommendation:** Verify the IntersectionObserver-based trigger fires correctly. The counters should animate from 0 to target value over ~2 seconds when scrolled into view.

---

## Priority 3: MEDIUM Impact Improvements

### 3.1 Glassmorphism Consistency
**Brand standard:** `rgba(15,25,41,0.6)` + `blur(16px)` + `border: 1px solid rgba(39,137,154,0.15)`

**Current issue:** Some cards use glass effects while others use flat `--navy-mid` backgrounds. The use-case question cards, solution cards, and expert card should all use consistent glassmorphism.

**Recommendation:** Audit all card elements and ensure they use the canonical glass properties from `01_Foundation/brand/components/`. Add hover state: `border-color: rgba(39,137,154,0.35)` + enhanced shadow.

### 3.2 CTA Button Hierarchy
**Brand standard:** Primary CTA = teal bg (#27899A), Secondary = transparent with white border.

**Recommendation:** Ensure the "Request Demo" nav button and "Get a Sample Board Package" hero CTA use the brand `btn-lg` style with `box-shadow: 0 4px 24px rgba(39,137,154,0.30)`. The secondary "See How It Works" should use `btn-outline-lg`.

### 3.3 Heading Typography Scale
**Brand standard:** Display 64-88px (Light), H1 40-56px (Regular), H2 28-36px (Medium) — all Cormorant Garamond.

**Recommendation:** Verify section headings follow the type scale. From screenshots, the headings render correctly in Cormorant Garamond. Check that italic text renders in teal (#27899A) per brand guidelines (e.g., "transaction-ready" in Solutions heading).

### 3.4 Mobile Responsive Audit
**Breakpoints:** 768px (mobile), 1024px (tablet)

**Recommendation:** Test the following on mobile:
- Hero headline should scale down to ~36px on mobile
- Use-case question cards should stack to 2-column on tablet, 1-column on mobile
- Solution cards: 3x2 grid on desktop, 2-column on tablet, 1-column on mobile
- Nav hamburger menu should work and close on link click
- Footer grid should stack vertically on mobile

### 3.5 Scroll Parallax Background
**Available component:** `01_Foundation/brand/components/scroll-parallax-bg*.html`

**Recommendation:** Consider adding the subtle animated orb background to the hero section for visual depth. The parallax component uses navy/teal gradient orbs that complement the brand. Cost: ~1-2K chars for the CSS/SVG. Would differentiate from the current flat navy background.

---

## Priority 4: NICE-TO-HAVE Improvements

### 4.1 AEO Snippet Formatting
Each use-case section has an AEO-optimized snippet paragraph. Ensure these are styled distinctly (e.g., left teal border, slightly different background) so they stand out as authoritative definitions for search engines.

### 4.2 Cross-Sell/Upsell Section
The design reference includes a 7th use-case section (cross-sell-upsell) that was cut. If character budget allows, this would complete the use-case coverage.

### 4.3 Pipeline Animation Component
**Available component:** `01_Foundation/brand/components/pipeline-animation.html`

The "What is Pacer AI?" section references a data pipeline: CRM > Billing > ERP > HRIS > [Pacer AI / Microsoft Fabric] > Power BI, Excel, Claude AI. The pipeline animation component would visualize this flow effectively. Consider adding to the "What is Pacer AI?" section or as a standalone component below it.

### 4.4 Exit Readiness Scorecard Component
**Available component:** `01_Foundation/brand/components/exit-readiness-scorecard.html`

Could be used as an interactive element in the Solutions section to demonstrate the Transaction Readiness offering.

---

## Content Gap Summary (Live vs Design)

| Section | Live | Design | Priority to Add |
|---------|------|--------|-----------------|
| Hero | Yes | Yes | -- |
| Use Case Questions (6 cards) | Yes | Yes | -- |
| Use Case Details (6 sections) | Yes | Yes (+1 extra) | P3 |
| Comparison | Yes | Yes | -- |
| DIY Challenges | Yes | Yes | -- |
| What is Pacer AI? | Yes | Yes | -- |
| Solutions Grid (6 cards) | Yes | Yes | -- |
| Customer Data Cube Detail | No | Yes | P2 (subpage) |
| ARR Snowball Detail | No | Yes | P2 (subpage) |
| Transaction Ready Detail | No | Yes | P2 (subpage) |
| GTM Maturity Model | No | Yes | P2 (subpage) |
| **Testimonials** | **No** | **Yes** | **P1** |
| **FAQ** | **No** | **Yes** | **P1** |
| Final CTA | Yes | Yes | -- |

---

## Recommended Next Steps (Prioritized)

1. **Add FAQ accordion** (~2-3K chars) — highest conversion impact
2. **Add 1-2 testimonial cards** (~1K chars) — social proof before final CTA
3. **Reduce section spacing** — tighten padding from 100px to 60-80px
4. **Add `prefers-reduced-motion`** — accessibility compliance
5. **Build Transaction Ready and GTM Maturity as subpages** — P2 site expansion
6. **Mobile responsive audit** — verify all breakpoints
7. **Apply glassmorphism consistently** across all card elements
8. **Consider scroll parallax background** for hero visual depth
