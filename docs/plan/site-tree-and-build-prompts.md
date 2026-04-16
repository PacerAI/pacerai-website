# Full Site Tree & Build Prompts

**Last updated:** 2026-03-09

This document maps every page planned for getpacerai.com and provides Claude Code prompts to build each one.

---

## Current State (4 pages, 5 blog posts)



---

## Product Enables Service Planned Site Tree — April 2026

**Last updated:** 2026-04-06
**Canonical nav source:** `src/nav-headers.html`

```
getpacerai.com/
├── /                    ← LIVE (Page 25)
├── /solutions/
├── /resources/
├── /team/
├── /login/              ← LIVE (Page 134) — redirect to app
└── (everything below is the full tree)
```

```
getpacerai.com/
│
├── / (Homepage aka Overview)                                ✅ LIVE (Page 25)
│
├── /solutions/
│   ├── /solutions/customer-data-cube/                       ✅ LIVE (Page 373)
│   ├── /solutions/arr-snowball-board-reporting/              ✅ LIVE (Page 372)
│   ├── /solutions/transaction-readiness/                           ✅ LIVE (Page 554) — Transaction Readiness
│   ├── /solutions/revops-transformation/                    🔲 PLANNED
│   ├── /solutions/gtm-transformation/                       🔲 PLANNED
│   └── /solutions/fpa-transformation/                       🔲 PLANNED
│
├── /resources/
│   ├── /blog/                                               ✅ LIVE (Page 230, 6 posts)
│   │   └── (filter deep-links: ?filter=arr-snowballs|frameworks|model-templates|revops)
│   ├── /resources/arr-snowball-guide/                       🔲 PLANNED (gated PDF)
│   ├── /resources/frameworks/                               🔲 PLANNED (gated downloads)
│   ├── /resources/model-templates/                          🔲 PLANNED (gated downloads)
│   ├── /resources/for-revops/                               🔲 PLANNED
│   ├── /resources/newsletter/                               🔲 PLANNED → agentsofinsight.substack.com
│   └── /resources/youtube/                                  🔲 PLANNED → youtube.com/@PacerAI
│
├── /prompt-library/                                         🔲 PLANNED (source: 04_GTM/prompt-library/index.html)
│
├── /team/                                                   (source: docs/design/team/team-page-v2.html)
│   ├── /team/about/                                         ✅ LIVE (Page 374)
│   ├── /team/contact/                                       ✅ LIVE (Page 375)
│   ├── /team/mission/                                       🔲 PLANNED
│   ├── /team/partners/                                      🔲 PLANNED
│   └── /team/ai-agents/                                     🔲 PLANNED
│
└── /login/                                                  ✅ LIVE (Page 134) — redirect to app
```

### Nav Dropdown Structure (from `src/nav-headers.html`)

| Nav Item | Type | Dropdown Contents |
|---|---|---|
| **Overview** | Single dropdown | Use Cases (`/#use-cases`), Solutions overview (`/#solutions`), Team overview (`/team/about/`) |
| **Solutions** | Mega dropdown (2 columns) | **Transaction Solutions:** Customer Data Cube, ARR Snowball Reporting, Transaction Readiness (Exit Readiness page). **Transformation Solutions:** RevOps, GTM, FP&A Transformation |
| **Resources** | Single dropdown (7 items) | Blog, ARR Snowballs, Frameworks, Model Templates (blog filter links), Newsletter (Substack), YouTube, For RevOps |
| **Team** | Single dropdown | About the Team, Contact, Partners, Agent Team |




