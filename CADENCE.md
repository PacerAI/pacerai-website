---
repo: pacerai-website
operator_role: repo-operator
agents: []
inputs:
  - pacerai-os/contracts/agent-ike-repo-handoff.md
  - pacerai-os/contracts/agent-repo-status.md
  - pacerai-os/contracts/agent-repo-cadence.md
  - pacerai-foundation/manifest.yml
outputs:
  - src/
  - WordPress REST API @ getpacerai.com
last_reviewed: 2026-05-18
---

# Notes

Marketing website. Publishes via WordPress REST API (`WP_BASE_URL`, `WP_USER`, `WP_APP_PASSWORD`). Pre-publish hook in `.claude/settings.json` gates Bash actions. Domain content sourced from Foundation; no paraphrasing into site copy.
