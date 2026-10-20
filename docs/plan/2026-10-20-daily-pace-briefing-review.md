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
| 18 | Slack via `SLACK_BOT_TOKEN` + `chat.postMessage` to `U08SSDPDTH9` | No Slack client in platform. The fleet uses incoming webhooks (`_slack_post.py`). A user ID as the channel needs a bot with `chat:write` and `im:write` | **Slack is in v1 (Will, 2026-10-20).** Send it through an incoming webhook (`BRIEFING_SLACK_WEBHOOK_URL`) to Will's channel. Prospects never get Slack |
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
| 7 | Resend REST. Tags as name/value pairs. One key per app in Key Vault. Slack in v1, by incoming webhook, to Will only |
| 7a (new) | **Recipients** (see "Recipients" below):<br>• Will's own addresses come from `BRIEFING_RECIPIENTS`, every day.<br>• Prospects come from `demo_users.yml`, only with a dated `daily_email.approved`, for the books listed, at most `days` times.<br>• One email per recipient |
| 8 | Add these variables:<br>• `BRIEFING_STATE_PATH` (default `/home/data/briefing_sent.json`)<br>• `BRIEFING_ROSTER_PATH` (default `/home/data/demo_users.yml`, falling back to the copy in the image)<br>• `BRIEFING_SLACK_WEBHOOK_URL`<br>`BRIEFING_SEND_TIME` becomes informational: the schedule lives in `settings.job` |
| new | "Supersedes" note: spec 009's email transport and pacerai-training `daily_pace_notify.py` |
| header | `specs/023-daily-pace-briefing/spec.md` in the SPEC-STANDARD layout |

## Decisions (Will, 2026-10-20)

1. **Slack is in v1.** One post per app per day to Will's channel, through an incoming webhook. It carries:
   - the headline;
   - the summary table;
   - the Go-Get;
   - one analysis line;
   - a "Sent to" line naming each prospect and their day N of M.
2. **Recipients come from the `daily_email` flags in `demo_users.yml`, approved by Will by name.** Will also sets
   how many days each person receives it. For example, Kyle at Crestrock gets 1 day.

## Recipients

`mcp/pacer_intake_mcp/demo_users.yml` is the roster Will edits by hand, defined by spec 011. It already has a
per-person `daily_email` field, and spec 011 AC-3 ("send to `daily_email` on a cloud scheduler") is what this
briefing delivers. `daily_email` grows from a true/false into a mapping that only Will sets:

```yaml
  - email: kyle@crestrock.com
    domain: crestrock.com
    company: Crestrock
    verified: true
    daily_email:
      approved: 2026-10-20        # the date Will approved this person, by name. No date: no email.
      books: [hubspot-100m]       # which briefing: hubspot-100m (HubSpot app) and/or startup (Salesforce app)
      days: 1                     # send this many daily emails, then stop. Leave out: until Will removes it
```

Rules:

| Rule | Detail |
|---|---|
| Approval is by name | A prospect gets the briefing only with a dated `daily_email.approved`. A bare `daily_email: true`, or a missing date, sends nothing. Old entries can't send by accident. An agent may add a person with `daily_email: false`. It writes `approved` only when Will names the person and the number of days in chat (AGENTS.md rule) |
| Day limit | `days: N` means N emails, counted per person per book. The count starts at the first successful send and increments only after Resend accepts it. At N the person drops off, and the run logs it. Will's Slack shows "Kyle (Crestrock): day 1 of 1, last" on the final day |
| Which briefing | `books` lists the apps that send to this person. Each app reads the same roster and sends only to people listing its own `PACER_BOOK` |
| One email each | Every recipient gets their own email. A prospect never sees another recipient's address |
| Will's copy | `BRIEFING_RECIPIENTS` on each app holds Will's addresses: every day, no limit, no approval needed |
| Idempotency | Keyed by book, local date and recipient. A retry after a partial failure re-sends only to the people who didn't get it |
| Changing recipients without a redeploy | The roster of record stays in git; editing and committing it is the approval. `deploy/home-files.sh` (a copy of client-pacerai `deploy/hq-files.sh`, allowed to target only the two demo apps) pushes it to each app's `/home/data/demo_users.yml`, where the WebJob reads it. An image rebuild isn't needed to add Kyle |
| Same content | Prospects get the same seven-section briefing as Will for that book. It's demo data; reply-to is Will |

## After the PR: steps that need Will's go (Azure writes)

1. Create two Resend Sending-access keys, one per app. Store them in Key Vault `pacerai-demo-kv30208`.
2. Create a Slack incoming webhook for Will's briefing channel, and store it in the same Key Vault.
3. Add these app settings on both apps:
   - `RESEND_API_KEY` and `BRIEFING_SLACK_WEBHOOK_URL` (Key Vault references)
   - `BRIEFING_*`
   - `WEBSITE_TIME_ZONE=America/Denver`
   - `WEBSITE_SKIP_RUNNING_KUDUAGENT=false`
