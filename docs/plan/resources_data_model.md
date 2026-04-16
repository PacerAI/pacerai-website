# Resources Data Model

**Purpose:** Align Pacer AI's ICPs → ICP Problems → Content Pillars → Solutions → Resources taxonomy into a single, queryable model. This is the source of truth for every resource that lives in the website's "Resources" dropdown and anywhere else we publish content.

**Status:** Phase 1 — documented. Phase 1 also ships 7 of 8 sublinks live in the WordPress Resources dropdown; item #8 (AI Prompt & Skill Library) is documented here but deferred from the live nav pending Phase 2.

**Last updated:** 2026-04-05

---

## Context — original prompt

> My goal is to align the ICP Problems to Content Pillars to Solutions and a Resource Data model. Please write a plan to create a "Data Model" plan using the instructions below.
>
> **Sources:**
> - `/01_Foundation/customers`
> - `/01_Foundation/products`
> - `/01_Foundation/prospects`
> - `/01_Foundation/reference`
> - `/01_Foundation/strategy/competitors.yml`
> - `/01_Foundation/strategy/content-pillars.yml`
> - `/01_Foundation/strategy/market-size.md`
> - `/01_Foundation/strategy/Positioning_by_ChatGPT.md`
> - `/01_Foundation/manifest.yml`
> - `/01_Foundation/one_page_business_plan.docx`
> - `/04_GTM/website-PacerAI`
> - `/04_GTM/prompt-library`
>
> In `/04_GTM/website-PacerAI/docs/plan` create a "resources_data_model" and list the Resources sublinks such as Blog, ARR Snowballs, Frameworks, "Model Templates", Newsletter, Youtube, "For RevOps", "AI Prompt & Skill Library"
>
> 1. In the "Resources" nav header have the "ARR Snowball" guide sublink take the user to "/Blog" and auto-select "ARR Snowballs"
> 2. In the "Resources" nav header have the "Frameworks" guide sublink take the user to "/Blog" and auto-select "Frameworks"
> 3. In "Blog" create a filter similar to "ARR Snowballs" for "Model Templates" then create a sublink under "Resources" for "Model Templates"
> 4. In the "Resources" nav header change "Templates & Frameworks" to just "Frameworks"
> 5. Add this prompt in the `/04_GTM/website-PacerAI/docs/plan` under the section #context — original prompt

---

## 1. Foundation Sources Map

Every row below is a canonical source this data model reads from. **Never edit the downstream copies** — edit the foundation file and propagate per `01_Foundation/manifest.yml`.

| Source | Path | Role in data model |
|---|---|---|
| ICPs | `01_Foundation/customers/icps.yml` | 8 canonical personas |
| ICP Problems | `01_Foundation/customers/icp-problems.yml` | 13 problems, scored by severity/frequency, linked to affected_personas |
| Firmographics | `01_Foundation/customers/firmographics.yml` | $50M–$1B ARR, PE-backed B2B SaaS, US/UK/EU |
| Content Pillars | `01_Foundation/strategy/content-pillars.yml` | 3 editorial pillars + 4 voice pillars + 3-tier distribution hierarchy |
| Positioning | `01_Foundation/strategy/Positioning_by_ChatGPT.md` + `strategy/positioning.yml` | Category + messaging |
| Competitors | `01_Foundation/strategy/competitors.yml` + `01_Foundation/competitors/` | Positioning differentiation |
| Market Size | `01_Foundation/strategy/market-size.md` | TAM/SAM/SOM |
| ARR Snowball Product | `01_Foundation/products/product_hypothesis_arr_snowball.md` | Core platform product (Essentials tier $70.2k/yr) |
| Exit Readiness | `01_Foundation/products/transaction-readiness/exit-readiness.md` | Service product (4-quarter framework with Veach AI partner) |
| GTM Transformation | `01_Foundation/products/GTM_Transformation/gtm-transformation.md` | 5-agent GTM chain framework |
| Product Value Chain | `01_Foundation/products/product-value-chain.md` | 5 Levels of Revenue Intelligence — Pacer AI operates at Level 5 |
| Pricing | `01_Foundation/commercial/pricing-packaging.yml` | Tier structure |
| Waterfall Manifest | `01_Foundation/manifest.yml` | Source → downstream consumer mapping |
| Prospects | `01_Foundation/prospects/` | PE funds and portcos |
| Reference | `01_Foundation/reference/` | Founder's Customer Development Checklist, Four Steps journey |
| Prompt Library | `04_GTM/prompt-library/` | Excel templates, client prompts, Claude projects, `index.html`, `prompts.json` |
| Website | `04_GTM/website-PacerAI/` | Blog posts, solution pages, Resources dropdown |

