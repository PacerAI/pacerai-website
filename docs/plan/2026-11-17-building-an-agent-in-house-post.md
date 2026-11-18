# PAC-307: Resources post, "Building an agent in-house?"

Draft PR only. Do not merge, deploy, publish, or upload to WordPress until Will says yes.

## Source

- Drive file (connected Google account cannot read it; the view link requires sign-in): https://drive.google.com/file/d/1PkNEuJjDeYIsk18FXUiGwFGh7us7_RTa/view
- HTML and PDF copies from Maya's bot files. The one-page letter source is `src/blog/assets/building-an-agent-in-house-onepager.html` (extracted from Maya's copy; only the Pacer AI price box changed). The PDF is pinned at `src/blog/assets/building-an-agent-in-house.pdf` (sha256 `8d33fd74ccc2977c638fb44bc20e75a99466f876801519eef3ea7b1b6735c3b0`, one page, 918 x 1188 pt, reprinted 2026-11-18 with headless Chrome).

## In this change

- `src/blog/posts/content-building-an-agent-in-house.html`
- `src/blog/posts/building-an-agent-in-house-build.html` (built from the PAC-221 bone shell, not from the stale `post-template.html`, which still has `/blog/` and retired `/solutions/*` nav)
- `src/blog/assets/building-an-agent-in-house.pdf`
- `src/blog/assets/building-an-agent-in-house-onepager.html` (the one-page letter the PDF is printed from)
- `src/blog/assets/building-an-agent-in-house-build.html` (the Resources post HTML, copied beside the PDF)
- Metadata in `src/blog/build-posts.py`
- `tests/test_building_an_agent_in_house_post.py`

The post links the PDF as `/building-an-agent-in-house-pdf/`, never the file.

## Not in this change

- No WordPress page, media upload, or Redirection entry.
- No change to `scripts/deploy.py` or `src/blog/index-build.html`. The hub on main already has undeployed Nov 11–14 edits; adding a card later must add only this card.

## After Will's voice pass, once `WP_APP_PASSWORD` is available

1. Upload the PDF to WordPress media (`POST /wp-json/wp/v2/media`).
2. Add a Redirection 302 from `/building-an-agent-in-house-pdf/` to the media URL.
3. Create the WordPress Page as a **draft**, parent 230, slug `building-an-agent-in-house`, content wrapped in `<!-- wp:html -->…<!-- /wp:html -->`. Send Maya the preview link.
4. After the voice pass and Will's publish yes: publish the page, add only this card to the Resources hub, record the page ID in `scripts/deploy.py` and `CLAUDE.md`. Do not run deploy-all.

## Pricing (Will, Nov 18)

- The post shows no Pacer AI prices. The "What does Pacer AI cost?" section is removed; the site nav still links `/pricing/`.
- The one-page letter PDF is reprinted with public pricing: Rep $100, Manager $500, SLT $1,000 per user a month, services from $15,000. The retired monthly figure is gone, and there is no Startup or Advisor tier. Everything else on the letter is unchanged.
- Reprint: `google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=src/blog/assets/building-an-agent-in-house.pdf file://$PWD/src/blog/assets/building-an-agent-in-house-onepager.html` (the HTML sets a 1224 x 1584 px page with no margins), then update the sha256 here and in the test.

## CTA

The download CTA ("Download Building an agent in-house? as a PDF") links `https://getpacerai.com/building-an-agent-in-house-pdf/?utm_source=linkedin&utm_medium=social&utm_campaign=build-vs-buy`. The PR has no per-platform social copy, so the post CTA uses `utm_source=linkedin`, the channel the post is shared on. Per-platform copy, when written, gets its own `utm_source` (for example `x`). The intro's PDF link stays the plain short link. When the Redirection 302 is added, keep the query string (pass-through) so the tags reach the media URL.

The opening hook is still a TODO until Will picks one.
