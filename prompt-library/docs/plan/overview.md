# Prompt Library — Plan Overview

## Vision

A curated collection of AI prompts purpose-built for PE-backed SaaS operators. Two deployment targets serve different audiences with appropriate depth and data integration.

## Dual Library Strategy

### Public-Facing Library (Website)

**Location:** Website nav under Resources (between Resources & Partners)
**URL:** `getpacerai.com/resources/prompt-library/`

**Purpose:** Lead generation and thought leadership. Demonstrates Pacer AI's domain expertise in PE-backed SaaS operations.

**Key features:**
- Read-only, copy-to-clipboard
- Interview mode: asks users questions to recommend the right prompt (e.g., "What's your role?" → "What are you working on?" → recommended prompts)
- Marketing-focused, generic prompts (no proprietary data required)
- Category filtering (Product Marketing, ARR Analysis, Growth Metrics, Board Reporting, Data Quality, Customer Success)
- SEO-optimized for "AI prompts for SaaS," "PE portfolio AI," etc.

**Deployment:** WordPress REST API (same pattern as website-PacerAI pages)

### Client-Facing Library (Platform)

**Location:** Platform sidebar component
**Reference:** `/02_Platform/client-TDS/clientTDS-chat/src/components/PromptLibrary.tsx`

**Purpose:** Accelerate client time-to-value by providing ready-to-use prompts optimized for their connected data.

**Key features:**
- Same visual structure as public library (bento cards, category filters, modal with copy)
- **Optimized prompts** with:
  - Self-learning: prompts that improve based on usage patterns
  - Meta-cognition: prompts that ask the AI to reason about its reasoning
  - Native knowledge: prompts that reference the client's connected data (Power BI datasets, CRM, ERP)
- Workspace-scoped: each client sees prompts relevant to their data connections
- Custom CRUD: clients can create, edit, and organize their own prompts
- Folder organization: personal folders, team-shared folders
- Usage analytics: track which prompts are most effective

**Deployment:** React component bundled with the platform frontend

## Prompt Categories

| Category | Description | Example Use Case |
|----------|-------------|-----------------|
| Product Marketing | Competitive analysis, persona research, messaging | "Analyze competitor X's positioning against our ICP" |
| ARR Analysis | Revenue modeling, cohort analysis, snowball metrics | "Build an ARR snowball from this quarterly data" |
| Growth Metrics | NRR, expansion, contraction signals | "Identify NRR expansion opportunities from usage data" |
| Board Reporting | MBR automation, board deck narratives | "Generate a board-ready MBR narrative from this data" |
| Data Quality | Reconciliation, audit, cleanup | "Audit data discrepancies between CRM and billing" |
| Customer Success | Health scoring, churn prediction, engagement | "Score customer health based on these engagement metrics" |

## Success Metrics

- **Public:** Prompt copies per visit, interview completion rate, demo requests from prompt library page
- **Client:** Prompts used per session, custom prompts created, time-to-first-insight improvement

## Distribution Channels

### Claude Projects (Primary — Immediate)

Claude Projects provide a native distribution channel for client-facing prompts. Each use case gets its own Claude Project with system instructions, knowledge files, and optional file attachments (Excel templates, reference docs).

**How it works:**
- Source files live in `claude-projects/{prompt-id}/` (system-prompt.md, knowledge.md, README.md)
- Projects are manually created at claude.ai from these source files
- Clients access via Claude Teams (shared workspace) or Claude Pro (exported configs)

**Current Projects:**
- ARR Waterfall Scenario Analysis

**See:** `docs/deploy/claude-projects-guide.md` for setup and sharing details.

### Client Prompt Files (Secondary — Version Control)

Client-optimized prompts are stored as individual JSON files in `client-prompts/`. These follow the same schema as `prompts.json` with additional fields: `delivery`, `template_file`, `optimized`, `requires_data_connection`, `requires_excel`.

### Platform Sidebar (Future — Phases 4-6)

The PromptLibrary.tsx component in the client platform will surface both copy-paste prompts and Claude Project links.

## Timeline

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | Brand component (design reference) | Complete |
| 2 | PDBRDD repo initialization | Complete |
| 2.5 | Claude Projects distribution channel + client-prompts directory | Complete |
| 3 | Public library WordPress page | Planned |
| 4 | Client library platform integration (+ Claude Project links) | Planned |
| 5 | Interview mode for public library | Planned |
| 6 | Optimized prompts for client library | Planned |
