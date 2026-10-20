# Daily Pace Briefing: review of the spec and the Claude Code prompt

**For:** Will, and the Claude Code session that will build the briefing in `pacerai-platform-claude-native`.
**Date:** 2026-10-20 · **Reviewed:** [`2026-10-20-daily-pace-briefing-spec.md`](2026-10-20-daily-pace-briefing-spec.md) and
[`2026-10-20-daily-pace-briefing-claude-code-prompt.md`](2026-10-20-daily-pace-briefing-claude-code-prompt.md)
(both verbatim) against the platform repo at `origin/main` on 2026-10-20.
**Related docs:** order emails and the Resend domain → [`../deploy/order-email-setup.md`](../deploy/order-email-setup.md)

## Verdict

The goal and the content contract hold: a server-side briefing, independent of any Claude session, with a locked
seven-section email. The engineering half does not match the repo. The spec assumes:
- a `pacer/` package;
- tools that return numbers;
- renewal tables inside `pace`;
- Jinja;
- a fixed-UTC schedule.

None of those are true. The prompt tells Claude Code to stop when the spec doesn't fit, so as written it stops at the
Plan stage with the list below. Fold these fixes into the spec (v1.1) and use the **revised prompt** at the end; the
build can then go straight through.

## Findings

Line numbers are from `origin/main` on 2026-10-20. "Platform" means `pacerai-platform-claude-native`.