# Previous version 2026 March before pivot in April to Product-Enabled Services
## Enterprise Product Planned Site Tree
```

```
getpacerai.com/
├── /                    ← LIVE (Page 25)
├── /pricing/            ← LIVE (Page 111) — needs refresh
├── /login/              ← LIVE (Page 134) — redirect to app
├── /blog/               ← LIVE (Page 230) — 5 posts
└── (everything below is PLANNED)
```

getpacerai.com/
│
├── / (Homepage)                                    ✅ LIVE
│
├── /platform/
│   ├── /platform/overview/                         🔲 BUILD
│   ├── /platform/data-ingestion/                   🔲 BUILD
│   ├── /platform/microsoft-fabric/                 🔲 BUILD
│   ├── /platform/power-bi/                         🔲 BUILD
│   ├── /platform/ai-agents/                        🔲 BUILD
│   ├── /platform/excel-copilot/                    🔲 BUILD
│   ├── /platform/security/                         🔲 BUILD
│   └── /platform/integrations/                     🔲 BUILD
│
├── /solutions/
│   ├── /solutions/arr-snowball-board-reporting/     🔲 BUILD (Priority 1)
│   ├── /solutions/customer-data-cube/              🔲 BUILD (Priority 1)
│   ├── /solutions/virtual-data-room/               🔲 BUILD (Priority 2)
│   ├── /solutions/transaction-readiness/                  🔲 BUILD (Priority 2)
│   ├── /solutions/expansion-enablement/            🔲 BUILD
│   ├── /solutions/whitespace-visibility/           🔲 BUILD
│   ├── /solutions/bottoms-up-forecasting/          🔲 BUILD
│   ├── /solutions/cohort-sales-planning/           🔲 BUILD
│   ├── /solutions/investor-diligence/              🔲 BUILD
│   ├── /solutions/mbr-automation/                  🔲 BUILD
│   └── /solutions/gtm-analytics/                   🔲 BUILD
│
├── /industry/
│   ├── /industry/b2b-saas/                         🔲 BUILD
│   ├── /industry/pe-backed-saas/                   🔲 BUILD
│   └── /industry/pre-ipo-saas/                     🔲 BUILD
│
├── /compare/
│   ├── /compare/vs-manual-excel/                   🔲 BUILD
│   ├── /compare/vs-mosaic-tech/                    🔲 BUILD
│   ├── /compare/vs-vena-solutions/                 🔲 BUILD
│   ├── /compare/vs-pigment/                        🔲 BUILD
│   ├── /compare/vs-causal/                         🔲 BUILD
│   └── /compare/vs-cube/                           🔲 BUILD
│
├── /resources/
│   ├── /blog/                                      ✅ LIVE (5 posts)
│   ├── /resources/arr-snowball-guide/              🔲 BUILD (gated PDF)
│   ├── /resources/templates/                       🔲 BUILD (gated downloads)
│   ├── /resources/documentation/                   🔲 BUILD
│   └── /resources/webinars/                        🔲 BUILD
│
├── /partners/                                      🔲 BUILD
├── /case-studies/                                  🔲 BUILD
│   ├── /case-studies/[client-1]/                   🔲 BUILD (when available)
│   └── /case-studies/[client-2]/                   🔲 BUILD (when available)
│
├── /company/
│   ├── /company/about/                             🔲 BUILD
│   ├── /company/founders-story/                    🔲 BUILD
│   ├── /company/careers/                           🔲 BUILD
│   └── /company/contact/                           🔲 BUILD
│
├── /newsletter/                                    🔲 BUILD (redirect to Substack)
│   └── Substack: Agents of Insight                 🔗 EXTERNAL
│
├── /pricing/                                       ✅ LIVE — needs refresh
├── /login/                                         ✅ LIVE — redirect
│
├── /privacy-policy/                                🔲 BUILD
├── /terms-of-service/                              🔲 BUILD
└── /cookie-settings/                               🔲 BUILD
```

**Total pages to build:** ~45 new pages

---

## Build Prompts

Each prompt below is designed to be given to Claude Code to build the page. The workflow is:
1. Claude Code creates the page HTML in `src/[section]/[slug].html`
2. Review the content
3. Deploy via REST API or MCP `wp_create_post`

### Conventions
- Every page reuses the same `<style>`, `<nav>`, and `<footer>` from the homepage
- Extract shared components into `src/shared/nav.html`, `src/shared/footer.html`, `src/shared/base-styles.css`
- Each page has its own unique content section between nav and footer

