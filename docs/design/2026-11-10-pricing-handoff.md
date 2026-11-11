# Handoff: pricing page v2 and the purchase flow (2026-11-10)

**Branch:** `will/pac-164-update-website-pricing-products-and-services-to` (PR #64). Nothing in this branch is deployed.
**Issues:** [PAC-164](https://linear.app/getpacerai/issue/PAC-164/update-website-pricing-products-and-services-to-price-book-v20) (pricing page v2.0), [PAC-260](https://linear.app/getpacerai/issue/PAC-260/purchase-flow-send-msa-mnda-and-stripe-invoice-when-the-kickoff-is) (Stripe, SignWell, approval; Spec review)
**Specs:** `docs/design/purchase_process.md` (+ `.html`), mockup `docs/design/pricing/pricing-v2_2026-11-10.html`

**LIVE 2026-11-11.** PRs #64 and #66 merged; go-live steps 1 to 8 done (see `docs/document/changelog.md`). What remains is Will's to-dos and PAC-260.

## Where it stands

| Piece | State |
|---|---|
| `/pricing/` page (WP 111) | Built from Price Book v2.0 by `scripts/build_pricing.py`. Passes `validate.py --strict` (11/11, 32,882 chars). **Not deployed.** WP page is still Draft; Redirection rule 5 still 302s `/pricing/` to `/#pricing`. |
| Homepage per-seat price line + See Pricing link | Edited in `src/homepage/index-build.html:528-529`. Not deployed (~65.9K of 68K). |
| Worker order card (`infra/pacer-demo-worker/src/order.ts`) | Purchase confirm screen: legal name, billing email and address, optional PO, Order Terms checkbox. Totals recomputed server-side. Confirmation email includes Book your kickoff. **Not deployed.** |
| `migrations/0005_pricing_seats.sql` and `0006_orders.sql` | Written, **not applied** to remote D1. |
| Purchase process spec | Done and agreed: `docs/design/purchase_process.md`. |
| PAC-260 | Updated 2026-11-10 with the corrections below. Still in Spec review. |

## Decisions (Will, 2026-11-10)

- PAC-260 as Will rewrote it wins any conflict with chat.
- Seats are pure. Page shows the three licenses plus services: Installation, AI Transformation, Reporting & Planning, M&A Services. No bands, Startup, Advisor, bulk rates, small team rate, pilot program or "most teams spend".
- H1: "Bottom-up Forecasting to hit sales targets with confidence". Seat copy is "<Product name>: <benefit>" for CRO/CFO/CEO. Service items are bullet-separated, each linking to a blog post.
- **SLT installation $5,000 stays on the page** (Installation row, `src/pricing/pricing-template.html:279`). Never in the seat total; added to the first invoice after approval.
- **`scripts/build_pricing.py` stays.** The Stripe price-ID map goes next to `price-book.json`, checked by the build.
- 12-month terms are billed up front ($1,000 / $5,000 / $10,000 per seat per year). Will approves every order (~first 5 customers) with a decline path. Stripe Tax on, billing address collected, Order Terms checkbox points to the MSA, optional PO, Net 30. E-signature: SignWell. Kickoff link: `https://calendly.com/pacerai/pacer-ai-onboarding`.
- D1 statuses: `submitted`, `kickoff_scheduled`, `approved`, `declined`, `invoiced`, `processing`, `paid`, `payment_failed`, `overdue`.

## Factory: not yet

`/factory PAC-260` stays deferred. Run it only after: this PR is merged, the Price Book's 12-month line is edited, Stripe test secrets and SignWell are set, and PAC-260 is moved to Ready.

## Done on this branch (not deployed)

Purchase steps 2 and 3 are in the tree. The page button is Purchase. The confirm screen, the confirmation email and `migrations/0006_orders.sql` match the list that was here. The 12-month line still says "billed monthly" because the Price Book still says that. `MSA_URL` in `src/order.ts` is empty until Price drafts the MSA; the checkbox names the agreement. `scripts/build_pricing.py --check` stays out of `factory/checks.sh` (PAC-164). The go-live sequence below is unchanged and still asks Will first.

## Will's to-dos

- [ ] Edit the Price Book: 12-month contracts billed up front, not "billed monthly" (foundation repo; then bump the submodule). Then the page's line 59 text changes too.
- [ ] Blog posts behind the service links: `/resources/what-a-day-1-brief-contains/` is a 404; no posts yet for annual plan, forecast model, MBR & QBR. Write them or say which links to drop.
- [ ] Stripe account, `STRIPE_SECRET_KEY` and webhook signing secret (Will's bot sets them; test mode first).
- [ ] SignWell API key and the NDA / MSA templates. The MSA is Price's to draft; may need a lawyer.
- [ ] Host a W-9. Confirm whether Calendly is on a paid plan (needed for webhooks).
- [ ] Approve go-live.

## Go-live sequence (each step asks Will first)

1. `npx wrangler d1 execute pacerai-leads --remote --file=migrations/0005_pricing_seats.sql`, then `0006`.
2. Deploy the Worker to staging, then production; check `/signup` returns 200.
3. Backup, then `python3 scripts/deploy.py 111`, and publish page 111.
4. Disable Redirection rule 5 in WP Admin.
5. `python3 scripts/deploy.py 25` (homepage).
6. Verify the 200s; log to `docs/document/changelog.md`.
7. Update CLAUDE.md (Pricing 111 row, Stack note, Known Issues), `src/nav-headers.html:28`, `docs/deploy/order-email-setup.md`.
8. Delete `src/pricing/_preview-local.html`.

Until PAC-260 lands, purchase steps 4 to 8 are done by hand: Calendly emails Will, Will sends the NDA and MSA from SignWell and creates the invoice in Stripe.
