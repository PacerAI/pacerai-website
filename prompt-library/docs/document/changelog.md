# Prompt Library — Changelog

## 2026-03-18

### Claude Projects Distribution Architecture
- Added `arr-analysis` category to `prompts.json`
- Created `client-prompts/` directory for client-optimized prompts
  - `arr-waterfall-scenarios.json` — first client prompt (ARR Waterfall Scenario Analysis)
- Created `claude-projects/` directory for Claude Project configs
  - `arr-waterfall-scenarios/system-prompt.md` — SaaS financial analyst persona
  - `arr-waterfall-scenarios/knowledge.md` — full model structure, formulas, chart specs
  - `arr-waterfall-scenarios/README.md` — setup and sharing instructions
- Created `excel-templates/` directory (placeholder for companion workbooks)
- Created `docs/deploy/claude-projects-guide.md` — distribution guide for Claude Projects channel
- Updated `docs/plan/overview.md` — added Claude Projects as distribution channel, Phase 2.5
- Updated `CLAUDE.md` — new directory structure, extended data model with delivery types

## 2026-03-17

### Initial PDBRDD Setup
- Created `CLAUDE.md` with repo guidance, stack, structure, data model, and critical rules
- Created `AGENTS.md` with operating instructions, PDBRDD workflow, and guardrails
- Created `.claude/settings.local.json` with Claude Code permissions
- Created `docs/` PDBRDD structure:
  - `plan/overview.md` — dual library strategy (public + client), categories, success metrics, timeline
  - `build/architecture.md` — data model schema, component architecture, integration points
  - `review/checklist.md` — QA checklist for visual, responsive, interactions, accessibility, data, deployment
  - `document/changelog.md` — this file
  - `deploy/runbook.md` — deployment instructions for both targets
- Created brand component: `/01_Foundation/brand/components/component-prompt-library.html`
  - Dark theme: glassmorphism bento cards, teal accents, typed hero animation
  - Light theme: solid white cards, navy accents, no glass effects
  - 9 prompts across 6 categories (3 from existing prompts.json + 6 new)
  - Category filter pills, modal with copy-to-clipboard, parallax orb
  - Responsive: 3-col → 2-col → 1-col breakpoints
  - Accessibility: `prefers-reduced-motion` support

### Existing Files (Pre-Init)
- `index.html` — standalone prototype (dark navy bg + white cards)
- `prompts.json` — 3 prompts in product-marketing category (Genesys Growth source)
- `README.md` — basic project overview
