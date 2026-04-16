# Solution Page Design — Canonical Template

**Status:** Phase 1 spec (docs + shell template). No live deploy yet.
**Date:** 2026-04-05
**Companion file:** `src/solutions/_template.html` (the HTML shell this spec describes)
**Canonical frameworks:** Diagnose → Design → Deploy → **Defend** (Transaction) · Diagnose → Design → Deploy → **Drive** (Transformation)

---

## 1. Purpose

This document defines the canonical structure for every Pacer AI solution page. Its goal is threefold:

1. **Ship consistent, high-converting solution pages** — every page follows the same customer-centric narrative arc (empathy → foresight → expert → method → proof) so buyers recognize the brand and sales knows what to expect.
2. **Feed Apollo outreach sequences** — each section of the page is designed to yield a snippet that can be reused verbatim in an email, LinkedIn post, or objection response. The page IS the sales enablement library.
3. **Enable AI-assisted population** — the template is structured so Claude (or any LLM) can mechanically fill it from `01_Foundation/content_library/`, `01_Foundation/customers/icp-problems.yml`, and `01_Foundation/products/` with minimal human rewriting.

---

## 2. Two Delivery Frameworks (Back-end)

Every Pacer AI solution ships under one of two 4-step delivery frameworks. The first three steps are identical; the fourth step differs by category so the language matches what the buyer actually cares about.

### 2a. Transaction Solutions → **Diagnose → Design → Deploy → Defend**

For solutions where the end-state is a **board meeting, buyer, or diligence team defending a number**. These buyers care about "will this survive scrutiny?"

| Solution | WP Page | Primary ICP |
|---|---|---|
| Customer Data Cube | `/solutions/customer-data-cube/` (exists) | CFO, RevOps Leader |
| ARR Snowball Reporting | `/solutions/arr-snowball-board-reporting/` (exists) | CFO, Operating Partner |
| Transaction Readiness Package | `/solutions/transaction-readiness/` (NEW) | CFO, Boutique Advisors, Operating Partner |
| Exit Readiness Service (partner w/ Veach AI) | `/solutions/exit-readiness/` (NEW) | CFO, Boutique Advisors |

### 2b. Transformation Solutions → **Diagnose → Design → Deploy → Drive**

For solutions where the end-state is **ongoing operational change — new motions, new teams, new cadences**. These buyers care about "will this keep moving after you leave?"

| Solution | WP Page | Primary ICP |
|---|---|---|
| RevOps Transformation | `/solutions/revops-transformation/` (NEW) | Head of RevOps, CRO, Operating Partner |
| GTM Transformation | `/solutions/gtm-transformation/` (NEW) | CRO, Operating Partner |
| FP&A Transformation | `/solutions/fpa-transformation/` (NEW) | CFO, FP&A Director |

### 2c. Why two endings, not one

| Word | Audience signal | When it lands |
|---|---|---|
| **Defend** | "I need to survive diligence / board / audit" | Transaction-oriented buyers (exit, fundraise, acquisition) |
| **Drive** | "I need ongoing motion and performance" | Transformation buyers (RevOps, GTM, FP&A rebuilds) |

One framework wouldn't serve both. But **steps 1–3 are identical**, which means the template, prompts, delivery methodology, and internal playbooks are 75% shared.

---

## 3. Page Narrative Arc (Front-end)

**Critical framing:** The 4D framework is the *delivery* backend. The page is *customer-centric*. The page leads with customer pain, proves expert foresight, and only then reveals the 4D method as the expert's answer. The reader's emotional journey is:

```
"You get me."  →  "You see something I don't."  →  "You've earned it."  →  "You have a plan."  →  "Others have won."  →  "Let's talk."
   Empathy           Foresight                       Authority              The Method         Proof               CTA
```

This maps to 9 sections on the page:

### Section-by-section spec

