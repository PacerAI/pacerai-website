# Plan: /pricing/ live, order capture, then Stripe (2026-10-14, v2)

**Goal:** the two-package pricing page live at `getpacerai.com/pricing/` today, with prices that come from the
pacerai-foundation Price Book, GA4 events that fit the 2026-10-13 tracking design, and a **Choose** button that
captures the visitor's selection and email, saves it, and emails both the visitor and Will. Payment through Stripe
follows as phase 3.
**Design source:** [`docs/design/pricing/two-package-pricing_2026-10-14.html`](../design/pricing/two-package-pricing_2026-10-14.html)
**Price source:** pacerai-foundation `pricing/product-pricing-price-book.md` (v1.0, effective 2026-10-14)
**Stripe account:** `acct_1QMZZ104FPHkGt9q` (dashboard → Billing → Setup)

## Phases and time

| Phase | What ships | Time | Today? |
|---|---|---|---|
| 1. Page | `/pricing/` live, prices from foundation, toggle and − / + working, GA4 events | ~60 min | Yes |
| 2. Order capture | **Choose** opens a summary + email card; the selection is saved; the visitor and Will get emails; Slack ping; Apollo contact | ~90 min | Yes, after phase 1 |
| 3. Stripe | Catalog built from the Price Book; payment from **Choose** | ~2–3 h, plus Stripe and legal setup | No, next session |

An hour covers phase 1 only. Phase 1 ships with **Choose** linking to the Calendly walkthrough, so the page is useful
the moment it's live. Phase 2 swaps that link for the capture card with a `footer.js` change and a Worker deploy; the
page itself is not redeployed.

## Review findings that shape the plan

| # | Finding (where) | What it means for the build |
|---|---|---|
| 1 | WordPress strips `<script>` tags; all site JS runs from `src/wpcode/footer.js` (runbook, footer.js header) | The toggle and − / + controls move into a new guarded section of `footer.js`. The page HTML carries no script. |
| 2 | WordPress strips `id=` except `pacerai-homepage` (runbook; `validate.py` check 2) | The design's `id="bill"`, `lblM`, `lblA` become classes / `data-` attributes. |
| 3 | No HTML comments, no `<link>` tags, no Google Fonts links in the `wp:html` block (runbook) | Strip them from the design; DM Sans is already loaded by the site. |
| 4 | Nav and footer are required (`validate.py` checks 7, 9, 10); mobile nav is handled by `footer.js` §4 | Use the sub-page nav and canonical footer; drop the design's own menu-toggle script. |
| 5 | `validate.py` check 12 compares every `$X/mo` on a page with `foundation/pricing/pricing-packaging.yml`, which no longer exists, so the check **passes silently** | Add a machine-readable price book to foundation and point check 12 at it, so price drift fails the build. |
| 6 | The `foundation/` submodule is pinned at `517aaf4` (May 29); foundation `origin/main` was already at `8653b0f` (Sep 28) | Update the submodule in the same PR as the new price book. |
| 7 | GA4 key event `pricing_page_visit` fires on URLs containing `getpacerai.com/pricing/` (web-tracking.md §4) | Ship at exactly `/pricing/`; reuse WP page **111** (slug `pricing`). |
| 8 | `/pricing/` is 301-redirected to `/#pricing` by the Redirection plugin | Will removes that rule in WP Admin. |
| 9 | `footer.js` §0 tracks clicks on `<a href>` only; `cta_location` comes from the nearest `<section>`'s first class | **Choose** must be a real link; each package sits in its own `<section>` with a distinct first class. |
| 10 | `pricing_estimate` is allow-listed in `footer.js` §0 and reserved in web-tracking.md | The page sends it through `window.pacerTrack` directly. |
| 11 | Apollo already labels `/pricing/` a **high** intent page (web-tracking.md D6) | Nothing to change; verify after go-live. |
| 12 | Homepage pricing band links **Discuss Pricing** to `/contact/`; homepage is 66,249 of ~69,000 chars | Point that button at `/pricing/` today; nav `/#pricing` links wait for a batch deploy. |
| 13 | The demo signup already solves "capture an email on WordPress": a **Worker-served iframe** with Cloudflare Turnstile, posting to `pacer-demo-worker`, which writes the shared D1 `leads` table, pings Slack `#website-leads`, creates the Apollo contact, and reports to GA4 by `postMessage` (`infra/pacer-demo-worker/src/index.ts`) | Phase 2 copies that pattern: a `/order` widget and a `POST /pricing-request` route in the same Worker. Turnstile matters here because the Worker will email whatever address is typed in. |
| 14 | Neither Worker sends transactional email today (Apollo sequences send follow-ups; Slack alerts Will) | Phase 2 adds an email provider. Recommended: **Resend**, sending from a verified `getpacerai.com` subdomain, `Reply-To: will@getpacerai.com`. |
| 15 | GA4 policy and decision D8: an email never goes in a URL | The selection (package, billing, user and hour counts) can go on the iframe URL; the email is typed inside the iframe and only ever POSTed. |

