---
name: aeo-ranking
status: active
owner: magnet + aeo-writer subagents (in pacerai-gtm) → Will (review gate)
created: 2026-05-21
depends_on: []
targets:
  - id: blogs
    label: Blogs created
    per_week: 3
---

# GOAL: AEO #1 ranking for the five anchor topics

## 1. The goal

`pacerai-website` ranks #**1** on AEO (Answer Engine Optimization) across GPT, Claude, Perplexity, Google AI Overviews, and Gemini for the five anchor topics that frame Pacer AI's product narrative: **ARR Waterfalls, ARR Snowballs, Upsell, Cross-sell, and White-space opportunity**. The work is executed via the `/aeo-ranking` skill at `pacerai-gtm/.claude/skills/aeo-ranking/SKILL.md` (the 5-phase playbook: SERP audit → canonical draft → schema → off-domain seeding → autoresearch loop → weekly monitoring). Every skill invocation that produces ranked content or moves the per-topic tracker is logged in `TASK-LOG.md` with a `(count: N)` annotation so the goal-accountability-matrix can roll up activity across the five rollup windows.

## 2. Why it matters now

Pacer AI's go-to-market motion sells against a specific narrative: ARR Waterfalls (the revenue-bridge concept), ARR Snowballs (the compounding-expansion mirror), and the three plays that drive Snowball outcomes — Upsell, Cross-sell, and White-space opportunity. When a CFO or Operating Partner asks an LLM "What is an ARR Waterfall?" or "How do I find white-space opportunity in my portfolio?", the answer they get is the first impression of Pacer AI's space — *before* any outbound DM, before any LinkedIn post. **Owning the answer-engine surface for these five topics is the inbound version of awareness coverage**: it gets Pacer AI's framing in front of the buyer at the exact moment they're asking the question.

The aeo-ranking skill is the operational mechanism. It runs the 5-phase playbook (SERP audit, canonical draft on `pacerai-website`, schema markup, off-domain seeding, autoresearch + weekly monitoring) and routes drafting work to the `aeo-writer` subagent and seeding work to the `magnet` subagent. The goal exists to track whether the playbook is being *run on cadence per topic* — because AEO ranking is a sustained-work problem, not a one-shot publish.

## 3. Success criteria

