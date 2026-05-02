# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

Curated AI prompt library for PE-backed SaaS operators. Two deployment targets:

1. **Public-facing** — Website page under Resources nav (between Resources & Partners). Read-only, copy-to-clipboard. Uses interview mode to ask users questions before recommending prompts. Marketing-focused, generic prompts.
2. **Client-facing** — Platform sidebar component (e.g., `client-TDS/PromptLibrary.tsx`). Same visual structure but with optimized prompts (self-learning, meta-cognition, native knowledge of connected data). Workspace-scoped, custom CRUD, folder organization.

**Target audience:** Operating Partners, CFOs, RevOps leaders at $50M–$1B ARR PE-backed SaaS companies.

## Stack

- **Brand component (design reference):** `/01_Foundation/brand/components/component-prompt-library.html` — single-file HTML/CSS/JS bento showcase
- **Current prototype:** `index.html` + `prompts.json` — standalone HTML page with vanilla JS
- **Public deployment:** WordPress page via REST API (same pattern as `website-PacerAI`)
- **Client deployment:** React TSX component integrated into platform sidebar

## Repository Structure

```
prompt-library/
├── CLAUDE.md                 # This file — repo guidance
├── AGENTS.md                 # Operating instructions, PDBRDD workflow
├── README.md                 # Human-readable overview
├── .claude/
│   └── settings.local.json   # Claude Code permissions
├── index.html                # Current prototype (dark navy + white cards)
├── prompts.json              # Prompt data (categories, tags, variables)
├── client-prompts/           # Client-optimized prompts (individual JSON files)
│   └── arr-waterfall-scenarios.json
├── claude-projects/          # Claude Project configs (system prompts + knowledge files)
│   └── arr-waterfall-scenarios/
│       ├── system-prompt.md  # Project system instructions
│       ├── knowledge.md      # Domain context + cell reference guide
│       └── README.md         # Setup + sharing instructions
├── excel-templates/          # Companion Excel workbooks (future)
└── docs/
    ├── plan/
    │   └── overview.md       # Goals, dual-library strategy, distribution channels
    ├── design/               # Mockups, UX stories (future)
    ├── build/
    │   └── architecture.md   # Data model, component references
    ├── review/
    │   └── checklist.md      # QA checklist
    ├── document/
    │   └── changelog.md      # Change history
    └── deploy/
        ├── runbook.md        # Deployment instructions
        └── claude-projects-guide.md  # Claude Projects setup + sharing guide
```

## Key References

| File | Location | Purpose |
|------|----------|---------|
| Brand component | `/01_Foundation/brand/components/component-prompt-library.html` | Design reference (dark + light bento grid) |
| Typed hero pattern | `/01_Foundation/brand/components/component-typed-hero.html` | Animation pattern |
| Bento grid pattern | `/01_Foundation/brand/components/component-bento-grid.html` | Card layout pattern |
| Client component | `/02_Platform/client-TDS/clientTDS-chat/src/components/PromptLibrary.tsx` | Platform integration reference |
| Website deploy | `/04_GTM/website-PacerAI/` | WordPress REST API deploy pattern |

## Commands

```bash
# Local preview (from repo root)
python3 -m http.server 5500

# Or use the static-files launch config
# Defined in /.claude/launch.json
```

## Prompt Data Model

### Public prompts (`prompts.json`)

```json
{
  "id": "unique-slug",
  "title": "Prompt title",
  "category": "product-marketing | arr-analysis | growth-metrics | board-reporting | data-quality | customer-success",
  "tags": ["tag1", "tag2"],
  "summary": "One-line summary",
  "prompt": "Full prompt text with {{variables}}",
  "variables": ["variable1", "variable2"],
  "source": "Attribution (e.g., Genesys Growth)"
}
```

### Client prompts (`client-prompts/*.json`)

Same base schema plus additional fields:

```json
{
  "delivery": "claude-project | claude-excel | platform | copy-paste",
  "template_file": "excel-templates/filename.xlsx",
  "optimized": true,
  "requires_data_connection": false,
  "requires_excel": true
}
```

### Delivery types

| Type | Description |
|------|-------------|
| `claude-project` | Full Claude Project with system prompt + knowledge files. Source in `claude-projects/`. |
| `claude-excel` | Designed for Claude's Excel add-in (`=CLAUDE()` formulas). Lightweight, per-cell. |
| `platform` | Delivered via PromptLibrary.tsx sidebar in client portal. |
| `copy-paste` | Simple prompt text — copy into any AI tool. |

## Critical Rules

1. **Foundation is source of truth.** Brand tokens, colors, typography come from `/01_Foundation/brand/`. Never create local overrides.
2. **Two libraries, one data model.** Public and client prompts share the same JSON schema. Client prompts add `optimized: true` and `requires_data_connection: true` fields.
3. **No search input in brand component.** Filter pills are sufficient for the showcase. Search is for the deployed versions.
4. **Dark theme = glass cards.** `backdrop-filter: blur(16px)`, teal accents. Never white cards on dark backgrounds.
5. **Light theme = solid white cards.** `border-top: 2px solid navy`, subtle shadow. No glassmorphism.
