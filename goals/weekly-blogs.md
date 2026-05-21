---
name: weekly-blogs
status: active
owner: aeo-writer subagent (in pacerai-gtm) → Will (review gate)
created: 2026-05-21
depends_on: []
---

# GOAL: Weekly blog cadence — 3 new blogs per week on pacerai-website

## 1. The goal

A sustained blog-publication cadence on `pacerai-website`: **3 new blog posts per week**, lands on `pacerai-website/src/blog/posts/` (or similar publication surface). Each blog publish is logged in `TASK-LOG.md` with a `(count: N)` annotation so the goal-accountability-matrix can roll up real publication volume across the five rollup windows.

This is the **operational predecessor to AEO ranking**. Sustained blog volume is the upstream condition that makes AEO ranking possible — the answer engines need *something* to find on the domain. The earlier `aeo-ranking.md` goal (now archived; see §8) tracked the outcome; this goal tracks the input cadence that makes the outcome possible.

## 2. Why it matters now

Pacer AI's go-to-market motion sells against a narrative of five anchor topics (ARR Waterfalls, ARR Snowballs, Upsell, Cross-sell, White-space opportunity). When a CFO or Operating Partner asks an LLM "What is an ARR Waterfall?", the answer they get is the first impression of Pacer AI's space. Owning the answer-engine surface for these topics is the inbound version of awareness coverage.

But AEO ranking is a **lagging outcome**, not a leading indicator. The leading indicator is **how many canonical pieces of writing about these topics live on pacerai-website**. The aeo-ranking skill in pacerai-gtm runs a 5-phase playbook (SERP audit → canonical draft → schema markup → off-domain seeding → autoresearch + weekly monitoring), and the drafting phase produces blogs. Three new blogs per week is the input rate that fills the topic coverage.

## 3. Success criteria

- [ ] 3 new blog posts per week, sustained across a full sprint
- [ ] Each blog has schema markup deployed (per the aeo-ranking skill's Phase 3)
- [ ] `TASK-LOG.md` dispatches for `blog-publish` chores are `(count: N)`-annotated per `pacerai-os/contracts/agent-ike-task-dispatch.md` v1.1
- [ ] Per-blog AEO rank tracking (in `pacerai-gtm/pipeline/content/aeo-tracker.yml`) updated weekly via the aeo-ranking skill's Phase 5 monitoring

## 4. Cadence plan

**Per week (target):** 3 new blogs published on pacerai-website.

**Per month (target):** ~12 new blogs (≈ 4 weeks × 3).

**Per quarter (target):** ~36 new blogs. Combined with the aeo-ranking skill's Phases 4–5 (off-domain seeding + monitoring), this volume should yield first-page rankings on multiple of the five anchor-topic query sets.

The mix between *anchor-topic canonical pieces* (ARR Waterfalls, ARR Snowballs, etc.) and *supporting/seeded* pieces (referencing the canonicals) is operator/aeo-writer discretion — the matrix tracks volume, not topic.

## 5. Cadence chores completed

**Source of truth:** `TASK-LOG.md` (this repo's root, per `pacerai-os/contracts/agent-ike-task-dispatch.md` v1.1).

**Operational sources cross-referenced:**

- `pacerai-website/src/blog/posts/` — published surface (file presence = publish event)
- `pacerai-website/src/pillars/` — canonical anchor-topic pages (subset of published blogs)
- `pacerai-gtm/.claude/skills/aeo-ranking/SKILL.md` — the orchestrating skill (5-phase playbook)
- `pacerai-gtm/pipeline/content/aeo-tracker.yml` — per-topic rank state tracker

**Chore types tracked for this goal:**

- `blog-publish` — one dispatch per published blog; `(count: 1)` for a single blog, or `(count: N)` for batch publishes

Counts roll up automatically into the per-repo goal-accountability-matrix via `(count: N)` annotations on TASK-LOG.md close lines.

## 6. Out of scope

- **AEO rank ranking outcomes** — the previous version of this goal (`aeo-ranking.md`, archived 2026-05-21) measured #1-rank achievement. v1.1 of this goal moves to the **input** cadence (blog publication volume). Rank measurement remains operationally useful via the aeo-ranking skill's tracker; it's just not the cadence-trackable goal anymore.
- **Off-domain seeding (Phase 4 of aeo-ranking)** — separate chore type if/when the operator wants to track seeded mentions; not in this goal's scope.
- **Traditional SEO** — keyword density, backlink farming, Google-only ranking. Different mechanic.
- **Paid search / paid social** — different motion; lives in pacerai-gtm.
- **Blog quality scoring** — operator picks.

## 7. Linked specs

| Spec | Status | Notes |
|------|--------|-------|
| `pacerai-os/specs/002-goal-accountability-matrix/spec.md` (#22) | Deployed | The matrix this goal feeds |
| `pacerai-content/goals/content-cadence.md` | active | Adjacent — content team publishes Substack + LinkedIn (3/week); this goal adds 3 blogs/week on the website surface |
| `pacerai-gtm/.claude/skills/aeo-ranking/SKILL.md` | live | Orchestrating skill that produces the blogs and tracks their downstream AEO rank |

## 8. Goal log

| Date       | Event                                                                                            | Note                                                                                                          |
|------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| 2026-05-21 | Goal born under spec #22 (replaces `goals/aeo-ranking.md` which tracked rank outcomes)          | Operator directive: "Website Goal: 3 new blogs every week". Pivots from lagging-outcome (rank) to leading-input (publish volume). |