---

### PLATFORM PAGES

#### /platform/overview/
```
Build a "Platform Overview" page for getpacerai.com. Reuse the homepage nav, footer, and
base dark theme CSS from src/homepage/index-build.html.

Content sections:
1. Hero: "One Platform. From Raw Data to Board-Ready Intelligence."
   Subheadline explaining the end-to-end flow: connect data → model → activate
2. Architecture diagram section showing the data flow:
   Data Sources (CRM, Billing, ERP) → Pacer AI (Ingestion → Fabric Lakehouse → Semantic Model) → Outputs (Power BI, AI Agents, Excel+Copilot, Board Reports)
3. Three capability cards (same as homepage pillars but expanded):
   - Microsoft Fabric Foundation
   - Power BI Intelligence Layer
   - AI Agent Activation
4. Integration logos/grid showing supported data sources
5. CTA: "See the Platform in Action → Request Demo"

Target keywords: revenue intelligence platform, SaaS data platform, ARR reporting platform
```

#### /platform/data-ingestion/
```
Build a "Data Ingestion" page for getpacerai.com. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Connect Every Revenue Data Source. Automatically."
2. Supported sources grid: Salesforce, HubSpot, Dynamics 365, Stripe, Chargebee,
   Zuora, QuickBooks, Xero, NetSuite, custom APIs
3. How ingestion works (3 steps): Connect → Validate → Normalize
4. Data quality section: deduplication, currency normalization, date alignment
5. Security callout: encrypted in transit + at rest, SOC 2, GDPR
6. CTA: "See Your Data Connected → Request Demo"

Target keywords: SaaS data ingestion, CRM data integration, revenue data pipeline
```

#### /platform/microsoft-fabric/
```
Build a "Microsoft Fabric" page for getpacerai.com. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Built on Microsoft Fabric. Enterprise-Grade from Day One."
2. Why Fabric section: lakehouse architecture, OneLake, semantic models
3. What Pacer builds on Fabric: customer data cube, ARR waterfall model,
   cohort analysis, revenue attribution
4. Microsoft partnership/certification callout
5. Comparison: Fabric vs. building your own data warehouse
6. CTA: "See Pacer + Fabric → Request Demo"

Target keywords: Microsoft Fabric SaaS, Fabric revenue analytics, Fabric semantic model
```

#### /platform/power-bi/
```
Build a "Power BI Dashboards" page for getpacerai.com. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Board-Ready Dashboards. Always Current. Always Accurate."
2. Dashboard gallery (screenshots/mockups): ARR Snowball, Customer Health,
   Pipeline, Cohort Analysis, Executive Summary
3. Features: embedded analytics, row-level security, scheduled refresh,
   mobile-optimized, export to PowerPoint
4. "Dashboards Your Board Will Actually Read" — design philosophy section
5. CTA: "See Live Dashboards → Request Demo"

Target keywords: Power BI SaaS dashboards, ARR reporting Power BI, board reporting dashboard
```

#### /platform/ai-agents/
```
Build an "AI Agents" page for getpacerai.com. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "AI Agents That Actually Understand Your Revenue Data."
2. Agent types: Revenue Analyst Agent, RevOps Copilot, Board Report Generator
3. How agents work: trained on your semantic model, not generic LLMs
4. Example prompts/outputs: "Show me net new ARR by cohort last quarter",
   "What's driving churn in enterprise accounts?"
5. Platform support: Claude, GPT, Copilot, custom agents
6. CTA: "Talk to a Pacer AI Agent → Request Demo"

Target keywords: AI revenue agent, SaaS AI analytics, revenue intelligence AI
```

#### /platform/excel-copilot/
```
Build an "Excel + Copilot" page for getpacerai.com. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Your Revenue Data, Right in Excel. Copilot-Ready."
2. Excel integration features: live data connection, pivot tables from semantic model,
   Copilot natural language queries
3. Use case examples: CFO pulls ARR bridge in Excel, analyst runs cohort in pivot table
4. "Meets Finance Where They Work" — philosophy section
5. CTA: "See Excel + Pacer → Request Demo"

Target keywords: Excel revenue reporting, Copilot SaaS analytics, Excel ARR model
```

