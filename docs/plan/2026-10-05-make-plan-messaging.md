# Plan: "Make plan with confidence" messaging + finishing email capture

> **Related:** goal → [`../../goals/email-capture.md`](../../goals/email-capture.md) · prior plan →
> [`2026-09-21-demo-signup-capture-form.md`](2026-09-21-demo-signup-capture-form.md) · open PR →
> [PacerAI/pacerai-website#24](https://github.com/PacerAI/pacerai-website/pull/24) · live snapshot →
> [`../archive/live-site-2026-10-05/`](../archive/live-site-2026-10-05/)

**Owner:** Will (approve + deploy go) / agent (build) · **Set:** 2026-10-05 · **Branch:** `feat/make-plan-messaging`
(stacked on `feat/email-capture-funnel`)

## Why

Two goals:
1. Reposition the homepage around **helping sales leaders make plan with confidence**: daily pacing, the gap to plan,
   and how to close it.
2. Get homepage visitors to **give their work email on `/demo-connect`**.

The email-capture work from 2026-09-24 (PR #24) is half-shipped. The capture servers, the D1 `leads` table,
`footer.js` and `/demo-connect` are live. The homepage, Resources hub, Team page and 13 blog posts are **not deployed**.
The live homepage still has no email form, and it links to Calendly twice. [`overview.md`](overview.md) marks
"Calendly on /contact/ only" as done, but that's only true in the undeployed source. This plan finishes that work
and layers the new messaging on top.

---

## Part A: Snapshot the live site ✅

- [x] Saved the rendered HTML of `/`, `/demo-connect/`, `/resources/`, `/team/` and `/contact/` to
      `docs/archive/live-site-2026-10-05/` (all HTTP 200).

## Part B: Homepage messaging (`src/homepage/index-build.html`, WP 25) ✅ LIVE 2026-10-05

Built 2026-10-05 on this branch; `validate.py --strict` 12/12; deploy dry-run OK (62,064 chars, limit 67,000).

| Section | From (live) | To |
|---|---|---|
| Hero kick | GTM Financial Modeling Agent | **Daily Pacing Agent** |
| Hero h1 | Pacer AI helps Sales Leaders / build financial models / for ‹rotor› | Pacer AI helps Sales Leaders / ‹rotor›: *make plan with confidence · close the gap to plan · improve Net Retention Rates · cross-sell products · improve durable revenue growth · improve forecast accuracy* |
| Hero sub | Reconciled to Finance, Built for Operations, On-Pace to Plan. | unchanged |
| Hero CTA | none live (source has the demo-access email form → `/demo-connect`) | keep the source's email form |
| Why h2 | …take the guesswork out of making investments to grow revenue. | Pacer AI exists to help companies achieve their sales targets and operating plans. |
| Why body | "Finance teams report / Sales teams generate…" lines + Income Statement vs ARR-movements cards + capital-allocation note | **removed**; replaced by the FY26 annual pacing chart (Part C) |
| Use Cases | 8 modeling cards | 6 pacing cards (below) |
| Buy-In | revenue-growth-plan questions | recommended rewrite (below) |
| Value | Buy-In / Speed / Capacity | recommended rewrite (below) |
| Get Started | Schedule a diagnostic review · Book a Free Diagnostic / See a Live ARR Demo / Talk to Will | **Try a Demo now** · *A data driven approach to close the gap to plan* · [Demo in Claude now] email form → `/demo-connect` · [Schedule a Demo] → `calendly.com/pacerai/demo-pacer-ai` |

### Use Cases (recommended bullets)
1. **Pacing Reports**: real-time sales trajectory updates · MTD, QTD and YTD against plan · forecast landing
2. **Sales Trajectory by Market**: pace and gap for each market · where the plan is won or lost
3. **Sales Trajectory by Segment**: Enterprise, Mid-Market and SMB against plan · segment mix shift
4. **Sales Trajectory by Rep**: each rep's pace to quota · who's ahead, who needs help
5. **Upsell & Cross-sell White Space by Product**: products each account doesn't own yet · ranked expansion white space
6. **ARR Waterfall Reporting**: New, Upsell, Cross-sell, Downsell, Churn · Net New ARR, Gross & Net Retention

### Buy-In (recommended)
- **h2:** Know where you stand against plan, every day
- **Questions:** Are we on pace to make the number this quarter? · We're halfway through and $3M behind. Where do we
  make it up? · Which markets, products and reps are ahead of plan, and which are behind? · How much of the gap can
  existing customers close through upsell and cross-sell? · Does our pacing tie to Finance's plan? · Do we need more
  pipeline? If so, where?
- **Keep:** the "deterministic skills with canonical definitions… same answer every time" note.
- **Replace the closing line with:** Pacing to plan takes data engineering, RevOps, strategic finance and sales
  strategy. Pacer AI brings all four.

### Value (recommended)
- **h2:** Make plan. Close the gap. Own the story.
- **Confidence:** *Know where you'll land before the quarter ends.* Daily pacing against plan, reconciled to Finance,
  so a miss shows up in month two, not at quarter close.
- **Focus:** *Know where to close the gap.* The gap broken down by market, product and rep, with the expansion white
  space and new-logo pipeline that can close it.
- **Speed:** *Live in days, not months.* Connect your CRM and see pacing in Claude the same week. No 6–12 month
  internal build, no BI stack to maintain.

## Part C: FY26 annual pacing chart ✅

> **Superseded 2026-10-05 (later):** the chart now comes from the Pacing Agent demo video's dataset — see
> [`../design/demo-vids/pacing-agent_2026_10_04/README.md`](../design/demo-vids/pacing-agent_2026_10_04/README.md).
> `fy26-annual-pacing.json` was removed; edit the dataset in the platform repo instead.

- **Style (2026-10-05 revision):** matches the `pace_annual` MCP chart (`svg_pace` in
  `pacerai-platform-claude-native/mcp/pacer_intake_mcp/demo_pace.py`; reference `docs/roadmap/assets/pace_annual.png`).
  The homepage `<style>` imports Cormorant Garamond + JetBrains Mono for it. If `svg_pace` changes, update `build_pacing_chart.py` to match.

- **Data (illustrative, labeled on the chart):** [`img/pacing/fy26-annual-pacing.json`](../../img/pacing/fy26-annual-pacing.json).
  FY26 goals: Net New ARR $20M = New Logo $14M + Expansion $6M, planned evenly by month. Jan–Sep actuals are
  illustrative and run behind plan at the end of September.
- **Build:** `python3 scripts/build_pacing_chart.py` → `img/pacing/fy26-annual-pacing.svg` + `.png` (2×, via
  headless Chrome), and inlines the SVG into the homepage `<figure class="pace-fig">`.
- **To update:** edit the JSON (actuals, goals, as-of month), re-run the script, redeploy WP 25.
- On screens under 700px the chart keeps a 640px minimum width and scrolls sideways inside its card, so the labels stay readable.

### Hero rotor: race fixed
The phrase list was in two places, the page's `<img onerror>` injector and the WPCode footer (`src/wpcode/footer.js` §6),
and whichever ran first won. The live footer still has the old 13 phrases. Fix: the page now owns the list
(`data-phrases` on the hero span) and the class is renamed `.rotor` → `.pa-rotor`, so the old live footer can't find
the element. `footer.js` was updated to read `data-phrases` too and `footer.paste.txt` was rebuilt. **Pasting it is
optional** (it only removes dead code); the homepage works without it.

### Positioning follow-ups (Will)
- [x] Will chose a site-wide rename (2026-10-05): nav, footer and body copy on all 18 pages now say *Daily Pacing Agent*, and `CLAUDE.md` is updated. **Still old, WP Admin only:** the Yoast titles and meta descriptions on all indexed pages, plus the WPCode JSON-LD `alternateName`. Originally: `CLAUDE.md`, the homepage Organization JSON-LD, the footer blurb
      ("The Revenue Modeling Agent for Sales Leaders"), the nav label and the Yoast titles still say *GTM Financial
      Modeling Agent* / *Revenue Modeling Agent*. Decide whether the category term changes site-wide.

## Part D: Finish email capture (PR #24 leftovers)

- [x] Deployed 2026-10-05: WP **25**, **230**, **366**, **375**, **983** and all 13 posts. Run `--dry-run`
      first; posts need `--force` because of the pre-existing writing-style debt.
- [x] Verified live (all 200): email forms bind (`data-asset-slug` in the live HTML) and the only Calendly links are `/contact/` plus
      the homepage "Schedule a Demo" (Will's call, 2026-10-05).
- [ ] Merge PR #24, then this branch's PR.
- [ ] Update [`overview.md`](overview.md) and [`../../goals/email-capture.md`](../../goals/email-capture.md): homepage
      Calendly exception, and drop the stale "password is on its way" open item (the password is revealed on screen;
      the "Will will send it" text only shows if the secret is unset).
- [ ] `validate.py --strict` CI failure: either fix the 8 posts' writing-style findings or accept `--force` and mark the
      check non-blocking. *(Will's call.)*
- [ ] **Will (WP Admin):** Yoast title + meta for page 983 and for the homepage's new positioning.

### Deferred (unchanged)
Email-to-Will on capture (Slack only, by choice) · research waitlist page (`src/research/index.html`) · more free resources.

## Verification
1. `python3 scripts/validate.py src/homepage/index-build.html --strict` passes.
2. Local preview (`scripts/preview.py`) at desktop and 390px widths: rotor cycles the six phrases; chart is legible on
   mobile; no horizontal scroll.
3. `python3 scripts/deploy.py 25 --dry-run`, then deploy on Will's go.
4. Live check: `curl` for "Daily Pacing Agent", "achieve their sales targets", the chart SVG, `demo-pacer-ai`; submit a
   test email in the hero form → lands on `/demo-connect`; delete the test row from `leads`.
5. Append to [`../document/changelog.md`](../document/changelog.md).