| # | Spec or prompt says | What the repo has | Fix |
|---|---|---|---|
| 1 | Package `pacer/briefing/`; CLI `python -m pacer.briefing` | No `pacer/` package. Code is flat modules in `mcp/pacer_intake_mcp/` (`server.py`, `demo_pace.py`, `md_template.py`); the image runs `/app/pacer_intake_mcp/server.py` (`deploy/Dockerfile`) | `mcp/pacer_intake_mcp/briefing/`. Run as `python -m briefing --now [--dry-run]` from `pacer_intake_mcp/` |
| 2 | Wrap the implementations behind `pace`, `pace_quarterly`, `pace_annual` | Those tools (`server.py:2916, 3515, 3552`) return **rendered** markdown + SVG/PNG via `_chart`, not numbers | Call the pure functions that return dicts:<br>• `_pace_load(as_of)` (`server.py:2095`: base, plan, pipeline, source label)<br>• `DP.mtd_metrics` (`demo_pace.py:1054`)<br>• `DP.quarter_metrics` (1557)<br>• `DP.pace_metrics` (306; `forecast_gap` is the Go-Get)<br>• `DP.mtd_deals` (1123)<br>• `DP.movers` (445) |
| 3 | `BriefingSource` Protocol with Salesforce and HubSpot adapters | One process serves one book. `PACER_BOOK` is fixed at import (`server.py:104, 316`). The two connectors are the same image on two apps (ADR-0004) | No Protocol: each app runs the briefing for its own book. The source name is `_pace_load`'s label. Also CLAUDE.md: "no abstractions until 3+ uses" |
| 4 | §6.5–6.6 renewal and new-booking tables "as returned by `pace`" | Removed from `pace` on Oct 13; `tests/test_pace_briefing.py:77` asserts they're absent. They come from the `renewals` and `new_bookings` tools, which use `DP.mtd_deals` | Source both tables from `DP.mtd_deals`. Reword §6 |
| 5 | §6.4 "What moved" | No such section in `pace` | New rules code. Inputs exist:<br>• mix: `mtd_metrics.new_mtd / existing_mtd`<br>• churn: `mtd_deals` row status<br>• timing: `movers.new_won` close dates<br>• landing: `quarter_metrics.gap_qtd` vs `pace_metrics.forecast_gap` |
| 6 | Jinja HTML + text templates | Jinja2 is not a dependency. ADR-0005: a command's wording lives in `agent/briefings/<command>.md`, filled by `md_template.py` | `agent/briefings/daily_email.html` + `.txt`, filled by `md_template`. Table rows are pre-rendered in Python, as `_pace_values` does. No new dependency |
| 7 | WebJob CRON `0 57 13 * * *` UTC = 7:57 MDT | Right until Nov 1. After that it fires at **6:57 MST** | `WEBSITE_TIME_ZONE=America/Denver` + `"schedule": "0 57 7 * * *"`. That keeps 7:57 local all year. `BRIEFING_SEND_TIME` becomes informational |
| 8 | "WebJob or Timer Function" | No scheduler in platform. client-pacerai runs a proven triggered WebJob: `deploy/webjobs.sh` + `deploy/webjobs/hq-nightly/{run.sh,settings.job}`. It needs Always On (both demo apps have it) and `WEBSITE_SKIP_RUNNING_KUDUAGENT=false`. That script refuses `pacerai-demo-mcp` on purpose | A platform copy, `deploy/webjobs.sh`, allowed to target the two demo apps only. No Timer Function, so no new Azure resource |
| 9 | Idempotency "in a small KV/table" | No KV or table on the apps. `/home` persists (`WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`); `oauth.py:137-156` already writes `/home/data/*.json` atomically | `/home/data/briefing_sent.json`, key `<PACER_BOOK>-<local date>`. Recorded **after** Resend accepts the send, so a failed send retries |
| 10 | Tags `briefing`, `server:<name>` | Resend tags are name/value pairs of letters, digits, `_` and `-`. `server:<name>` is invalid | `[{name: "category", value: "briefing"}, {name: "server", value: "<PACER_BOOK>"}]` |
| 11 | `resend.Emails.send(...)` (SDK) | No Resend code in platform. `requests` is already in `deploy/requirements-mcp.txt`. The website Worker calls the REST API (`infra/pacer-demo-worker/src/order.ts`) | `POST https://api.resend.com/emails` with `requests` |
| 12 | `RESEND_API_KEY` per host | — | **One Sending-access key per app**, limited to `mail.getpacerai.com`, stored in Key Vault `pacerai-demo-kv30208` and referenced by an app setting. Load each with the `read -s` + pipe method from `order-email-setup.md`; never paste a key in chat |
| 13 | (silent) | Two older daily-email efforts overlap:<br>• **spec 009** `pacer_emailv2` (Cloudflare Email, `pacer@getpacerai.com`; every acceptance criterion unchecked)<br>• **pacerai-training** `scripts/daily_pace_notify.py` under launchd `com.pacerai.pace-daily`. It is Salesforce-only, passes no `plan` and uses `DP.base_arr`, so its numbers differ from `pace`. Its last exit was 1 | The spec states it **supersedes** both:<br>• spec 009's transport gets a "superseded by 023" note<br>• after cutover, remove the `daily_pace_notify` step from `run-pace-daily.sh`. Keep the `sf_pacing_tick` / `hs_pacing_tick` steps |
| 14 | Spec at `specs/SPEC-daily-pace-briefing.md`; plan at `specs/PLAN-…` | Platform convention: `specs/NNN-slug/spec.md` in the SPEC-STANDARD layout (Seed / Phases / Acceptance / Lifecycle). Plans go in `docs/plan/`. Docs wiring: every doc is listed in `docs/README.md`. Next free number is **023** (022 is open PR #75) | `specs/023-daily-pace-briefing/spec.md` and `docs/plan/2026-10-20-daily-pace-briefing.md`, both added to `docs/README.md` |
| 15 | Churn sentence lists "account IDs" | Open PR #75 shows account names instead of IDs in every tool | Names, plus the ID where the tools show one. Build after #75 merges, or rebase onto it |
| 16 | "Numbers match a same-day `pace` call to the $K" | Known bug: `pace_metrics` counts open deals closing after Dec 31 in the FY forecast. It's a strict xfail, spec 019 AC-13 | The same function feeds both, so the numbers still match. Name the caveat in the spec until AC-13 lands |
| 17 | Build on `main` | Open PRs #70, #71, #73 and #75 all touch `demo_pace.py` / `server.py`. Another Claude session handles platform deploys | Branch from the latest `origin/main`. Keep the briefing in new files; touch existing code only through imports. Coordinate before any deploy |
| 18 | Slack via `SLACK_BOT_TOKEN` + `chat.postMessage` to `U08SSDPDTH9` | No Slack client in platform. The fleet uses incoming webhooks (`_slack_post.py`). A user ID as the channel needs a bot with `chat:write` and `im:write` | v1: an incoming webhook (`BRIEFING_SLACK_WEBHOOK_URL`), or defer Slack. The email is the contract |
| 19 | Review: diff against the Oct 20 email "in my inbox" | Claude Code needs the Gmail connector to read it | Keep the step. Or save the email's text to `docs/review/2026-10-20-pace-email.md` before the run |

**Still right as written:**
- The §6 content contract and its order.
- `reports@mail.getpacerai.com`: it's the same verified domain, so no new DNS. Never `orders@`.
- `BRIEFING_ENABLED=false` by default.
- The failure contract: a data error still sends, naming the horizon.
- One send per server per local day.
- No narration from a language model in v1.
- Rollout order: HubSpot, then Salesforce, then retire the claude.ai tasks.
- "Behind $860K" wording. It matches the AGENTS.md rule that gaps are words, never signed numbers.

## Spec v1.1: proposed changes

| § | Change |
|---|---|
| 4 | Package `mcp/pacer_intake_mcp/briefing/`. Data comes from `_pace_load` + `demo_pace` functions (finding 2). No `BriefingSource` Protocol: one book per process (finding 3) |
| 5 | Azure App Service: a triggered WebJob with `WEBSITE_TIME_ZONE=America/Denver`, CRON `0 57 7 * * *`. Idempotency in `/home/data/briefing_sent.json` |
| 6.5–6.6 | "as returned by `DP.mtd_deals` (the data behind the `renewals` and `new_bookings` tools)" |
| 6 rules | Churn sentence: account names (IDs where shown). Add the AC-13 caveat on the FY forecast |
| 7 | Resend REST. Tags as name/value pairs. One key per app in Key Vault. Slack by incoming webhook, or deferred |
| 8 | Add `BRIEFING_STATE_PATH` (default `/home/data/briefing_sent.json`) and `BRIEFING_SLACK_WEBHOOK_URL`. `BRIEFING_SEND_TIME` becomes informational (the schedule lives in `settings.job`) |
| new | "Supersedes" note: spec 009's email transport and pacerai-training `daily_pace_notify.py` |
| header | `specs/023-daily-pace-briefing/spec.md` in the SPEC-STANDARD layout |

## Open questions for Will (not blocking)

1. Slack in v1 (incoming webhook) or later?
2. Recipients: the `BRIEFING_RECIPIENTS` env var now, or the existing `daily_email:` flags in
   `mcp/pacer_intake_mcp/demo_users.yml` (present, but nothing reads them yet)?

## After the PR: steps that need Will's go (Azure writes)

1. Create two Resend Sending-access keys, one per app. Store them in Key Vault `pacerai-demo-kv30208`.
2. Add these app settings on both apps:
   - `RESEND_API_KEY` (Key Vault reference)
   - `BRIEFING_*`
   - `WEBSITE_TIME_ZONE=America/Denver`
   - `WEBSITE_SKIP_RUNNING_KUDUAGENT=false`
3. Upload the WebJob to `pacerai-demo-hubspot-mcp`. Then run one manual fire, `python -m briefing --now`, and compare it with the Oct 20 email.
4. Set `BRIEFING_ENABLED=true` on HubSpot. Then do the same on `pacerai-demo-mcp` (Salesforce).
5. Turn off the two claude.ai scheduled tasks. Remove the `daily_pace_notify` step from pacerai-training
   `run-pace-daily.sh`.

---

## Revised prompt (ready to paste)

Paste into Claude Code in VS Code with `pacerai-platform-claude-native` open.

```
Read AGENTS.md, CLAUDE.md, architecture/decisions/ADR-0004-one-codebase-one-app-per-demo-book.md and ADR-0005
in full. Then read the spec and its review in the pacerai-website repo:
docs/plan/2026-10-20-daily-pace-briefing-spec.md and docs/plan/2026-10-20-daily-pace-briefing-review.md.
We are building the server-side Daily Pace Briefing: the spec with the review's v1.1 changes applied. Work in stages
(Plan, Design, Build, Review, Document, Deploy) and stop at the end of each stage for my go-ahead.

PLAN. Confirm each fact against the code first; if one is wrong, stop and tell me.
1. pace / pace_quarterly / pace_annual (server.py) return rendered markdown + SVG/PNG via _chart, not numbers.
2. The numbers come from _pace_load(as_of) in server.py and demo_pace: mtd_metrics, quarter_metrics,
   pace_metrics (forecast_gap = Go-Get), mtd_deals (renewals + new bookings), movers.
3. One process serves one book: PACER_BOOK is fixed at import. Each Azure app runs its own book.
4. The renewals / new-bookings tables are no longer in pace (tests/test_pace_briefing.py); they come from
   DP.mtd_deals.
5. There is no scheduler in this repo. client-pacerai has a working triggered WebJob (deploy/webjobs.sh +
   deploy/webjobs/hq-nightly/). Both demo apps have Always On and persistent /home.
6. There is no Resend or Slack code here, and requests is in deploy/requirements-mcp.txt.
Then:
- Create specs/023-daily-pace-briefing/spec.md in the SPEC-STANDARD layout of specs/020-top-movers/spec.md,
  from the spec with the review's v1.1 changes.
- Write the plan to docs/plan/2026-10-20-daily-pace-briefing.md.
- List both in docs/README.md.
Stop and show me.

DESIGN. Package mcp/pacer_intake_mcp/briefing/:
- __main__.py — CLI: python -m briefing --now [--dry-run]
- collect.py — collect(as_of) -> BriefingData for the active book. It calls _pace_load and the demo_pace
  functions. No Protocol, no adapters. Never call the MCP tools.
- analysis.py — the four rules in spec §6.
- render.py — fills agent/briefings/daily_email.html and daily_email.txt with md_template (ADR-0005).
  Pre-render table rows in Python. No Jinja.
- send.py — Resend REST via requests. Slack via an incoming webhook only if BRIEFING_SLACK_WEBHOOK_URL is set.
- config.py — the spec §8 env vars, plus BRIEFING_STATE_PATH and BRIEFING_SLACK_WEBHOOK_URL.
- state.py — the idempotency record.
Sketch both templates. Stop and show me.

BUILD on branch feat/daily-pace-briefing, from the latest origin/main.
- Call _pace_load and demo_pace directly. Importing server.py is fine (the tests do); never start the server
  and never go through the MCP layer.
- from "Pacer AI Reports <reports@mail.getpacerai.com>", reply_to will@getpacerai.com. Never orders@ — add a
  test that fails if a briefing from-address contains "orders@".
- Resend tags: [{"name":"category","value":"briefing"},{"name":"server","value":<PACER_BOOK>}].
- Content order, table columns, footnote definitions and the footer line are locked by spec §6.
  Dollars in whole $K. Gaps in words ("behind $860K"), never signed numbers. Churn rows by account name
  (with the ID where the tools show one).
- Behind amounts #c05621, churn #c53030, Georgia on white, max width 760px, no images, no marketing footer.
  The text body is built from the same data, not stripped from the HTML.
- Idempotency: key "<PACER_BOOK>-<local date in BRIEFING_TZ>". Store it in BRIEFING_STATE_PATH
  (default /home/data/briefing_sent.json) with an atomic write like oauth.py. Write it only after Resend
  returns 2xx. A second fire the same day is a no-op with a log line.
- Failure contract: a data error still sends the email, naming the failed horizon(s) and the error text.
- BRIEFING_ENABLED defaults to false and gates sending. --dry-run writes the HTML and text to ./out/ and
  never sends.
- WebJob: deploy/webjobs/daily-pace-briefing/{run.sh,settings.job} with "schedule": "0 57 7 * * *" (local time
  via WEBSITE_TIME_ZONE=America/Denver), plus deploy/webjobs.sh adapted from client-pacerai. It may target only
  pacerai-demo-mcp and pacerai-demo-hubspot-mcp. Do not run it.
- Tests, offline:
  - the analysis rules against a fixture built from the Oct 20, 2026 briefing numbers;
  - render snapshot (HTML and text);
  - idempotency;
  - the failure path;
  - tag format;
  - the from-address guard.
  Run pytest -m "not user_auth".

REVIEW.
- Dry-run both books locally:
  PACER_BOOK=hubspot-100m python -m briefing --now --dry-run
  python -m briefing --now --dry-run    (the Salesforce book)
  Open the HTML.
- Diff the HubSpot output against the email "Pace — Oct 20: MTD behind $860K · FY Go-Get $2,100K". Read it
  with the Gmail connector, or from docs/review/2026-10-20-pace-email.md if I saved it there.
- List every difference and whether it's intentional.

DOCUMENT.
- AGENTS.md "## Daily Pace Briefing" section:
  - the job calls internal pacing functions, never the MCP layer;
  - spec 023 §6 is locked — extend it there, don't fork it;
  - the from-address rule;
  - how to fire it manually.
- Update .env.example and docs/README.md.
- Add a "transport superseded by spec 023" note to specs/009-client-email-delivery/spec.md.
- Do not edit pacerai-training. List its follow-up in the PR: remove the daily_pace_notify step from
  run-pace-daily.sh after cutover.

DEPLOY.
- Open a PR against main, titled "feat: server-side Daily Pace Briefing via Resend", with spec 023, the plan
  and the two dry-run HTML files.
- In the description, for each app, list:
  - every env var / app setting (Key Vault reference for RESEND_API_KEY);
  - WEBSITE_TIME_ZONE and WEBSITE_SKIP_RUNNING_KUDUAGENT;
  - the exact deploy/webjobs.sh command.
- Do not merge. Do not run any az command. Do not set BRIEFING_ENABLED=true. Do not touch the claude.ai
  scheduled tasks.
- Before opening the PR, check open PRs #70, #71, #73 and #75 for conflicts and say what you found.

Throughout: no fluff, tables for anything multi-row. If something in the spec or this prompt doesn't fit the
code, say so and stop rather than improvising.
```
