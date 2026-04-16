# Product-Enabled Services — Site Build Plan

**Last updated:** 2026-04-06
**Status:** In Progress
**Dashboard:** `04_GTM/website-PacerAI/website-development-dash.html`

---

## Phase 0: Engineering Setup

- [x] Content brief template (`01_Foundation/products/_content_brief_template.md`)
- [x] Voice calibration file (`01_Foundation/brand/voice_samples.md`)
- [x] Delivery framework (`01_Foundation/products/delivery_framework.md`)
- [x] Solution page design spec (`04_GTM/website-PacerAI/docs/plan/solution_page_design.md`)
- [x] Solution page HTML template (`04_GTM/website-PacerAI/src/solutions/_template.html`)
- [ ] Build script (`04_GTM/website-PacerAI/scripts/build-solution-page.py`)

---

## Phase 1: Content Briefs (Will writes, ~20 min each)

- [ ] ARR Snowball Reporting — `01_Foundation/products/arr-snowball/content_brief.md`
- [ ] Customer Data Cube — `01_Foundation/products/customer-data-cube/content_brief.md`
- [ ] Transaction Readiness — `01_Foundation/products/transaction-readiness/content_brief.md`
- [ ] RevOps Transformation — `01_Foundation/products/RevOps Transformation/content_brief.md`
- [ ] GTM Transformation — `01_Foundation/products/GTM_Transformation/content_brief.md`
- [ ] FP&A Transformation — `01_Foundation/products/fpa-transformation/content_brief.md`

---

## Phase 2: Solution Pages (Claude builds from brief + template)

### Tier 1 — Full Pages (Priority 1)

| Page | URL | WP ID | Brief | Design | Deploy | Live |
|---|---|---|---|---|---|---|
| ARR Snowball Reporting | `/solutions/arr-snowball-board-reporting-pkg/` | TBD | [ ] | [ ] | [ ] | [ ] |
| Customer Data Cube | `/solutions/customer-data-cube-development/` | 373 (update) | [ ] | [ ] | [ ] | [ ] |

### Tier 2 — Structured Pages (Priority 2)

| Page | URL | WP ID | Brief | Design | Deploy | Live |
|---|---|---|---|---|---|---|
| Transaction Readiness | `/solutions/transaction-readiness-pkg/` | TBD | [ ] | [ ] | [ ] | [ ] |
| RevOps Transformation | `/solutions/revops-transformation-pkg/` | TBD | [ ] | [ ] | [ ] | [ ] |
| GTM Transformation | `/solutions/gtm-transformation-pkg/` | TBD | [ ] | [ ] | [ ] | [ ] |
| FP&A Transformation | `/solutions/fpanda-transformation-pkg/` | TBD | [ ] | [ ] | [ ] | [ ] |

---

## Phase 3: Resource Pages

| Page | URL | WP ID | Status |
|---|---|---|---|
| Blog | `/blog/` | 230 | [x] LIVE |
| ARR Snowball Guide | `/resources/arr-snowball-guide/` | TBD | [ ] |
| Frameworks | `/resources/frameworks/` | TBD | [ ] |
| Model Templates | `/resources/model-templates/` | TBD | [ ] |
| For RevOps | `/resources/for-revops/` | TBD | [ ] |
| Newsletter | `/resources/newsletter/` | TBD | [ ] |
| YouTube | `/resources/youtube/` | TBD | [ ] |

---

## Phase 4: Team Sub-Pages

| Page | URL | WP ID | Status |
|---|---|---|---|
| Team (parent) | `/team/` | 366 | [x] LIVE |
| Mission | `/team/mission/` | TBD | [ ] |
| Partners | `/team/partners/` | TBD | [ ] |
| AI Agents | `/team/ai-agents/` | TBD | [ ] |

---

## Phase 5: Special Pages

| Page | URL | Source | Status |
|---|---|---|---|
| Prompt Library | `/prompt-library/` | `04_GTM/prompt-library/index.html` | [ ] |

---

## Workflow Per Solution Page

1. **Will writes** content brief using `_content_brief_template.md` (~20 min)
2. **Claude reads** content_brief + delivery_framework + solution_page_design + _template.html + voice_samples
3. **Claude builds** design file in `docs/design/solutions/{page}.html`
4. **Will reviews** locally at `http://127.0.0.1:5500/...`
5. **Will provides** batch feedback (all edits in one message)
6. **Claude iterates** and produces production file in `src/solutions/{page}.html`
7. **Claude deploys** to WordPress via REST API
8. **Claude registers** new WP page ID in CLAUDE.md
9. **Will verifies** live URL renders correctly

---

## Key Files

| File | Purpose |
|---|---|
| `01_Foundation/products/_content_brief_template.md` | Template for Will to write expert content |
| `01_Foundation/products/delivery_framework.md` | 4D framework (Diagnose→Design→Deploy→Defend/Drive) |
| `01_Foundation/brand/voice_samples.md` | Voice calibration (GOOD vs BAD examples) |
| `04_GTM/website-PacerAI/docs/plan/solution_page_design.md` | 9-section page template spec |
| `04_GTM/website-PacerAI/src/solutions/_template.html` | HTML shell |
| `04_GTM/website-PacerAI/docs/deploy/runbook.md` | WordPress deploy constraints |
| `04_GTM/website-PacerAI/docs/plan/product-enabled-services.md` | This file |
