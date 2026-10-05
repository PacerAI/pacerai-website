# Demo videos

The self-playing "Claude + Pacer AI" videos on getpacerai.com. Each folder holds the exact HTML that was served, so
any version can be replayed or restored. They are served by the `pacer-demo-worker` Cloudflare Worker
(`infra/pacer-demo-worker/`): production `/` is the homepage video; staging serves every version at `/v/<slug>`.

| Folder | Worker variant | What it shows | sha256 | Status |
|---|---|---|---|---|
| [`planning-agent_2026_10_04/`](planning-agent_2026_10_04/) | `cro-arr-v1` | Planning Agent: "$100M ARR in 2025 → $150M in 2027", ends in the Excel workbook | `dda61798b1b9…` | Homepage until the pacing video is promoted; kept for cross-sell |
| [`pacing-agent_2026_10_04/`](pacing-agent_2026_10_04/) | `pacing-agent-v1` | Pacing Agent: user types `pace`, then `gap`; ends on "Try the Demo Free" | `62516d897a43…` | Staged for review; replaces the homepage video on Will's go |

**Go-to-market fit:** the homepage video lands the **Pacing Agent** (watch → give a work email on `/demo-connect` →
try it free). The **Planning Agent** video is the cross-sell follow-up.

**Rules** (from `pacerai-content/collateral/demo_reels/README.md`): never hand-edit a video; never overwrite a slug
(a new version is a new slug); `infra/pacer-demo-worker/src/demo.html` is written only by `promote.sh`; record every
promotion in `pacerai-content/collateral/demo_reels/registry.yaml`.
