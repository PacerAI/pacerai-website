# Ask an AI assistant icons

Small, accessible buttons that open Claude, ChatGPT, Grok or Copilot with a prefilled question about Pacer AI.

This was not on the live site or in the repo before this change. Do not merge or deploy until Will says yes.

## Placement (homepage only in this change)

The `/bottom-up-sales-forecasting/` and `/bottom-up-sales-planning/` pages were retired on 2026-11-14 (WP 1172 and 1174, 301 to `/`). Do not recreate them. The hooks go on the homepage, which already answers these questions:

| Prompt | Hook | Where |
|---|---|---|
| What is Pacer AI? | `data-prompt="what-is-pacer-ai"` | Under the homepage hero subhead |
| What is bottom-up sales forecasting? | `data-prompt="bottom-up-forecasting"` | Inside the matching homepage FAQ item |
| What is bottom-up planning? | `data-prompt="bottom-up-planning"` | Immediately after that FAQ item |

A sitewide footer row is intentionally not wired. Adding it would mean rebuilding every page that inlines the canonical footer, and deploying those pages could publish other undeployed Nov 11–14 edits on main. A footer hook can be a later, separate change.

## Why a WPCode snippet, not inline URLs

`src/homepage/index-build.html` is already close to the 67k character soft limit (about 800 characters of room). Three placements of four long prefill URLs would blow it. The homepage only gets empty hooks; this script fills them.

## Deploy (later, Will's yes)

1. Paste `src/wpcode/ask-ai.js` into a **new** WPCode JavaScript snippet. Do not paste it into the existing Footer field.
2. Deploy the homepage only after Will has accepted any other pending homepage edits, or after confirming this file's hooks are the only homepage change being published.
3. Do not run `scripts/deploy.py` for all pages.

## Prompt text

Positioning used in every prompt: "Pacer AI - Bottom-up sales forecast agent". Bottom-up forecasting first, real-time second. ICP: CROs, VP Sales, RevOps, CFOs at B2B companies with $10M+ recurring revenue. Each prompt names getpacerai.com.

See `src/ask-ai/prompts.md` for the exact strings and encoded URLs.