---

## 2. ICPs (8 canonical personas)

From `01_Foundation/customers/icps.yml`:

| ID | Title | Org Type | ARR Range | Source |
|---|---|---|---|---|
| `operating-partner` | Operating Partner | Private Equity Fund | $50M–$1B | Brand Kit |
| `portfolio-ops` | Portfolio Operations Team | Private Equity Fund | $50M–$1B | Brand Kit |
| `cfo` | CFO / VP Finance | PE-backed B2B SaaS | $50M–$500M | Brand Kit |
| `board-investors` | Board Members & Investors | PE Funds / Growth Equity | $50M–$1B | Brand Kit |
| `boutique-advisors` | Boutique Investment Bankers & Attorneys | Tech M&A Advisors | $50M–$1B | Brand Kit |
| `accounting-consulting` | Accounting & Consulting Firms | CPA Firms / RevOps Consultancies | $50M–$1B | Brand Kit |
| `revops-leader` | Head of RevOps | PE-backed B2B SaaS | $50M–$500M | GTME |
| `cro` | CRO | Growth-stage SaaS | $50M–$500M | GTME |

---

## 3. Content Pillars (3 editorial + 4 voice)

From `01_Foundation/strategy/content-pillars.yml`:

### Editorial Pillars (what we write about)
| ID | Name | Topics | Primary Personas | Writing Rule |
|---|---|---|---|---|
| `retention_economics` | Retention Economics | ARR waterfalls as operating dashboards, cohort behavior, NRR decomposition, GTM health diagnostics | Operating Partners, CFOs, FP&A | Show the math. Name the metric. Framework reader can apply Monday morning. |
| `exit_ready` | Operating Exit-Ready | Data quality as diligence accelerator, reporting infrastructure, board cadences, "track vs. prove" gap | CFOs, boutique-advisors, board-investors | Write from buyer's side of table. What does diligence pull? What makes them nervous? |
| `ai_ops` | AI Operator's Playbook | AI in FP&A and RevOps, forecasting, anomaly detection, agent patterns | RevOps leaders, CROs, FP&A analysts | Not trends. Anchor to workflow. Name the meeting or spreadsheet it replaces. |

### Voice Pillars (how we sound)
1. **Practitioner Authority** — M&A diligence background, hands-on platform experience, not vendor marketing
2. **Radical Specificity** — Name the metric (ARR Snowball, NRR, GRR), name the tool (Fabric, Copilot, Chargebee)
3. **Founder Authenticity** — Plain-spoken, direct, no corporate veneer

### Distribution Hierarchy (who reads what, where)
| Tier | Persona | Channel | Format | Purpose |
|---|---|---|---|---|
| 1 | Operating Partners | LinkedIn | Short posts, threads | Air cover — frame problem, OP forwards to CFO |
| 2 | CFOs | LinkedIn + Substack | Substack essays, depth posts | Validate problem |
| 3 | FP&A / RevOps | Substack + WordPress | Long-form tutorials, frameworks | Prove depth — hands-on team bookmarks |

**Forward test quality bar:** *"Would an Operating Partner forward this to their portfolio CFO?"*

---

## 4. Solutions / Products

From `01_Foundation/products/`:

