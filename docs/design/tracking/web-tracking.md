# Website tracking: decisions, strategy and how-to

**Status:** live 2026-10-13. **Owner:** Will. **Supersedes:** `docs/document/Internal_Documentation.md` §7–8, which
describe a Tag Manager plan that was never built.

> **Related docs**
> - Plan: `~/.claude/plans/make-a-plan-in-abundant-bear.md` (parts A–D: tracking, Apollo intent, the HQ
>   `website_visitors` tool, pricing page)
> - Code: [`src/wpcode/footer.js`](../../../src/wpcode/footer.js) (section 0),
>   [`infra/pacer-demo-worker/src/index.ts`](../../../infra/pacer-demo-worker/src/index.ts) (signup widget and handler)
> - Checker: [`scripts/check_trackers.mjs`](../../../scripts/check_trackers.mjs)
> - Downstream: pacerai-gtm `scripts/apollo-lead-stamp.py` (reads the D1 UTMs into Apollo Lead Source); the
>   client-pacerai HQ MCP `website_visitors` tool (planned, spec 020)

## 1. What this is for

The site exists to turn a visit into a demo signup or a walkthrough call. Until 2026-10-13 nothing measured that:
- GA4 had zero working key events.
- The demo signup ran in a cross-origin iframe that GA4 could not see.
- Lead records did not keep where the visitor came from.

The goal is to answer three questions every week:
1. **Which pages and sources produce signups?** Answered by GA4 events and key events, by page and source.
2. **Which companies are looking, and at what?** Answered by Apollo's website tracker and intent pages.
3. **Where did each named lead come from?** Answered by the D1 `leads` row, through the nightly stamp to Apollo
   Lead Source.

## 2. Decisions (2026-10-13)

| # | Decision | Why (evidence) |
|---|---|---|
| D1 | **One Apollo tracker: appId `69cc4a06a3da2f00192ab0b0`**, injected in `<head>`. Deleted the second Apollo tag in Tag Manager (appId `698cf85a0e031100151f3ac7`). | A clean-browser network capture showed Apollo answers the Tag Manager appId with **HTTP 400** on every page view. `69cc4a06…` is the team's only tracker in Apollo (tracker index: getpacerai.com, data received 2026-10-13). The deleted tag only loaded Apollo's script twice. |
| D2 | **Removed Snitcher** (two Tag Manager tags, two profiles). | Only one profile (`sYADCNqvn1`) ever ran; the other was blocked as a duplicate. Snitcher names visiting companies, which Apollo already does. Nothing in HQ or the GTM workflows reads it, and it sent every page view to another vendor. Restore: Tag Manager → Versions → version 6. |
| D3 | **Turned off WordPress.com's built-in Google Analytics** (Jetpack → Traffic → "Add Google"). | It was on with an empty Measurement ID, so it tracked nothing and printed an error comment on every page. Site Kit's GA4 tag is the real one and is unaffected. |
| D4 | **GA4 events are sent from our own code** (`footer.js` section 0) through Site Kit's `gtag`. Tag Manager stays installed but empty. | Events live in git, are tested, and can't drift in a UI. Tag Manager stays so a future vendor tag needs no code change. |
| D5 | **Exactly three GA4 key events:** `demo_signup`, `whitepaper_download`, `schedule_walkthrough`. Plus the pre-existing `pricing_page_visit`, which fires once `/pricing/` is live, and (2026-10-14) `pricing_request`: an email plus a chosen package is an outcome. | Key events should be **outcomes**: an email captured, or a call booked. `try_demo_click` and `demo_email_capture` are steps toward `demo_signup`; marking them too would count one visitor two or three times. They stay as ordinary events for funnel analysis. |
| D6 | **Apollo intent pages:** `/pricing/`, `/demo-connect/` and `/contact/` are **high**; `/resources/` is **low**. Contact-level tracking stays off. | Pricing, demo and contact visits are buying signals. Blog readers are usually researching. This only labels visits in Apollo; it starts no outreach. Contact-level tracking needs Apollo's Inbound add-on. |
| D7 | **First-touch attribution**, 30 days, in the visitor's browser. The first UTMs, or else the outside referrer as `utm_source=<host>` / `utm_medium=referral`, plus the landing page, travel with every capture. | Most visitors don't sign up on their first page. Without this, a LinkedIn visitor who read two posts and then signed up was recorded as a direct `/demo-connect` lead. The `referral` medium keeps these leads Organic in `lead-source-map.yml`; only paid mediums and marketplace sources change the Lead Source. |
| D9 | **GA4 user ID = an opaque visitor ID, never a name or email** (2026-10-14). After a demo signup the worker returns `pv_` + 16 hex characters, stable per email. footer.js sets it as GA4's `user_id` and on every later visit from that browser. | GA4's terms forbid emails, including hashed ones, as user IDs. The Apollo contact ID isn't known until about a second after the password shows. The ID maps to the person through the lead record: `SELECT email, apollo_contact_id FROM leads WHERE request_id LIKE '%_<16 hex>'` (also in KV `DEMO_SIGNUPS`, field `vid`). |
| D10 | **Five event-scoped GA4 custom dimensions** (2026-10-14): `cta_location`, `section`, `category` (Resource category), `video` (Demo video), `link_text`. | Without them GA4's standard reports can't break events down by button, section, category or video; Realtime shows them either way. |
| D11 | **Five GA4 audiences** (2026-10-14), each a 30-day membership. **Search engine visitors**: any session with medium `organic` (est. 161 people). **AI assistant visitors**: session source matches `.*(chatgpt|openai|claude|anthropic|gemini|copilot|perplexity).*` (est. 4). The other three: **High intent: pricing or demo page, no signup** (page path matches `/(pricing|demo-connect).*`, permanently excluding anyone with `demo_signup`); **Readers: 2+ resource article views** (two `/resources/<article>` page views in sequence); **LinkedIn visitors** (session source contains `linkedin`). | For reports and future Google Ads remarketing. From past data the builder estimated 19, 27 and 12 people. Membership counts build from creation day. |
| D8 | **An email address never goes in a URL.** The hero form hands the email to `/demo-connect/` through `sessionStorage`. | Page URLs are collected by GA4, Apollo and Jetpack Stats. Google's GA4 policy forbids sending emails that way. |