4. Push the roster with `deploy/home-files.sh --app <app> put mcp/pacer_intake_mcp/demo_users.yml data/demo_users.yml`.
   Do this again after every approval Will gives.
5. Upload the WebJob to `pacerai-demo-hubspot-mcp`. Then run one manual fire, `python -m briefing --now`, and compare it with the Oct 20 email.
6. Set `BRIEFING_ENABLED=true` on HubSpot. Then do the same on `pacerai-demo-mcp` (Salesforce).
7. Turn off the two claude.ai scheduled tasks. Remove the `daily_pace_notify` step from pacerai-training
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
- send.py — Resend REST via requests, one email per recipient. Slack (in v1) via an incoming webhook to my
  channel: headline, summary table, Go-Get, one analysis line, and a "Sent to" line ("Kyle (Crestrock): day 1
  of 1, last").
- roster.py — recipients for the active book:
  - BRIEFING_RECIPIENTS: my addresses, every day, no limit.
  - demo_users.yml entries whose daily_email is a mapping with a dated `approved`, a `books` list containing
    this PACER_BOOK, and a `days` count not yet reached.
  - A bare `daily_email: true` or a missing date sends nothing.
  - Read BRIEFING_ROSTER_PATH (default /home/data/demo_users.yml), falling back to the bundled
    mcp/pacer_intake_mcp/demo_users.yml.
- config.py — the spec §8 env vars, plus BRIEFING_STATE_PATH, BRIEFING_ROSTER_PATH and BRIEFING_SLACK_WEBHOOK_URL.
- state.py — the idempotency record and the per-recipient day counts.
Sketch both templates, the roster schema and the state file. Stop and show me.

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
- Idempotency: key "<PACER_BOOK>-<local date in BRIEFING_TZ>-<recipient>". Store it in BRIEFING_STATE_PATH
  (default /home/data/briefing_sent.json) with an atomic write like oauth.py. Write it only after Resend
  returns 2xx. A second fire the same day sends to no one already sent and logs a line.
- Recipients:
  - Prospects only with daily_email.approved (a date) and this book in daily_email.books.
  - Stop after daily_email.days successful sends, counted per person per book and incremented only after 2xx.
  - One email per recipient; never put two recipients on one email.
  - Prospects never get Slack.
- Failure contract: a data error still sends the email, naming the failed horizon(s) and the error text.
- BRIEFING_ENABLED defaults to false and gates sending. --dry-run writes the HTML and text to ./out/ and
  never sends.
- WebJob: deploy/webjobs/daily-pace-briefing/{run.sh,settings.job} with "schedule": "0 57 7 * * *" (local time
  via WEBSITE_TIME_ZONE=America/Denver), plus deploy/webjobs.sh adapted from client-pacerai. It may target only
  pacerai-demo-mcp and pacerai-demo-hubspot-mcp. Do not run it.
- deploy/home-files.sh, adapted from client-pacerai deploy/hq-files.sh (Kudu file API, az login, never prints a
  token). It may target only the two demo apps. It pushes the roster to /home/data/demo_users.yml so recipients
  change without an image rebuild. Do not run it.
- Tests, offline:
  - the analysis rules against a fixture built from the Oct 20, 2026 briefing numbers;
  - render snapshot (HTML and text);
  - idempotency;
  - the failure path;
  - tag format;
  - the from-address guard;
  - the roster: a bare `daily_email: true` sends nothing; no approved date sends nothing; the wrong book
    sends nothing; `days: 1` sends once and then stops, even across two scheduler fires; a partial failure
    retries only the people not yet sent;
  - the Slack payload, including the "Sent to" line.
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
  - how to fire it manually;
  - recipients: an agent may add a person to demo_users.yml with `daily_email: false`. It writes
    `daily_email.approved` only when Will names the person and the number of days in chat.
- Update the field notes at the top of demo_users.yml for the daily_email mapping (approved / books / days).
  Don't approve anyone.
- Update .env.example and docs/README.md.
- Add a "transport superseded by spec 023" note to specs/009-client-email-delivery/spec.md.
- Do not edit pacerai-training. List its follow-up in the PR: remove the daily_pace_notify step from
  run-pace-daily.sh after cutover.

DEPLOY.
- Open a PR against main, titled "feat: server-side Daily Pace Briefing via Resend", with spec 023, the plan
  and the two dry-run HTML files.
- In the description, for each app, list:
  - every env var / app setting (Key Vault references for RESEND_API_KEY and BRIEFING_SLACK_WEBHOOK_URL);
  - WEBSITE_TIME_ZONE and WEBSITE_SKIP_RUNNING_KUDUAGENT;
  - the exact deploy/webjobs.sh command;
  - the exact deploy/home-files.sh command that pushes the roster.
- Do not merge. Do not run any az command. Do not set BRIEFING_ENABLED=true. Do not touch the claude.ai
  scheduled tasks.
- Before opening the PR, check open PRs #70, #71, #73 and #75 for conflicts and say what you found.

Throughout: no fluff, tables for anything multi-row. If something in the spec or this prompt doesn't fit the
code, say so and stop rather than improvising.
```