| # | Section | Purpose | Reader reaction | Chars budget |
|---|---|---|---|---|
| 1 | **Hero** | Name the promise with buyer's language | "This is for me" | ~1,500 |
| 2 | **The Pain (Empathy)** | Show 3 painful realities the buyer already knows | "You get me" | ~2,500 |
| 3 | **The Foresight (Reframe)** | Reveal 1–2 hidden costs only an expert sees | "Oh. I hadn't thought of that" | ~2,500 |
| 4 | **Why an Expert** | Credibility card: Will's background + KPI counters | "You've earned the right to guide me" | ~2,000 |
| 5 | **The Pacer Method** (4D) | Horizontal timeline: Diagnose → Design → Deploy → Defend/Drive | "There's a plan" | ~4,500 |
| 6 | **What You Get** (Deliverables) | 4–6 card grid of concrete outputs | "I know what I'm buying" | ~2,500 |
| 7 | **Proof** | Customer case study + quote + metric | "Others like me have won" | ~2,000 |
| 8 | **FAQ** (AEO) | 5–7 Q&As with plain-text answers | "My objections are handled" | ~3,500 |
| 9 | **CTA** | One clear next step | "Let's talk" | ~1,000 |

**Total content budget: ~22,000 chars.** Plus ~30,000 for inline CSS + 15,000 for nav/footer = ~67,000 total. Under the 69,000 WordPress limit with ~2K buffer.

---

## 4. Section-by-Section Content Requirements

### Section 1 — Hero

**Purpose:** One-breath promise in the buyer's own language.

**Structure:**
```html
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-eyebrow"><span class="dot"></span>{{SOLUTION_NAME}} · {{CATEGORY_TAG}}</div>
  <h1>{{BUYER_PAIN_RESTATED}}<br><em>{{PROMISE_IN_ITALIC}}</em></h1>
  <p class="hero-sub">{{ONE_PARAGRAPH_PROMISE}}</p>
  <div class="hero-ctas">
    <a href="https://calendly.com/pacerai" class="btn-lg">{{PRIMARY_CTA}}</a>
    <a href="#the-pain" class="btn-outline-lg">{{SECONDARY_CTA}}</a>
  </div>
</section>
```

**Content sources:**
- H1 pain → `01_Foundation/customers/icp-problems.yml` (`description` field for primary problem)
- Promise → `01_Foundation/products/{solution}/` product hypothesis
- CTAs → `01_Foundation/commercial/cta-language.yml` (approved CTAs only)

**Example (Exit Readiness):**
> Eyebrow: `Exit Readiness Service · Transaction Solutions`
> H1: `Your ARR Won't Survive Diligence.<br><em>Ours Will.</em>`
> Sub: `M&A-grade ARR, NRR, and cohort reporting — co-built with Veach AI's Quality of Earnings team. Defensible in 30 minutes of diligence, not 30 days.`

### Section 2 — The Pain (Empathy)

**Purpose:** Prove we understand the buyer's day-to-day. No selling yet.

**Structure:**
```html
<section class="section" data-section="the-pain" id="the-pain">
  <div class="section-inner">
    <div class="section-eyebrow">The Reality</div>
    <h2>You know this feeling.</h2>
    <p class="lead">{{PRACTITIONER_POV_LEAD_PARAGRAPH}}</p>
    <div class="problem-grid">
      <div class="problem-card">
        <div class="p-icon">{{EMOJI_OR_SVG}}</div>
        <h4>{{PAIN_TITLE_1}}</h4>
        <p>{{PAIN_DESCRIPTION_1}}</p>
      </div>
      {{REPEAT_3X}}
    </div>
  </div>
</section>
```

**Content sources:**
- 3 pain points → `01_Foundation/customers/icp-problems.yml` (filter by target persona, sort by severity desc, take top 3)
- Lead paragraph → `01_Foundation/content_library/*.md` (practitioner POV files like `Nine challenges I heard from executives going into 2026.md` or `Revenue teams and finance teams don't speak the same language.md`)

**Do:** Use concrete numbers ("20–30 hours per cycle", "60–80% of pre-meeting week")
**Don't:** Sell. Don't mention Pacer AI yet. Don't use "we help" language.

