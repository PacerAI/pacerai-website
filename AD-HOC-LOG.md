# AD-HOC-LOG.md — pacerai-website

Append-only audit trail for ad hoc edits in this repo. See `pacerai-os/POLICY.md` for what qualifies as ad hoc versus what needs a spec, and for the escalation rule (3+ ad hoc edits to the same artifact in 7 days → promote to a spec).

One line per edit, format:

```
YYYY-MM-DD | repo/file touched | one-line description | agent or Will
```

---

<!-- entries below, newest at bottom -->
2026-05-18 | pacerai-website/README.md | Appended ceremonial "PacerAI-OS started May 18th 2026" line | ad-hoc executor (dispatched by Ike)
2026-05-19 | pacerai-website/foundation (submodule pin) | Bumped foundation submodule pin from 8757bb3 (2026-05-01) → ce2cd44 (2026-05-18); fleet alignment with content/database/plugins/platform/gtm. Trigger: Archie health-check review 2026-05-19 — website was the lone laggard. | Claude (dispatched by Will via Ike)
2026-05-29 | pacerai-website/CLAUDE.md, scripts/deploy.py | Wired cRPO Blog (WP ID 865) into page registry + PAGE_REGISTRY/PAGE_NAMES dicts so future content updates use `python3 scripts/deploy.py 865`. | Claude (dispatched by Will)
2026-05-29 | pacerai-website/scripts/deploy-crpo.py | Added one-shot create-page Python script (Spec-#38-style). Used once to attempt new-page creation via REST API; superseded by manual-create-in-admin workflow after WP.com App-Password REST permissions blocked direct page creation. Retained for future blog posts that may run under a wider-scoped App Password. | Claude (dispatched by Will)
2026-05-29 | pacerai-website/src/blog/posts/crpo-build.html | Authored "What is cRPO?" blog post + Bridging-cRPO-to-ARR-equivalent section + inline source links to Workday/ServiceNow/Atlassian/Salesforce/Snowflake/Datadog/MongoDB earnings pages; deployed to WP ID 865. | Claude (dispatched by Will)
2026-05-29 | pacerai-website/src/blog/index-build.html | Added "Diligence" filter pill to category-bar + cRPO card at position 1 of blog-grid; deployed to WP ID 230. | Claude (dispatched by Will)
2026-07-22 | pacerai-website/ (branch-scale — see PR #20) | v3.0.0 "Claude-bone" light redesign (#F5F4EF): homepage (WP 25) full bone port from demo-site design + blog (WP 230) + team (WP 366) + all 14 blog post pages converted to bone; Cloudflare Worker demo host (infra/pacer-demo-worker/); /blog → /resources slug rename (live) + redirect; VERSION=3.0.0. Branch/PR-scale work tracked via PR #20 (github.com/PacerAI/pacerai-website/pull/20) + go-live plan docs/deploy/v3-golive-plan.md — NOT deployed, gated on Will's approval. | Claude (with Will)