#### /platform/security/
```
Build a "Security & Compliance" page for getpacerai.com. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Enterprise Security. Zero Compromise."
2. Security features: encryption (transit + rest), Azure AD/Entra ID SSO,
   row-level security, audit logging
3. Compliance: SOC 2 Type II (planned), GDPR, data residency options
4. Architecture security: Microsoft Fabric security model, no data leaves Azure
5. Trust center / certifications grid
6. CTA: "Review Our Security Documentation → Contact Us"

Target keywords: SaaS data security, revenue platform compliance, SOC 2 analytics
```

#### /platform/integrations/
```
Build an "Integrations" page for getpacerai.com. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Connects to the Tools You Already Use."
2. Integration grid with logos and categories:
   - CRM: Salesforce, HubSpot, Dynamics 365
   - Billing: Stripe, Chargebee, Zuora, Recurly
   - ERP: QuickBooks, Xero, NetSuite
   - Data: Snowflake, BigQuery, custom APIs
3. Integration depth section: not just connectors — semantic model mapping
4. Custom integration callout
5. CTA: "See Your Stack Connected → Request Demo"

Target keywords: SaaS data integrations, CRM billing integration, revenue data connectors
```

---

### USE CASE / SOLUTIONS PAGES

#### /solutions/arr-snowball-board-reporting/ (Priority 1)
```
Build the "ARR Snowball Board Reporting" use case page for getpacerai.com.
Reuse homepage nav/footer/theme. This is the PRIMARY use case — most detailed page.

Content sections:
1. Hero: "Your ARR Snowball Report. Board-Ready in Days, Not Months."
2. "What is an ARR Snowball?" definition section (AEO-optimized — clear, extractable paragraph)
3. The problem: manual Excel, 3-6 month timelines, error-prone, not auditable
4. Pacer solution: automated waterfall from raw data, always current
5. ARR Snowball components breakdown: Beginning ARR → New → Expansion → Contraction → Churn → Ending ARR
6. Dashboard mockup/screenshot
7. Who uses it: CFO for board decks, PE for portfolio reviews, M&A for due diligence
8. Customer quote/testimonial
9. FAQ section (schema markup): "How long does it take?", "What data do I need?",
   "How is it different from manual Excel?"
10. CTA: "See Your ARR Snowball → Request Demo"

Target keywords: ARR Snowball reporting, ARR waterfall analysis, SaaS board reporting
AEO: Optimize for "What is an ARR Snowball?" and "How to build an ARR Snowball report"
```

#### /solutions/customer-data-cube/ (Priority 1)
```
Build the "Customer Data Cube" use case page for getpacerai.com.
Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "One Unified View of Every Customer. Every Dollar. Every Signal."
2. What is a Customer Data Cube? (AEO paragraph)
3. The problem: customer data scattered across CRM, billing, support, product
4. Pacer solution: unified customer entity with full revenue history
5. Dimensions: customer, product, cohort, segment, geography, contract
6. Use cases: identify expansion opportunities, churn risk, LTV analysis
7. Dashboard mockup
8. FAQ section
9. CTA: "Build Your Customer Data Cube → Request Demo"

Target keywords: customer data cube, unified customer analytics, SaaS customer intelligence
```

#### /solutions/virtual-data-room/ (Priority 2)
```
Build the "Virtual Data Room" use case page. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Investor-Grade Data Room. Built Automatically from Your Live Data."
2. What goes in a SaaS data room? (AEO paragraph)
3. The problem: months of manual preparation, stale by the time it's ready
4. Pacer solution: always-current data room powered by live semantic model
5. Data room contents: ARR bridge, cohort analysis, customer concentration,
   NRR/GRR trends, pipeline coverage, unit economics
6. M&A use case: due diligence acceleration
7. CTA: "Prepare Your Data Room → Request Demo"

Target keywords: SaaS virtual data room, M&A data room automation, due diligence SaaS
```

