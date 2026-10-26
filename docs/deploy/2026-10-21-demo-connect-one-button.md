# /demo-connect one-button rollout (2026-10-21)

**Why.** `/demo-connect` had two install paths that didn't meet. A signup card (work email, then a bot check, then the
shared password shown on screen), and, about 1,700px further down, an "Add Pacer AI - Demo to Claude" button. A visitor
who clicked the button without using the card reached a sign-in page asking for a password they had never seen. Now
there is one path: the button sits in the hero, and the connector's own sign-in page asks for the work email only
(no password, with a bot check). Each sign-in is sent to the website Worker, which records it as a lead exactly the
way a card signup was recorded: a D1 `leads` row, the Apollo list and email, and the Slack alert.

**What changes where.**
- Website pull request (this repo, branch `feat/demo-connect-one-button`): page 983, the Worker route
  `POST /internal/connector-sign-in`, and the `install_click` GA4 event in `src/wpcode/footer.js`.
- Platform pull request (`PacerAI/pacerai-platform-claude-native`, branch `feat/email-only-sign-in`): the email-only
  sign-in page, and the hook that sends each sign-in to the Worker.

Nothing is live until the steps below. Claude runs the commands on Will's go; the Cloudflare dashboard step is Will's.

## Checklist

- [x] **1. Merge both pull requests.** The platform one (connector email-only sign-in;
  `PacerAI/pacerai-platform-claude-native`, branch `feat/email-only-sign-in`) and this website one.
  - _Done 2026-10-21 (Will merged platform #104 and website #45)._
- [x] **2. Let the bot check run on the connector's sign-in page.** Cloudflare dashboard → Turnstile → the existing
  demo-signup widget (site key `0x4AAAAAAFCmrSWLyo0ieLAF`) → Settings → Hostnames → add
  `pacerai-demo-mcp.azurewebsites.net` → Save.
  - _Done 2026-10-22. Will's dashboard save didn't take, so Claude added the hostname through Cloudflare's API (wrangler's sign-in has widget access); the widget's other settings were unchanged._
- [x] **3. One shared token for the sign-in → lead hand-off.** The same value goes to the Worker secret
  `CONNECTOR_SIGNIN_TOKEN` and the Salesforce demo app's setting `PACER_LEAD_SYNC_TOKEN` (through Key Vault, like
  the briefing token). It is never printed:
  ```bash
  TOKEN=$(openssl rand -hex 32)
  printf %s "$TOKEN" | az keyvault secret set --vault-name pacerai-demo-kv30208 --name CONNECTOR-SIGNIN-TOKEN --file /dev/stdin -o none
  cd ~/Documents/pacerai/pacerai-website/infra/pacer-demo-worker && printf %s "$TOKEN" | npx wrangler secret put CONNECTOR_SIGNIN_TOKEN --env="" && unset TOKEN
  ```
  - _Done 2026-10-22 ~08:48 MT, both tokens (this one and the briefing feed's `BRIEFING_SIGNUPS_TOKEN`)._
- [x] **4. Settings on the Salesforce demo app only** (`pacerai-demo-mcp`, resource group `pacerai-demo-rg`; the
  HubSpot app keeps its current sign-in). First put the Turnstile widget's secret key in Key Vault (Cloudflare →
  Turnstile → the same widget → Settings → copy the secret key):
  ```bash
  read -s "TS?Paste the Turnstile secret key: "; echo
  printf %s "$TS" | az keyvault secret set --vault-name pacerai-demo-kv30208 --name TURNSTILE-DEMO-SIGNUP-SECRET --file /dev/stdin -o none && unset TS
  KV=pacerai-demo-kv30208
  az webapp config appsettings set -n pacerai-demo-mcp -g pacerai-demo-rg -o none --settings \
    PACER_OAUTH_EMAIL_ONLY=true \
    PACER_TURNSTILE_SITEKEY=0x4AAAAAAFCmrSWLyo0ieLAF \
    PACER_TURNSTILE_SECRET="@Microsoft.KeyVault(VaultName=$KV;SecretName=TURNSTILE-DEMO-SIGNUP-SECRET)" \
    PACER_LEAD_SYNC_URL=https://pacer-demo-worker.will-078.workers.dev/internal/connector-sign-in \
    PACER_LEAD_SYNC_TOKEN="@Microsoft.KeyVault(VaultName=$KV;SecretName=CONNECTOR-SIGNIN-TOKEN)"
  ```
  The app ignores these until step 6 ships the code that reads them. In the portal, both Key Vault references
  should show Resolved.
  - _Done 2026-10-22, plus `BRIEFING_SIGNUPS_URL` / `BRIEFING_SIGNUPS_TOKEN` (briefing rollout section 4). All three Key Vault references Resolved. Will put the Turnstile secret in Key Vault himself._
