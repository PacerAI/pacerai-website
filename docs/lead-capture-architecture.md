# Lead-capture architecture — form → Worker → D1 `leads` → Slack → Apollo sequence

> **Related docs:** goal → [`../goals/email-capture.md`](../goals/email-capture.md) (what we're optimising and how it's measured) ·
> diagram → [`lead-capture-flow-light.mermaid`](lead-capture-flow-light.mermaid) · page authoring + WPCode →
> [`../src/README.md`](../src/README.md) · deploy → [`deploy/runbook.md`](deploy/runbook.md) · nurture copy →
> `pacerai-gtm/tactics/website-visitor/email-sequences/` · hard rules → [`../CLAUDE.md`](../CLAUDE.md) §"WordPress.com CSS/JS Pitfalls".
> Sibling precedent: `pacerai-platform-claude-native/docs/data-pipeline-architecture.md` (same shape, Salesforce→Fabric instead of forms→D1).

**Who this is for:** the operator question *"someone gave us their email — where did it go, and who follows up?"*
If you only read one section, read **[Where changes are made](#where-changes-are-made)**.

---

## The flow

```
OFFER      white paper (PDF) · demo access · research waitlist          "talk to sales"
              │                                                            │
              │                                                            │  (no form — Calendly)
SURFACE    homepage hero + closing band · /resources · 13 blog posts     /contact
           /demo-connect                                                    │
              │                                                             ▼
              │   src/wpcode/footer.js §2  ← binds EVERY .wp-cta-form,   Calendly booking
              │                               reads data-asset-slug       (no row, no alert)
              │
              ├──────────────────────────┬──────────────────────────────────────────┐
              ▼                          ▼                                          │
CAPTURE    whitepaper-worker       pacer-demo-worker /demo-signup                    │
           POST /  (CORS)          Turnstile siteverify → password reveal            │
           validate → KV idem      (same-origin, iframed by /demo-connect)           │
           60s dedupe                    │                                           │
              │                          │                                           │
              │  200 + download_url      │  200 + connectorUrl + password             │
              │  returned FIRST,         │  returned FIRST,                           │
              │  side effects in         │  side effects in ctx.waitUntil             │
              │  ctx.waitUntil           │                                            │
              ▼                          ▼                                            │
CLASSIFY   internal · personal_email · competitor · valid_lead   ← domain match only   │
              │                                                    (no score, no ICP)  │
              ▼                                                                        │
DATA       D1 ▸ pacerai-leads ▸ leads   (append-only; ONE table, BOTH Workers)  ◀──────┘
           request_id · email · email_domain · company · lead_class · source ·          (never reaches
           asset_slug · page_url · utm_* · apollo_contact_id · enrolled_sequence · ip     the data layer)
              │
              ├──▶ NOTIFY   Slack #website-leads — classification emoji · source · UTM · Apollo deep link
              │
              └──▶ PLAY     Apollo: POST /v1/contacts (labels) → /v1/people/match backfill
                            → /v1/emailer_campaigns/{id}/add_contact_ids
                              valid_lead          → Signal_CONTACT_Whitepaper_BoardQualityARR  (4 steps · Day 0/3/8/15)
                              personal / competitor → Signal_CONTACT_Whitepaper_NonLead        (1 step)
                              internal            → no enrollment
                              demo-access · research-waitlist → no enrollment (no sequence yet)
                                   │
                                   ▼
HUMAN                       Will reads #website-leads and escalates a recognisable
                            PE-backed domain inside 24h — judgment, not code.
                            Nightly apollo-channel-status.py rolls the Apollo labels
                            into the GTME dashboard inbound KPI          ← REPORTING ONLY
```

### Two capture paths, one table

| | `.wp-cta-form` path | demo-signup path |
|---|---|---|
| Worker | `whitepaper-worker` (in `pacerai-gtm`) | `pacer-demo-worker` (in this repo) |
| Trigger | any `.wp-cta-form` on any page | the Worker-served widget iframed by `/demo-connect` |
| Bot gate | none (KV 60s idempotency only) | Cloudflare Turnstile, verified server-side |
| Hands back | `download_url` for slugs that have a file | connector URL + access password |
| Apollo | contact + enrich + sequence | **none** — the demo grants itself |
| Writes | `leads` | `leads` **and** legacy KV `DEMO_SIGNUPS` |

They stay separate because the demo needs a bot gate and a secret to hand out, and the resource path needs CORS and a fast redirect to a file. They write the same table so one query answers the whole funnel.

---

## Where changes are made

| You want to… | Where it happens | Then |
|---|---|---|
| **Add an offer** (new white paper, new magnet) | the `ASSETS` registry in `pacerai-gtm/infra/whitepaper-worker/src/index.ts` | `npm run deploy`, then add a form with `data-asset-slug="<key>"` |
| **Put a form on a page** | the page's HTML — `<form class="wp-cta-form" data-asset-slug="…">` | nothing else; `footer.js` binds it automatically |
| **Change form behaviour** (copy, redirect, validation) | `src/wpcode/footer.js` §2, or the form's `data-success-msg` / `data-redirect` | **paste `footer.js` into WPCode** — see [`../src/README.md`](../src/README.md) |
| **Change the demo signup widget** | `signupHtml()` in `infra/pacer-demo-worker/src/index.ts` | `npm run deploy`; it is server-rendered, not a page file |
| **Change who gets alerted** | the `SLACK_WEBHOOK_URL` secret on either Worker | `wrangler secret put`; no code change |
| **Change the nurture emails** | Apollo UI (sequence copy) + mirror in `pacerai-gtm/tactics/website-visitor/email-sequences/` | the Worker only holds the sequence **id** |
| **Read the leads** | `wrangler d1 execute pacerai-leads --remote --command "…"` | see [Worked example](#worked-example) |

### ❌ Do not add a second leads table

Both Workers bind the same D1 database on purpose. A per-Worker table would mean two schemas, two query shapes, and no single answer to "how many emails did the site capture this week."

Two related traps:
- **KV `DEMO_SIGNUPS` is not a second source of truth.** It predates D1 and still receives demo signups, because it is what the `demo_users.yml` roster sync reads. Treat it as a legacy side-record; the `leads` table is canonical.
- **Apollo is not the table of record either.** It is a downstream consumer. When Apollo returns 401 the row still lands with `apollo_contact_id = NULL` — that is the design, not a bug.

---

## Classification is the gate

`classifyLead()` is pure domain matching — 2 own domains, 12 personal, 18 competitor (sourced from `foundation/competitors/`), everything else `valid_lead`. There is **no score, no firmographic lookup, no ICP match** anywhere in the path, despite what `context/scoring.yml` and `classification-rules.yml` in `pacerai-gtm` describe.

| Class | Row written | Slack | Apollo contact | Sequence |
|---|---|---|---|---|
| `valid_lead` | ✅ | 🔥 | ✅ | the asset's sequence |
| `personal_email` | ✅ | ⚠️ | ✅ | thank-you (1 step) |
| `competitor` | ✅ | 👀 | ✅ | thank-you (1 step) |
| `internal` | ✅ | 🧪 | ✅ | **none** |

`internal` is what makes live testing safe: a `@getpacerai.com` submit exercises the whole path and never enrols you in your own nurture.

---

## Worked example

| Thing | Value |
|---|---|
| Database | `pacerai-leads` · `e0d0228a-75a6-4eff-b2b0-9455623229d2` · region WNAM |
| Schema | `pacerai-gtm/infra/whitepaper-worker/migrations/0001_leads.sql` |
| Capture endpoint | `https://whitepaper-worker.will-078.workers.dev` (POST `/`) |
| Demo endpoint | `https://pacer-demo-worker.will-078.workers.dev` (POST `/demo-signup`, widget at `/signup`) |
| Sequences | valid `69d83dab0a15420021ae717d` · non-lead `69e2577cfba82800152a99ab` |
| Alert channel | `#website-leads` (`SLACK_WEBHOOK_URL_WEBSITE_LEADS`; the Worker secret drops the suffix) |

```bash
# captures per week, by source
npx wrangler d1 execute pacerai-leads --remote --command \
  "SELECT strftime('%Y-%W',created_at) wk, source, COUNT(*) n FROM leads GROUP BY wk,source ORDER BY wk DESC"

# valid-lead share — the number that actually matters
npx wrangler d1 execute pacerai-leads --remote --command \
  "SELECT lead_class, COUNT(*) n FROM leads GROUP BY lead_class"

# a safe end-to-end test: @getpacerai.com classifies internal, so no sequence enrolment
curl -sX POST https://whitepaper-worker.will-078.workers.dev \
  -H 'content-type: application/json' \
  -d '{"email":"will@getpacerai.com","asset_slug":"demo-access","page_url":"https://getpacerai.com/"}'
```

> **Local note:** `--remote` hits production. Without it you are querying the local miniflare replica, which is a different database and will look empty.

---

## Gates & guardrails

- **Capture never blocks on a side effect.** Both Workers return the visitor's 200 first and run Apollo / D1 / Slack inside `ctx.waitUntil`. Every side effect is individually try/caught into an `errors[]` array that lands in the structured log (`npx wrangler tail`). A D1 outage costs a row, never a download.
- **Rows are append-only.** A repeat submit is a new row. Dedupe at read time — the 60-second KV idempotency window exists to stop double-submits, not to enforce uniqueness.
- **PII lives in three places:** the `leads` table, Apollo, and KV `DEMO_SIGNUPS` (where the *key* is the email address, and entries have no TTL). Any deletion request has to touch all three.
- **Never author the demo widget in a page file.** WordPress strips inline `<script>`; the widget is served by the Worker and iframed so the access password never appears in page source.
- 💰 D1 and Workers here sit inside free-tier limits. This is unrelated to the Fabric capacity guardrail.

## Known drift

Recorded rather than silently fixed — each is a real inconsistency you will hit when reading neighbouring docs.

1. **`pacerai-gtm/tactics/website-visitor/docs/design/flow.md` is wrong in three ways.** It shows `/v1/people` + `/v1/sequences/{id}/people` (the Worker uses `/v1/contacts` + `/v1/emailer_campaigns/{id}/add_contact_ids`), a 3-step Day 0/3/7 sequence (live is **4 steps, Day 0/3/8/15**), and a `log.jsonl` (the Worker writes D1 + `console.log`). It also has no non-lead branch and no D1.
2. **`sequence-board-quality-arr-snowballs.md` says `Status: Inactive`.** Apollo reports `active: true`. The file's "last synced 2026-04-19" header is the tell.
3. **The Apollo label migration is half-applied.** `scripts/apollo-rename.py` retires `whitepaper-download` → `Signal_CONTACT_Whitepaper_Triage`, but the Worker still writes the old kebab-case label, so every capture recreates what the migration removes. Both names coexist in `channel-status.json`. Drift, not breakage — Apollo labels are additive per contact.
4. **`plays/website-visitor/` is a dead path** still cited by several `pacerai-gtm` docs and by the Worker's own header comment. The live path is `tactics/website-visitor/`.
5. **The Worker's Apollo key was stale and silently 401-ing** — found and fixed 2026-09-25. Every capture
   between roughly 2026-07-01 and then created **no Apollo contact and enrolled nobody in nurture**; the
   `#website-leads` alert for 2026-07-01 reads `*Apollo:* (create failed — check logs)`, as did every alert
   until the secret was replaced from `pacerai-gtm/.env`. Downloads still worked throughout — the fan-out is
   isolated by design, which is exactly why it went unnoticed. **Watch for it:** `apollo.ok:false` in
   `npx wrangler tail`, or `apollo_contact_id IS NULL` on a non-internal row:
   ```bash
   npx wrangler d1 execute pacerai-leads --remote --command \
     "SELECT COUNT(*) FROM leads WHERE apollo_contact_id IS NULL AND lead_class!='internal'"
   ```
6. **Nothing reads the `leads` table yet.** The dashboard's inbound KPI is built from Apollo labels, not from D1. Until something consumes it, the table is an audit log and a manual query surface.