## 3. How the pieces fit

```
visitor ── page view ─▶ GA4 (Site Kit tag GT-5DCV7LH2 → G-CS8XR6P08G)    anonymous: pages, sources, events
        │            └▶ Apollo tracker (69cc4a06…)                       companies by IP + intent pages
        │            └▶ Jetpack Stats                                     WordPress.com Stats
        │
        ├─ clicks a CTA ─▶ footer.js §0 ─▶ gtag event (schedule_walkthrough / try_demo_click / tear_sheet_open)
        │
        ├─ submits a form ─▶ whitepaper-worker ─▶ D1 leads (utm_*, page_url) ─▶ Apollo contact + sequence
        │                  └▶ gtag event (whitepaper_download / demo_email_capture)
        │
        └─ demo signup card (iframe, pacer-demo-worker /signup)
               ├─ footer.js §2b puts email + utm_* + landing + page on the iframe URL
               ├─ widget POSTs them with the signup ─▶ D1 leads (utm_*, real page_url) + Slack "Came from"
               └─ widget postMessage {type:'pacer:event', name:'demo_signup'} ─▶ footer.js §0 ─▶ gtag event
```

### Where each tag lives (change it there, nowhere else)

| What | Where it is installed | Source of truth |
|---|---|---|
| GA4 (`GT-5DCV7LH2` → `G-CS8XR6P08G`, property **514635916**) | Site Kit by Google plugin | WP Admin → Site Kit |
| Tag Manager `GTM-PVJ33WB5` (head snippet + body noscript) and the Apollo tracker | Plugin "Head, Footer and Post Injections" → WP Admin → **Settings → Head and Footer** (`options-general.php?page=hefo`), fields *head* and *body* | That settings page (not in git) |
| Tag Manager tags | tagmanager.google.com, container getpacerai.com. **Version 7 has 0 tags**; version 6 still holds the removed ones. | Tag Manager |
| Event code, attribution, email handoff | WPCode → Header & Footer → **Footer** | [`src/wpcode/footer.js`](../../../src/wpcode/footer.js), pasted as `footer.paste.txt` |
| Signup widget events and attribution | Cloudflare Worker `pacer-demo-worker` | [`infra/pacer-demo-worker/src/index.ts`](../../../infra/pacer-demo-worker/src/index.ts) |
| Demo-video events (homepage video, `/demo-connect/` reel) | Both workers add a small script before `</body>` when they serve a video, so a re-promoted video keeps it | [`infra/pacer-demo-worker/src/video-bridge.ts`](../../../infra/pacer-demo-worker/src/video-bridge.ts) |
| Custom dimensions and audiences | GA4 → Admin → Data display → Custom definitions / Audiences | GA4 (property 514635916) |
| Apollo intent pages | app.apollo.io → Settings → Website visitors (tracker `69cc4a06…`, referrer `69ce967c…`) | Apollo (or the Apollo connector's `apollo_website_visitor_domain_tracker_update`) |
| Jetpack Stats | WordPress.com, always on | — |

## 4. Event dictionary

Every event carries `page_path`. Click events also carry `cta_location`, `link_text` and `link_url`.
`cta_location` is the id of the nearest element that has one, or else `nav`, `footer` or the section's first class.

| Event | Fires when | Coded in | Key event |
|---|---|---|---|
| `demo_signup` | The signup card returns the access password (bot check passed, email recorded) | Worker widget → postMessage → footer.js §0 | **Yes** |
| `whitepaper_download` | A white-paper form succeeds | footer.js §2 | **Yes** |
| `schedule_walkthrough` | Any click on a `calendly.com` link, on the page or inside the signup card (`cta_location: signup_card` or `signup_card_reveal`) | footer.js §0 + Worker widget | **Yes** |
| `pricing_page_visit` | A page view whose URL contains `getpacerai.com/pricing/` (created earlier in GA4) | GA4 configuration | Yes (fires once `/pricing/` is live) |
| `try_demo_click` | A click on any `/demo-connect` link from another page, or the **Try the Demo** button in a demo video (`cta_location: video_end_card` / `video_review_bar`) | footer.js §0 + Worker video bridge | No: a step |
| `demo_email_capture` | The homepage hero email form succeeds (then redirects to `/demo-connect/`) | footer.js §2 | No: a step |
| `tear_sheet_open` | A click on a `/tear-sheet/` link | footer.js §0 | No |
| `research_waitlist` | The research waitlist form succeeds | footer.js §5 | No |
| `section_jump` | A link to a section of the same page (homepage nav: Use Cases, Pricing, How It Works…), or arriving on a URL with a `#section`. Param `section`; `cta_location: arrival` on arrival | footer.js §0 | No |
| `resource_filter` | A Resources category pill (ARR Snowballs, Case Study, M&A…), or arriving on `/resources/#<category>`. Param `category`. GA4 drops the `#` from page URLs, so this is the only record of the category | footer.js §0 | No |
| `demo_video_complete` | A demo video reaches its end card. Param `video` (`homepage`, or the staging slug such as `demo-connect`) | Worker video bridge (`src/video-bridge.ts`) → footer.js §0 | No |
| `demo_video_replay` / `demo_video_review` | Replay / Review the output in a demo video | Worker video bridge → footer.js §0 | No |
| `pricing_estimate` | On `/pricing/`, 1.5 s after the last Monthly / Annual toggle or user / hour-block change. Params `plan` (`sales_pacing` / `pacing_planning`), `billing` (`annual` / `monthly`), `value` (monthly total, USD), `currency`, `cta_location` (the card: `price-sales-pacing` / `price-pacing-planning`) | `src/pricing/pricing.js` (inlined into page 111 by `build_pricing.py`) | No |
| `pricing_choose` | A click on a **Choose** button on `/pricing/`. Same params as `pricing_estimate`, plus `pacer_users`, `planning_users`, `hour_blocks`. Until order capture ships, Choose records this event and does nothing else (Will, 2026-10-14) | `src/pricing/pricing.js` | No: a step |
| `pricing_request` | The order card on `/pricing/` saved the request and sent the emails (Worker `POST /pricing-request` returned ok). Params `plan`, `billing`, `value`, `currency`, `cta_location: order_card`; also sets the GA4 user_id | pacer-demo-worker `/order` → postMessage → `src/pricing/pricing.js` | **Yes** (an outcome: an email plus a chosen package; mark after the first hit) |

### Inventory: what each link and button sends (crawled 2026-10-14, 24 published pages)

| Link / button | GA4 event | Where |
|---|---|---|
| Every page load | `page_view` (+ automatic `scroll`, `user_engagement`, `session_start`) | All 24 pages |
| **Try the Demo** / **try the demo free** (nav, posts, team, contact) | `try_demo_click` | 17 pages |
| **Tear Sheet** (nav + footer) | `tear_sheet_open` | 18 pages |
| **Schedule a Walkthrough / Demo**, **Book a 30-min diagnostic**, **Schedule a founder call**, **Request Demo** (any calendly.com link) | `schedule_walkthrough` | `/`, `/contact/`, `/demo-connect/`, one post |
| Signup card: email submit → password shown; its Schedule a Walkthrough buttons | `demo_signup`, `schedule_walkthrough` (iframe bridge) | `/demo-connect/` |
| White paper form (success) | `whitepaper_download` | 14 posts |
| Homepage hero email form (success) | `demo_email_capture` | `/` |
| Outside links: Log In (app.getpacerai.com), LinkedIn, claude.ai, SEC, partner sites | GA4 automatic `click` (outbound, with `link_url`) | 19 pages |
| Homepage demo video and `/demo-connect/` reel: end card shown, Replay, Review the output, Try the Demo | `demo_video_complete`, `demo_video_replay`, `demo_video_review`, `try_demo_click` (bridge, 2026-10-14) | `/`, `/demo-connect/` |
| **Not tracked as clicks:** nav/footer links to other pages (Resources, Contact, Team…) | only the next page's `page_view` | all pages |
| Jump links within a page (homepage nav: Use Cases, Pricing, How It Works…); Resources category pills | `section_jump`; `resource_filter` (2026-10-14) | `/`, `/resources/`, posts |
| **Not tracked:** `mailto:` links, the mobile menu button | — | various |

## 5. How-to

### Change the site-wide event code (`footer.js`)
1. Edit [`src/wpcode/footer.js`](../../../src/wpcode/footer.js). It is plain JS: no `<script>` tags, and never a
   literal closing script tag.
2. Test it locally. Load it in a page with a stub `window.gtag` that records calls, click the links, and read
   the recorded events. This is how the 2026-10-13 change was tested.
3. Run `python3 scripts/build_footer_paste.py` to regenerate `footer.paste.txt`.
4. Paste it into WP Admin → WPCode → Header & Footer → **Footer**, replacing everything, then **Save Changes**.
   - In Chrome, this can be done by setting the third CodeMirror editor's value and saving.
   - Check that the saved field's SHA-256 matches the file:
     `shasum -a 256 src/wpcode/footer.paste.txt`.
5. Confirm it's live:
   `curl -s -A "Mozilla/5.0 …Chrome/141.0" https://getpacerai.com/?n=$(date +%s) | grep -c "window.pacerTrack ="`
   should print 1.

### Change the signup widget or its handler
1. Edit `infra/pacer-demo-worker/src/index.ts`. The widget's JS sits inside a TypeScript template literal: don't
   introduce `${`, and double any backslash.
2. Run `npx tsc --noEmit -p .`. Then run `npx wrangler dev --port 8799`, fetch `/signup`, and `node --check` the
   inline script.
3. Run `npm run deploy` (production).
4. Verify:
   - `/signup` returns 200 (use a browser User-Agent).
   - The homepage video's sha is unchanged.

### Track a new CTA
- **A link to Calendly, `/demo-connect` or `/tear-sheet`:** nothing to do. The delegated click listener catches
  it on every page.
- **A new kind of link:** add a branch to the `document.addEventListener('click', …)` block in §0, then paste
  (see above).
- **Inside a Worker iframe:**
  1. Call `parent.postMessage({type:'pacer:event', name, params}, 'https://getpacerai.com')`.
  2. Add `name` to `ALLOWED` in footer.js §0.
  3. Only `cta_location`, `plan` and `value` params are forwarded, up to 80 characters each.

### Mark a key event in GA4
In this GA4 interface an event can only be marked after it has fired once.
1. Go to Admin → Data display → **Events** → *Recent events*.
2. Click the star next to the event.
3. Don't send fake events to make a name appear; they count in the reports.

### Change Apollo intent pages
Use app.apollo.io → Settings → Website visitors, or the Apollo connector:
1. Call `apollo_website_visitor_domain_tracker_index` to get the ids.
2. Call `…_update` with `action: "edit"`, the referrer `_id`, `domain: "getpacerai.com"` and the full
   `intent_paths` list. Send the complete list every time.

### Check what a visitor's browser really sends
Your own browser is a poor test. Site Kit hides GA4 from logged-in admins, and extensions block trackers. Use
[`scripts/check_trackers.mjs`](../../../scripts/check_trackers.mjs); its header has the commands. It runs a
clean headless Chrome and prints third-party calls.

A healthy page shows:
- one Apollo `can_track_visitor?x_app_id=69cc4a06…`
- a GA4 `g/collect?…tid=G-CS8XR6P08G`
- `gtm.js`
- nothing from Snitcher

`ERR_ABORTED` on a beacon POST is normal in headless Chrome. A 4xx is not.

### Test a conversion end to end
1. Open an incognito window on `https://getpacerai.com/demo-connect/?utm_source=test&utm_medium=qa`.
2. Sign up with a test address. This creates a real Apollo contact and enrolls a sequence, so use your own test
   email.
3. Expect:
   - `demo_signup` in GA4 → Admin → DebugView, or in Realtime.
   - A D1 `leads` row with `utm_source=test` and `page_url=https://getpacerai.com/demo-connect/`.
   - A Slack line "Came from: test / qa · landed on /demo-connect/".

## 6. Open items
- **Mark key events.** Star `demo_signup`, `whitepaper_download` and `schedule_walkthrough` in GA4 once each has
  fired (within about 48 hours of the first real conversion, or after Will's test signup).
- **HQ `website_visitors` tool** (client-pacerai, spec 020). It combines:
  - GA4 page, source and key-event counts (GA4 Data API, property 514635916; needs the `analytics.readonly`
    re-consent)
  - Apollo's named companies and their top pages
- **Pricing page (part D).** When `/pricing/` goes live, `pricing_page_visit` starts firing. The page's own
  script (no iframe) sends `pricing_estimate` and `pricing_choose`. Register `plan` and `billing` as event-scoped
  custom dimensions so reports can split by them. Order capture (next) adds `pricing_request`, a key event.
- **Not changed:**
  - The `/demo-connect/` walkthrough reel still embeds the staging worker (`/v/demo-connect`).
  - Lead records carry no full referrer column. The referrer travels as `utm_source=<host>`,
    `utm_medium=referral`.

## 7. Change log
- **2026-10-20: key events marked.**
  - Starred in GA4: `demo_signup`, `schedule_walkthrough` and `whitepaper_download` (D5).
  - Key events now: those three plus the pre-existing `pricing_page_visit`.
  - Still to star: `pricing_request`, once it appears under Admin → Events → Recent events. This GA4
    interface can't create a key event by name before its first hit.
  - `pricing_choose` checked in GA4 Realtime the same day: it arrives.
- **2026-10-14: /pricing/ live.**
  - GA4 dimensions "Pricing plan" (`plan`) and "Billing" (`billing`).
  - Events `pricing_estimate` and `pricing_choose`, sent by the page script.
  - Event `pricing_request`, from the order card through postMessage, which also sets the GA4 user_id.
  - The Redirection rule `/pricing/` → `/#pricing` is disabled, so `pricing_page_visit` now fires.
  - To do: mark `pricing_request` as a key event once it appears under Admin → Events.
- **2026-10-14: video, jump-link and user-ID tracking** (Will approved each change).
  - **Workers:** production version `e5c9a59d` and staging `7e2bd763` add the video bridge
    (`demo_video_complete`, `demo_video_replay`, `demo_video_review`, `try_demo_click` from the end card). The
    homepage video's hash is now `0a2983b38204`; only the bridge script was added. The signup returns the
    visitor ID.
  - **footer.js** (WPCode, sha `2c98f687cc6c`):
    - `section_jump` and `resource_filter`, on a click and on arrival.
    - Accepts the video events from both worker origins.
    - Sets GA4 `user_id` after a signup.
  - **GA4:** five custom dimensions and five audiences (D10, D11). The 13 Snitcher user dimensions were archived
    (Will's go); 5 custom dimensions remain.
  - **Verified:**
    - A logged-out visit clicking the homepage Pricing link sent `section_jump` to GA4.
    - The bridge events were tested against the real homepage video.
    - Jump, filter and user-ID logic were tested in headless Chrome.
- **2026-10-14: end-to-end test (Will, incognito).**
  - **The test:** homepage → Try the Demo → Schedule a Walkthrough in the card → signup as `test@testco.com`.
  - **GA4 Realtime:** `try_demo_click`, `schedule_walkthrough` and `demo_signup` = 1 each.
  - **D1 row:** `page_url=https://getpacerai.com/demo-connect/`; UTMs empty (correct: a direct visit).
  - **GA4 admin list:** the three names weren't there yet; GA4 adds new names up to 24–48 hours after Realtime.
    Star them under Admin → Data display → Events → Recent events once they appear.
  - **Lesson: test with a getpacerai.com address.**
    - Any other domain is treated as a real lead. `testco.com` belongs to a real company that accepts every
      address, so the one-step demo sequence emailed it.
    - The contact is on HQ's never-a-lead list (client-pacerai `data/lead-exclusions.txt`).
- **2026-10-13: initial setup** (Will approved each account change).
  - **Code:** worker deployed (version `b7ad4085`), and the WPCode footer pasted (sha `72287944edc8`).
  - **Tag Manager:** version 7 published, removing the Apollo duplicate and Snitcher.
  - **WordPress.com:** the GA toggle is off.
  - **Apollo:** four intent pages set.
  - **GA4 key events:** pending their first events.
