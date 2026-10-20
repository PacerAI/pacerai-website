# pacer-demo-worker

Cloudflare Worker that serves the Pacer AI **demo video** — the Claude app window animating over
a macOS-Tahoe desktop — so the getpacerai.com **v3 homepage** can iframe it. The demo HTML is
~160K and can't live in a WordPress page (block-size limit), so it's served from here.

Lives in the **website** repo (not gtm) because its only job is to serve the homepage iframe —
it has no GTM concern. Co-located with the site's other deploy tooling under `infra/`.

- **Serves at:** `https://pacer-demo-worker.will-078.workers.dev/`
- **Embedded by:** the homepage showcase iframe in `src/homepage/index-build.html`
  (`<iframe src="https://pacer-demo-worker.will-078.workers.dev/">`).
- **Demo source of truth:** `pacerai-platform-claude-native/demo-site/demo-video-by-claude.html`
  → copied to `src/demo.html` (refresh with `./sync.sh`).
- **Process doc + reel catalog:** `pacerai-content/collateral/demo_reels/` (README + registry).
  Reels are a tracked collateral type; `/demo-reel` in that repo automates everything below.

## Two workers: production and staging

Production serves **one** reel. Staging serves **every** reel variant so a new one can be reviewed
and shared before it goes anywhere near the homepage embed.

```
PRODUCTION                                   STAGING
pacer-demo-worker.will-078.workers.dev/      pacer-demo-worker-staging.will-078.workers.dev/
  └─ /  → src/demo.html                        ├─ /            → index of all variants
        (the ONE promoted reel)                └─ /v/{slug}    → src/variants/{slug}.html
```

| | Production | Staging |
|---|---|---|
| Entrypoint | `src/index.ts` | `src/staging.ts` |
| Serves | `src/demo.html` only | every file in `src/variants/` |
| Deploy | `npm run deploy` | `npm run deploy:staging` |
| Caching | `max-age=300` | `no-store` (see what you just shipped) |
| Indexing | normal | `X-Robots-Tag: noindex` |

`main` is overridden per-environment so **production's entrypoint still imports exactly one HTML
file**. Its bundle never changes shape as the staging catalog grows — adding a tenth variant to
staging carries zero risk to live traffic. That's the whole reason for two entrypoints instead of
one worker with path routing.

## Structure

```
pacer-demo-worker/
├── src/index.ts        PRODUCTION entrypoint — serves demo.html, iframe-friendly headers
├── src/staging.ts      STAGING entrypoint — serves src/variants/* at /v/{slug} + an index
├── src/demo.html       The promoted reel (written ONLY by promote.sh; a build artifact)
├── src/variants/       Staged reels, one .html per slug — the dev catalog
├── src/html.d.ts       Text-module type shim
├── wrangler.toml       CF config (name, Text rule for *.html, workers_dev, [env.staging])
├── package.json        Local wrangler (no global install)
├── tsconfig.json       Strict TS
├── sync.sh             Pull the generated reel in — `./sync.sh <slug>` stages it
├── promote.sh          Promote a staged variant to production (dry run by default)
└── .gitignore
```

## Framing / security

The worker allows itself to be iframed **only** by getpacerai.com via
`Content-Security-Policy: frame-ancestors https://getpacerai.com https://*.getpacerai.com` and
deliberately does **not** send `X-Frame-Options` (which would block the embed). `/health` returns
`ok` for uptime checks.

## First-time deploy

```bash
cd pacerai-website/infra/pacer-demo-worker
npx wrangler@4 login        # interactive OAuth (your Cloudflare account)
npx wrangler@4 deploy       # bundles + deploys -> https://pacer-demo-worker.will-078.workers.dev
```
No `npm install` needed — `npx` fetches wrangler and bundles the TS + HTML directly. (`npm install`
also works now that the deps are pinned to compatible versions; if it ever errors on peer deps, use
`npm install --legacy-peer-deps` or just the `npx` path above.)

Verify: open `https://pacer-demo-worker.will-078.workers.dev/` (the Claude window renders on a
transparent background — the Tahoe backdrop comes from the homepage), then load getpacerai.com and
confirm the homepage showcase iframe displays it.

First staging deploy: `npm run deploy:staging` (same account, no extra setup).

## Shipping a new reel or a new version

Never overwrite an existing slug — a new version is a new slug (`-v2`, `-v3`).