## Decisions for Will

| Decision | Recommendation | Alternative |
|---|---|---|
| **Choose** in phase 1 | Calendly walkthrough ("Book a walkthrough"), fires the `schedule_walkthrough` key event | `/demo-connect/` (`try_demo_click`). CLAUDE.md keeps booking links on `/contact/`, so either needs your OK. |
| Email provider (phase 2) | **Resend**: free tier, one Worker `fetch`, verified sender on a subdomain such as `mail.getpacerai.com` (3 DNS records in WordPress.com DNS; Google Workspace mail is untouched) | Apollo one-step sequence from your mailbox: no new vendor, but the selection has to travel in Apollo custom fields and arrives minutes later |
| GA4 key event for a captured order | Make `pricing_request` a **key event**: it is an outcome (email plus a chosen plan), like `demo_signup` | Keep it as a step under `schedule_walkthrough` |
| How phase 3 takes payment | **Stripe Quote / Invoice sent by Will** for annual contracts (ACH, net 15), self-serve **Checkout** for month-to-month | Self-serve Checkout for everything |

---

## Phase 1: the page (~60 min)

### A. Foundation: the Price Book is the source (≈10 min)
- [ ] In pacerai-foundation add `pricing/product-pricing-price-book.md` (v1.0) and a machine-readable twin
      `pricing/price-book.yml`: `version`, `effective_date`, `next_review`, `currency`, and one entry per offering
      (`id`, `revenue_type`, `offering`, `term`, `price`, `unit`, `stripe_lookup_key`). Include the display strings
      the page shows (`$1,500/mo`, `$1,800/mo`, `$3,000/mo`, `$3,600/mo`) so check 12 can match them.
- [ ] Mark `product-pricing-tiers.md` as superseded for website pricing (link to the Price Book).
- [ ] Commit to foundation `main`; in pacerai-website run `git submodule update --remote foundation`.

### B. Build script: the page pulls its prices from foundation (≈15 min)
- [ ] `src/pricing/pricing-template.html`: the design with `{{price.*}}` placeholders. From the design: ids → classes
      and `data-` attributes; no `<script>`, comments or fonts `<link>`; sub-page nav and canonical footer; each
      package in `<section class="price-sales-pacing">` / `<section class="price-pacing-planning">`; **Choose** as an
      `<a>` with `data-plan`; the WordPress overrides (hide theme header, footer and title; bone background; remove
      constraints) from `pricing-bone_v3_2026-10-13.html`.
- [ ] `scripts/build_pricing.py` reads `foundation/pricing/price-book.yml` and writes:
      `src/pricing/pricing-build.html` (prices in the text and in `data-m`, `data-a`, `data-seat-m`, `data-seat-a`,
      `data-block`, `data-included`, plus `data-price-book="v1.0"`), and
      `infra/pacer-demo-worker/src/price-book.json` for phase 2's server-side price check.
      Fails if the YAML is missing or a placeholder is left unfilled.
- [ ] `scripts/validate.py` check 12 reads `price-book.yml` and **fails** when the file is missing.
- [ ] `scripts/deploy.py`: add `111: "src/pricing/pricing-build.html"` to `PAGE_REGISTRY` and `PAGE_NAMES`;
      update CLAUDE.md's registry row for 111 and the runbook's "retired" list.

### C. JavaScript and GA4 (≈10 min)
- [ ] `src/wpcode/footer.js` new section **9. Pricing page**, guarded by `#pacerai-homepage .pricing-two-pack`.
      No prices in code: every number is read from the `data-` attributes.
- [ ] `python3 scripts/build_footer_paste.py`.
- [ ] GA4 Admin (2 min): event-scoped custom dimensions `plan` and `billing`.

| Event | When | Params | Key event |
|---|---|---|---|
| `pricing_page_visit` | Page view on `/pricing/` | GA4 config, nothing to code | Yes |
| `pricing_estimate` | 1.5 s after the last toggle or − / + change | `plan`, `billing`, `value` (monthly total) | No |
| `schedule_walkthrough` | Click on **Choose** (phase 1) | `cta_location` = the package's section class | Yes |

