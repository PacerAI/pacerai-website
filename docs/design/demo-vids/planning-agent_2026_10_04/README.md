# Planning Agent demo video (archived 2026-10-05)

The demo video that played on the getpacerai.com homepage until the Pacing Agent video replaced it. Kept for the
cross-sell follow-up: after a prospect lands on the Pacing Agent, this is the Planning Agent story.

- **File:** `reel.html`, byte-identical to the production worker's `src/demo.html` at archive time
  (sha256 `dda61798b1b96591…`, 160,426 bytes; also checked against the live `pacer-demo-worker` response).
- **Worker variant:** `cro-arr-v1`, still playable at
  https://pacer-demo-worker-staging.will-078.workers.dev/v/cro-arr-v1
- **Catalog copy:** `pacerai-content/collateral/demo_reels/cro-arr-v1/reel.html` (same sha).

## What the user types
1. Help me build a plan to go from $100M ARR in 2025 to $150M ARR in 2027
2. Looks good — let’s move forward with the operational requirements
3. Let’s build the ARR Financial Model and get a breakdown by market
4. Yes, build the full workbook

Claude's first reply: "I have your company financials. Here’s our 3 step plan: Set target ARR Growth rates ·
Breakout ARR Growth drivers of Upsell and Cross-sell · Conduct a bottoms-up build by market to Net New ARR targets."
It ends by opening the Excel workbook and the user typing "this saved my team weeks".

## Rebuilding
The generator is `pacerai-platform-claude-native/demo-site/build_demo_site.py`. **It is currently broken**:
`arr_target_planning` now returns a `CallToolResult`, which the script's `_frag()` can't parse. Use this archived
file; fix the generator before making a v2 of this video.
