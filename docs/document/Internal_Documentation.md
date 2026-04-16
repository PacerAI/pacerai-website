# Internal Documentation — getpacerai.com

**Last updated:** 2026-03-10
**Owner:** Will Sullivan, Founder

---

## 1. Primary Messaging & Positioning

### Tagline
**"Your ARR Snowball Report. Automated. Board-Ready."**

### Positioning Statement
Pacer AI is an ARR intelligence platform built for PE-backed B2B SaaS companies ($50M–$1B ARR). It transforms raw revenue data — CRM, billing, and reported — into due diligence-grade ARR Snowball reports, automatically. From raw data to board quality in days, not months.

### Value Proposition Pillars
1. **Speed** — Board-ready ARR reports in days, not months
2. **Automation** — No manual Excel, no data team dependency
3. **Credibility** — Due diligence-grade accuracy, M&A defensible
4. **Microsoft Native** — Built on Fabric, Power BI, Excel + Copilot

### Target Personas

| Persona | Title | Pain Point | Message |
|---------|-------|------------|---------|
| Operating Partner | PE firm (3–15 portfolio cos) | No consistent ARR view across portfolio | "Portfolio-wide ARR intelligence in one platform" |
| CFO / VP Finance | $50M–$500M ARR SaaS | Months to produce board-ready ARR report | "Board-ready in days, not months" |
| Head of RevOps | $50M–$500M ARR SaaS | Data scattered across CRM, billing, spreadsheets | "One customer data cube from all your sources" |
| CRO | Growth-stage SaaS | Can't see expansion/churn drivers clearly | "See where your ARR is growing and leaking" |

### CTA Language
- **Primary:** "Request a Demo", "See a Live ARR Demo"
- **Secondary:** "How It Works", "Talk to a RevOps Expert"
- **Never use:** "Get Started Free", "Sign Up", "Try It Now"

### Competitive Positioning

| Competitor | Our Differentiator |
|------------|-------------------|
| Manual Excel | Automated, auditable, always current |
| Mosaic Tech | Microsoft-native (Fabric/Power BI), not another SaaS silo |
| Vena Solutions | Purpose-built for ARR Snowball, not generic FP&A |
| Pigment | Built for PE-backed SaaS operators, not enterprise planning |
| Causal | Board-grade output, not financial modeling tool |
| Cube | Revenue intelligence, not just BI semantic layer |

---

## 2. How the Site Works

### Architecture
- **CMS:** WordPress.com (hosted, Premium plan)
- **Theme:** Twenty Twenty-Four (WordPress default)
- **Content delivery:** Homepage content is a single `<!-- wp:html -->` Gutenberg block containing inline CSS + HTML + vanilla JS
- **Deploy methods:**
  - WordPress REST API via Python (full content pushes)
  - AI Engine MCP via Claude Code (reads, small edits, media)
- **SEO:** Yoast SEO plugin manages `<head>` meta tags, OG tags, canonical URLs
- **Analytics:** Google Site Kit (Google Analytics + Search Console)
- **Code injection:** Head, Footer and Post Injections plugin + WPCode Lite

### Claude Code Skill

A project-level Claude Code skill is available for website development tasks:

- **Location:** `.claude/skills/webdev-getpacerai/SKILL.md`
- **Invoke:** `/webdev-getpacerai [action] [details]`
- **Examples:** `/webdev-getpacerai deploy all pages`, `/webdev-getpacerai build /solutions/virtual-data-room page`
- **Also symlinked to:** `~/.claude/skills/webdev-getpacerai` (available in all Claude Code sessions)
- **Contains:** Page registry, REST API deploy workflows (single, batch, new page), brand constraints, TT4 override patterns, operating rules

