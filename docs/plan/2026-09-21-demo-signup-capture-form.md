# Plan — Demo signup on getpacerai.com (`/demo-connect`)

> **Related docs:** governing spec → `pacerai-platform-claude-native/specs/011-demo-access-and-email-login/spec.md`
> (AC-1 = onboarding page; AC-5 = email-capture form) · roadmap story 11 →
> `pacerai-platform-claude-native/docs/roadmap/registry.yml` · user test →
> `pacerai-platform-claude-native/user-tests/11_Prospect_signup/11_Prospect_signup.md` · page source →
> `../../src/demo-connect.html` · WP page pattern → `../../CLAUDE.md` · reel infra → `../../infra/pacer-demo-worker/`.

**Owner:** Will (approve) / agent (build) · **Repo:** `pacerai-website` (owns the getpacerai.com page + the
Cloudflare Worker; the connector auth + roster live in `pacerai-platform-claude-native`).

## Why this exists
Spec 011's **AC-1 (onboarding page)** and **AC-5 (website email-capture signup)** are website work. This doc
tracks that slice and cross-links the spec, roadmap story 11, and the user test.

---

## Part A — Onboarding page, live + seamless with the homepage ✅ DONE (2026-09-24)

- [x] `src/demo-connect.html` authored as a v3 bone WordPress fragment; passes `validate.py --strict` (11/11).
- [x] Demo reel deployed to the staging Worker (`/v/demo-connect`, HTTP 200) and embedded on the page.
- [x] Page **published** — WP ID **983**, `getpacerai.com/demo-connect` (HTTP 200); registered in `CLAUDE.md`
      + `scripts/deploy.py` (`PAGE_REGISTRY`/`PAGE_NAMES`).
- [x] Homepage CTA "See a Live ARR Demo" → `/demo-connect` added and homepage (WP 25) redeployed.
- [x] **Chrome rebuilt from the live homepage** so it's seamless: full TT4 width override (was clamped to
      620px), `position:fixed` nav (Log In + Free Diagnostic), `--maxw:1180`, `--font-body:'DM Sans'`,
      homepage 3-col footer. Root cause (cloned stale `contact.html`) documented in `CLAUDE.md` pitfalls.
- [x] Design reference: `docs/design/demo-connect/demo-connect-bone_v3_2026-09-24.html`.
- [ ] **Will (WP Admin only):** set the Yoast title (<60) + meta description (<155) for page 983 — REST can't
      write Yoast on WordPress.com.

**What Part A does NOT have:** any way to enter an email. Access today = the story-10 model (the page tells the
visitor the access password comes privately from Pacer). The email-capture signup is Part B below.

---

## Part B — Email-capture signup (AC-5 / roadmap story 11) — NOT built

**Goal:** on `/demo-connect`, a prospect enters a work email in exchange for the demo; the request is stored,
Will is pinged in Slack, and on approval the prospect gets access.

### The flow
```
/demo-connect: work email (+ optional name/company) + Cloudflare Turnstile → Submit
  → pacer-demo-worker POST /signup: verify Turnstile → write {email,company,ts,status:"pending"} to Cloudflare KV
  → Worker posts to Slack #gtm-triggers: "New demo request — <email> · <company> · <time>"
  → success state on the page: connector URL + "we'll email your access shortly"
  → Will reviews in #gtm-triggers → approves → prospect gets connector instructions + access password (private)
    ; KV record → status:"approved" ; entry added to mcp/pacer_intake_mcp/demo_users.yml
```

### The three questions, answered
- **How is the email captured?** An email field + **Cloudflare Turnstile** (bot check — the "real person"
  gate, in place of email verification for now) on `/demo-connect`, POSTing to the Worker. Turnstile scope is
  already on Will's Cloudflare token.
- **Where does the email go?** To a **Cloudflare KV** namespace on `pacer-demo-worker` (a web form can't write
  the git-tracked `demo_users.yml`). KV is the live request list; it is **synced into
  `mcp/pacer_intake_mcp/demo_users.yml`** (the curated roster of record) on approval.
- **How is it reviewed & approved?** The Worker posts every submit to **Slack #gtm-triggers** (the review
  trigger). Will reviews there and approves; approval flips the KV record to `approved`, adds the prospect to
  `demo_users.yml`, and sends the connector instructions + access password (the story-10 private note/email).
  **No email verification** in this version (deferred to AC-4 / spec 009 Cloudflare Email).

### v1.0 status — BUILT + LIVE (2026-09-24)
Revised model (Will): **captcha-gated auto-reveal** — pass Turnstile → the password is shown on the page;
Slack is an FYI; email is tracked. The widget is **served by the Worker and iframed** on `/demo-connect`
(WordPress strips inline `<script>`; this also keeps the password out of the page source).
- [x] Turnstile widget created (sitekey `0x4AAAAAAFCmrSWLyo0ieLAF`; secret set as `TURNSTILE_SECRET`).
- [x] KV namespace `DEMO_SIGNUPS` created + bound in `wrangler.toml`.
- [x] Worker `GET /signup` (3-screen widget: email → Turnstile ≤3 tries → reveal) + `POST /demo-signup`
      (siteverify → KV write → Slack → return `{password, connectorUrl}`) in `infra/pacer-demo-worker/src/index.ts`; deployed.
- [x] `/demo-connect` embeds the signup iframe; validated `--strict`; page 983 redeployed (live).
- [x] Verified: bad/no Turnstile token → 403 (no KV write, no password); `/signup` renders; reel + `/` intact.
- [ ] **Will — set two Worker secrets** (until then the flow runs but shows "password on its way" instead of the
      password, and Slack is silent):
      - `printf '<#gtm-triggers Incoming Webhook URL>' | npx wrangler secret put SLACK_WEBHOOK_URL --env=""`
      - `printf '<current demo password>' | npx wrangler secret put PACER_DEMO_PASSWORD --env=""`  (must match Azure `PACER_OAUTH_PASSWORD`)
      (run in `infra/pacer-demo-worker/`)
- **Rotating / resetting the demo password:** the connector's password is set/rotated with
  **`pacerai-platform-claude-native/deploy/set_demo_password.sh`** (secure prompt →
  `az webapp config appsettings set PACER_OAUTH_PASSWORD` on `pacerai-demo-mcp` → restart). Because v1.0 reveals
  the password from the **Worker's own `PACER_DEMO_PASSWORD` secret**, a rotation is **two updates kept in
  sync:** (1) run `deploy/set_demo_password.sh` (Azure connector), then (2)
  `printf '<new password>' | npx wrangler secret put PACER_DEMO_PASSWORD --env=""` (the Worker, in
  `infra/pacer-demo-worker/`). If the two drift, the page reveals a password the connector rejects.
- [ ] Later: a small step/script to sync approved KV entries into `demo_users.yml`.

### Decision resolved
Access model = **capture → Turnstile → auto-reveal password** (v1.0, per Will — faster). Slack #gtm-triggers is
an FYI notification, not an approval gate. Email verification is v2.0.

## Later
- **AC-4:** per-email verification (code/magic-link via Cloudflare Email, spec 009) + verified-domain allow-list
  + per-email identity threaded into the connector token.
- **Observability + feedback:** tool-call logging → App Insights; in-chat `feedback` MCP tool.