### A. ARR Snowball Platform
- **Path:** `01_Foundation/products/product_hypothesis_arr_snowball.md`
- **Target ICPs:** `operating-partner`, `portfolio-ops`, `cfo`, `revops-leader`
- **Problems solved:** `manual-waterfall-rebuild`, `inconsistent-arr-definitions`, `no-single-source-of-truth`, `data-scattered-across-systems`, `no-portfolio-standardization`
- **Features:**
  1. Account-Product level data cube & dashboard
  2. Multi-dimensional ARR Snowball dashboard
  3. Whitespace Opportunity dashboard
  4. Semantic Modeling for Agent interaction
  5. Analyst Agent
- **MVP:** Pre-built ARR Snowball Dashboard + Customer data cube build (95% of customers need the cube first)
- **Pricing:** $25k–$50k data cube build + $70.2k/year platform subscription (Essentials tier)

### B. Exit Readiness Service (partnered with Veach AI for QoE)
- **Path:** `01_Foundation/products/transaction-readiness/exit-readiness.md`
- **Target ICPs:** `cfo`, `boutique-advisors`, `operating-partner`
- **Problems solved:** `arr-not-diligence-ready`, `late-stage-data-requests`, `inconsistent-arr-definitions`, `inconsistent-board-packages`
- **4-Quarter Framework:** Q1 Foundation → Q2 Intelligence → Q3 Readiness → Q4 Transaction

### C. GTM Transformation Service
- **Path:** `01_Foundation/products/GTM_Transformation/gtm-transformation.md`
- **Target ICPs:** `cro`, `revops-leader`, `operating-partner` (for portfolio)
- **Problems solved:** `cant-see-expansion-churn-drivers`, `forecast-tribal-knowledge`, `no-single-source-of-truth`
- **5-Agent GTM Chain:** Marketing Automation → Smart Prospecting → Lead Routing → Sales Enablement → Expansion Enablement

### Supporting Framework
- **Product Value Chain** (`01_Foundation/products/product-value-chain.md`): 5 Levels of Revenue Intelligence (Pacer AI = Level 5 "Revenue Motion Driven")

---

## 5. The Data Model — ICP × Problem × Pillar × Solution × Resource

This is the full mapping derived mechanically from `icp-problems.yml` + `content-pillars.yml` + `products/`. Each row is a (primary ICP, problem) pair.

