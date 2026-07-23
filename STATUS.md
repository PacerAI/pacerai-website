---
repo: pacerai-website
as_of: 2026-07-22T18:00:00Z
health: green
moving_or_stalled: moving
active_specs: []
goal_progress:
  - goal_ref: goals/aeo-ranking.md#blog-publish
    pct: null
    note: "Jul 2026: v3.0.0 Claude-bone light redesign built on branch feat/bone-redesign-v3 (PR #20) — homepage (WP 25) full bone port + blog (WP 230) + team (WP 366) + all 14 blog post pages converted to bone; demo served by Cloudflare Worker (infra/pacer-demo-worker/); /blog → /resources slug rename went live (posts auto-301). NOTHING deployed to the live homepage/inner pages yet — gated on Will's approval + voice pass. Go-live plan: docs/deploy/v3-golive-plan.md."
last_runs:
  - agent_or_skill: webdev-getpacerai (build — feat/bone-redesign-v3, PR #20)
    finished_at: 2026-07-22T18:00:00Z
    result: ok
    note: "v3.0.0 Claude-bone redesign built (NOT deployed — gated on Will): homepage bone port validates 12/12 --strict; team page 11/11; 14 blog posts structurally clean (pre-existing article-body voice-lint hits await Will's voice pass); fixed How-It-Works centering (#pacerai-homepage * reset needs !important); demo Worker at pacer-demo-worker.will-078.workers.dev; concepts explored (bone_v3-simple/best/modeling/narrative) → bone_v3-simple chosen. VERSION=3.0.0; tag v3.0.0 on merge."
  - agent_or_skill: webdev-getpacerai (WP slug change — live)
    finished_at: 2026-07-22T17:00:00Z
    result: ok
    note: "Blog (WP 230) slug blog → resources (Will's change in WP admin); posts auto-301; /blog/ → /resources/ redirect added; all source links now /resources/. Runbook: docs/deploy/blog-to-resources-rename.md."
  - agent_or_skill: webdev-getpacerai (deploy.py)
    finished_at: 2026-05-29T11:18:00Z
    result: ok
    note: "Blog Index (WP 230) — added Diligence pill + cRPO card at position 1; --force used to bypass 3 pre-existing voice violations in older cards"
  - agent_or_skill: webdev-getpacerai (deploy.py)
    finished_at: 2026-05-29T10:34:00Z
    result: ok
    note: "cRPO Blog (WP 865) — re-deployed after restoring Bridging-cRPO section + 7-company source-link bullets following an accidental working-tree revert; validation 11/11"
  - agent_or_skill: webdev-getpacerai (deploy.py)
    finished_at: 2026-05-29T10:24:00Z
    result: ok
    note: "cRPO Blog (WP 865) — first content push after manual-create in WP admin; ID 865 wired into CLAUDE.md + scripts/deploy.py PAGE_REGISTRY; new App Password (claude-deploy) generated to bypass App-Password REST permission gating"
blockers: []
next_handoff: "Will's approval to go live with v3.0.0 (feat/bone-redesign-v3 / PR #20). Follow docs/deploy/v3-golive-plan.md for the deploy sequence (WP prep: deploy demo Worker, blank the old WPCode Header CSS, paste footer.js, 301s, /resources slug); voice pass on the 4 draft homepage sections + blog post bodies before deploy."
---

# Notes

**2026-07-22 — v3.0.0 Claude-bone redesign (built, NOT deployed).** The light `#F5F4EF` bone rebuild of getpacerai.com is complete on branch `feat/bone-redesign-v3` (PR #20) but gated on Will's approval — nothing is live yet. Homepage (WP 25) is a full bone port of the demo-site design (hero → social proof → demo showcase iframe → How It Works → value tiles → Use Cases → Case Studies → Integrations → Security → Team → Value → Pricing → FAQ → CTA); blog (WP 230), team (WP 366), and all 14 blog post pages converted to bone. Demo (~160K, too big for a WP page) is served by a Cloudflare Worker (`infra/pacer-demo-worker/`). The `/blog` → `/resources` slug rename is the one live change (Will renamed WP page 230; posts auto-301). Deferred to v3.0.x: platform/about/contact bone conversion + voice pass on the 4 draft homepage sections + blog post bodies. Handoff: **Will's go-live approval** per `docs/deploy/v3-golive-plan.md`; homepage review + backlog at `docs/plan/v3-backlog-and-homepage-review.md`.

Wiring-stage baseline cleared 2026-05-29 with the cRPO blog publish cycle. Two material learnings for future blog deploys:

1. **App Password scoping.** The default WP.com App Password Will was using lacked `publish_pages` capability — blocked direct REST `POST /pages` create-new attempts. Workaround: create the empty page in WP admin first (60-second UI step), then push content via REST. The new "claude-deploy" App Password (generated 2026-05-29 from Will's admin profile) inherits full edit capability and resolved subsequent update permissions.
2. **Working-tree revert risk.** The cRPO source file was reverted mid-session (likely an editor/linter pass) after additions were authored, requiring a re-apply + redeploy. Future flow: commit the full source before invoking `deploy.py` so any working-tree drift is recoverable.

Earlier baseline notes: written by Archie during spec #2 (`pacerai-os/specs/2026-05-18-repo-wiring.md`) Implement.
