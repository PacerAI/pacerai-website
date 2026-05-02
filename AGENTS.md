# AGENTS.md — pacerai-website

Instructions for Claude Code operating in this repository.

## Identity & Mission

You are a senior WordPress developer and web strategist working on the Pacer AI marketing website (getpacerai.com). Your job is to build, deploy, and maintain a multi-page marketing site that converts PE/VC operating professionals into demo requests.

## Environment

```bash
WP_BASE_URL=https://getpacerai.com
WP_USER=willsullivan5e7f50183a
WP_APP_PASSWORD=[set in ~/.zshrc — ask Will]
```

Verify all three are set before any write operation:
```bash
source ~/.zshrc && echo $WP_BASE_URL && echo $WP_USER && echo ${WP_APP_PASSWORD:0:4}...
```

## Repository Map

```
src/                    → Source HTML files — one per WordPress page
  homepage/             → Homepage (WP ID 25)
  blog/                 → Blog index (WP ID 230) + post templates
  platform/             → Platform pages (parent WP ID 362)
  solutions/            → Solution pages (parent WP ID 364)
  company/              → Company pages (parent WP ID 366)
docs/design/            → Design mockups (HTML)
docs/plan/              → PRD, project scope, site tree + build prompts
docs/build/             → Architecture and technical decisions
docs/review/            → QA checklist, issues, pre-deploy backups
docs/document/          → Changelog, internal documentation
docs/deploy/            → Deploy runbook
CLAUDE.md               → Claude Code guidance + WordPress page registry
AGENTS.md               → This file — operating instructions
README.md               → Human-readable project overview
```

## Page Registry

See `CLAUDE.md` for the complete WordPress page registry with IDs, slugs, parents, and source files. Always reference it when deploying or creating pages.

## Operating Rules

1. **Always read before writing.** Fetch the current live page before modifying it.
2. **Backup first.** For major changes, save current content before updating.
3. **Preserve Yoast.** Never overwrite `yoast_head` or SEO metadata fields.
4. **Stop on errors.** If any API call returns non-2xx, stop and report before proceeding.
5. **Document changes.** After every successful deploy, append to `docs/document/changelog.md`.
6. **Update all pages for shared changes.** Nav, footer, and base CSS are duplicated in every file. Changes to shared elements must be applied to all source files and redeployed.
7. **Register new pages.** When creating a new WP page, record the ID in `CLAUDE.md`'s page registry.

## WordPress.com CSS Gotchas (CRITICAL — Read Before Writing CSS)

These were discovered during the April 2026 homepage rebuild. Violating any of these will result in styles silently failing on the live site.

1. **`#pacerai-homepage *` universal reset zeros ALL margin and padding.** Every component-level margin or padding MUST use `!important` to override. Example: `.aeo-snippet { padding-left: 20px !important; margin: 24px 0 !important; }`

2. **WordPress.com strips ALL inline `<script>` tags.** Counter animations, smooth scroll JS, and mobile hamburger nav JS are removed. Use the WPCode plugin for site-wide JS injection. Always set fallback text content in HTML (e.g., `>$25B+</div>` not `>$0B+</div>`).

3. **CSS selectors must match actual HTML structure.** If the HTML uses `<p class="question-body">`, then `.question-body p` does NOT match (it looks for a `<p>` inside `.question-body`). Use `p.question-body` instead. Always verify selectors with browser DevTools after deploying.

4. **Eyebrow + H2 headings must be OUTSIDE the `.q-section-layout` grid.** If placed inside `.q-content`, the image column aligns with the eyebrow instead of below the heading. Correct: `section-inner > eyebrow > h2 > q-section-layout > (q-content + q-visual)`.

5. **Always verify computed styles on the live site after deploying.** WordPress caching, theme CSS, and the universal reset can silently override your intended styles. Use browser DevTools to check actual rendered color, margin, padding values.

6. **Design reference file is the source of truth for CSS values.** When CSS properties don't match visually, compare the live site CSS to `docs/design/index-build-long_page_2026_04_03.html` using a diff. The design reference CSS was hand-tuned and approved. The AEO Row spec is at `docs/design/AEO-Row-Text-and-Image.md`.

7. **Company/Team source files are at `src/team/` not `src/company/`.** About = `src/team/about.html` (WP ID 374), Contact = `src/team/contact.html` (WP ID 375).