#### /solutions/transaction-readiness/ (Priority 2)
```
Build the "Exit Readiness" use case page. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "M&A-Grade Revenue Metrics. Ready Before the LOI."
2. What is exit readiness? (AEO paragraph)
3. The problem: scrambling to produce defensible metrics after LOI
4. Pacer solution: continuously maintained, auditable revenue model
5. Exit readiness checklist: ARR bridge, cohort retention, customer concentration,
   rule of 40, LTV/CAC, magic number
6. PE portfolio context: standardized across portfolio companies
7. CTA: "Get Exit-Ready → Request Demo"

Target keywords: SaaS exit readiness, M&A revenue due diligence, PE exit preparation
```

#### /solutions/expansion-enablement/
```
Build the "Expansion Enablement" use case page. Reuse homepage nav/footer/theme.

Focus on: identifying expansion revenue opportunities, upsell/cross-sell visibility,
whitespace analysis, expansion playbook automation.

Hero: "See Every Expansion Dollar You're Missing."
Target keywords: SaaS expansion revenue, upsell analytics, expansion enablement
```

#### /solutions/whitespace-visibility/
```
Build the "Whitespace Visibility" use case page. Reuse homepage nav/footer/theme.

Focus on: product adoption gaps, feature penetration by customer, cross-sell mapping,
whitespace heat maps.

Hero: "See the Revenue Hiding in Your Existing Customers."
Target keywords: whitespace analysis SaaS, cross-sell analytics, product adoption analytics
```

#### /solutions/bottoms-up-forecasting/
```
Build the "Bottoms-Up Forecasting" use case page. Reuse homepage nav/footer/theme.

Focus on: customer-level forecasting, renewal prediction, expansion forecasting,
pipeline-to-revenue modeling.

Hero: "Forecasts Built on Customer Reality, Not Gut Feel."
Target keywords: bottoms-up revenue forecasting, SaaS forecasting model, customer-level forecast
```

#### /solutions/cohort-sales-planning/
```
Build the "Roll-Forward Sales Planning by Cohort" use case page. Reuse homepage nav/footer/theme.

Focus on: cohort-based revenue planning, vintage analysis, roll-forward models,
quota setting from retention data.

Hero: "Plan Revenue by Cohort. Not by Gut."
Target keywords: cohort revenue planning, SaaS cohort analysis, vintage revenue analysis
```

#### /solutions/investor-diligence/
```
Build the "Investor Diligence" use case page. Reuse homepage nav/footer/theme.

Focus on: investor-facing analytics, diligence package automation, standardized
PE portfolio reporting, quality of earnings support.

Hero: "Diligence-Grade Metrics. On Demand."
Target keywords: investor due diligence SaaS, PE diligence analytics, quality of earnings SaaS
```

#### /solutions/mbr-automation/
```
Build the "MBR Automation" use case page. Reuse homepage nav/footer/theme.

Focus on: monthly business review automation, standardized MBR/QBR templates,
executive summary generation, automated commentary.

Hero: "Monthly Business Reviews That Write Themselves."
Target keywords: MBR automation, monthly business review SaaS, QBR reporting automation
```

#### /solutions/gtm-analytics/
```
Build the "GTM Analytics" use case page. Reuse homepage nav/footer/theme.

Focus on: go-to-market analytics, pipeline analysis, win/loss analysis,
sales productivity, marketing attribution.

Hero: "See Your Entire GTM Machine. In One View."
Target keywords: GTM analytics SaaS, go-to-market analytics, sales pipeline analytics
```

---

### INDUSTRY PAGES