```bash
# 1. Regenerate from the live MCP tools (project venv — Python 3.12; bare python3 fails)
cd ~/Documents/pacerai/pacerai-platform-claude-native
~/.venvs/pacer/bin/python demo-site/build_demo_site.py

# 2. Stage it
cd ~/Documents/pacerai/pacerai-website/infra/pacer-demo-worker
./sync.sh cro-arr-v2                 # → src/variants/cro-arr-v2.html
#    register it in src/staging.ts (import + VARIANTS entry — the file says where)
npm run deploy:staging

# 3. Review, then promote when ready
open https://pacer-demo-worker-staging.will-078.workers.dev/v/cro-arr-v2
./promote.sh cro-arr-v2              # dry run — prints outgoing vs incoming SHA
./promote.sh cro-arr-v2 --deploy     # copies to src/demo.html AND deploys production
```

`promote.sh` is a **dry run unless you pass `--deploy`** — the homepage embed is live traffic. It
refuses unknown slugs and no-ops when production already serves that exact file.

**Rollback** is the same command pointed at the previous slug:
`./promote.sh cro-arr-v1 --deploy`. Every previously-promoted variant stays in `src/variants/`
precisely so rollback is one command — never delete one that has been in production.

After promoting, update `pacerai-content/collateral/demo_reels/registry.yaml`
(`production_variant` + `promotion_log`). Unregistered work is invisible work.

Legacy path (skips staging, writes production directly): `./sync.sh && npm run deploy`.

## Optional: custom domain (`demo.getpacerai.com`)

Nicer URL, but requires the `getpacerai.com` zone to be on **Cloudflare DNS** (the site itself is
WordPress.com-hosted, so confirm DNS first). If so: uncomment the `[[routes]]` block + set
`workers_dev = false` in `wrangler.toml`, `npm run deploy`, then update the homepage iframe `src`
to `https://demo.getpacerai.com/`. Until then, the `workers.dev` URL is the reliable default.

## `/signup` + `POST /demo-signup` — demo access and Apollo follow-up

The same production Worker serves the `/demo-connect` signup widget (`/signup`, iframed by WP page 983). A submit
runs Turnstile → KV `DEMO_SIGNUPS` → returns the connector URL + password. Then, off the critical path:
Apollo (`syncApollo()`) → D1 `leads` row → Slack `#website-leads`.

The full flow, the class → action table, the Apollo ids and the operating checks are in
`pacerai-gtm/tactics/website-visitor/docs/design/flow.md`. Change that file when you change `syncApollo()`.

**Secrets** (`npx wrangler secret put <NAME>`; `wrangler.toml` has the comments):

| Secret | Value / source | Unset means |
|---|---|---|
| `TURNSTILE_SECRET` | Cloudflare Turnstile widget | every signup 403s |
| `PACER_DEMO_PASSWORD` | must equal Azure `PACER_OAUTH_PASSWORD` | the revealed password doesn't work |
| `SLACK_WEBHOOK_URL` | `#website-leads` webhook | no alerts |
| `APOLLO_API_KEY` | `pacerai-gtm/.env` `APOLLO_API_KEY` | Apollo step skipped |
| `APOLLO_EMAIL_ACCOUNT_ID` | `698cf8caac41ac000da4c9f9` (will@getpacerai.com) | list only, no email |
| `APOLLO_SEQUENCE_ID_DEMO_SIGNUP` | `6ac6a3099f51790014977897` | list only, no email |
| `BRIEFING_SIGNUPS_TOKEN` | a random token; the same value as `pacerai-demo-mcp`'s `BRIEFING_SIGNUPS_TOKEN` (Key Vault) | `/internal/demo-signups` returns 404 |

## `GET /internal/demo-signups` — signups for the Daily Pace Briefing

After the Apollo email, a /demo-connect signup gets the demo book's daily Pace briefing for the next 3 days
(pacerai-platform-claude-native spec 023 §7.2). The briefing job on `pacerai-demo-mcp` reads the signups here at
07:57 America/Denver: `GET /internal/demo-signups?since=YYYY-MM-DD` with `Authorization: Bearer <token>`.

- **Returns** `{since, signups: [{email, company, lead_class, created_at}]}` from D1 `leads` (`source = 'demo'`): one
  row per email at its **first** signup ever, so a repeat submit never restarts the 3 days. The briefing applies the
  class rule (`valid_lead`, `personal_email`, `internal`) and counts the days.
- **Read-only.** 404 when the token secret is unset, 401 on a wrong token, and `since` is clamped to the last 31 days.
- **Code:** `src/signups.ts`.

**Deploy caution:** `./promote.sh <slug> --deploy` ships whatever `src/index.ts` holds, so never promote a reel
with a half-finished signup change in the tree. After any production deploy, check that `/signup` returns 200.
