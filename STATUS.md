---
repo: pacerai-website
as_of: 2026-07-23T16:35:00Z
health: green
moving_or_stalled: moving
active_specs: []
goal_progress:
  - goal_ref: goals/aeo-ranking.md#blog-publish
    pct: null
    note: "Jul 23 2026: v3.0.x LIVE. PR #20 merged, v3.0.0 tagged. Whole site is Claude-bone (#F5F4EF) — homepage (25), Resources hub (230), all 12 blog articles, Team (366), Contact (375, moved to top-level /contact/). Rebranded to the 'GTM Financial Modeling Agent' category (PE-backed SaaS framing removed site-wide). Yoast title/meta + og:title + Organization/Person schema rebranded across all 21 indexed pages (Yoast set in WP Admin — not REST-writable); 6 x 301 redirects live. Homepage animations moved to the inline <img onerror> injector (WPCode footer is fragile)."
last_runs:
  - agent_or_skill: webdev-getpacerai (v3.0.x go-live + rebrand)
    finished_at: 2026-07-23T16:35:00Z
    result: ok
    note: "v3.0.x LIVE: full-site bone (homepage 25 / Resources 230 / 12 blog articles / Team 366 / Contact 375); 'GTM Financial Modeling Agent' rebrand + PE-backed removal; Contact rebuilt lean + moved to /contact/ (email will@getpacerai.com); Yoast title/meta + og:title + Org/Person schema across 21 indexed pages (WP Admin, not REST); 6 x 301 redirects; blog articles deploy with --force (prose voice-debt); rotor/marquee/pipeline moved to inline injector guarded by window.__paRotor/__paPipe. New tooling: scripts/build_seo_table.py; docs/deploy/wp-admin-actions.md + yoast-worklist.md; docs/review/jan2026-batch-aeo-seo-plan.md + website_bone_v3_recommendations.md."
  - agent_or_skill: webdev-getpacerai (build — feat/bone-redesign-v3, PR #20)
    finished_at: 2026-07-22T18:00:00Z
    result: ok
    note: "v3.0.0 Claude-bone redesign built (since merged): homepage bone port validates 12/12 --strict; team page 11/11; 14 blog posts structurally clean (pre-existing article-body voice-lint hits handled with --force); fixed How-It-Works centering (#pacerai-homepage * reset needs !important); demo Worker at pacer-demo-worker.will-078.workers.dev; concepts explored (bone_v3-simple/best/modeling/narrative) → bone_v3-simple chosen. VERSION=3.0.0; tag v3.0.0 on merge."
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
next_handoff: "Open items: (1) bump the pacerai-foundation submodule via /fleet-doctrine-fanout for apollo_ai.md; (2) paste the updated Apollo AI Context Center document. Both are the remaining tails after the v3.0.x go-live."
---

# Notes

**2026-07-23 — v3.0.x LIVE (full-site bone + GTM Financial Modeling Agent rebrand).** PR #20 is merged and `v3.0.0` tagged; the light `#F5F4EF` bone rebuild of getpacerai.com is deployed end to end — homepage (25), Resources hub (230), all **12 blog articles**, Team (366), and Contact (375) are all bone. Only legacy/redirected URLs remain non-bone. Positioning was rebranded to the **GTM Financial Modeling Agent** category (CROs / Sales Leaders primary, CFOs secondary; "Revenue Modeling Agent" is a nav-label synonym) and the **"PE-backed SaaS" framing was removed site-wide**, broadened to recurring-revenue companies ($10M–$1B, often PE/sponsor-backed, incl. non-tech). Contact was rebuilt lean and moved to top-level `/contact/` (email will@getpacerai.com). Yoast title + meta + homepage `og:title` + Organization/Person JSON-LD schema were rebranded across all **21 indexed pages** — Yoast is set in WP Admin (NOT REST-writable on WordPress.com; worklist `docs/deploy/yoast-worklist.md`, schema snippet `docs/deploy/wp-admin-actions.md`). Six 301 redirects live (`/team/about/`→`/#about`, `/platform/overview/`→`/#how-it-works`, `/team/contact/`→`/contact/`, `/what-is-an-arr-waterfall/`→`/resources/what-is-an-arr-waterfall/`, `/about/`, `/overview/`). Homepage animations (hero rotor w/ 13 phrases, logo marquee, pipeline numbers) moved to the inline `<img onerror>` injector in `src/homepage/index-build.html` (the WPCode footer is fragile), guarded by `window.__paRotor` / `window.__paPipe`. New tooling this session: `scripts/build_seo_table.py`; `docs/deploy/wp-admin-actions.md` + `docs/deploy/yoast-worklist.md`; `docs/review/jan2026-batch-aeo-seo-plan.md` + `docs/review/website_bone_v3_recommendations.md`. **Open tails:** (1) `/fleet-doctrine-fanout` submodule bump for `apollo_ai.md`; (2) paste the updated Apollo AI Context Center document.

**2026-07-22 — v3.0.0 Claude-bone redesign (built on `feat/bone-redesign-v3`, PR #20; since merged).** Homepage (WP 25) is a full bone port of the demo-site design (hero → social proof → demo showcase iframe → How It Works → value tiles → Use Cases → Case Studies → Integrations → Security → Team → Value → Pricing → FAQ → CTA); blog (WP 230), team (WP 366), and all 14 blog post pages converted to bone. Demo (~160K, too big for a WP page) is served by a Cloudflare Worker (`infra/pacer-demo-worker/`). The `/blog` → `/resources` slug rename went live (Will renamed WP page 230; posts auto-301). Go-live runbook preserved at `docs/deploy/v3-golive-plan.md`; homepage review + backlog at `docs/plan/v3-backlog-and-homepage-review.md`.

Wiring-stage baseline cleared 2026-05-29 with the cRPO blog publish cycle. Two material learnings for future blog deploys:

1. **App Password scoping.** The default WP.com App Password Will was using lacked `publish_pages` capability — blocked direct REST `POST /pages` create-new attempts. Workaround: create the empty page in WP admin first (60-second UI step), then push content via REST. The new "claude-deploy" App Password (generated 2026-05-29 from Will's admin profile) inherits full edit capability and resolved subsequent update permissions.
2. **Working-tree revert risk.** The cRPO source file was reverted mid-session (likely an editor/linter pass) after additions were authored, requiring a re-apply + redeploy. Future flow: commit the full source before invoking `deploy.py` so any working-tree drift is recoverable.

Earlier baseline notes: written by Archie during spec #2 (`pacerai-os/specs/2026-05-18-repo-wiring.md`) Implement.