- [ ] **ARR Waterfalls** — rank #1 on GPT, Claude, Perplexity, Google AI Overviews, and Gemini for the query "What is an ARR Waterfall?" (and synonyms)
- [ ] **ARR Snowballs** — rank #1 across the same five engines for "What is an ARR Snowball?" (and synonyms)
- [ ] **Upsell** — rank #1 for "SaaS upsell strategy / playbook" framing (specific query set determined by the aeo-ranking skill's SERP audit phase)
- [ ] **Cross-sell** — rank #1 for SaaS cross-sell framing (specific queries per SERP audit)
- [ ] **White-space opportunity** — rank #1 for "PE portfolio white-space" / "ARR white-space analysis" framing (specific queries per SERP audit)
- [ ] Per-topic canonical pages live on `pacerai-website` with full schema markup
- [ ] Weekly monitoring loop running across all 5 topics (per-topic tracker updated weekly via aeo-ranking step 5)
- [ ] `TASK-LOG.md` dispatches for `aeo-rank-check`, `aeo-content-publish`, `aeo-schema-update`, and `aeo-monitor-update` chores are annotated with `(count: N)` per `pacerai-os/contracts/agent-ike-task-dispatch.md` v1.1
- [ ] Rank position tracked over time per engine per topic (the truth source is the aeo-ranking skill's per-topic tracker, e.g. `pacerai-gtm/pipeline/content/aeo-tracker.yml`)

## 4. Cadence plan

**Per week (target, per topic):**

- **1 aeo-rank-check** dispatch per topic per engine — confirms current rank, captures the rank-position number, identifies what's #1, what changed (`/aeo-ranking` step 5 monitoring)
- **As-needed aeo-content-publish** — when the autoresearch loop or SERP audit surfaces a content gap, draft a new canonical or supporting page on pacerai-website
- **As-needed aeo-schema-update** — when an LLM's answer-shape changes (Schema.org evolves; LLMs change citation patterns), update the per-topic schema markup

**Per topic, baseline cadence:**

- **Phase 1 (SERP audit):** 1× per topic, at goal start
- **Phase 2 (canonical draft + publish):** 1× per topic, lands on `pacerai-website/src/blog/posts/` or `pacerai-website/src/pillars/` or similar
- **Phase 3 (schema markup):** 1× per topic, often bundled with Phase 2
- **Phase 4 (off-domain seeding):** ongoing — 2–4 seeded mentions per topic per month (LinkedIn posts that cite the pacerai-website canonical; guest content; community answers that link back)
- **Phase 5 (autoresearch + weekly monitoring loop):** weekly, ongoing — 5 topics × 5 engines = 25 rank-checks/week at steady state

**Per quarter (target):**

- All 5 topics through Phases 1–4 inside the first 4 weeks of activation
- ~325 rank-checks (~25/week × 13 weeks) at steady state, with rank position tracked over time per topic per engine
- Per-topic content refresh as the LLMs evolve their answer patterns (typically 1× per quarter per topic)

## 5. Cadence chores completed

**Source of truth:** `TASK-LOG.md` (this repo's root, per `pacerai-os/contracts/agent-ike-task-dispatch.md` v1.1).

**Operational sources cross-referenced:**

- `pacerai-gtm/.claude/skills/aeo-ranking/SKILL.md` — the playbook; the orchestrating skill
- `pacerai-gtm/.claude/skills/aeo-ranking/playbooks/aeo-ranking.yml` — the 5-phase definition the skill executes
- `pacerai-gtm/pipeline/content/aeo-tracker.yml` — per-topic state tracker referenced by the skill
- `pacerai-website/src/blog/posts/` and `pacerai-website/src/pillars/` — the on-domain published surface
- The `aeo-writer` and `magnet` subagents — drafting and seeding workers respectively

**Chore types tracked for this goal:**

- `aeo-rank-check` — one dispatch per topic per engine check; `(count: 1)` for a single-topic-single-engine check, or `(count: N)` for a batch (e.g., one weekly run checks 5 topics × 5 engines → `(count: 25)`)
- `aeo-content-publish` — one dispatch per canonical or supporting page published; `(count: 1)`
- `aeo-schema-update` — one dispatch per schema markup deployment; `(count: 1)`
- `aeo-off-domain-seed` — one dispatch per off-domain seeded mention; `(count: 1)` or `(count: N)` for batch
- `aeo-monitor-update` — one dispatch per tracker-state refresh (per-topic rank update); `(count: 1)`

Counts roll up automatically into the per-repo goal-accountability-matrix via `(count: N)` annotations on TASK-LOG.md close lines.

## 6. Out of scope

- **Traditional SEO** — keyword density, backlink farming, Google-only ranking. AEO is the focus; classical SEO has a different mechanic and a different operating system. If they happen to align, fine — but traditional SEO is not what success here is measured against.
- **Branded keyword ranking** — "Pacer AI", "Will Sullivan Pacer AI" are out of scope; those are already #1 by construction. The five anchor topics are *category* questions where the buyer doesn't yet know Pacer AI exists.
- **Paid search / paid social** — AEO is the organic-discovery surface. Paid is a different motion and lives in `pacerai-gtm`.
- **Topic strategy beyond the 5 anchors** — adding a 6th, 7th, 8th anchor topic is a future goal. v1.0 scope is locked at the 5 listed in §1.
- **Conversion from rank → meeting → opportunity** — that math belongs in `pacerai-gtm/goals/outbound-cadence.md` (the funnel that catches inbound AEO-driven traffic). This goal is upstream: it produces *aware visitors*, not opportunities.
- **Pre-existing in-flight work** — the `spec-22-readme-template-adoption` branch and other parallel work on this repo do not need to wait for this goal to land; they are independent.

## 7. Linked specs

| Spec | Status | Notes |
|------|--------|-------|
| `pacerai-os/specs/002-goal-accountability-matrix/spec.md` (#22) | Implement phase 6 | The matrix this goal feeds |
| `pacerai-gtm/goals/outbound-cadence.md` | active | Downstream consumer — AEO inbound feeds the same awareness funnel the GTM outbound motion fills from the other direction |

## 8. Goal log

| Date       | Event                                                                                  | Note                                                                                                          |
|------------|----------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| 2026-05-21 | Goal born under spec #22 T-website — third v1.1-shaped goal file in the fleet         | Adopts goals schema v1.1 directly (no v1.0 → v1.1 migration; this repo had no goals/ before). Operational mechanism is the aeo-ranking skill in pacerai-gtm. |
