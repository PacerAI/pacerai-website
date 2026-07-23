# Jan-2026 Blog Batch — AEO/SEO Improvement Plan

**Author:** Claude · **Date:** 2026-07-23 · **Owner:** Will
**Articles:** 227, 236, 244, 288, 264 (all now live + bone under `/resources/`).
**Goal:** turn the weakest five posts into AI-citable, credibility-building assets for the CRO/CFO/PE ICP — win AEO (citations in ChatGPT/Claude/Perplexity/AI Overviews) and category SEO, without diluting the diligence-grade credibility the M&A originals earn.

---

## Diagnosis (grounded in the actual files)

| # | Article | Words | Schema | Citation quality | Verdict |
|---|---------|-------|--------|------------------|---------|
| **227** | What Is an ARR Snowball? | 2,032 | **none** | **Poor** — 25+ links, mostly SEO-farm/vendor blogs (directiveconsulting, eqvista, serpsculpt, marketingltb, arisegtm, proven-saas, focus-digital, getmonetizely, averi.ai, humanr.ai, gofishdigital, adaptcfo) | **Heavy rework** |
| **236** | Prevent Churn in High-Value Accounts | 1,974 | **none** | **Poor** — hibob, averi.ai, selectsoftwarereviews, siroccogroup, tropicapp, softwarepricingguide, partnerfleet, sunbeltatlanta | **Heavy rework** |
| **244** | ARR Snowball Analysis: Expansion Drivers | 1,888 | **none** | **Poor** — drivetrain, successcoaching, younium, **cufinder**, **influenceflow.io**, **orm-tech**, payhawk | **Heavy rework** |
| **288** | Why ARR Waterfall Models Matter | 2,234 | **none** | **Mixed** — has McKinsey (good) but also kaplancollectionagency, breakwaterma, mtlc, clearlyacquired (irrelevant) | **Medium** |
| **264** | Using AI to Enable RevOps | 2,045 | **none** | **N/A** — no external citations; original, well-structured (TL;DR, agent types, build-vs-buy) | **Light — strongest of the five** |

**Three findings that drive the plan:**
1. **Zero of the five have JSON-LD schema.** The strong pillars (`what-is-an-arr-waterfall`, `491`, `comparison`) carry `Article` + `FAQPage` (+ `DefinedTerm`). These five have **none** — the single biggest, fastest AEO miss. All five *already have a visible "Frequently Asked Questions" H2*, so `FAQPage` is free to add.
2. **Citation-stuffing with low-authority domains actively hurts** a PE reader's trust and dilutes link equity. 227/236/244 are the offenders.
3. **No proprietary POV.** Pacer's real edge ($25B+ M&A diligence, 50+ ARR waterfalls, account-product-grain reconciliation, the "reconciles to Finance to the dollar" claim) is absent — replaced by generic third-party stats. That edge is exactly what makes content *citable* and *differentiated*.

---

## The plan — 6 moves, applied across all five (schema first)

### Move 1 — `Article` + `FAQPage` schema *(✅ DONE 2026-07-23 — deployed live)*
**Correction to the diagnosis:** the five *did* have a JSON-LD block, but it was **broken**: the `FAQPage` listed only **2 Q&As that didn't even match the 6 visible questions** (schema said "What is an ARR snowball?" while the page asked "What is a *good* ARR snowball effect…") — a mismatch Google ignores or flags, worse than none — and the `author` was an Organization, not a Person.
**Fixed + deployed:** regenerated each graph programmatically — `FAQPage` now mirrors **all** visible Q&As exactly (6/6/6/6 and 4 for 264), `Article` now has `author` = **Person** (Will Sullivan, ex-PwC M&A / West Point + LinkedIn), real `datePublished`/`dateModified`, 1200×630 `image`, and `mainEntityOfPage`; added `BreadcrumbList` to all five and `DefinedTerm` ("ARR Snowball") to 227. Verified valid + live on all five.

### Move 2 — Answer-first block under each H1 *(AEO extraction)*
Add the site's `aeo-snippet` bolded 40–80-word direct answer immediately under the H1 (as 491/comparison already do), then expand. Each H2 section should open with a self-contained 2–3 sentence answer so any section is independently quotable by an answer engine.

