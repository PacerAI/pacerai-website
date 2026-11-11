# Day 1 brief lead magnet: setup and tests

**Status, 2026-11-10 13:21 MT.** Code is merged and deployed (#59, #61). What's left is WP Admin work and tests,
all Will's. Visual version of this file, with the visitor storyboard:
[`2026-11-10-day-1-brief-walkthrough.html`](2026-11-10-day-1-brief-walkthrough.html) (open it from a checkout,
so the slide resolves).

Specs: [`2026-11-10-demo-connect-day-1-brief-spec.md`](2026-11-10-demo-connect-day-1-brief-spec.md) (the page and
the PDF form), [`2026-11-08-day-1-brief-post-spec.md`](2026-11-08-day-1-brief-post-spec.md) (the PAC-221 post).

## Already live

| What | Where |
|---|---|
| PDF request form, `GET`/`POST /day-1-brief-pdf` | `pacer-demo-worker` version `4714166a` |
| /demo-connect/ hero: "Build my Day 1 brief" and the headline slide | page 983, media 1161 |
| Step 6 matches the hero | #61, page 983 redeployed 13:21, backup `docs/review/pre-deploy-backup-983-20261110-1321.json` |
| October PDF | media 1160, `https://getpacerai.com/wp-content/uploads/2026/11/pacer-ai-day-1-sales-review-october-2026.pdf`, 3,728,234 bytes, same as `src/blog/assets/october-2026-day-1-sales-review.pdf` |

## Setup, in order

### 1. Redirect for the PDF link

The PDF email links `https://getpacerai.com/day-1-brief-pdf/`, which returns 404 today. This is also step 2 of
the PAC-221 post's deploy.

WP Admin → Tools → Redirection → Add new:

- Source URL: `/day-1-brief-pdf/`, Ignore Slash on
- Target URL: the media 1160 URL above
- HTTP code: 302, like the Tear Sheet's (#18), so a new month's PDF can take the same link

Check: a 302 whose location is the PDF.

```bash
curl -sI https://getpacerai.com/day-1-brief-pdf/ | grep -iE '^HTTP|^location'
```

### 2. Save the current WPCode Footer

WP Admin → Code Snippets → Header & Footer. Select all in the Footer box, copy, then:

```bash
pbpaste > docs/review/wpcode-footer-before-20261110.txt && shasum -a 256 docs/review/wpcode-footer-before-20261110.txt | cut -c1-12
```

Expect `54ba22069572`, the footer pasted on 2026-10-22. A different value can be a trailing newline from the
copy. Keep the file either way: it is the rollback for step 3.

### 3. Paste the new footer

```bash
git fetch -q origin main && git show origin/main:src/wpcode/footer.paste.txt | pbcopy && pbpaste | shasum -a 256 | cut -c1-16
```

Expect `30b1e81659090701` (24,520 bytes). Select all in the Footer box, paste, Save Changes.

Check, in a private window on
`https://getpacerai.com/demo-connect/?utm_source=linkedin&utm_medium=dm&utm_campaign=day1-brief`, in the
DevTools console. Every line should end in the tag:

```js
[...document.querySelectorAll('a[href*="claude.ai/customize/connectors"]')].map(a => new URL(a.href).searchParams.get('connectorUrl'))
```

Then open the homepage and check the console has no red errors (a malformed footer once broke all footer JS
site-wide). Rollback: paste the step 2 file back and save.

### 4. Send yourself the PDF

No page frames the form until the PAC-221 post ships, so open
`https://pacer-demo-worker.will-078.workers.dev/day-1-brief-pdf` and submit a `@getpacerai.com` address.

- The form says **Check your inbox**.
- An email from `orders@mail.getpacerai.com`, subject "October's Day 1 brief, as a PDF". Its link opens the
  13-page PDF (needs step 1).
- Slack: **Day 1 brief PDF request — internal**, with `Email sent: sent`.

A second request within 10 minutes sends no email; Slack says "repeat request, no email sent". Expected.

### 5. Run the DM link cold

Private window, a Claude account that has never added Pacer AI - Demo. Open the tagged link from step 3.

1. Click **Add Pacer AI - Demo to Claude**. The dialog's URL ends in
   `?utm_source=linkedin&utm_medium=dm&utm_campaign=day1-brief`.
2. Continue, Add, Connect. Sign in with a work email.
3. Settings → Connectors → Pacer AI - Demo → tool permissions: Always allow.
4. New chat: **Build my Day 1 brief**. It builds October without being told the month.

If claude.ai refuses the tagged URL, roll back the footer (step 3) and raise it on the platform. The plain link
still works.

### 6. Run the direct link, then send DMs

From a second fresh account, open
`https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Pacer%20AI%20-%20Demo&connectorUrl=https%3A%2F%2Fdemo.getpacerai.com%2Fmcp`,
click Continue and type **Day 1 brief**. Same brief.

Then send DMs with the tagged link. DMs use `utm_medium=dm`; the LinkedIn post uses `social`, so the two stay
apart.

## After setup, not blocking the first DM

- **The PAC-221 post.** Will's voice pass, then a new WP page under Resources (230), its card on the hub,
  `deploy.py` and CLAUDE.md registry rows, and deleting `test_post_is_held_back_from_the_live_site`. Own PR. Until
  it ships, a DM recipient without Claude can't reach the PDF form.
- **Record the tag on the lead.** The connector's sign-in sends `utm_*` as null to
  `POST /internal/connector-sign-in`, so DM sign-ins land untagged. Platform change plus a matching Worker change.
