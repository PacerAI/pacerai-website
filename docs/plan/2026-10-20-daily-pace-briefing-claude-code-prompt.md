# Claude Code prompt — Daily Pace Briefing (server-side, Resend)

Paste into the Claude Code panel in VS Code with `pacerai-platform-claude-native` open. Put `SPEC-daily-pace-briefing.md` at `specs/SPEC-daily-pace-briefing.md` first.

---

Read `specs/SPEC-daily-pace-briefing.md` and `AGENTS.md` in full before doing anything. We are building the server-side Daily Pace Briefing described in the spec. Work in stages — Plan, Design, Build, Review, Document, Deploy — and stop at the end of each stage for my go-ahead before starting the next.

**Plan.** Map the repo before proposing anything:
- Find the implementations behind the MCP tools `pace`, `pace_quarterly` and `pace_annual` for both the Salesforce (Pacer AI - Demo) and HubSpot (Pacer AI - Hubspot Demo) servers. Tell me the exact module and function names, their return shapes, and how a server picks its data source at startup.
- Find how each server is hosted and started (App Service, container, Worker, local process) and whether any scheduler, background job, or cron mechanism already exists in the repo.
- Find any existing email or Resend code, and any Slack client.
- Confirm the Resend sending domain in config is `mail.getpacerai.com`.
Then write the plan as `specs/PLAN-daily-pace-briefing.md`: file-by-file changes, the scheduling mechanism you'll use for this host (spec §5 lists options — pick the one that matches reality), and anything in the spec that conflicts with the codebase. Stop and show me.

**Design.** Define the `BriefingSource` protocol and the two adapters by wrapping the existing pacing functions — do not duplicate their logic. Design the `pacer/briefing/` package: `run.py` (entry + idempotency), `analysis.py` (rules from spec §6), `render.py` (Jinja HTML + text from the same data), `send.py` (Resend, optional Slack), `config.py` (env vars from spec §8). Sketch the Jinja template. Stop and show me.

**Build.** Implement on branch `feat/daily-pace-briefing`. Constraints:
- The briefing calls internal pacing functions directly and never goes through the MCP layer.
- `from` is `Pacer AI Reports <reports@mail.getpacerai.com>`, `reply_to` `will@getpacerai.com`. Never send from `orders@`.
- Content order, table columns, footnote definitions, and the footer line are locked by spec §6 — match them exactly. Dollars in whole $K.
- Behind amounts in `#c05621`, churn in `#c53030`, Georgia on white, max width 760px, no images, no marketing footer.
- Idempotency: one send per server per local date; a second fire the same day is a no-op with a log line.
- Failure contract: any data error still sends the email naming the failed horizon(s) and the error text.
- `BRIEFING_ENABLED` defaults to false. Add a CLI: `python -m pacer.briefing --now [--dry-run]` where `--dry-run` writes the HTML and text to `./out/` instead of sending.
- Write tests: analysis rules against a fixture built from the Oct 20, 2026 briefing numbers in spec §6 and the renewal/new-bookings tables; render snapshot; idempotency; failure path. Run them.

**Review.** Run `--dry-run` for both servers and open the HTML files. Diff the HubSpot output against the email in my inbox titled "Pace — Oct 20: MTD behind $860K · FY Go-Get $2,100K" — same sections, same definitions, numbers to the $K. List every difference and whether it's intentional.

**Document.** Add a `## Daily Pace Briefing` section to `AGENTS.md`: the briefing job calls internal pacing functions, never the MCP layer; the content contract in `specs/SPEC-daily-pace-briefing.md` §6 is locked — extend it there, don't fork it; from-address rule; how to fire manually. Update `.env.example` with the spec §8 variables.

**Deploy.** Open a PR against main titled "feat: server-side Daily Pace Briefing via Resend" with the spec, plan, and the two dry-run HTML files attached. In the PR description list the exact env vars I need to set on each host and the scheduler entry to add. Do not merge, do not set `BRIEFING_ENABLED=true`, and do not touch the claude.ai scheduled tasks — I'll do those after a manual fire on HubSpot Demo.

Throughout: no corporate fluff in prose, tables for anything multi-row, and if a step in the spec doesn't fit what you find in the repo, say so and stop rather than improvising.