### Move 3 — Replace low-authority citations with authoritative sources *(credibility + link equity)*
**Cut** the SEO-farm/vendor-blog domains (directiveconsulting, eqvista, serpsculpt, marketingltb, arisegtm, proven-saas, getmonetizely, averi.ai, humanr.ai, gofishdigital, adaptcfo, cufinder, influenceflow.io, orm-tech, successcoaching, tropicapp, softwarepricingguide, partnerfleet, siroccogroup, selectsoftwarereviews, sunbeltatlanta, kaplancollectionagency, breakwaterma, mtlc, clearlyacquired). **Replace** with the sources a CFO/PE actually trusts:
- **Retention/expansion/NRR benchmarks:** KeyBanc Capital Markets SaaS Survey, ICONIQ Growth reports, SaaS Capital retention studies, Bessemer State of the Cloud, Benchmarkit (Ray Rike), Maxio/ChartMogul benchmark reports.
- **Strategy/market:** McKinsey (keep the 288 one), Bain, Gartner.
- **Primary sources:** public SaaS **10-Ks / S-1s / investor decks** (Snowflake, Datadog, HubSpot) for real ARR-movement examples.
- **Best of all — Pacer's own:** cite our diligence experience and worked examples (the Semrush×Adobe case study, the CFO quote) via internal links. Aim: **2–5 authoritative citations per article, not 25 weak ones.**

### Move 4 — Inject Pacer's proprietary POV/data *(E-E-A-T + differentiation)*
Add 1–2 paragraphs per article of genuine Pacer perspective the competitors can't copy: the account-product grain, "reconciles to reported revenue," the M&A-diligence lens, "the same models we built across $25B+ of diligence." Thread the canonical **"GTM Financial Modeling Agent"** positioning (+ "runs in Claude") into each intro. This is what makes the piece *the* citable source, not one of fifty.

### Move 5 — Internal linking + HITL CTA *(topical authority + conversion)*
- Link each spoke **up to a hub/pillar** and **laterally to siblings** with descriptive anchors: 227/244 ↔ `what-is-an-arr-waterfall`, `board-quality-arr-snowballs`, Semrush case study; 236 ↔ churn/retention pillars; 288 ↔ `what-is-an-arr-waterfall` (differentiate: 288 = *why it matters*, waterfall = *what/how*); 264 ↔ `why-llms-cant-build-your-arr-snowball`.
- Vary the generic post-CTA ("See Your ARR Snowball. Live.") to fit each topic; the **"Talk to a Pacer AI advisor →"** HITL CTA is already added to 227/236/244/288.

### Move 6 — Yoast title/meta per article *(SERP + AI snippet)*
Front-load the target keyword; benefit-led meta ≤155 chars. Targets:

| # | Target keyword | Suggested title |
|---|----------------|-----------------|
| 227 | "ARR snowball" (definitional) | `What Is an ARR Snowball? Definition + How to Build One \| Pacer AI` |
| 236 | "prevent SaaS churn / churn early-warning" | `Prevent Churn in High-Value Accounts: 5 Early-Warning Signals \| Pacer AI` |
| 244 | "ARR expansion drivers / expansion revenue" | `ARR Expansion Drivers: Find Them at the Customer-Product Grain \| Pacer AI` |
| 288 | "ARR waterfall model" | `ARR Waterfall Models: Why They Matter for SaaS Growth \| Pacer AI` |
| 264 | "RevOps AI agents / AI for RevOps" | `AI for RevOps: Agents That Don't Break Your GTM \| Pacer AI` |

---

## Sequence & effort

**Phase 1 — schema sweep (do first, ~1 hr total, no copy risk):** Move 1 on all five + Move 2 answer-first blocks. Biggest AEO gain for least effort; ships immediately (structural, no voice-lint exposure).

**Phase 2 — citation + POV pass (the real rework):** Moves 3–4 on **227, 236, 244** (the citation-stuffed three) first, then **288** (lighter — mostly prune the 4 irrelevant links + add benchmarks). Each is a genuine editorial pass; pair with the voice cleanup (below) so they can move into the normal validated deploy path.

**Phase 3 — polish:** Moves 5–6 (internal links, CTAs, Yoast) across all five. **264 needs only Phase 1 + Move 6** — it's already original and well-structured; don't over-edit it.

**Bundle the voice cleanup here.** These five carry the pre-existing banned words ("leverage", "utilize", "framework", "journey", …) that block `validate.py`. Fix them during the Phase 2 editorial pass so the articles rejoin the normal (validated, non-`--force`) deploy path.

## Measurement
Track monthly: (1) does getpacerai.com get cited when you ask ChatGPT/Claude/Perplexity the target questions ("what is an ARR snowball?", "how do I prevent SaaS churn?"); (2) Search Console impressions/position for the target keywords; (3) `dateModified` freshness. Answer engines re-crawl structural changes in days (Perplexity) to a few weeks (Claude/AI Overviews).

---

## Open question for Will
Want me to **execute Phase 1 (the schema sweep) now** across all five — it's low-risk, structural, and the highest AEO ROI — and leave Phases 2–3 (editorial + voice) for a focused content session? Or hold the whole thing for one pass?