#### /industry/b2b-saas/
```
Build the "B2B SaaS" industry page. Reuse homepage nav/footer/theme.

Focus on: $50M–$1B ARR companies, complex revenue models (subscriptions + usage + services),
multi-product, enterprise sales cycles. Show how Pacer handles SaaS-specific metrics:
ARR, NRR, GRR, LTV/CAC, magic number, rule of 40.

Hero: "Built for B2B SaaS. $50M to $1B ARR."
Target keywords: B2B SaaS analytics, SaaS revenue intelligence, ARR reporting B2B SaaS
```

#### /industry/pe-backed-saas/
```
Build the "PE-Backed SaaS" industry page. Reuse homepage nav/footer/theme.

Focus on: portfolio company standardization, Operating Partner visibility, board reporting
cadence, value creation plans, exit preparation.

Hero: "Portfolio Intelligence for PE-Backed SaaS."
Target keywords: PE portfolio reporting, PE-backed SaaS analytics, portfolio company metrics
```

#### /industry/pre-ipo-saas/
```
Build the "Pre-IPO SaaS" industry page. Reuse homepage nav/footer/theme.

Focus on: S-1 ready metrics, auditor-grade data, public market readiness,
investor relations, quarterly earnings prep.

Hero: "S-1 Ready Revenue Metrics. Before You Need Them."
Target keywords: pre-IPO SaaS metrics, S-1 revenue reporting, IPO readiness analytics
```

---

### COMPARISON PAGES

#### Template for all comparison pages:
```
Build a "Pacer AI vs [COMPETITOR]" comparison page. Reuse homepage nav/footer/theme.

Structure:
1. Hero: "Pacer AI vs. [Competitor]: Which Is Right for You?"
2. Quick comparison table (features, pricing model, ideal customer, key differentiator)
3. "Where [Competitor] Excels" (fair, honest)
4. "Where Pacer AI Excels" (our differentiators)
5. Detailed feature comparison grid
6. "Best For" summary: [Competitor] is best for X, Pacer AI is best for Y
7. CTA: "See Pacer AI in Action → Request Demo"

AEO: Optimize for "[Competitor] alternatives" and "Pacer AI vs [Competitor]"
```

Competitors: Manual Excel, Mosaic Tech, Vena Solutions, Pigment, Causal, Cube

---

### RESOURCES

#### /blog/ (Existing — Expand)
```
Blog content plan — publish 2 posts/month:

Category: ARR Snowballs
- "How to Build an ARR Snowball Report: Step-by-Step Guide" (AEO target)
- "ARR Snowball vs. ARR Bridge: What's the Difference?"
- "5 ARR Snowball Mistakes That Kill Your Board Presentation"
- "Reading an ARR Snowball: A CFO's Guide"

Category: Frameworks
- "The Customer Data Cube Framework for SaaS Revenue Intelligence"
- "SaaS Metrics That Matter: Beyond MRR"
- "Building a Revenue Data Foundation: Lakehouse vs. Warehouse"

Category: Industry
- "How PE Firms Should Evaluate Portfolio Company Revenue Quality"
- "Pre-IPO Revenue Reporting: Getting S-1 Ready"
- "The RevOps Data Stack in 2026"

Category: Use Cases
- "Automating Monthly Business Reviews with AI"
- "From Raw CRM Data to Board Deck in 48 Hours"

Link every blog post to relevant use case page + homepage CTA.
```

#### Agents of Insight Newsletter (Substack)
```
Set up redirect: /newsletter/ → Substack URL (use Redirection plugin)

Add Substack subscribe link to:
- Resources dropdown in nav
- Footer "Company" column
- Blog sidebar/CTA
- Homepage empathy section or CTA section

Newsletter content: weekly insights on AI + revenue operations, ARR analysis tips,
industry trends. Cross-promote blog posts.
```

#### /resources/arr-snowball-guide/ (Gated)
```
Build an "ARR Snowball Guide" landing page. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "The Definitive Guide to ARR Snowball Reporting"
2. What you'll learn (bullet list)
3. Chapter preview/table of contents
4. Email capture form (name + email + company) → delivers PDF
5. Social proof: "Downloaded by 500+ SaaS finance leaders"

Gate: Email required for PDF download. Use WPForms or HubSpot form.
```

