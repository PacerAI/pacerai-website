# TASK-LOG.md

Append-only log of task dispatches received by this repo. See
`pacerai-os/contracts/agent-ike-task-dispatch.md` for the shape:
one header line per task `[<ISO-timestamp>] <skill_id>: <description> (goal: <link|—>)`
plus one mandatory closing line `  → closed|escalated-to-spec <ISO-timestamp>, <outcome|reason>`.

[2026-05-20T19:30:02Z] provision-task-log: bootstrap TASK-LOG.md (goal: pacerai-os/goals/three-mode-gate.md#sc-006)
  → closed 2026-05-20T19:30:02Z, TASK-LOG.md provisioned

[2026-05-29T10:24:00Z] webdev-getpacerai: deploy cRPO blog post — create WP page 865 + push content (goal: goals/aeo-ranking.md#blog-publish)
  → closed 2026-05-29T10:24:00Z, "What is cRPO? The Operator's Guide to Current Remaining Performance Obligations" deployed to https://getpacerai.com/blog/what-is-current-performance-obligation/ via REST API (WP ID 865, parent 230 Blog); registry wired in CLAUDE.md + scripts/deploy.py; validation 11 pass / 0 warn / 0 fail (count: 1, id: blogs)

[2026-05-29T10:34:00Z] webdev-getpacerai: re-deploy cRPO blog post — restore Bridging-cRPO section + 7-company link bullets after accidental working-tree revert (goal: goals/aeo-ranking.md#blog-publish)
  → closed 2026-05-29T10:34:00Z, full version re-applied + redeployed to WP ID 865; validation 11 pass / 0 warn / 0 fail; live page now contains Bridging-cRPO section + Workday/ServiceNow/Atlassian/Salesforce/Snowflake/Datadog/MongoDB inline source links (count: 1, id: blogs)

[2026-05-29T11:18:00Z] webdev-getpacerai: add cRPO card + Diligence filter pill to blog index — deploy WP ID 230 (goal: goals/aeo-ranking.md#blog-publish)
  → closed 2026-05-29T11:18:00Z, new "Diligence" filter pill added to category-bar + cRPO card slotted at position 1 of blog-grid; deployed to https://getpacerai.com/blog/ via REST API; --force used to bypass 3 pre-existing voice violations in older cards (count: 1, id: blogs)

[2026-05-28T11:00:00Z] blog: what-is-current-performance-obligation (goal: —)
  → closed 2026-05-28T11:00:00Z, published https://getpacerai.com/blog/what-is-current-performance-obligation/ (count: 1, id: blogs)

[2026-05-29T11:00:00Z] blog: what-is-an-arr-waterfall (goal: —)
  → closed 2026-05-29T11:00:00Z, published https://getpacerai.com/blog/what-is-an-arr-waterfall/ (count: 1, id: blogs)

[2026-06-02T11:00:00Z] blog: semrush-adobe-case-study (goal: —)
  → closed 2026-06-08T19:00:00Z, published https://getpacerai.com/semrush-adobe-acquisition-case-study/ (WP page 888, listing 230) — Adobe×Semrush M&A carousel ported to blog: 9 visuals (4 charts rendered from source HTML + 2 product maps + 3 headshots), all tables verbatim, tagged Case Study/M&A/RevOps; runbook at docs/ADBE_SEMR_case_study.md; Yoast title/desc pending (WP MCP offline) (count: 1, id: blogs)

[2026-07-22T18:00:00Z] webdev-getpacerai: build v3.0.0 "Claude-bone" light redesign of getpacerai.com — full bone port of homepage (WP 25) from the demo-site design + blog (WP 230) + team (WP 366) + all 14 blog post pages converted to bone; Cloudflare Worker demo host (infra/pacer-demo-worker/); /blog → /resources slug rename (live) + redirect; go-live plan (goal: goals/aeo-ranking.md#blog-publish)
  → closed 2026-07-23T16:35:00Z, PR #20 merged + v3.0.0 tagged; shipped in the v3.0.x go-live below

[2026-07-23T16:35:00Z] webdev-getpacerai: v3.0.x go-live + GTM Financial Modeling Agent rebrand — full-site bone go-live (homepage 25 / Resources hub 230 / all 12 blog articles / Team 366 / Contact 375); "GTM Financial Modeling Agent" rebrand + PE-backed removal site-wide; Contact rebuilt lean + moved to top-level /contact/ (email will@getpacerai.com); Yoast title/meta + og:title + Organization/Person schema rebranded across 21 indexed pages (WP Admin — Yoast not REST-writable); 6 x 301 redirects; homepage animations moved to inline <img onerror> injector (WPCode footer fragile); new tooling (scripts/build_seo_table.py, docs/deploy/wp-admin-actions.md + yoast-worklist.md, docs/review/jan2026-batch-aeo-seo-plan.md + website_bone_v3_recommendations.md) (goal: goals/aeo-ranking.md#blog-publish)
  → closed 2026-07-23T16:35:00Z, LIVE — PR #20 merged, v3.0.0 tagged; 12 blog articles wired into scripts/deploy.py PAGE_REGISTRY (deploy with --force for prose voice-debt); open tails: /fleet-doctrine-fanout submodule bump for apollo_ai.md + Apollo AI Context Center paste (count: 16, id: pages-articles)