### D. Deploy (≈10 min)
- [ ] `python3 scripts/build_pricing.py && python3 scripts/validate.py src/pricing/pricing-build.html --strict`
- [ ] Back up page 111 to `docs/review/pre-deploy-backup-111-<date>.json`; `python3 scripts/deploy.py 111` (status `publish`).
- [ ] **Will, WP Admin:** paste `footer.paste.txt` into WPCode → Header & Footer → Footer; check the console for errors.
- [ ] **Will, WP Admin:** Tools → Redirection → disable `/pricing/` → `/#pricing`.
- [ ] **Will, WP Admin:** Yoast title and meta description for page 111.
- [ ] Homepage (if approved): **Discuss Pricing** → **See Pricing**, `href="/pricing/"`; back up 25, `python3 scripts/deploy.py 25`.

### E. Verify (≈10 min)
- [ ] `https://getpacerai.com/pricing/` returns **200**, not 301.
- [ ] Logged out, desktop and phone: bone background, nav and footer, cards aligned, toggle and − / + work, users $50 annual / $60 monthly.
- [ ] Every price on the live page matches Price Book v1.0.
- [ ] `node scripts/check_trackers.mjs https://getpacerai.com/pricing/`: one GA4 collect, one Apollo call, no 400s.
- [ ] GA4 Realtime: `pricing_page_visit`, `pricing_estimate`, `schedule_walkthrough` with the package's `cta_location`.

---

## Phase 2: Choose captures the order and emails both sides (~90 min)

### Flow
1. Visitor sets billing, users and hours, then clicks **Choose**.
2. `footer.js` §9 sends `pricing_choose` and opens a modal holding an iframe:
   `https://pacer-demo-worker.will-078.workers.dev/order?plan=pacing_planning&billing=annual&pu=5&fu=7&hb=1&pb=v1.0`
   (selection only, never an email).
3. The iframe shows the order summary, recomputed from `price-book.json`, and asks for **work email** (required),
   **name** and **company** (optional), plus a consent line and Turnstile.