### Section 3 — The Foresight (Reframe)

**Purpose:** Show the buyer something they didn't realize was connected to their pain. This is the "commercial teaching" moment (Challenger Sale). It's where the expert earns the right to be heard.

**Structure:**
```html
<section class="section" style="background:var(--navy-mid);" data-section="the-foresight">
  <div class="section-inner">
    <div class="section-eyebrow">What You Don't See Yet</div>
    <h2>{{HIDDEN_COST_HEADLINE}}</h2>
    <div class="foresight-grid">
      <div class="foresight-card">
        <div class="f-tag">THE STAKES</div>
        <h3>{{HIDDEN_COST_1}}</h3>
        <p>{{EXPERT_EXPLANATION_1}}</p>
      </div>
      <div class="foresight-card">
        <div class="f-tag">THE RISK</div>
        <h3>{{HIDDEN_COST_2}}</h3>
        <p>{{EXPERT_EXPLANATION_2}}</p>
      </div>
    </div>
    <blockquote class="expert-aside">
      "{{WILL_POV_QUOTE}}"
      <cite>— {{ATTRIBUTION}}</cite>
    </blockquote>
  </div>
</section>
```

**Content sources:**
- Hidden costs → `01_Foundation/content_library/PE PortCo questions and answer by will.md`, `01_Foundation/content_library/If I were a CRO I would fight like hell...md`, market-signal PDFs (McKinsey M&A report, SEG 2026 SaaS report)
- Will quote → `01_Foundation/content_library/Wills Background and skillset.md`

**Example (Exit Readiness):**
> H2: `The real cost isn't the diligence — it's the deal you never close.`
> Stakes: `Late-stage data requests derail 30% of deals in our portfolio. Not because the data is wrong — because nobody can produce it fast enough.`
> Risk: `Your buyer's diligence team isn't looking for reasons to say yes. They're looking for reasons to renegotiate price. Every data gap is a $2M–$5M haircut.`
> Quote: `"I spent 7 years at PwC on the buy side. I've seen exactly what makes diligence teams comfortable — and what makes them nervous." — Will Sullivan, Founder`

### Section 4 — Why an Expert

**Purpose:** Authority without bragging. Credentials + receipts.

**Structure:**
```html
<section class="section" data-section="why-expert">
  <div class="section-inner">
    <div class="section-eyebrow">Why a Practitioner, Not a Platform</div>
    <h2>Built by someone who has been <em>in the data room.</em></h2>
    <div class="expert-card">
      <div class="expert-avatar">WS</div>
      <div class="expert-details">
        <h3>Will Sullivan · Founder, Pacer AI</h3>
        <p>Ex-PwC TMT Financial Due Diligence · West Point Graduate</p>
        <div class="expert-tags">
          <span>$25B+ M&amp;A transactions</span>
          <span>40+ Customer Data Cubes built</span>
          <span>50+ ARR Snowballs shipped</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Content sources:**
- Background → `01_Foundation/content_library/Wills Background and skillset.md`
- KPIs → existing homepage hero (`$25B+ M&A`, `40+ Cubes`, `50+ Snowballs`, `$2B+ Revenue analyzed`, `Big 4 PwC TMT`)

**Reuse:** The existing `.expert-card` pattern already lives on the homepage — copy as-is.

### Section 5 — The Pacer Method (4D Framework) ⭐

**This is the section that makes the page sequenceable.** Every Apollo email can map to one step.

**Structure (horizontal 4-step timeline):**
```html
<section class="section" style="background:var(--navy-mid);" data-section="the-method">
  <div class="section-inner">
    <div class="section-eyebrow">The Pacer Method</div>
    <h2>Four steps. {{TOTAL_DURATION}}. <em>One defensible outcome.</em></h2>
    <p class="lead">{{ONE_PARAGRAPH_METHOD_OVERVIEW}}</p>

    <div class="method-timeline">
      <div class="method-step">
        <div class="step-number">1</div>
        <div class="step-label">DIAGNOSE</div>
        <h3>{{DIAGNOSE_HEADLINE}}</h3>
        <p>{{DIAGNOSE_DESCRIPTION}}</p>
        <ul class="step-deliverables">
          <li>{{DELIVERABLE_1}}</li>
          <li>{{DELIVERABLE_2}}</li>
        </ul>
        <div class="step-duration">{{DURATION}}</div>
      </div>
      <div class="method-arrow">→</div>
      <div class="method-step"><!-- DESIGN --></div>
      <div class="method-arrow">→</div>
      <div class="method-step"><!-- DEPLOY --></div>
      <div class="method-arrow">→</div>
      <div class="method-step">
        <div class="step-number">4</div>
        <div class="step-label">{{DEFEND_OR_DRIVE}}</div>
        <h3>{{STEP_4_HEADLINE}}</h3>
        <p>{{STEP_4_DESCRIPTION}}</p>
        <ul class="step-deliverables">...</ul>
        <div class="step-duration">{{DURATION}}</div>
      </div>
    </div>
  </div>
