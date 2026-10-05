# Pacing Agent demo video (built 2026-10-05)

A user types **`pace`** into Claude with Pacer AI connected, gets the month, quarter and year pacing charts with a
summary, then types **`gap`** and gets the September white-space chart and the two motions that close the gap. It ends
on "Type “pace” in your own Claude" with **Try the Demo Free** (getpacerai.com/demo-connect), **Review the output**
(closes the card and scrolls back to the top, with a bar keeping the other two in reach) and **Replay**.

- **File:** `reel.html` (sha256 `9237422ce2729113…`). Transcript: [`script.md`](script.md). Charts: [`frames/`](frames/).
- **Worker variant:** `pacing-agent-v3`, **on the homepage** (production `/`). Also at
  https://pacer-demo-worker-staging.will-078.workers.dev/v/pacing-agent-v3. History: `v1` first staged cut (never
  promoted) · `v2` added "Review the output" (homepage 2026-10-05) · `v3` white-space chart gains an ACCOUNT column
  header and stops clipping its longest label (renderer fix in the MCP tool, same day). Slugs can't contain underscores, hence the different names.
- **Registry:** `pacerai-content/collateral/demo_reels/registry.yaml` (catalog copy in `pacing-agent-v2/`).
- **Seed:** [`../../../seed/2026-10-05-pacing-agent-demo-video.md`](../../../seed/2026-10-05-pacing-agent-demo-video.md)

## Data
Illustrative, as of **2026-09-20**: $100M starting ARR, $120M FY2026 target (+$20M Net New ARR = $14M new logo +
$6M expansion). Built by `pacerai-platform-claude-native/demo-site/pacing_fixture.py`; the CSVs it writes are in
`demo-site/fixtures/pacing-agent-2026-09-20/`. Customer and prospect names are the fictional DemoCo names the live demo
uses. The same dataset renders the homepage "Why Pacer AI exists" chart, so the two always agree.

## Charts are the tools' own
Every chart is the renderer the live MCP tool calls (`demo_pace.svg_pace_mtd` / `svg_pace_quarterly` / `svg_pace`,
`demo_gap.svg_whitespace`). The build asserts the titles match the live connector exactly:
"Pace to the month — Sep 2026 (day 20 of 30)", "Q3 2026 — day 82 of 92", "Pace to plan — Sep 2026",
"Expansion white space — renewing Sep 2026". The video-only canvas widening used for v1–v2 is
no longer needed: since v3 the tool's renderer fits the longest bar's "contracted" label and has an ACCOUNT header.

## Rebuilding
```bash
cd ~/Documents/pacerai/pacerai-platform-claude-native
~/.venvs/pacer/bin/python demo-site/pacing_fixture.py        # only if the data changes
~/.venvs/pacer/bin/python demo-site/build_pacing_video.py    # video + charts + numbers.json
cd ~/Documents/pacerai/pacerai-website
python3 scripts/build_pacing_chart.py                        # homepage chart from the same pace_annual.svg
```
A new version is a new slug (`pacing-agent-v4`), staged with `infra/pacer-demo-worker/sync.sh` and promoted with
`promote.sh`. Never overwrite a slug.