| # | ICP | Problem | Sev | Pillar | Solution | Primary Resources |
|---|---|---|---|---|---|---|
| 1 | CFO | manual-waterfall-rebuild | 5 | retention_economics | ARR Snowball Essentials | Blog (ARR Snowballs), Model Templates, Newsletter |
| 2 | RevOps Leader | manual-waterfall-rebuild | 5 | ai_ops | ARR Snowball Essentials | Blog (RevOps), For RevOps hub, Model Templates |
| 3 | Portfolio Ops | manual-waterfall-rebuild | 5 | retention_economics | ARR Snowball Portfolio | Blog (Frameworks), Board package templates |
| 4 | CFO | inconsistent-arr-definitions | 5 | exit_ready | ARR Snowball + Exit Readiness | Blog (ARR Snowballs), Frameworks |
| 5 | Operating Partner | inconsistent-arr-definitions | 5 | exit_ready + retention_economics | ARR Snowball Portfolio tier | LinkedIn posts, Blog (ARR Snowballs), YouTube |
| 6 | Board & Investors | inconsistent-arr-definitions | 5 | exit_ready | Exit Readiness | Frameworks, Exit Readiness one-pager |
| 7 | Boutique Advisors | inconsistent-arr-definitions | 5 | exit_ready | Exit Readiness (white-label) | Frameworks, Exit Readiness ebook |
| 8 | CFO | no-single-source-of-truth | 4 | retention_economics | ARR Snowball Essentials | Blog (ARR Snowballs), Newsletter |
| 9 | RevOps Leader | no-single-source-of-truth | 4 | ai_ops | ARR Snowball + GTM Transformation | Blog (RevOps), For RevOps, AI Prompt & Skill Library |
| 10 | CRO | no-single-source-of-truth | 4 | retention_economics + ai_ops | GTM Transformation | Blog (RevOps), Model Templates |
| 11 | Portfolio Ops | board-prep-fire-drill | 4 | exit_ready | ARR Snowball Portfolio + Exit Readiness | Blog (Frameworks), Model Templates, Board package templates |
| 12 | CFO | board-prep-fire-drill | 4 | exit_ready | ARR Snowball + Exit Readiness | Blog (Frameworks), Newsletter, YouTube |
| 13 | Board & Investors | inconsistent-board-packages | 3 | exit_ready | Exit Readiness | Frameworks |
| 14 | Operating Partner | inconsistent-board-packages | 3 | exit_ready | ARR Snowball Portfolio | LinkedIn posts, Frameworks |
| 15 | Operating Partner | no-portfolio-standardization | 4 | retention_economics | ARR Snowball Portfolio | LinkedIn posts, Frameworks, Model Templates |
| 16 | Portfolio Ops | no-portfolio-standardization | 4 | retention_economics | ARR Snowball Portfolio | Model Templates, Frameworks |
| 17 | Portfolio Ops | different-metric-definitions | 4 | exit_ready | ARR Snowball Portfolio | Frameworks, Blog (ARR Snowballs) |
| 18 | Operating Partner | different-metric-definitions | 4 | exit_ready | ARR Snowball Portfolio | LinkedIn posts, Frameworks |
| 19 | RevOps Leader | data-scattered-across-systems | 4 | ai_ops | ARR Snowball + GTM Transformation | Blog (RevOps), For RevOps, AI Prompt & Skill Library |
| 20 | CFO | data-scattered-across-systems | 4 | retention_economics | ARR Snowball Essentials | Blog (ARR Snowballs), Model Templates |
| 21 | CRO | cant-see-expansion-churn-drivers | 4 | retention_economics + ai_ops | GTM Transformation | Blog (RevOps), Model Templates, Newsletter |
| 22 | CRO | forecast-tribal-knowledge | 3 | ai_ops | GTM Transformation | Blog (RevOps), AI Prompt & Skill Library, For RevOps |
| 23 | Boutique Advisors | arr-not-diligence-ready | 5 | exit_ready | Exit Readiness (white-label) | Frameworks, Exit Readiness ebook, YouTube |
| 24 | CFO | arr-not-diligence-ready | 5 | exit_ready | Exit Readiness | Frameworks, Newsletter, Exit Readiness self-assessment |
| 25 | Operating Partner | arr-not-diligence-ready | 5 | exit_ready | Exit Readiness | LinkedIn posts, Frameworks |
| 26 | Boutique Advisors | late-stage-data-requests | 4 | exit_ready | Exit Readiness (white-label) | Frameworks, Exit Readiness one-pager |
| 27 | Accounting & Consulting | advisory-differentiation | 3 | exit_ready | Exit Readiness (channel partner) | Frameworks, AI Prompt & Skill Library |

**How to query this model:**
- *"What resources should a CFO see on LinkedIn about ARR waterfalls?"* → filter rows where ICP = CFO, Pillar = `retention_economics`, Tier = 1
- *"Which problems justify a Model Templates post?"* → filter rows where Resources include "Model Templates"
- *"Which Frameworks posts need to exist first?"* → filter rows where Resources include "Frameworks" and sort by severity

---

## 6. Resources Taxonomy — The Sublinks

Full taxonomy (8 items). **Items 1–7 ship in Phase 1** to the live WordPress Resources dropdown. **Item 8 is data-model-only for now** — referenced here, deferred from the live nav pending Phase 2 decisions.