</section>
```

**4D template values (Transaction — Defend variant):**

| Step | Label | Headline (default) | Description (default) | Typical duration |
|---|---|---|---|---|
| 1 | **DIAGNOSE** | Baseline your data | Data source audit, metric definition reconciliation, gap analysis against M&A-grade standard. | 2–4 weeks |
| 2 | **DESIGN** | Build the cube & waterfall | Semantic model, account-product grain, ARR waterfall, NRR/GRR cohorts, board view. | 4–8 weeks |
| 3 | **DEPLOY** | Operationalize | Production refresh cadence, owner handoff, board package template, monthly running cadence. | 2–4 weeks |
| 4 | **DEFEND** | Diligence-ready | QoR/QoE support, buyer data room prep, late-stage data request response, deal defense. | On-demand |

**4D template values (Transformation — Drive variant):**

| Step | Label | Headline (default) | Description (default) | Typical duration |
|---|---|---|---|---|
| 1 | **DIAGNOSE** | Baseline the motion | Current-state audit of org, systems, data, cadence, and pipeline hygiene. | 2–4 weeks |
| 2 | **DESIGN** | Blueprint the new motion | Future-state operating model, tooling stack, agent chain, metrics tree, quota model. | 4–6 weeks |
| 3 | **DEPLOY** | Ship the change | Systems build-out, team enablement, new cadence rollout, pilot team activation. | 8–12 weeks |
| 4 | **DRIVE** | Operate & optimize | Ongoing operating rhythm, weekly pipeline reviews, quarterly model tune-up, expansion plays. | Ongoing |

**Reuse:** Adapt `01_Foundation/brand/components/component-exit-readiness-timeline-horizontal.html` — extract the horizontal timeline CSS (~3K chars minified) and use as the method-timeline pattern. Each solution page embeds it once.

### Section 6 — What You Get (Deliverables)

**Purpose:** Concrete, spec-sheet clarity. Removes ambiguity about scope.

**Structure:** 4–6 card grid. Each card = one deliverable.

```html
<section class="section" data-section="deliverables">
  <div class="section-inner">
    <div class="section-eyebrow">What You Get</div>
    <h2>Specific outputs, not vague promises.</h2>
    <div class="comp-grid">
      <div class="comp-card">
        <div class="c-icon">{{ICON}}</div>
        <h4>{{DELIVERABLE_NAME}}</h4>
        <p>{{ONE_SENTENCE_DESCRIPTION}}</p>
      </div>
      {{REPEAT_4_TO_6_TIMES}}
    </div>
  </div>