---

### CASE STUDIES

#### /case-studies/ (Index Page)
```
Build a "Case Studies" index page. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "See How SaaS Leaders Use Pacer AI"
2. Case study cards grid (2-col desktop, 1-col mobile):
   Each card: company logo/name, industry, headline result, "Read More →"
3. Filter by: Use Case, Industry, Company Size
4. CTA: "Want results like these? → Request Demo"

Note: Individual case studies will be added as they're available.
Template for each: Challenge → Solution → Results (with specific metrics).
```

---

### COMPANY PAGES

#### /company/about/
```
Build an "About Pacer AI" page. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "We Turn Revenue Data Into Intelligence."
2. Mission statement
3. The problem we solve (brief)
4. Founded by [Will Sullivan] — brief founder intro
5. "Why We Built Pacer AI" — origin story teaser (link to Founders Story)
6. Values/principles (3-4 items)
7. Technology partners: Microsoft, etc.
8. CTA: "Join Us / Request Demo"

Target keywords: Pacer AI company, about Pacer AI, revenue intelligence company
```

#### /company/founders-story/
```
Build a "Founder's Story" page. Reuse homepage nav/footer/theme.

Content: Will Sullivan's story — background in data/analytics, experience building
ARR models for PE-backed SaaS companies, why the manual process is broken,
vision for AI-powered revenue intelligence.

Personal, authentic tone. Photo of Will.
CTA: "Talk to Will → Schedule a Call"
```

#### /company/careers/
```
Build a "Careers" page. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Build the Future of Revenue Intelligence"
2. Why work at Pacer AI
3. Current openings (or "We're always looking for great people")
4. Culture/values
5. CTA: "Send us your resume → contact@getpacerai.com"
```

#### /company/contact/
```
Build a "Contact" page. Reuse homepage nav/footer/theme.

Content sections:
1. Hero: "Let's Talk."
2. Contact form (name, email, company, message)
3. Email: contact@getpacerai.com
4. Calendly embed or link for scheduling
5. Office location (if applicable)
```

---

### LEGAL PAGES

#### /privacy-policy/, /terms-of-service/, /cookie-settings/
```
Build standard legal pages. Reuse homepage nav/footer/theme.

Use standard SaaS legal page templates. Include:
- Privacy Policy: data collection, usage, sharing, retention, rights
- Terms of Service: usage terms, limitations, liability
- Cookie Settings: cookie types, opt-out mechanism

Note: These should be reviewed by legal counsel before publishing.
```

---

## Build Priority Order

| Priority | Pages | Rationale |
|----------|-------|-----------|
| P0 (done) | Homepage | Live |
| P1 | ARR Snowball, Customer Data Cube use cases | Primary product stories |
| P1 | Platform Overview | Needed for nav links |
| P1 | About, Contact | Basic company presence |
| P2 | Virtual Data Room, Exit Readiness | Secondary use cases |
| P2 | PE-Backed SaaS, B2B SaaS industry pages | ICP targeting |
| P2 | Comparison pages (vs. Manual Excel first) | SEO/AEO value |
| P3 | Remaining use cases | Fill out solutions section |
| P3 | Remaining platform pages | Fill out platform section |
| P3 | Blog expansion (2/month) | Content marketing |
| P3 | Resources (gated content) | Lead generation |
| P4 | Legal pages, Careers, Partners | Foundational |

## Shared Component Extraction

Before building pages beyond the homepage, extract shared components:
```
src/
├── shared/
│   ├── base-styles.css     # CSS variables, resets, TT4 overrides
│   ├── nav.html            # Header nav (desktop + mobile)
│   ├── footer.html         # Footer
│   └── responsive.css      # Mobile + tablet media queries
├── homepage/
│   └── index-build.html    # Homepage (current)
├── platform/
│   └── overview.html       # First platform page
├── solutions/
│   └── arr-snowball.html   # First use case page
└── ...
```
