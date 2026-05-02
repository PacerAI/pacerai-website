# pacerai-website

Marketing website for [getpacerai.com](https://getpacerai.com) — AI-native build using the PDBRDD lifecycle.

## Project Overview

This repo manages the design, development, and deployment of the Pacer AI marketing website. Pages are authored as standalone HTML files with inline CSS, then deployed to WordPress.com as Pages via the REST API.

**Target audience:** Operating Partners, PE Portfolio Ops, CFOs, and RevOps leaders at $50M-$1B ARR SaaS companies.

**Tagline:** Your ARR Snowball Report. Automated. Board-Ready.

---

## Stack

| Layer | Tool |
|---|---|
| CMS | WordPress.com (hosted) |
| Theme | Twenty Twenty-Four (overridden by inline CSS) |
| Deploy | WordPress REST API + Application Password (Python) |
| Dev Environment | Claude Code (Anthropic) |
| Version Control | GitHub (`PacerAI/pacerai-website`) |
| SEO | Yoast SEO (active plugin) |
| Analytics | Google Site Kit (GA4 + Search Console) |

---

## Live Pages

| Page | URL | WP ID | Source File |
|------|-----|-------|-------------|
| Home | https://getpacerai.com/ | 25 | `src/homepage/index-build.html` |
| Blog | https://getpacerai.com/blog/ | 230 | `src/blog/index-build.html` |
| Platform Overview | https://getpacerai.com/platform/overview/ | 371 | `src/platform/overview.html` |
| ARR Snowball | https://getpacerai.com/solutions/arr-snowball-board-reporting/ | 372 | `src/solutions/arr-snowball.html` |
| Customer Data Cube | https://getpacerai.com/solutions/customer-data-cube/ | 373 | `src/solutions/customer-data-cube.html` |
| About | https://getpacerai.com/company/about/ | 374 | `src/company/about.html` |
| Contact | https://getpacerai.com/company/contact/ | 375 | `src/company/contact.html` |

---

## Repository Structure

```
.claude/
└── skills/
    └── webdev-getpacerai/  # Claude Code skill (symlinked to ~/.claude/skills/)

src/
├── homepage/           # Homepage build file
├── blog/               # Blog index + post templates
├── platform/           # Platform pages
├── solutions/          # Solution/use case pages
└── company/            # Company pages (about, contact)

docs/
├── plan/               # PRD, site tree, build prompts
├── design/             # HTML mockups
├── build/              # Architecture, technical decisions
├── review/             # QA checklist, known issues, backups
├── document/           # Changelog, internal documentation
└── deploy/             # Deploy runbook
```

---

## Quick Start for Claude Code

1. Source env vars: `source ~/.zshrc` — confirms `WP_BASE_URL`, `WP_USER`, `WP_APP_PASSWORD`
2. Read `CLAUDE.md` for page registry and deploy workflows
3. Read `AGENTS.md` for operating instructions and brand constraints
4. Read `docs/deploy/runbook.md` before deploying to WordPress
5. Site tree and build prompts for new pages: `docs/plan/site-tree-and-build-prompts.md`

---

## Deploy Workflow

Each HTML source file is deployed to WordPress as a Page via the REST API:

```python
import requests, os

source ~/.zshrc  # loads WP_BASE_URL, WP_USER, WP_APP_PASSWORD

with open('src/platform/overview.html') as f:
    html = f.read()

content = f"<!-- wp:html -->{html}<!-- /wp:html -->"
resp = requests.post(
    f"{os.environ['WP_BASE_URL']}/wp-json/wp/v2/pages/371",
    json={"content": content},
    auth=(os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])
)
```

See `docs/deploy/runbook.md` for full instructions including backup, verification, and batch deploys.

---

## Agents & Skills

### Claude Code Skill

This repo includes a project-level Claude Code skill for website development:

```
.claude/skills/webdev-getpacerai/SKILL.md
```

**Invoke with:** `/webdev-getpacerai [action] [details]`

Examples:
- `/webdev-getpacerai deploy all pages`
- `/webdev-getpacerai build /solutions/virtual-data-room page`
- `/webdev-getpacerai update nav across all pages`

The skill includes the full page registry, deploy workflows (single, batch, new page), brand constraints, and operating rules. It is also symlinked to `~/.claude/skills/webdev-getpacerai` for availability across all sessions.

### Key Files

- **CLAUDE.md** — Claude Code guidance, page registry, deploy patterns
- **AGENTS.md** — Operating instructions, PDBRDD workflow, brand constraints

### MCP Servers

- Slack (`https://mcp.slack.com/mcp`) — deploy notifications
- Gmail (`https://gmail.mcp.claude.com/mcp`) — stakeholder comms
- Notion (`https://mcp.notion.com/mcp`) — project tracking

---

## Brand Constraints

- **Fonts:** DM Sans (body), Cormorant Garamond (headings)
- **Background:** Dark navy (#080E1C)
- **Accent:** Teal (#27899A), Teal Light (#70C49C)
- **Aesthetic:** Minimal, financial-professional. No playful UI elements.
- **CTA language:** "Request a Demo", "Talk to a RevOps Expert" — never "Get Started Free"