</section>
```

**Content sources:**
- `01_Foundation/products/{solution}/` deliverables list
- Existing arr-snowball.html / customer-data-cube.html "Components" section patterns

### Section 7 — Proof

**Purpose:** One compelling customer story. Not a logo wall — a *story* with a metric.

**Structure:**
```html
<section class="quote-section" data-section="proof">
  <div class="quote-inner">
    <div class="section-eyebrow">Customer Story</div>
    <h2>{{ONE_LINE_RESULT_HEADLINE}}</h2>
    <blockquote>
      "{{CUSTOMER_QUOTE}}"
    </blockquote>
    <div class="quote-meta">
      <strong>{{CUSTOMER_ROLE}}</strong> · {{COMPANY_DESCRIPTION}}
    </div>
    <div class="result-metric">
      <div class="metric-value">{{BIG_NUMBER}}</div>
      <div class="metric-label">{{METRIC_DESCRIPTION}}</div>
    </div>
  </div>
</section>
```

**Content sources:** `01_Foundation/content_library/`
- `Customer Case Study - Helped Semrush grow from 21-24% in a down market.md`
- `Customer Case Study - Helped healthtech company grow to 105 NRR.md`
- `Customer Case Study - How I helped a fintech client raise 75M over initial valuation.md`
- `Case Study post - How I helped a CFO achieve over 100% NRR.pdf`

### Section 8 — FAQ (AEO Power Section)

**Purpose:** Two-for-one: handles sales objections AND fuels Google passage ranking + LLM answer engines.

**Structure:** 5–7 collapsible Q&As. Plain-text answers (no HTML inside `<p>` tags). Each Q targets a real search query or a real sales objection.

```html
<section class="section faq-section" data-section="faq">
  <div class="section-inner">
    <div class="section-eyebrow">Frequently Asked Questions</div>
    <h2>Common questions about <em>{{SOLUTION_NAME}}</em></h2>
    <div class="faq-list">
      <details class="faq-item">
        <summary>{{QUESTION_1}}</summary>
        <p>{{ANSWER_1_PLAIN_TEXT}}</p>
      </details>
      {{REPEAT_5_TO_7}}
    </div>
  </div>
</section>
```

**Question types to include (every solution page):**
1. How long does implementation take? *(timeline objection)*
2. What data sources do you integrate with? *(technical feasibility objection)*
3. How is this different from {{major competitor}}? *(competitive objection)*
4. What's the investment? *(price objection — answer with a range, not a number)*
5. Who owns it after you leave? *(sustainability objection — especially important for Transformation solutions)*
6. How do you handle security/SOC2/data residency? *(enterprise gate)*
7. What if our data is a mess? *(confidence gate — the "I'm not ready yet" objection)*

### Section 9 — CTA

**Purpose:** One clear next step. No multi-option paradox.

**Structure:**
```html
<section class="cta-section" data-section="cta">
  <div class="cta-inner">
    <div class="section-eyebrow">Get Started</div>
    <h2>{{ACTION_ORIENTED_HEADLINE}}</h2>
    <p>{{ONE_SENTENCE_PROMISE}}</p>
    <div class="cta-buttons">
      <a href="https://calendly.com/pacerai" class="btn-lg">{{PRIMARY_CTA}}</a>
      <a href="/team/contact/" class="btn-outline-lg">{{SECONDARY_CTA}}</a>
    </div>
  </div>
