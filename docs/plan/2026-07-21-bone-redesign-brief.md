# Brief — Claude-bone homepage redesign (paste-into-a-new-session prompt)

**Status:** Planning brief (not yet planned/built)
**Owner:** Will Sullivan
**Created:** 2026-07-21
**Design source:** `pacerai-platform-claude-native/demo-site/index.html`
**Target:** getpacerai.com homepage (WP ID 25) + nav/blog/team/FAQ changes

This file is a self-contained prompt to paste into a fresh Claude Code session. That session's
job is to produce a reviewable PLAN (plan mode) — not to write or deploy code. The `## Open
decisions` block is intentionally left for that session to resolve with Will before finalizing.

---

You are planning a website redesign for Pacer AI. DO NOT WRITE OR DEPLOY ANY CODE YET.
Your only job this session is to produce a thorough, reviewable implementation PLAN.
Use plan mode. Before finalizing, ask me clarifying questions (AskUserQuestion) on the
open decisions I flag at the bottom. Never auto-deploy anything under my brand — every
deploy is gated on my explicit approval and a voice/visual pass.

## Goal
Replace the current getpacerai.com homepage design (a dark navy #080E1C layout) with the
new light "Claude-bone" design, using this file as the design source of truth:
  /Users/willsullivan/Documents/pacerai/pacerai-platform-claude-native/demo-site/index.html
(hero → a Claude app window floating over a macOS-Tahoe desktop → the "How It Works"
pipeline animation at #how-it-works → value tiles → team → FAQ → CTA).

## Repos & how the site works (read these first)
- Website repo: /Users/willsullivan/Documents/pacerai/pacerai-website  (branch main,
  github.com/PacerAI/pacerai-website). It is a WordPress.com site deployed via the WP REST
  API — there is NO local dev server. Each page is a standalone HTML file that is the source
  of truth, pushed to a WordPress Page ID.
- Read first: pacerai-website/CLAUDE.md, docs/deploy/runbook.md, docs/document/changelog.md,
  docs/document/architecture.md, scripts/deploy.py (the PAGE_REGISTRY maps WP IDs → files).
- Deploy tool: `python3 scripts/deploy.py <WP_ID>` — it already validates, BACKS UP live
  content to docs/review/pre-deploy-backup-*.json, deploys, and verifies 200. Supports
  --dry-run / --force / --skip-backup.
- Relevant page IDs: homepage=25 (src/homepage/index-build.html), blog=230
  (src/blog/index-build.html), team=366 (src/team/team-page.html), solutions pages =
  372/373/554/650/651/652, platform overview=371.
- IMPORTANT shared-element rule (from CLAUDE.md): nav, footer, and base CSS are DUPLICATED
  across every page file. Any header/nav change must be applied to ALL page files and
  redeployed, not just the homepage.
- Design source lives in a DIFFERENT repo (pacerai-platform-claude-native/demo-site/). The
  demo-site page references local assets — assets/tahoe-bg.jpg, an <iframe> to
  demo-video-by-claude.html, and demo-sheets-slides.html — and scopes nothing for WordPress.
  The current WP homepage wraps everything in #pacerai-homepage and hides the WP theme
  header/footer via CSS; the ported design must do the same (scope + suppress WP chrome +
  host/relink the assets). The "How It Works" pipeline animation is already scoped under a
  `.how` wrapper and is the reusable component
  (source: pacerai-content/assets/_components/component-pipeline-animation-claude-bone.html).

## Required changes (the redesign spec)
1. Port the demo-site/index.html design into src/homepage/index-build.html (WP ID 25),
   adapted for WordPress (scoped wrapper, WP chrome hidden, assets hosted/relinked).
2. Header — keep it centralized (one canonical header, identical on every page, centered),
   with exactly these items plus the login button:
     Revenue Modeling Agent · Use Cases · Pricing · Team · Resources
   - Keep the Log In button (https://app.getpacerai.com/.auth/login/aad).
   - Resources links to the blog (/blog/).
3. Remove "Solutions" from the nav AND remove the /#solutions homepage section and all its
   sublinks (arr-snowball-board-reporting, customer-data-cube, transaction-readiness,
   revops-transformation-pkg, gtm-transformation-pkg, fpanda-transformation-pkg).
4. Blog (/blog/, WP ID 230, src/blog/index-build.html): restyle from the dark palette to the
   Claude-bone color (#F5F4EF ground; match the homepage's bone/navy/teal tokens). Keep it
   reachable via the Resources header link.
5. Team section on the homepage (#team): populate a SHORT team section using the content from
   the live Team page (getpacerai.com/team/#team) and src/team/team-page.html — at minimum
   Will Sullivan (Founder/CEO) and Alexander Veach (Founder, Veach.Co), plus the agent/
   advisory network if it fits a short section. Link out to the full /team/ page.
6. FAQ: keep the existing FAQ section, but update/add this Q&A verbatim:
     Q: "What does pricing look like?"
     A: "Pacer AI utilizes an alignment based pricing model to ensure Pacer AI is aligned to
         its clients' goals."

## Process / safety requirements the plan MUST cover
- Git & backup: everything committed and pushed to origin on a feature branch, PR opened and
  (on my approval) merged; the old dark homepage design archived (not deleted) under an
  archive path (the repo already uses foundation/*/archive and _archive conventions — propose
  a docs/design or src archive location). The deploy.py pre-deploy backup must also run.
- Semantic versioning: the changelog is currently date-based with no semver. Establish a
  semver scheme for the site (propose: a top-level VERSION file + annotated git tags vX.Y.Z +
  version-keyed CHANGELOG entries), treat this redesign as the appropriate MAJOR bump, and
  reconcile it with the existing docs/document/changelog.md rather than replacing it.
- Docs: update docs/document/changelog.md, docs/document/architecture.md, the
  docs/design/homepage and nav_headers design docs, and docs/deploy/runbook.md as needed;
  archive superseded design docs rather than overwriting them.
- Respect the shared-nav rule: enumerate every page file that must have its header updated
  (homepage, blog, team, all solutions pages, platform) and redeployed for nav consistency.

## Deliverable
A phased plan with: (a) a short inventory of what you read/verified, (b) the open decisions
resolved with me, (c) file-by-file changes with WP IDs, (d) the semver + archive + docs
updates, (e) the git/PR/backup/deploy sequence, and (f) a rollback path. Do not start editing
until I approve the plan.

## Open decisions — ask me before finalizing
1. "Pricing" nav target: a new standalone Pricing page (needs a WP page created), a homepage
   #pricing anchor section, or a jump to the pricing FAQ? (There is no pricing page today.)
2. The 6 standalone /solutions/* pages: once removed from nav and the homepage section, do we
   keep them live (linked from Use Cases or Resources), 301-redirect them, or leave them
   orphaned? (SEO impact — flag it.)
3. The auto-playing "demo video" iframe (Claude replay over Tahoe): keep it on the marketing
   homepage as-is, replace it with a static image, or drop it? And where should its assets
   live (WP media library vs repo img/)?
4. "Use Cases" nav target: the demo-site has a Use Cases dropdown (GTM / ARR Waterfall) — keep
   the dropdown, or make it a single page/anchor?
5. Semver baseline: start this redesign at v1.0.0, or is there an implied prior version this
   should bump from?