| # | Sublink | Route | Content Type | Backing Source | Phase 1 in WP? |
|---|---|---|---|---|---|
| 1 | **Blog** | `/blog/` | All posts | `src/blog/` WordPress | ✅ Yes |
| 2 | **ARR Snowballs** | `/blog/?filter=arr-snowballs` | Filtered blog | Posts tagged `data-category="arr-snowballs"` (6 posts) | ✅ Yes — replaces old "ARR Snowball Guide" link |
| 3 | **Frameworks** | `/blog/?filter=frameworks` | Filtered blog | Posts tagged `data-category="frameworks"` (0 posts — needs seeding) | ✅ Yes — replaces "Templates & Frameworks" |
| 4 | **Model Templates** | `/blog/?filter=model-templates` | Filtered blog (NEW) | Posts tagged `data-category="model-templates"` (NEW category) | ✅ Yes — NEW filter |
| 5 | **Newsletter** | `https://agentsofinsight.substack.com/` | External (new tab) | Substack | ✅ Yes — renamed from "Agents of Insight Newsletter" |
| 6 | **YouTube** | `https://www.youtube.com/@PacerAI` | External (new tab) | YouTube channel | ✅ Yes |
| 7 | **For RevOps** | `/blog/?filter=revops` | Filtered blog | Posts tagged `data-category="revops"` (1 post) | ✅ Yes — persona hub |
| 8 | **AI Prompt & Skill Library** | `04_GTM/prompt-library/index.html` (local source) → future web page | Local HTML index / future page | `04_GTM/prompt-library/` (includes `prompts.json`, `excel-templates/`, `client-prompts/`, `claude-projects/`) | ❌ **NOT in Phase 1.** Phase 2 decides: iframe the local index.html, copy to WP page, or build new `/resources/prompt-library/` page. |

---

## 7. Phased Rollout

### Phase 1 (ships with this document)
- ✅ Create this `resources_data_model.md`
- ✅ 7-link Resources dropdown live on all 7 WordPress pages
- ✅ Blog filter URL auto-select via `?filter=<slug>` query param
- ✅ New "Model Templates" blog filter pill
- ✅ "Coming soon" empty-state for categories with 0 posts

### Phase 2 (follow-up)
- Seed empty filter categories: Frameworks, Model Templates, AI & Agents (1–3 posts each)
- Decide how to surface AI Prompt & Skill Library on the live web:
  - **Option A:** Embed `04_GTM/prompt-library/index.html` via iframe on a new WP page
  - **Option B:** Copy the static HTML content into a WP page and sync manually
  - **Option C:** Build a dedicated `/resources/prompt-library/` WP page that renders `prompts.json` dynamically
- Add AI Prompt & Skill Library link to the Resources dropdown once it has a live URL

### Phase 3 (later)
- Consider dedicated persona landing pages (e.g., `/resources/for-revops/`) if blog filters prove insufficient for SEO/AEO
- Consider a dedicated `/use-cases/<question>/` sub-page per homepage question section for better Google passage ranking

---

## 8. Open Questions

1. **AI Prompt & Skill Library surfacing strategy** — iframe, static copy, or dedicated page? (Phase 2 decision)
2. **Frameworks seeding priority** — which empty category deserves the first post: Frameworks, Model Templates, or AI & Agents?
3. **For RevOps evolution** — stay a blog filter, or upgrade to a dedicated persona landing page?
4. **ICP → Resource mapping automation** — should Section 5 become a generated artifact (read YAML sources + emit Markdown) so it stays in sync as Foundation evolves?

---

## 9. Related Files

- **Plan file (this document):** `docs/plan/resources_data_model.md`
- **PRD (nav spec):** `docs/plan/prd.md`
- **Design reference (canonical HTML):** `docs/design/index-build-long_page_2026_04_03.html`
- **Deploy runbook:** `docs/deploy/runbook.md`
- **Changelog:** `docs/document/changelog.md`
- **Blog source with filter:** `src/blog/index-build.html` (filter pills ~line 634, JS ~line 798)
- **Homepage nav:** `src/homepage/index-build.html` (Resources dropdown ~line 86)