</section>
```

**CTA language (from `01_Foundation/commercial/cta-language.yml`):**
- Primary (Transaction): "Talk to an M&A-grade RevOps expert →"
- Primary (Transformation): "Map your transformation →"
- Secondary (both): "See a live demo"

---

## 5. Placeholder Token Convention

The template shell uses `{{TOKEN}}` placeholders. Any LLM (or a `build-solution-page.py` script) populating the template should replace every `{{TOKEN}}` from the structured content sources below.

**Standard tokens:**
| Token | Source |
|---|---|
| `{{SOLUTION_NAME}}` | `01_Foundation/products/{solution}/` frontmatter |
| `{{CATEGORY_TAG}}` | `Transaction Solutions` or `Transformation Solutions` |
| `{{DEFEND_OR_DRIVE}}` | `DEFEND` (Transaction) or `DRIVE` (Transformation) |
| `{{PRIMARY_ICP}}` | `01_Foundation/customers/icps.yml` |
| `{{PAIN_TITLE_N}}` / `{{PAIN_DESCRIPTION_N}}` | `01_Foundation/customers/icp-problems.yml` (filtered by persona) |
| `{{HIDDEN_COST_N}}` / `{{EXPERT_EXPLANATION_N}}` | `01_Foundation/content_library/*will*.md` files |
| `{{WILL_POV_QUOTE}}` | Will's practitioner POV markdown files |
| `{{CUSTOMER_QUOTE}}` / `{{BIG_NUMBER}}` | `01_Foundation/content_library/Customer Case Study*.md` |
| `{{DELIVERABLE_N}}` | `01_Foundation/products/{solution}/` feature list |
| `{{QUESTION_N}}` / `{{ANSWER_N_PLAIN_TEXT}}` | FAQ library (Phase 2 — currently write fresh) |

---

## 6. Component Reuse Map

Nothing in this template is net-new CSS. Every pattern already exists somewhere:

| Section | Reused from |
|---|---|
| Nav + footer | `src/solutions/arr-snowball.html` (lines 217–288, 495–546) |
| Hero | `src/solutions/arr-snowball.html` (lines 292–303) |
| Problem grid | `src/solutions/arr-snowball.html` (lines 318–344) |
| Expert card | `src/homepage/index-build.html` `what-is-pacer-ai` section |
| Method timeline (horizontal) | `01_Foundation/brand/components/component-exit-readiness-timeline-horizontal.html` |
| Deliverables card grid | `src/solutions/arr-snowball.html` (Components section) |
| Quote / proof | `src/solutions/arr-snowball.html` (lines 439–447) |
| FAQ collapsibles | `src/solutions/arr-snowball.html` (lines 449–479) |
| CTA | `src/solutions/arr-snowball.html` (lines 481–493) |

**The only genuinely new CSS** is the horizontal 4D method timeline (~3K chars). Everything else is copy-paste.

---

## 7. Population Workflow (Claude-friendly)

When asked to build a new solution page, Claude should follow this sequence:

1. **Read** `docs/plan/solution_page_design.md` (this file) + `src/solutions/_template.html`
2. **Identify** target solution category (Transaction → Defend / Transformation → Drive)
3. **Read foundation sources** for that solution:
   - `01_Foundation/products/{solution}/` — feature list, 4-quarter framework if it exists
   - `01_Foundation/customers/icp-problems.yml` — filter by primary persona, sort by severity
   - `01_Foundation/content_library/` — grep for solution name + persona + relevant case study
4. **Fill every `{{TOKEN}}`** in the template from the sources above
5. **Run** the `docs/deploy/runbook.md` pre-deploy sanitize (remove HTML comments, size check)
6. **Verify** total file size < 69,000 chars before deploying
7. **Deploy** as new WordPress page under parent Solutions (ID 364), record new page ID in `CLAUDE.md` registry
8. **Append** entry to `docs/document/changelog.md`

---

## 8. Apollo Outreach Sequence Mapping

The whole point of this template is that every solution page = one Apollo sequence. Here's how the sections map:

| Apollo Email # | Pulled from section | Email role | Example subject line |
|---|---|---|---|
| 1 (Cold intro) | §2 Pain card #1 | Hook with specific pain | "Re: your {{Q3 board prep}}" |
| 2 (Teach) | §3 Foresight card #1 | Commercial teaching — reframe | "The 30% of deals that die in diligence" |
| 3 (Prove) | §5 DIAGNOSE step | Tease the method | "2 weeks to baseline your ARR data" |
| 4 (Proof) | §7 Customer story | Social proof | "How {{Semrush}} grew 21→24% in a down market" |
| 5 (Ask) | §9 CTA + §8 FAQ excerpt | Close with objection handling | "3 questions we hear before every engagement" |

**Signal-based triggering (Inven.io integration):**
- Signal: "PE-backed SaaS, 4+ years since last transaction" → enroll in **Exit Readiness** sequence
- Signal: "RevOps leader hired in last 90 days" → enroll in **RevOps Transformation** sequence
- Signal: "New CFO, $100M–$500M ARR" → enroll in **ARR Snowball** sequence
- Signal: "Series C+ PE-backed SaaS, no board-grade reporting" → enroll in **Customer Data Cube** sequence

---

## 9. Phased Rollout

### Phase 1 (ships with this document)
- ✅ `docs/plan/solution_page_design.md` (this file)
- ✅ `src/solutions/_template.html` (the shell)
- ❌ No live WP deploy yet — template is internal scaffolding

### Phase 2 (first real page — recommended: Exit Readiness)
- Copy `_template.html` → `src/solutions/exit-readiness.html`
- Populate all `{{TOKENS}}` from `01_Foundation/products/transaction-readiness/` + content library
- Create new WP page under Solutions parent (ID 364)
- Deploy, verify, add to nav
- **This is the validation run** — if the template works for Exit Readiness, it works for all 7.

### Phase 3 (upgrade existing pages)
- Retrofit `src/solutions/arr-snowball.html` and `src/solutions/customer-data-cube.html` to the new 9-section arc with the Defend framework. Preserve existing content but reorganize into the new structure.

### Phase 4 (ship remaining solutions)
- Transaction Readiness Package (`Defend`)
- RevOps Transformation (`Drive`)
- GTM Transformation (`Drive`)
- FP&A Transformation (`Drive`)

### Phase 5 (Apollo wiring)
- Build Apollo sequence for each solution page, pulling snippets from the 9 sections
- Wire Inven.io signal triggers → sequence enrollment

---

## 10. Success Criteria

A solution page is "done" when it passes all of these checks:

| Check | Pass criterion |
|---|---|
| Customer-centric arc | Reader experiences empathy → foresight → authority → method → proof → CTA in that order |
| Framework clarity | 4D method section uses correct variant (Defend for Transaction, Drive for Transformation) |
| Content provenance | Every `{{TOKEN}}` is populated from a real source file, not invented |
| AEO readiness | ≥5 FAQs with plain-text answers; definition card present in §1 or §2 |
| Size budget | File < 69,000 chars before deploy |
| Apollo readiness | Can map §2, §3, §5, §7, §9 each to a distinct email in an outreach sequence |
| Brand voice | Uses approved language from `01_Foundation/brand/voice.yml` and `commercial/cta-language.yml` |
| Waterfall compliance | No content duplicated from `01_Foundation` — all references point upstream |

---

## 11. Open Questions

1. **Method timeline visual:** Should we use a horizontal 4-step cards layout (simpler, smaller), or adapt the richer vertical timeline from `component-exit-readiness-timeline.html`? Recommendation: horizontal for first page (proves pattern at lower cost), vertical if horizontal feels too thin.
2. **Exit Readiness vs. Transaction Readiness:** Are these the same offering or two separate solutions? Currently planned as separate. Will to confirm.
3. **Solution card icons:** Keep emoji (current arr-snowball.html pattern) or switch to SVG-only (matches nav mega-dropdown style)?
4. **Price ranges in FAQ:** Disclose ranges publicly or keep "contact us"? Recommendation: ranges drive qualified inbound and improve AEO.

---

## 12. Related Files

- **Template shell:** `src/solutions/_template.html`
- **Existing reference pages:** `src/solutions/arr-snowball.html`, `src/solutions/customer-data-cube.html`
- **Canonical framework source:** `01_Foundation/products/transaction-readiness/exit-readiness.md` (4-quarter framework = DDDDefend)
- **Resources data model:** `docs/plan/resources_data_model.md` (ICP → Problem → Pillar → Solution → Resource mapping)
- **Deploy runbook:** `docs/deploy/runbook.md`
- **Brand components library:** `01_Foundation/brand/components/` (22 pre-built HTML snippets)
- **Content library:** `01_Foundation/content_library/` (71 files — pain signals, case studies, Will's POV)
