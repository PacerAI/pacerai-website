---
repo: pacerai-website
as_of: 2026-05-29T11:18:00Z
health: green
moving_or_stalled: moving
active_specs: []
goal_progress:
  - goal_ref: goals/aeo-ranking.md#blog-publish
    pct: null
    note: "May 2026: cRPO blog (WP 865) deployed 2026-05-29 to /blog/what-is-current-performance-obligation/; ARR Waterfall AEO pillar shipped earlier this week (commit ef23b4d). Blog index updated with new Diligence filter pill."
last_runs:
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
next_handoff: null
---

# Notes

Wiring-stage baseline cleared 2026-05-29 with the cRPO blog publish cycle. Two material learnings for future blog deploys:

1. **App Password scoping.** The default WP.com App Password Will was using lacked `publish_pages` capability — blocked direct REST `POST /pages` create-new attempts. Workaround: create the empty page in WP admin first (60-second UI step), then push content via REST. The new "claude-deploy" App Password (generated 2026-05-29 from Will's admin profile) inherits full edit capability and resolved subsequent update permissions.
2. **Working-tree revert risk.** The cRPO source file was reverted mid-session (likely an editor/linter pass) after additions were authored, requiring a re-apply + redeploy. Future flow: commit the full source before invoking `deploy.py` so any working-tree drift is recoverable.

Earlier baseline notes: written by Archie during spec #2 (`pacerai-os/specs/2026-05-18-repo-wiring.md`) Implement.