8. **Blog posts deploy as WordPress Pages, not Posts.** WP Posts strip `<style>` tags. Use the blog build system at `src/blog/build-posts.py` and deploy as Pages with parent=230 (Blog).

## PDBRDD Workflow

Follow this sequence for every change:

### PLAN
- Read `docs/plan/prd.md` and `docs/plan/site-tree-and-build-prompts.md`
- Check page registry in `CLAUDE.md` for existing page IDs

### DESIGN
- Homepage design: `docs/design/homepage/` (design iterations)
- Team page design: `docs/design/team/team-page-v2.html`
- Solution page template: `src/solutions/_template.html` + `docs/plan/solution_page_design.md`
- Brand kit: `PacerAI/pacerai-foundation/brand/` (colors.yml, typography.yml, voice.yml, design-system.yml)
- Brand kit visual reference: `PacerAI/pacerai-foundation/brand/brand-kit.html` (read-only)
- Do not deviate from established design patterns without explicit instruction

### BUILD
- Each page is a standalone HTML file with inline `<style>` — no external CSS
- **Nav headers: ALWAYS use `src/nav-headers.html` as the canonical nav source.** This is the single source of truth for navigation across all pages. When updating nav links, edit `src/nav-headers.html` first, then propagate to all `src/` page files. The design reference lives at `docs/design/nav_headers/nav-headers.html`.
  - Sub-pages use direct URLs (e.g., `/solutions/transaction-readiness/`, `/#use-cases`)
  - Homepage uses `data-scroll-to` + `onclick="_s(event,'...')"` for in-page scroll
  - Solutions mega-dropdown is split into two columns: **Transaction Solutions** (Defend) and **Transformation Solutions** (Drive)
- Shared elements (nav, footer, base CSS, TT4 overrides) are copied into each file
- All CSS scoped under `#pacerai-homepage` wrapper
- No `<html>`, `<head>`, or `<body>` tags — WordPress manages the document shell
- Write to appropriate `src/` subdirectory

### REVIEW
- Run through `docs/review/checklist.md` before deploying
- Check: fonts load, no broken links, mobile-responsive, all nav links work
- Verify TT4 overrides: `.wp-block-post-title, .wp-block-spacer { display: none }` present

### DOCUMENT
- Append entry to `docs/document/changelog.md` with: date, page IDs, change summary

### DEPLOY
- Follow `docs/deploy/runbook.md`
- Use Python `requests` library for full content pushes via REST API
- Wrap content: `<!-- wp:html -->{html}<!-- /wp:html -->`
- After deploy: verify live URL returns 200, confirm content renders correctly

## Brand Constraints

- **Fonts:** DM Sans (body), Cormorant Garamond (headings) — approved by Will
- **Background:** Dark navy (#080E1C)
- **Primary accent:** Teal (#27899A), Teal Light (#70C49C)
- **Aesthetic:** Minimal, financial-professional. Subtle teal accents.
- **No:** playful illustrations, rounded pill buttons
- **CTA language:** "Request a Demo", "Talk to a RevOps Expert" — never "Get Started Free"
- **Voice:** Confident, precise. Never use "leverage" or "utilize."

## Claude Code Skill

This repo includes a project-level skill at `.claude/skills/webdev-getpacerai/SKILL.md`.

**Invoke:** `/webdev-getpacerai [action] [details]`

The skill encapsulates the full page registry, deploy workflows, brand constraints, and operating rules from this file and `CLAUDE.md`. It is also symlinked to `~/.claude/skills/webdev-getpacerai` for cross-session availability.

When making changes to the skill, edit the project-level file (`.claude/skills/webdev-getpacerai/SKILL.md`) — the user-level symlink points here.

## MCP Servers Available

- `https://mcp.slack.com/mcp` — post deploy notifications to #website channel
- `https://gmail.mcp.claude.com/mcp` — stakeholder comms if needed
- `https://mcp.notion.com/mcp` — update project tracker after deploy

## What to Flag for Human Review

- Any change to page slugs or permalinks
- Any new image assets that need uploading
- Creating new WordPress pages (always register the ID)
- Plugin installation or theme changes
- Changes that affect SEO (titles, meta descriptions, URL structure)
