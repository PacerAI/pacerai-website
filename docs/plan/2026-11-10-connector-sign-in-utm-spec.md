# SPEC: Connector sign-in records the visitor's utm tag (PAC-262)

**Status:** Draft · **Owner:** Will Sullivan · **Date:** 2026-11-10
**Tests:** `tests/test_connector_sign_in_utm.py` (with `tests/harness_worker.mjs`, which runs the demo Worker under Node)

The Worker half of PAC-261. It ships first; the platform half (`lead_sync.py` sending the tag) stays on PAC-261 and
starts sending the tag once this is live. Context: `docs/plan/2026-11-10-demo-connect-day-1-brief-spec.md`, "Not in
this change", first bullet, and `docs/deploy/2026-10-21-demo-connect-one-button.md` for the route and its token.

## The problem

`POST /internal/connector-sign-in` (`infra/pacer-demo-worker/src/connector-sign-in.ts`) passes `utm_source`,
`utm_medium` and `utm_campaign` to `recordDemoLead` as `null`. A sign-in from the LinkedIn DM link
(`utm_source=linkedin&utm_medium=dm&utm_campaign=day1-brief`) can't be told apart from any other sign-in in D1
`leads` or in Slack.

## Acceptance criteria

1. **The route reads the tag.** `utm_source`, `utm_medium` and `utm_campaign` are optional strings in the JSON body.
   Each goes through the route's own `str(v, n)` helper, as `book` does: trimmed, cut to **100** characters, and
   `null` when it is missing, blank or not a string. No other new field is read.
2. **A tagged sign-in carries the tag.** The D1 `leads` row has the three values, and the Slack alert's
   `*Came from:*` line shows them (`recordDemoLead` already builds that line from the tag).
3. **An untagged sign-in behaves as today.** The live platform build sends no tag. That request still gets 200
   `{ok:true}`, the row's three tag fields are `null`, and the Slack alert has no `*Came from:*` line.
4. **Bad values don't break a sign-in.** A value over 100 characters is stored cut to 100. A number, boolean, list,
   object or blank string is stored as `null`. Either way the reply is 200 and the lead is recorded.
5. **The header comment's request shape lists `utm_source`, `utm_medium` and `utm_campaign`** as optional fields.

## Not in this change

- The platform side, `lead_sync.py` sending the tag (PAC-261).
- `/demo-connect/`, the WPCode footer and the `/signup` widget.
- `recordDemoLead` itself; it already takes the tag. Only the call site changes.

## Check by hand after deploy

Merging doesn't deploy. Deploy with the Worker's normal production deploy, then:

- `/signup` returns 200 (CLAUDE.md's rule for this Worker).
- A `POST /internal/connector-sign-in` from the current platform build, which sends no tag, still records the lead
  with null tag fields.
