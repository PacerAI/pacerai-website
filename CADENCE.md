---
repo: pacerai-website
operator_role: repo-operator
agents:
  - name: blog-post
    purpose: Authors blog posts for getpacerai.com per Pacer voice.
    schedule: on-dispatch
    reports_to: STATUS.md
  - name: ui-ux-pro-max
    purpose: UI/UX review and refinement skill for site components.
    schedule: on-dispatch
    reports_to: STATUS.md
  - name: webdev-getpacerai
    purpose: Web-dev skill for getpacerai.com — WordPress REST publication and template edits.
    schedule: on-dispatch
    reports_to: STATUS.md
  - name: website-char-count
    purpose: Character-count utility for SEO-bounded fields.
    schedule: on-dispatch
    reports_to: STATUS.md
workflows:
  - name: Claude Code Review
    file: .github/workflows/claude-code-review.yml
    trigger: pull_request
    purpose: Runs Claude on every PR for review feedback.
    reports_to: GitHub Issues
  - name: Claude Code
    file: .github/workflows/claude.yml
    trigger: mixed:issue_comment,pull_request_review_comment,issues,pull_request_review
    purpose: Responds to @claude mentions on issues/PRs.
    reports_to: GitHub Issues
  - name: Pre-Publish Validation
    file: .github/workflows/pre-publish.yml
    trigger: mixed:pull_request,push
    purpose: Cloud-side validate.py --strict gate on publishable artifacts (voice/foundation/HTML).
    reports_to: GitHub Issues
sprints: []
cadence_files: []
scheduled_skills: []
loops: []
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

No scheduled work in this repo: all workflows are PR/push-event-driven; all skills run on-dispatch.
