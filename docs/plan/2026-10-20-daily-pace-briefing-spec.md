# SPEC — Daily Pace Briefing (server-side, Resend)

**Status:** Draft · **Owner:** Will Sullivan · **Date:** 2026-10-20
**Applies to:** Pacer AI - Demo (Salesforce book), Pacer AI - Hubspot Demo (HubSpot book), and any future `client-<name>` harness. Pacer AI - HQ (Apollo) is out of scope for v1.
**Repo:** `PacerAI/pacerai-platform-claude-native` · **Built with:** Claude Code in VS Code

## 1. Problem

The daily Pace briefing is currently produced by a claude.ai scheduled task that calls the Pacer MCP connector, renders the email in-session, and sends through the Gmail connector. It fails whenever the connector is toggled off in Will's claude.ai settings (Oct 16–19, 2026), and it is not something a client could be given. The briefing should be a feature of the Pacer server itself.

## 2. Outcome

Every morning at a configured local time, each Pacer server sends its own Pace briefing by email (Resend) and optionally Slack, built from the same functions that back the `pace` tools, with no dependency on a Claude session or connector state.

## 3. Non-goals (v1)

- No per-user login or multi-tenant recipient management (config-driven list only)
- No narrative generation by LLM — see §6
- No change to the MCP tool surface

## 4. Architecture

```
scheduler (per host) ──▶ briefing.run(server_config)
                               │
                               ├─ data: pacing.pace(), pacing.pace_quarterly(), pacing.pace_annual()
                               │        (internal functions — NEVER via the MCP layer)
                               ├─ render: templates/briefing.html.j2 + briefing.txt.j2
                               ├─ analysis: briefing/analysis.py (rules-based, §6)
                               └─ send: resend.Emails.send(...)   [+ slack.chat_postMessage if configured]
```

**Shared module:** `pacer/briefing/` in the platform harness. Each server supplies a `BriefingSource` adapter:

```python
class BriefingSource(Protocol):
    name: str                      # "live Salesforce org" | "live HubSpot portal"
    def pace(self) -> PaceResult: ...
    def pace_quarterly(self) -> PaceResult: ...
    def pace_annual(self) -> PaceAnnualResult: ...
```

The Salesforce and HubSpot adapters already exist as the implementations behind the MCP tools; this spec wraps them, it does not duplicate them.

## 5. Scheduling

| Host type | Mechanism |
|---|---|
| Azure App Service | WebJob (triggered, CRON `0 57 13 * * *` UTC = 7:57 MDT) or Timer Function |
| Container / VM | `cron` entry or APScheduler inside the server process |
| Cloudflare Worker | Cron Trigger in `wrangler.toml` |

Config: `BRIEFING_SEND_TIME` (local, `HH:MM`), `BRIEFING_TZ` (IANA, default `America/Denver`). One run per day per server; idempotency key = `<server>-<YYYY-MM-DD>` stored in a small KV/table so a retried scheduler never double-sends.

## 6. Content contract (locked — matches the current briefing)

Order and tables are fixed. Dollars in whole $K. Every metric that appears is defined in the footnote under its table.

1. **Headline** — one line: on/behind pace for month, quarter, year, with the three behind/ahead amounts and the FY forecast landing vs target.
2. **Summary table** — Horizon | Booked | Plan to date | Pace (ahead/behind $) | Forecast vs target. Rows: Month (MTD, day n of N), Quarter (QTD, Qx day n of N), Year (FY, ARR). Footnote defines plan-to-date, booked, and rounding.
3. **Go-Get** — FY target − forecast landing, with the definition of forecast (booked + weighted open pipeline).
4. **What moved** — rules-based paragraph (see rules below).
5. **Accounts up for renewal (MTD)** — as returned by `pace`, churn rows flagged, "+N more" line.
6. **New bookings (MTD)** — as returned by `pace`, lost prospects flagged.
7. **Footer** — `Source: Pacer AI pacing agent, <source.name>, <date>.`

**Analysis rules (v1, deterministic):**
- Mix sentence: `MTD booking is X% Existing / Y% New ($A net expansion, $B new logos).`
- Timing sentence: if ≥70% of new-logo dollars closed in the last 5 days, say so with the count of closes.
- Churn sentence: if any renewal rows are churn/downsell, list count, total ARR, and the account IDs; else "No churn posted in the period."
- Landing sentence: month forecast vs month target; and whether the FY Go-Get is mostly the current-quarter shortfall (quarter gap ≥ 75% of Go-Get).

An LLM-written paragraph can replace this later behind a feature flag (`BRIEFING_ANALYSIS=rules|llm`); v1 ships `rules`.

## 7. Delivery

**Email (Resend):**
- `from`: `Pacer AI Reports <reports@mail.getpacerai.com>` — same verified Resend subdomain that `orders@mail.getpacerai.com` already uses; no new DNS. Never send briefings from `orders@`.
- `reply_to`: `will@getpacerai.com`
- `to`: `BRIEFING_RECIPIENTS` (comma-separated)
- `subject`: `Pace — <Mon DD>: MTD <ahead/behind $X> · FY Go-Get $Y`
- `html`: Georgia, white background, `#1a202c` text, bordered tables `#cbd5e0`, behind amounts in `#c05621`, churn in `#c53030`. Max width 760px. No images, no marketing footer.
- `text`: generated from the same data, not stripped from HTML.
- Tag: `briefing`, `server:<name>` for Resend analytics.

**Slack (optional):** if `SLACK_BOT_TOKEN` and `BRIEFING_SLACK_CHANNEL` are set, post headline + summary table (mrkdwn) + Go-Get + one analysis line.

**Failure contract:** if any data call raises, still send both messages with the horizon(s) that failed and the error text. Never skip a day silently. Log the run outcome.

## 8. Config (env)

| Var | Example | Required |
|---|---|---|
| `BRIEFING_ENABLED` | `true` | yes |
| `BRIEFING_SEND_TIME` | `07:57` | yes |
| `BRIEFING_TZ` | `America/Denver` | no (default) |
| `BRIEFING_RECIPIENTS` | `will@getpacerai.com` | yes |
| `BRIEFING_FROM` | `Pacer AI Reports <reports@mail.getpacerai.com>` | yes |
| `BRIEFING_REPLY_TO` | `will@getpacerai.com` | no |
| `RESEND_API_KEY` | — | yes |
| `BRIEFING_SLACK_CHANNEL` | `U08SSDPDTH9` | no |
| `SLACK_BOT_TOKEN` | — | no |
| `BRIEFING_ANALYSIS` | `rules` | no (default) |

## 9. Rollout

1. Build in the platform harness behind `BRIEFING_ENABLED=false`.
2. Enable on Pacer AI - Hubspot Demo first; run one manual fire (`python -m pacer.briefing --now`) and compare side-by-side with the Oct 20 scheduled-task email.
3. Enable on Pacer AI - Demo (Salesforce).
4. Disable both claude.ai scheduled tasks (`Daily Pace Briefing`, `Daily Pace Briefing (HubSpot)`).
5. Add a `/briefing` entry to AGENTS.md: *the briefing job calls internal pacing functions directly and never the MCP layer; the content contract in this spec is locked — extend it here, don't fork it.*

## 10. Acceptance

- [ ] Both servers send at 07:57 MDT with the connector toggled off in claude.ai
- [ ] HTML and text bodies render the seven sections in order with all definitions present
- [ ] Numbers match a same-day `pace` call in Claude to the $K
- [ ] A forced data error still produces an email naming the failed horizon
- [ ] Two scheduler fires on the same day produce exactly one email
- [ ] Resend dashboard shows `briefing` tag on every send