- [x] **5. Deploy the Worker:** `cd ~/Documents/pacerai/pacerai-website/infra/pacer-demo-worker && npm run deploy`.
  - This also ships the Worker changes already merged on main and held back: the 3-day briefing line and the
    `/internal/demo-signups` feed (website pull request #43), and the card's prefilled install link (website pull
    request #44). The 3-day briefing for signups only starts once `BRIEFING_SIGNUPS_TOKEN` is set, per
    `pacerai-platform-claude-native/docs/deploy/2026-10-20-daily-pace-briefing-rollout.md` section 4.
  - Check: `/signup` and `/health` return 200 (use a browser User-Agent), the homepage video's sha is unchanged, and
    `curl -s -o /dev/null -w '%{http_code}\n' -X POST https://pacer-demo-worker.will-078.workers.dev/internal/connector-sign-in`
    prints `401` (it prints `503` if step 3's Worker secret is missing).
  - _Done 2026-10-22, Worker version `8147c653` from a clean copy of main (one network retry). Homepage video unchanged; `/signup` and `/health` 200; both internal routes 401 without a token._
- [x] **6. Redeploy the Salesforce demo app** from a fresh checkout of main: `pacerai-platform-claude-native`
  `deploy/redeploy.sh`. Confirm with the connector's `health` tool. No reconnect is needed in Claude.
  - _Done 2026-10-22 from clean copies of main (`e5191a8`, image `3dc8e977`); `health` confirmed. Redeployed again with platform #107 (`dff9f6b`, image `dd2d2d00`)._
- [x] **7. End-to-end test** in an incognito window, signed in to Claude as **Will@getpacerai.com**. Any other domain
  is a real lead and gets the Apollo email. The hero button isn't live until step 9, so use the
  **Add Pacer AI - Demo to Claude** button in step 1 of the live page (the same link):
  - claude.ai's dialog opens with the name and URL filled in → Continue → Add → Connect.
  - The sign-in page shows the email field and the bot check, and no password field → Start the demo.
  - Set Always allow, then ask "Are we on pace?".
  - Then check:
    - the usage log has the `sign_in` line (`/demo-usage`);
    - D1 has a row with `asset_slug = 'connector-sign-in'`:
      `npx wrangler d1 execute pacerai-leads --remote --command "SELECT request_id, email, lead_class, asset_slug, created_at FROM leads WHERE asset_slug = 'connector-sign-in' ORDER BY created_at DESC LIMIT 3"`;
    - Slack `#website-leads` shows the alert with "Via: the connector's sign-in page";
    - `/demo-usage` lists Will as a signup, not "stray".
  - _Passed 2026-10-22 09:30 MT: sign-in page email-only with the bot check; usage-log sign-in and two `pace` calls; D1 row `connector-sign-in` (class internal) linked to Apollo. No Slack alert, as designed: Will's address was already on record._
- [x] **8. Voice pass** on the two lines under the hero button and on the steps (`src/demo-connect.html`).
  - _Done 2026-10-22: Will approved both hero lines as written._
- [x] **9. Deploy page 983 and paste the footer.**
  - [x] `python3 scripts/deploy.py 983` (it keeps a backup in `docs/review/`). _Done 2026-10-22 10:03 MT; backup `docs/review/pre-deploy-backup-983-20261022-1003.json`. Live page checked: hero button above the screenshot, no card, no password text, URL box not a link._
  - [x] Paste `src/wpcode/footer.paste.txt` into WP Admin → WPCode → Header & Footer → Footer, then Save. The saved
    field's SHA-256 must start `54ba22069572` (`shasum -a 256 src/wpcode/footer.paste.txt`).
  - Check: the live page shows the button above the hero screenshot at phone width; the step 1 URL box is plain
    text, not a link; clicking the hero button shows `install_click` with `cta_location: hero` in GA4 Realtime.
  - _Done 2026-10-22 ~11:20 MT by Claude in Will's Chrome, at Will's ask. Before: the Footer field was `2c98f687cc6c`
    (the previous version, `git show 9567749:src/wpcode/footer.paste.txt`, so that's the rollback). Pasted from the
    clipboard, checked `54ba22069572` before saving, and again after the reload. Live: /demo-connect and the homepage
    load the new script with no script errors (2 homepage CTA forms); a hero-button click sends `install_click` with
    `cta_location: hero` (checked with a stand-in for GA4, so no test event reached analytics)._

**Rollback.** Set `PACER_OAUTH_EMAIL_ONLY=false` on `pacerai-demo-mcp` (the password sign-in page returns) **and**
restore page 983 from the deploy backup (the card and its password come back with it). Do both: either one alone
leaves visitors without a way in. The Worker route and `install_click` are harmless to leave in place.

## Known gaps (follow-ups, not blockers)

- **GA4 loses the demo signup key event.** `demo_signup` fired from the card; the card is gone, and the sign-in page
  on Azure has no GA4. The D1 row is now the record of a signup; `install_click` is the last step GA4 sees.
- **The homepage's two email forms** still capture an email and send the visitor to `/demo-connect`, where nothing
  uses it now, so the visitor types it again on the sign-in page.
- **The datacenter flag can't apply to connector sign-ins.** The Worker learns the visitor's network only when the
  visitor's own browser calls it; here the caller is the Azure app. Classification is by email domain; the sign-in
  page's bot check is the gate.
- **Screenshots and the reel show the old flow.** Step 4 has no screenshot (the old one showed the password field),
  step 6's shows the user typing `pace`, and the "See it in action" reel still says "Enter your email and the access
  password". The reel is generated in the platform repo's `demo-site/`; regenerate it there as a new version.
- **The 3-day briefing test** in the platform's briefing rollout (section 4) says to sign up through the card. A
  connector sign-in now does the same job.

## Next: point the button at the HubSpot demo (2026-10-22)

**Why.** Will made the HubSpot demo the primary demo (2026-10-22): `https://demo.getpacerai.com/mcp`, the app
`pacerai-demo-hubspot-mcp`, DemoCo.ai at $100M ARR in a live HubSpot portal. The Salesforce demo
(`pacerai-demo-mcp`, about $7M) stays available on request. Branch `feat/demo-connect-hubspot` changes every
prospect-facing connector URL on page 983 and in the Worker's `/signup` card to `https://demo.getpacerai.com/mcp`,
and names DemoCo.ai in HubSpot in the page's copy. **Nothing changes for visitors until steps 6 and 7.**

**State on 2026-10-22:** `demo.getpacerai.com` does not resolve (`getpacerai.com`'s DNS is on WordPress.com). The
HubSpot app still has password sign-in and `PACER_OAUTH_ALLOWED_EMAILS` holding Will's address alone, and none of the
step 4 settings above (setting names checked, values not read). Publishing the page before steps 1–3 would send
prospects to a URL that doesn't answer, then to a sign-in page that refuses them.

- [x] **1. Bind `demo.getpacerai.com` to `pacerai-demo-hubspot-mcp`** (platform side, Will's go): the DNS records
  Azure asks for at WordPress.com, then the custom domain and its certificate on the app. Then set
  `PACER_PUBLIC_URL=https://demo.getpacerai.com` and add `demo.getpacerai.com` to `PACER_MCP_ALLOWED_HOSTS`; the
  sign-in metadata's issuer comes from `PACER_PUBLIC_URL`. Check:
  `curl -s https://demo.getpacerai.com/.well-known/oauth-authorization-server` names `demo.getpacerai.com` throughout.
  - _Done 2026-10-22: DNS via the WordPress.com connector on Will's approval; managed certificate bound (SNI, renews; first expiry 2027-04-22)._
- [x] **2. Bot check on the new host.** Add `demo.getpacerai.com` to the same Turnstile widget's hostnames (step 2
  above).
  - _Done 2026-10-22: the widget renders on `demo.getpacerai.com` (checked in a headless browser; no domain error)._
- [x] **3. Email-only sign-in on the HubSpot app** (resource group `pacerai-demo-hubspot-rg`): the five settings of
  step 4 above, with the same Key Vault references, **and remove `PACER_OAUTH_ALLOWED_EMAILS`**. While it is set,
  every email but Will's is refused.
  - _Done 2026-10-22: email-only, Turnstile and lead sync copied from the Salesforce app; the allow-list removed; `PACER_PUBLIC_URL=https://demo.getpacerai.com`._
- [x] **4. Decide where the 3-day briefing comes from.** Only the Salesforce app reads the signup feed
  (`BRIEFING_SIGNUPS_URL` / `BRIEFING_SIGNUPS_TOKEN`), and the feed doesn't separate the two books. Unless those
  settings move to the HubSpot app, a prospect who signs in to the $100M HubSpot demo gets three briefings on the $7M
  Salesforce book. Check `pacerai-platform-claude-native/docs/deploy/2026-10-20-daily-pace-briefing-rollout.md`
  section 4 first: its "day 1 of 3" test is still open.
  - _Done 2026-10-23: `BRIEFING_SIGNUPS_URL` / `TOKEN` moved to the HubSpot app and removed from the Salesforce app, so signups get the HubSpot book._
- [x] **5. End-to-end test** as step 7 above, on the HubSpot app, in an incognito window as **Will@getpacerai.com**:
  the dialog shows `https://demo.getpacerai.com/mcp`, sign-in asks for the email only, `pace` answers from the
  HubSpot portal, and `/demo-usage` shows the sign-in on the HubSpot app.
  - _Done 2026-10-22/23: Will added the connector through the install link and signed in; `/demo-usage` shows the sign-in on the HubSpot app._
- [x] **6. Deploy the Worker** (Will's go): `cd infra/pacer-demo-worker && npm run deploy`, the same checks as step 5
  above. This ships the `/signup` card's new URL. It also re-ships the card's line promising the daily Pace briefing
  for 3 days, so do step 4 first.
  - _Done 2026-10-23, version `c2ffc19e` from a clean copy of main (`1f48d6d`): homepage video unchanged; `/signup` and `/health` 200; both internal routes 401; the card hands out `demo.getpacerai.com`._
- [x] **7. Deploy page 983** (Will's go): `python3 scripts/deploy.py 983`. Check the hero button opens claude.ai's
  dialog with `https://demo.getpacerai.com/mcp` filled in.
  - _Done 2026-10-23 14:51 UTC; backup `docs/review/pre-deploy-backup-983-20261023-1451.json`. The live page links only `demo.getpacerai.com`._
- [ ] **8. New screenshots and reel.**
  - [ ] Screenshots. Step 1's dialog screenshot (`pacer-ai-demo-connect-step-4-url-2x.png`) shows the old URL, and
    step 6's (`pacer-ai-demo-connect-step-8-pace-2x.png`) shows the Salesforce book's numbers.
  - [x] Reel regenerated and staged. _2026-10-26: built by `demo-site/build_demo_connect_reel.py` in
    pacerai-platform-claude-native (pull request #120) and copied to `src/variants/demo-connect.html` here (branch
    `feat/demo-connect-reel-hubspot`). The September reel stays at `/v/demo-connect-v1`. Stills:
    `demo-site/out/demo-connect/frames/` in the platform repo._
  - [ ] **Deploy the staging Worker** (Will's go), from a clean copy of main once both pull requests are merged:
    `cd infra/pacer-demo-worker && npm run deploy:staging`. Page 983 iframes `/v/demo-connect` on the staging
    Worker, so this is the step that changes the page. `npm run deploy` (production) does not serve this reel and is
    not needed. Checks:
    - `https://pacer-demo-worker-staging.will-078.workers.dev/health` returns 200.
    - `curl -s -A Mozilla/5.0 https://pacer-demo-worker-staging.will-078.workers.dev/v/demo-connect | grep -c demo.getpacerai.com/mcp`
      prints 3, and the same with `grep -c azurewebsites` prints 0.
    - `/v/demo-connect-v1` and `/v/pacing-agent-v3` return 200.
    - The homepage video is untouched: production was not deployed, so
      `curl -s -A Mozilla/5.0 https://pacer-demo-worker.will-078.workers.dev/ | shasum -a 256` is the same before and after.
    - On getpacerai.com/demo-connect, scroll to "See it in action": the reel starts as it comes into view and
      shows `https://demo.getpacerai.com/mcp`, the email-only sign-in, and the answer with plain company names.
    - Rollback: copy `src/variants/demo-connect-v1.html` over `src/variants/demo-connect.html` and deploy staging
      again.
  - [ ] After the deploy, record it in pacerai-content `collateral/demo_reels/registry.yaml`: the `demo-connect`
    entry's sha256 (`2cde8729f2fc07ff…`), its generator (now the platform repo's `demo-site/build_demo_connect_reel.py`)
    and stage, plus a `demo-connect-v1` entry. The answer is tool output; the connector dialog and the bot check are
    drawn.

**Rollback.** Restore page 983 from its deploy backup and roll the Worker back to the previous version (`npx wrangler
rollback`). The HubSpot app settings can stay: the Salesforce app is untouched by this change.