4. `POST /pricing-request` on the Worker: verify Turnstile → reject disposable domains (existing list) → **recompute
   totals server-side** from `price-book.json` (never trust the page's numbers) → save → email → Slack → Apollo.
5. The iframe shows "Order summary sent to <email>. Will reaches out within one business day," and posts
   `{type:'pacer:event', name:'pricing_request', params:{plan, billing, value, user_id}}` to the page.

### What gets saved (D1 `pacerai-leads`, new table `pricing_requests`)

| Column | Example |
|---|---|
| `id`, `created_at` | `pr_…`, ISO time |
| `email`, `name`, `company`, `email_class` | classifier shared with `leads` |
| `plan`, `billing` | `pacing_planning`, `annual` |
| `pacer_users`, `planning_users`, `hour_blocks` | 5, 7, 1 |
| `monthly_total`, `annual_contract_value` | 4,600, 55,200 |
| `price_book_version` | `v1.0` |
| `utm_source`, `utm_medium`, `utm_campaign`, `landing`, `page_url` | first-touch attribution from `pacerAttr` |
| `status` | `requested` → `quoted` → `paid` (phase 3) |
| `stripe_customer_id`, `stripe_quote_id`, `stripe_subscription_id` | empty until phase 3 |

The migration lives with the `leads` schema in pacerai-gtm `migrations/` (the shared table's home per `index.ts`).

### Emails (Resend)

| To | Subject | Body |
|---|---|---|
| Visitor | "Your Pacer AI order summary" | Package, billing, users, hour blocks, monthly price and annual contract value; "Price Book v1.0, valid 30 days"; next step (Will books a kickoff and sends the order form); reply goes to Will |
| Will | "Pricing request: <company>, <plan>, $<ACV>" | Same summary plus email, attribution and the D1 row id |

### Steps
- [ ] Resend: create the account, add `mail.getpacerai.com`, add its DNS records in WordPress.com → Domains → DNS, wait for "Verified".
- [ ] Worker secrets: `wrangler secret put RESEND_API_KEY`; vars `ORDER_NOTIFY_TO=will@getpacerai.com`, `ORDER_FROM="Pacer AI <orders@mail.getpacerai.com>"`.
- [ ] `infra/pacer-demo-worker/src/index.ts`: routes `GET /order` (widget, CSP frame-ancestors `getpacerai.com`) and
      `POST /pricing-request`, reusing the Turnstile, disposable-domain, Slack and Apollo helpers. Apollo: the contact
      goes on a new list `Signal_CONTACT_PricingRequest`, not enrolled in a sequence (Will follows up himself).
- [ ] D1 migration for `pricing_requests`; `wrangler d1 migrations apply pacerai-leads`.
- [ ] Deploy to staging, test end to end, then `npm run deploy`.
- [ ] `footer.js` §9: **Choose** opens the modal (falls back to the Calendly link if the iframe fails to load);
      add `pricing_request` to `ALLOWED` in §0 and pass `plan`, `billing`, `value`; call `pacerSetUser` with the returned id.
- [ ] Rebuild and paste `footer.paste.txt` (Will).
- [ ] GA4: mark `pricing_request` as a key event; web-tracking.md: add `pricing_choose` and `pricing_request`, update D5.

| Event | When | Key event |
|---|---|---|
| `pricing_choose` | Click on **Choose** (modal opens) | No: a step |
| `pricing_request` | The Worker saved the order and sent the emails | Yes |

### Verify
- [ ] A test order from a real inbox: both emails arrive, the D1 row matches the page, Slack posts, the Apollo contact is on the list.
- [ ] A disposable address and a failed Turnstile are refused with a clear message.
- [ ] Totals posted from a tampered page are ignored (the saved row matches the Price Book, not the request).
- [ ] GA4 Realtime: `pricing_choose`, then `pricing_request` with `plan`, `billing`, `value`.

---

## Phase 3: Stripe (next session)

### Stripe dashboard setup (Billing → Setup)

| Area | Setting |
|---|---|
| Business details | Legal name Predictive Analytics Partners LLC, statement descriptor `PACER AI`, support email, logo and brand color |
| Products and prices | Built by script from `price-book.yml` (below), never typed by hand |
| Payment methods | Card, ACH Direct Debit, bank transfer (B2B contracts of $18K–$36K+ usually pay by ACH or invoice) |
| Invoices | Template with the Price Book version in the footer; net 15 default; Smart Retries and failed-payment emails on |
| Customer portal | Update payment method and view invoices; **cancellation off for annual contracts** |
| Tax | Stripe Tax registration review for SaaS by state (Colorado home state); confirm with your accountant |
| Webhook | Endpoint `https://pacer-demo-worker…/stripe-webhook` for `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` |

### Catalog from the Price Book
- [ ] `scripts/sync_stripe_catalog.py` reads `price-book.yml` and creates products (Pacing Agent, Planning Agent, User
      license, Monthly 5-hr block, Installation & integration, 5 / 20 / 40-hr blocks) and prices with lookup keys
      such as `pb_v1_pacing_agent_m`, `pb_v1_pacing_agent_12m`, `pb_v1_user_license_m`, metadata
      `price_book_version: v1.0`. Stripe prices can't be edited, so a new Price Book version creates new prices
      and moves the lookup keys; old subscriptions keep their price.
- [ ] Run it in **test mode** first, then live.

### Payment from Choose
- **Month-to-month:** the Worker creates a Checkout Session (mode `subscription`) from the lookup keys with the chosen
  quantities (extra users = users above 5 per agent), prefilled email, and returns its URL; the modal's
  "Continue to payment" opens it.
- **Annual contract billed monthly:** Stripe Checkout can't enforce a 12-month commitment. The Worker creates a
  **Quote** (or a subscription schedule of 12 monthly iterations) for Will to send; the customer accepts and pays by
  ACH or card.
- The webhook updates `pricing_requests.status`, posts to Slack, and moves the Apollo contact.
- GA4: `begin_checkout` from the modal; `purchase` (value, currency) sent server-side by the webhook through the GA4
  Measurement Protocol, marked as a key event.

### Before taking any payment
- [ ] Terms of Service / order terms page on getpacerai.com (Checkout and Quotes link to it), and a privacy policy link.
- [ ] Restricted Stripe API key stored only as a Worker secret, never in `footer.js` or a page.
- [ ] Test-mode run of each path: monthly card, annual quote by ACH, failed payment, cancellation attempt on annual.

## Rollback
- Page: re-POST `docs/review/pre-deploy-backup-111-<date>.json` and re-enable the Redirection rule.
- Footer JS: `git show HEAD~1:src/wpcode/footer.js`, rebuild the paste file, paste it back.
- Worker: `wrangler rollback` to the previous version; **Choose** falls back to the Calendly link when the iframe fails.

## Later
- Nav **Pricing** link `/#pricing` → `/pricing/` on every page (batch deploy).
- Homepage pricing band copy and the FAQ schema answer "What does pricing look like?".
- Archive the superseded drafts in `docs/design/pricing/`.
- Price Book review by 2027-04-14: edit foundation, rerun `build_pricing.py` and `sync_stripe_catalog.py`, redeploy 111 and the Worker.
