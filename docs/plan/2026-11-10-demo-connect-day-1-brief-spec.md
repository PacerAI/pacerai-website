# SPEC: Day 1 brief CTA, the demo-connect page and the PDF fallback (PAC-105)

**Status:** Draft · **Owner:** Will Sullivan · **Date:** 2026-11-10
**Tests:** `tests/test_demo_connect_day_1_brief.py`, `tests/test_day_1_brief_pdf_form.py` (with `tests/harness_footer.mjs`
and `tests/harness_worker.mjs`, which run `src/wpcode/footer.js` and the demo Worker under Node)

This repo is public. Nothing here or on the pages names a tool, a call argument or a build note (PAC-221's rule).

## What ships

One call to action with two doors, and a fallback for a CRO who doesn't use Claude.

| Door | Where | What the visitor does |
| --- | --- | --- |
| 1 | `getpacerai.com/demo-connect/` (page 983, `src/demo-connect.html`), linked from the LinkedIn post as `/demo-connect/?utm_source=linkedin&utm_medium=social&utm_campaign=day1-brief` | Reads the prompt, clicks **Add Pacer AI - Demo to Claude**, types the prompt |
| 2 | The LinkedIn post's first comment, never its body (LinkedIn mangles the link): `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Pacer%20AI%20-%20Demo&connectorUrl=https%3A%2F%2Fdemo.getpacerai.com%2Fmcp` | Continue, then types "Day 1 brief" |
| Fallback | The PAC-221 post, `/resources/what-a-day-1-brief-contains/` | Gives email and company, gets October's brief as a PDF by email |

The prompt is **Build my Day 1 brief**, the same words the PAC-221 post names. With no month named, the connector
builds the last closed month. That default is PAC-104's (platform repo); this issue checks it by hand from the page.

## Acceptance criteria

### Door 1: the page

1. **The hero is the Day 1 brief section.** The page's first `<section class="hero">` holds the prompt to type,
   "Build my Day 1 brief", set apart so a visitor can copy it, and the one Add-to-Claude button. Both come before the
   hero image in the source, so on a phone the button stays above the image (the 2026-10-21 rollout's rule). One
   primary action: the hero has exactly one `claude.ai/customize/connectors` link.
2. **The hero image is the deck's headline slide,** page 2 of `src/blog/assets/october-2026-day-1-sales-review.pdf`
   ("October: 20% miss ($386K) due to 5 large churn events"; the PAC-221 post calls it "The headline").
   - The file is `img/demo-connect/day-1-brief-headline-slide.png`, rendered from that page: 16:9, at least 1600px
     wide.
   - The page loads it from WordPress media as `.../pacer-ai-demo-connect-day-1-brief-headline-slide.png`, the
     `pacer-ai-demo-connect-` prefix the page's other images use. Uploading it is a deploy step.
   - Its `alt` gives the slide's headline as printed.
   - The connectors-list screenshot leaves the hero. It may move into the steps.
3. **The button's static `href` is door 2, exactly.** Without the footer script, door 1 and door 2 add the same
   connector under the same name.

### Door 1: the tag rides into the connector

4. **The button carries the visitor's tag into the connector URL.** `src/wpcode/footer.js` section 0 gains
   `window.pacerConnectorHref(href)`. It returns the claude.ai link with the visitor's `utm_source`, `utm_medium` and
   `utm_campaign` (from `window.pacerAttr()`) added to the query of `connectorUrl`, and every other parameter unchanged.
   On load it rewrites every `a[href*="claude.ai/customize/connectors"]` on the page with it.
   - From the LinkedIn post the connector URL becomes
     `https://demo.getpacerai.com/mcp?utm_source=linkedin&utm_medium=social&utm_campaign=day1-brief`, and that is the
     URL claude.ai's dialog shows.
   - A visitor with no tag gets door 2 unchanged.
   - Why it isn't hard-coded: `/demo-connect/` is also the site's demo page, linked from the nav, the homepage and the
     PAC-221 post (`utm_source=getpacerai&utm_medium=blog`). A fixed LinkedIn tag on the button would credit LinkedIn
     with all of them.
   - `src/wpcode/footer.paste.txt` is rebuilt with `scripts/build_footer_paste.py`.

### The fallback: "Send me October's brief as a PDF"

5. **The demo Worker serves the form.** `GET /day-1-brief-pdf` on `pacer-demo-worker` returns an HTML widget, framed
   by the post the same way `/signup` was framed by `/demo-connect/`. It has a work-email field, a company field, the
   Turnstile check (`TURNSTILE_SITE_KEY`), a button reading "Send me October's brief as a PDF", and the Worker's
   `FRAME_HEADERS`. WordPress strips scripts from page HTML, so the bot check can't live in the post itself.
6. **`POST /day-1-brief-pdf` sends and logs.** The body is JSON: `email`, `company`, `token` (Turnstile), and optional
   `utm_*` and `page`.
   - It refuses a bad email or a missing company (400), a missing token (400), a failed check (403), and a
     disposable address (400). A refused request sends nothing and logs nothing.
   - Otherwise it answers 200, then:
     - writes one `leads` row: `source = 'resource'`, `asset_slug = 'day-1-brief-pdf'`, the email, the company and
       the lead class from `classify()`;
     - sends one email through Resend to the address given. It links the PDF by its short link,
       `https://getpacerai.com/day-1-brief-pdf/`, never the file, and needs no attachment;
     - posts the lead to Slack with the email and company.
7. **Sends are limited and opt-outs hold.**
   - At most one email per address per 10 minutes. Every request still gets its row.
   - An address in `email_optouts` gets no email. The response doesn't change, so the form doesn't reveal who is on
     the list.
   - The request never touches `DEMO_SIGNUPS`: asking for a PDF isn't demo access.
8. **The post frames the widget.** `src/blog/posts/content-what-a-day-1-brief-contains.html` (and so its build page)
   has an `<iframe>` whose `src` is `https://pacer-demo-worker.will-078.workers.dev/day-1-brief-pdf`. The post still
   has no `<form>` of its own, so PAC-221's `test_no_form_on_this_post` stands as written.

## How to build it

- Model the Worker route on `src/order.ts`'s retired `/pricing-request`: its Turnstile check, its D1 count for repeat
  requests, its Resend call (`ORDER_FROM`, reply-to `ORDER_NOTIFY_TO`) and its Slack post. Put it in its own module and
  route it from `index.ts` before the GET-only guard. Today an unknown GET falls through to the demo video page.
- The opt-out check reads `email_optouts` directly. It's the same D1 database.
- The email and the widget's copy are external copy under Will's name. Keep them short, and leave them for his voice
  pass.
- The page keeps the hero's two notes (work-email sign-in, and the Team/Enterprise Owner line with its walkthrough
  link). It stays under `validate.py --strict`.

## Not in this change

- **Recording the tag on the lead.** The connector's sign-in hook (platform repo) would have to forward the connector
  URL's `utm_*` to `POST /internal/connector-sign-in`, which today sets them to null. That needs a platform issue and a
  matching Worker change.
- **The default month.** That is PAC-104's. Here it is checked by hand.
- No Apollo contact or sequence for a PDF request. Enrolment approval is Will's (`first_principles.md` §4).
- No link from `/demo-connect/` to the PDF form. The issue puts the fallback on the post.
- No change to the `/signup` widget, the connector sign-in route or the whitepaper Worker.

## Deploy, Will's run, after PAC-104 ships

Merge, but don't deploy, before PAC-104 ships. The page tells visitors to type a prompt that doesn't work until then,
and the PDF form sits on the PAC-221 post, which is held for the same reason. Will does the voice pass first. Then:

1. Deploy the Worker (`npm run deploy`). Check that `GET /day-1-brief-pdf` renders and that a `@getpacerai.com`
   submit (class `internal`) lands a `leads` row with `asset_slug = 'day-1-brief-pdf'`, a Slack alert and the email.
2. Upload `img/demo-connect/day-1-brief-headline-slide.png` to WordPress media as
   `pacer-ai-demo-connect-day-1-brief-headline-slide.png`, and fix the month folder in the page's `src` if it differs.
3. Paste `src/wpcode/footer.paste.txt` into WPCode's Footer field and check its SHA-256.
4. `python3 scripts/deploy.py 983`.
5. Deploy the PAC-221 post per its spec.
6. From a logged-out browser and a fresh Claude account:
   - **Door 1:** open the LinkedIn link. claude.ai's dialog shows the tagged connector URL. Then Continue, Add,
     Connect, sign in, type "Build my Day 1 brief". The connector builds the last closed month without being given
     one.
   - **Door 2:** open the direct link. Continue, then type "Day 1 brief". It gives the same result.
   - **Fallback:** submit the post's form. The email arrives, its link downloads the PDF, and the `leads` row and the
     Slack alert are there.
   - If claude.ai or the connector refuses the tagged URL, roll back the footer paste (door 1 falls back to door 2's
     link) and raise it on the platform.