### Key Technical Details
- Homepage page ID: **25**
- Homepage slug: `no-title` (known issue — needs review before changing)
- Front page setting: Static page (page_on_front: 25)
- No posts page set (page_for_posts: 0)
- Fonts: DM Sans (body) + Cormorant Garamond (headings) via Google Fonts
- Background: Dark navy (#080E1C)
- All content CSS is inline — no dependency on theme styles

---

## 3. Site Tree (Current State)

**Last updated:** 2026-03-10

```
getpacerai.com/
├── / (Home)                                          ← Page ID 25, slug: no-title
│   ├── Nav: Platform | Solutions | Resources | Partners | Case Studies | Company
│   ├── Hero, Dashboard Preview, Logo Strip, Use Cases, How It Works
│   ├── Platform Pillars, Empathy Section, Testimonial, CTA
│   └── Footer (Platform | Use Cases | Comparisons | Company)
│
├── /platform/                                        ← Page ID 362 (parent placeholder)
│   └── /platform/overview/                           ← Page ID 371
│       └── Architecture diagram, 3 capability pillars, integration grid
│
├── /solutions/                                       ← Page ID 364 (parent placeholder)
│   ├── /solutions/arr-snowball-board-reporting/       ← Page ID 372
│   │   └── AEO definition, problem grid, ARR components, dashboard mockup, FAQ (JSON-LD)
│   └── /solutions/customer-data-cube/                ← Page ID 373
│       └── AEO definition, 6-dimension grid, use cases, dashboard mockup, FAQ (JSON-LD)
│
├── /company/                                         ← Page ID 366 (parent placeholder)
│   ├── /company/about/                               ← Page ID 374
│   │   └── Mission, old-way/new-way contrast, founder bio, values, tech partners
│   └── /company/contact/                             ← Page ID 375
│       └── Contact form, Calendly link, email addresses, partnerships
│
├── /pricing/                                         ← Page ID 111 (legacy)
├── /login/                                           ← Page ID 134 (legacy)
├── /blog/                                            ← Page ID 230
│   ├── Why ARR Waterfall Models Matter for SaaS Growth (ID 358)
│   ├── Using AI to Enable RevOps Without Breaking Your GTM (ID 360)
│   ├── ARR Snowball Analysis: Find Your Expansion Drivers (ID 368)
│   ├── Prevent Churn in High-Value Accounts with ARR Snowball (ID 376)
│   └── What Is an ARR Snowball? Understanding Revenue Growth (ID 378)
│
└── External Links
    ├── https://app.getpacerai.com/.auth/login/aad  (Log In — Entra ID auth)
    ├── https://calendly.com/pacerai                 (Request Demo / Schedule)
    └── Substack: Agents of Insight newsletter        (TBD — needs link)
```

### Source File Mapping

| WP Page | WP ID | Source File |
|---------|-------|-------------|
| Home | 25 | `src/homepage/index-build.html` |
| Blog | 230 | `src/blog/index-build.html` |
| Platform Overview | 371 | `src/platform/overview.html` |
| ARR Snowball | 372 | `src/solutions/arr-snowball.html` |
| Customer Data Cube | 373 | `src/solutions/customer-data-cube.html` |
| About | 374 | `src/company/about.html` |
| Contact | 375 | `src/company/contact.html` |

All pages deployed via WordPress REST API. See `CLAUDE.md` for full page registry and `docs/deploy/runbook.md` for deploy instructions.

---

## 4. Links & Navigation

**Last nav rebuild:** 2026-04-04 / 2026-04-05 — see `docs/review/resources-nav-and-data-model-20260405.md` for the full change log.

### Header Nav (Desktop) — 4 top-level items

| Item | Type | Destination |
|------|------|-------------|
| **Overview** | Single dropdown | Use Cases (`#use-cases` via smooth scroll), Solutions overview (`#solutions`), Team overview (`#what-is-pacer-ai`) — homepage-scoped `data-scroll-to` links via inline `_s(event,'name')` helper |
| **Solutions** | Mega dropdown (2-column grid with SVG icons) | **Solutions column:** Customer Data Cube → `/solutions/customer-data-cube/`, ARR Snowball reporting → `/solutions/arr-snowball-board-reporting/`, Transaction Readiness → `#` (in-page), RevOps Transformation → `#`, GTM Transformation → `#`, FP&A Transformation → `#`. **By Persona column:** Operating Partners → `#`, CFOs → `#`, CROs → `#` |
| **Resources** | Single dropdown (7 items) | Blog → `/blog/`, ARR Snowballs → `/blog/?filter=arr-snowballs`, Frameworks → `/blog/?filter=frameworks`, Model Templates → `/blog/?filter=model-templates`, Newsletter → `https://agentsofinsight.substack.com/` (new tab), YouTube → `https://www.youtube.com/@PacerAI` (new tab), For RevOps → `/blog/?filter=revops` |
| **Team** | Single dropdown | Purpose & Mission → `#what-is-pacer-ai`, Team → `/team/about/`, Partners → `#transactionready`, Agent Team → `/team/about/` |
| Log In | Button (nav-right) | `https://app.getpacerai.com/.auth/login/aad` |
| Request Demo | Button (nav-right, teal) | `https://calendly.com/pacerai` |

**Sub-page note:** On non-homepage pages, Overview/Team in-page scroll links point to the homepage root (`/`) instead of `data-scroll-to` anchors, since in-page targets only exist on the homepage.

### Homepage smooth scroll helper
WordPress strips `<script>` tags, so the smooth-scroll helper is injected via `<img onerror>`:
```html
<img src="//0" onerror="window._s=function(e,n){e&&e.preventDefault&&e.preventDefault();var t=document.querySelector('[data-section=\"'+n+'\"]');if(t){window.scrollTo(0,t.getBoundingClientRect().top+window.pageYOffset-70);if(e)history.pushState(null,'','#'+n)}};if(location.hash){var h=location.hash.slice(1);setTimeout(function(){window._s(null,h)},300)}this.remove()" style="display:none" alt="">
```
Each in-page nav link uses `onclick="_s(event,'section-name')"`. URL hash updates via `pushState` so links like `getpacerai.com/#use-cases` are shareable and auto-scroll on page load.

### Blog Category Filter (deep-linking)
Blog posts are tagged with `data-category="<slug>"`. The `.cat-pill` filter bar supports:
- **All Posts** (default)
- **ARR Snowballs** — `data-filter="arr-snowballs"` (6 posts)
- **Frameworks** — `data-filter="frameworks"` (0 posts — shows "Coming soon" empty state)
- **Model Templates** — `data-filter="model-templates"` (0 posts — shows "Coming soon" empty state) *NEW 2026-04-05*
- **RevOps** — `data-filter="revops"` (1 post)
- **AI & Agents** — `data-filter="ai-agents"` (0 posts — shows "Coming soon" empty state)

**URL query param auto-select:** `/blog/?filter=<slug>` auto-clicks the matching pill on page load. Used by Resources dropdown links.

**Empty state:** `<div id="blog-empty-state">` shows "Coming soon / New posts on the way" when a filter returns 0 matching cards (except for "All Posts"). Styled with teal eyebrow + links to full blog and newsletter.

### Footer Links
| Column | Links |
|--------|-------|
| Platform | Platform Overview, Data Ingestion, Microsoft Fabric, Power BI Dashboards, AI Agents, Excel + Copilot, Security, Integrations |
| Use Cases | ARR Snowball Board Reporting, Customer Data Cube, Virtual Data Room, Exit Readiness, MBR Automation, GTM Analytics |
| Comparisons | vs. Manual Excel, vs. Mosaic Tech, vs. Vena Solutions, vs. Pigment, vs. Causal, vs. Cube |
| Company | About Pacer AI, Agents of Insight Newsletter, Blog, Partners, Case Studies, Careers, Contact |
| Legal (bottom bar) | Privacy Policy, Terms of Service, Cookie Settings, LinkedIn |

### External Services
| Service | URL | Purpose |
|---------|-----|---------|
| App (Entra ID) | app.getpacerai.com | Client portal login |
| Calendly | calendly.com/pacerai | Demo scheduling |
| Substack | agentsofinsight.substack.com | Agents of Insight newsletter (linked from Resources dropdown) |
| YouTube | youtube.com/@PacerAI | Video content (linked from Resources dropdown) |
| LinkedIn | TBD | Company page |

### Resources Data Model
Canonical ICP → Problem → Content Pillar → Solution → Resource mapping lives at `docs/plan/resources_data_model.md`. This is the source of truth for every Resources sublink and for any future content that needs a "home" in the taxonomy. Reads from `01_Foundation/customers/`, `01_Foundation/strategy/content-pillars.yml`, and `01_Foundation/products/`.

**Resources taxonomy (8 items, Phase 1 ships 7):**

| # | Sublink | Route | Phase 1 in WP? |
|---|---|---|---|
| 1 | Blog | `/blog/` | ✅ |
| 2 | ARR Snowballs | `/blog/?filter=arr-snowballs` | ✅ |
| 3 | Frameworks | `/blog/?filter=frameworks` | ✅ |
| 4 | Model Templates | `/blog/?filter=model-templates` | ✅ |
| 5 | Newsletter | Substack (new tab) | ✅ |
| 6 | YouTube | `@PacerAI` (new tab) | ✅ |
| 7 | For RevOps | `/blog/?filter=revops` | ✅ |
| 8 | AI Prompt & Skill Library | `04_GTM/prompt-library/index.html` | ❌ Phase 2 |

---

## 5. Categories & Tags

### Categories (WordPress)
| Category | Slug | Posts | Purpose |
|----------|------|-------|---------|
| ARR Snowballs | `arr-snowballs` | 4 | Primary content pillar — ARR analysis topics |
| Frameworks | `frameworks` | 1 | Methodology and framework content |
| Uncategorized | `uncategorized` | 1 | Default (should be recategorized) |

### Tags
| Tag | Slug | Posts |
|-----|------|-------|
| Churn | `churn` | 1 |

### Recommended Taxonomy Expansion
**Categories to add:**
- Platform Updates
- Use Cases
- Industry Insights (PE, SaaS)
- Customer Stories / Case Studies
- RevOps Best Practices

**Tags to add:**
- ARR, MRR, Net Revenue Retention, Logo Retention
- Due Diligence, M&A, Board Reporting
- Microsoft Fabric, Power BI, Copilot
- CRM, Billing, ERP
- PE Portfolio, SaaS Metrics

---

## 6. SEO & AEO Strategy

### Current SEO Status
| Item | Status | Action |
|------|--------|--------|
| Yoast SEO plugin | Active (v27.1.1) | Configured |
| Page title (Home) | "Home" | **Needs update:** "Pacer AI — ARR Intelligence for PE-Backed SaaS" |
| Meta description | Missing | **Needs update:** see PRD section 11 |
| Canonical URL | Set by Yoast | OK |
| OG tags | Set by Yoast | OK |
| Sitemap | Generated by Yoast | OK |
| Google Search Console | Via Site Kit | Connected |
| Google Analytics | Via Site Kit | Connected |

### Target Keywords

| Priority | Keyword | Intent | Target Page |
|----------|---------|--------|-------------|
| P1 | ARR Snowball reporting | Informational/Commercial | Homepage, Blog |
| P1 | ARR waterfall analysis | Informational | Blog, Use Case page |
| P1 | SaaS board reporting automation | Commercial | Homepage |
| P2 | PE portfolio reporting | Commercial | Use Case page |
| P2 | revenue intelligence platform | Commercial | Homepage |
| P2 | SaaS due diligence data room | Commercial | Use Case page |
| P3 | net revenue retention analysis | Informational | Blog |
| P3 | customer data cube SaaS | Informational | Blog, Use Case page |

### AEO (Answer Engine Optimization) Strategy
Optimize for AI-powered search (Perplexity, ChatGPT Browse, Google AI Overview):

1. **Structured Q&A content** — each use case page should answer "What is [X]?" and "How does [X] work?" in clear, extractable paragraphs
2. **Schema markup** — Organization + SoftwareApplication JSON-LD (inject via Yoast or Head/Footer Injections)
3. **Definitive statements** — lead paragraphs with clear definitions AI can extract
4. **Comparison pages** — "Pacer AI vs [Competitor]" pages are high-value for AI citation
5. **FAQ schema** on key pages
6. **Blog content** targeting long-tail questions: "How to build an ARR Snowball report", "What goes in a SaaS data room"

### Planned SEO/AEO Agent
Build a Claude Skill that:
- Fetches live page HTML and analyzes heading structure, keyword density, internal linking
- Checks for missing meta descriptions, alt text, schema markup
- Runs Lighthouse SEO audit
- Compares content against target keywords
- Outputs actionable recommendations
- Runs weekly on a schedule

---

## 7. Google Tag Manager & Analytics

### Current Setup
- **Google Site Kit plugin** (v1.173.0) — connects Google Analytics and Search Console
- **Head, Footer and Post Injections plugin** — can inject GTM/custom scripts into `<head>`, `<body>`, `<footer>`
- **WPCode Lite** — alternative code snippet injection

### GTM Implementation Plan

| Tag | Trigger | Purpose |
|-----|---------|---------|
| GA4 Page View | All pages | Basic traffic tracking |
| GA4 Event: CTA Click | Click on `.btn-teal`, `.btn-lg` | Track demo request clicks |
| GA4 Event: Nav Dropdown | Hover/click on nav dropdowns | Track interest by section |
| GA4 Event: Blog Read | Scroll > 75% on blog posts | Track content engagement |
| GA4 Event: External Link | Click on calendly.com, app.getpacerai.com | Track conversions |
| LinkedIn Insight Tag | All pages | LinkedIn ad conversion tracking |
| Meta Pixel | All pages (if running Meta ads) | Facebook/Instagram conversion tracking |

### Key Metrics to Track
- **Homepage:** Bounce rate, scroll depth, CTA click rate, time on page
- **Blog:** Pageviews, avg read time, scroll completion, CTA clicks from blog
- **Conversion funnel:** Homepage → Demo CTA click → Calendly booking → Demo completed

---

## 8. Website Visitor Reporting & Notifications

### Visitor Intelligence Play
Goal: Know who visits the site and what they looked at, even if they don't fill out a form.

| Layer | Tool | What It Captures |
|-------|------|-----------------|
| Basic analytics | Google Analytics (via Site Kit) | Traffic, pages, time, referrers, device |
| Company identification | Clearbit Reveal / Leadfeeder / RB2B | Reverse IP → company name, industry, size |
| Session recording | Hotjar / Microsoft Clarity | Heatmaps, scroll maps, session replays |
| Real-time alerts | Slack webhook from GA/Clearbit | "Someone from [Company] viewed your pricing page" |

### Recommended Stack (MVP)
1. **RB2B** (free tier) — identifies companies visiting the site via reverse IP lookup
2. **Microsoft Clarity** (free) — heatmaps and session recordings
3. **Google Analytics 4** (already active via Site Kit) — traffic and events
4. **Slack webhook** — real-time notifications when high-value visitors are detected

### Notification Workflow
```
Visitor hits getpacerai.com
    → GA4 tracks pageview + events
    → RB2B identifies company (if possible)
    → If company matches ICP (PE firm, $50M+ SaaS):
        → Slack alert to #website-leads: "[Company] viewed [Page] at [Time]"
        → Log to CRM (HubSpot/Salesforce)
```

---

## 9. Lead Generation Capture

### Current Lead Capture Points
| Touchpoint | Current State | Capture Method |
|------------|---------------|----------------|
| "Request Demo" CTA | Links to Calendly | Calendly captures email + name at booking |
| "See a Live ARR Demo" CTA | Links to Calendly | Same as above |
| "Talk to a RevOps Expert" CTA | Links to Calendly | Same as above |
| Blog posts | No capture | **Gap — needs email gate or CTA** |
| Resources (guides, templates) | Not built yet | **Planned — gated downloads** |
| Newsletter (Agents of Insight) | Links to Substack (TBD) | Substack captures email |

### Planned Lead Capture Enhancements

#### A. Email Capture on Blog
- **Exit-intent popup** or **inline CTA block** at end of each blog post
- "Get the ARR Snowball Template — free download" → email gate
- Tool: WPForms, ConvertKit, or HubSpot form embedded via WPCode

#### B. Gated Resources
| Resource | Format | Gate Level |
|----------|--------|------------|
| ARR Snowball Template | Excel download | Email required |
| ARR Snowball Guide | PDF | Email required |
| Customer Data Cube Framework | PDF | Email required |
| SaaS Board Reporting Checklist | PDF | Email + company |
| Virtual Data Room Checklist | PDF | Email + company |

#### C. IP-to-Company Enrichment
Even without form fills, capture visitor intelligence:
- RB2B or Clearbit Reveal → company name from IP
- Match against ICP criteria
- Route to CRM for outbound follow-up

#### D. Click-to-Capture Tracking
Track these micro-conversions in GA4:
| Action | Event Name | What It Signals |
|--------|------------|-----------------|
| Click "Request Demo" | `cta_request_demo` | High intent |
| Click "Log In" | `cta_login` | Existing user |
| Click any use case link | `usecase_click_{name}` | Interest area |
| Click comparison link | `comparison_click_{competitor}` | Evaluation stage |
| Click blog CTA | `blog_cta_click` | Content-to-conversion |
| Download gated resource | `resource_download_{name}` | Lead capture |
| Subscribe to newsletter | `newsletter_subscribe` | Nurture funnel entry |

---

## 10. Active Plugins

| Plugin | Version | Purpose | Keep? |
|--------|---------|---------|-------|
| AI Engine | 3.4.1 | MCP server for Claude Code | Yes — critical |
| Akismet Anti-spam | 5.6 | Spam protection | Yes |
| Gutenberg | 22.6.0 | Block editor (bleeding edge) | Review — may cause issues |
| Head, Footer and Post Injections | 3.3.3 | GTM/script injection | Yes |
| Jetpack | 15.7-a.1 | WordPress.com integration | Yes (alpha — watch for issues) |
| Page Optimize | 0.6.2 | Performance | Yes |
| Redirection | 5.7.5 | URL redirects | Yes — needed for slug changes |
| Site Kit by Google | 1.173.0 | Analytics + Search Console | Yes — critical |
| WPCode Lite | 2.3.4 | Code snippets | Yes |
| Yoast SEO | 27.1.1 | SEO management | Yes — critical |
| Crowdsignal Dashboard | 3.1.5 | Polls/surveys | Review — is this used? |
| Crowdsignal Forms | 1.8.0 | Forms | Review — is this used? |
| Filester - File Manager Pro | 2.0.2 | File management | Review — redundant with WP File Manager? |
| Gravatar Enhanced | 0.13.0 | Avatars | Low priority |
| Layout Grid | 1.8.5 | Grid layouts | Review — needed post-BB removal? |
| Ultimate Addons for BB Lite | 1.6.7 | BB addons | **Delete — BB removed** |
| WP File Manager | 8.0.2 | File management | Review — redundant with Filester? |
