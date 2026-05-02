# Claude Projects Distribution Guide

## Overview

Claude Projects is the primary distribution channel for PacerAI client prompts. Each use case gets its own Claude Project with a system prompt, knowledge files, and optional file attachments (e.g., Excel templates).

## Architecture

```
prompt-library/claude-projects/
└── {prompt-id}/
    ├── system-prompt.md     # Project system instructions
    ├── knowledge.md         # Domain context, cell references, detailed specs
    └── README.md            # Setup + sharing instructions
```

**Source of truth:** The files in `claude-projects/` are the canonical versions. Claude Projects at claude.ai are manually created from these files.

## Creating a New Claude Project

### 1. Write the source files

Create a new directory under `claude-projects/` with:
- `system-prompt.md` — Role definition, workflow, key principles
- `knowledge.md` — Detailed reference material (cell mappings, formulas, domain context)
- `README.md` — Setup and sharing instructions

### 2. Create the Project at claude.ai

1. Go to Projects → New Project
2. Name it to match the prompt title
3. Paste `system-prompt.md` into Instructions
4. Upload `knowledge.md` as a knowledge file
5. Attach any companion files (Excel templates, reference docs)

### 3. Register in client-prompts/

Create a JSON entry in `client-prompts/{prompt-id}.json` with `"delivery": "claude-project"`.

## Sharing Models

| Method | Cost | Sharing | Best For |
|--------|------|---------|----------|
| Claude Teams | $30/user/mo | Automatic — all workspace members see Projects | Multiple clients, seamless access |
| Claude Pro | $20/user/mo | Manual — export system prompt + knowledge files | Single client, cost-sensitive |
| Hybrid | Mixed | You create on Teams, client recreates on Pro | Flexible |

## Updating Projects

1. Update source files in `claude-projects/`
2. Manually update the Project at claude.ai (no API for this yet)
3. For Claude Pro clients: send updated files with brief changelog

## Current Projects

| Project | Status | Directory |
|---------|--------|-----------|
| ARR Waterfall Scenario Analysis | Active | `arr-waterfall-scenarios/` |
