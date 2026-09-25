# Goal — Capture the work email

**Status:** Active
**Owner:** Will Sullivan
**Set:** 2026-09-24
**Supersedes:** the "converts visitors into demo requests" goal in `docs/plan/overview.md` and §0 of `docs/review/website_bone_v3_recommendations.md`

---

## The goal

**Get a revenue leader to hand over their work email, in exchange for something they get immediately.**

Two offers, both free, both self-serve:

| Offer | Where it lives | What they get back |
|---|---|---|
| **Demo access** | Homepage hero, nav, `/demo-connect` | Turnstile check, then the connector URL + access password, on screen |
| **Board-Quality ARR Snowballs** (white paper) | Homepage closing band, Resources hub, every blog post | PDF opens immediately; Apollo enrolls them in the 4-step nurture |

Booking a call is the secondary path. It lives on `/contact/` and nowhere else.

## Why this changed

The prior goal was a Calendly booking. That asked every visitor for a 30-minute commitment before they had seen anything, and captured **nothing** from the ones who weren't ready — which is most of them. Three CTAs promised "Get a Sample Board Package" and delivered a calendar; there was no file behind the promise.

Meanwhile the machinery for the new goal already existed and was unreachable: a working capture Worker, a live PDF, and a 4-step nurture sequence, all attached to a page that had been retired and 301-redirected.

## How it works

```
any page ─► work email ─► whitepaper-worker ─┬─► D1 `leads` (table of record)
                                             ├─► Apollo contact + enrich + nurture
                                             └─► Slack #website-leads
/demo-connect ─► email + Turnstile ─► pacer-demo-worker ─┬─► D1 `leads`
                                                         ├─► KV DEMO_SIGNUPS
                                                         └─► Slack #website-leads
```

Both Workers write the **same** `leads` table, so one query answers "who came in this week and from where."

- Schema: `pacerai-gtm/infra/whitepaper-worker/migrations/0001_leads.sql`
- Capture endpoint: `pacerai-gtm/infra/whitepaper-worker/src/index.ts` (the `ASSETS` registry is where new offers get added)
- Demo signup: `pacerai-website/infra/pacer-demo-worker/src/index.ts`
- Form handler: `src/wpcode/footer.js` §2 — binds every `.wp-cta-form`, reads `data-asset-slug`

## Measures

Pull from D1, not from a dashboard:

```sql
-- captures per week by source
SELECT strftime('%Y-%W', created_at) wk, source, COUNT(*) n
FROM leads GROUP BY wk, source ORDER BY wk DESC;

-- valid-lead share (the number that actually matters)
SELECT lead_class, COUNT(*) n FROM leads GROUP BY lead_class;

-- distinct companies, last 30 days
SELECT COUNT(DISTINCT email_domain) FROM leads
WHERE created_at > date('now','-30 day') AND lead_class='valid_lead';
```

| Measure | Baseline | Target |
|---|---|---|
| Captures / week | not yet measured | set after 2 weeks of data |
| Valid-lead share | not yet measured | > 50% (rest is personal email / competitors) |
| Demo → white paper split | not yet measured | informs which offer leads the hero |

Baseline first, targets second. Nothing here is worth a target until there are two weeks of real rows.

## Open

- **Email notification to Will is deferred.** Slack only for now (Will's call, 2026-09-24). `getpacerai.com` DNS sits at WordPress.com with Google Workspace MX, so Cloudflare's native `send_email` binding is unavailable without moving the zone. A commented Resend stub sits in `fanOut()` in the whitepaper worker — one secret and ~10 lines to switch on.
- **Only one resource exists.** The white paper is the entire free-resource library. More assets (ARR snowball template, board reporting checklist, the unpublished `prompt-library/`) are each a content build, and each one is a new `ASSETS` entry plus a `data-asset-slug`.
- **The demo widget's "password is on its way" copy** promises an email nothing sends. The password is revealed on screen instead; the copy should be rewritten or the email actually sent.
- **`src/research/index.html`** has a waitlist form and is undeployed + unregistered. The Worker now accepts its slug, so it would work if published.
