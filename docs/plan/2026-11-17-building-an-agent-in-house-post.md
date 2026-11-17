# PAC-307: Resources post, "Building an agent in-house?"

Draft PR only. Do not merge, deploy, publish, or upload to WordPress until Will says yes.

## Source

- Drive file (connected Google account cannot read it; the view link requires sign-in): https://drive.google.com/file/d/1PkNEuJjDeYIsk18FXUiGwFGh7us7_RTa/view
- HTML and PDF copies from Maya's bot files. The PDF is pinned at `src/blog/assets/building-an-agent-in-house.pdf` (sha256 `7a4cd2be311413bdfe13d00e8737240ba0f8707eb4897d07a6cc0968cda007d4`, one page, created 2026-11-06).

## In this change

- `src/blog/posts/content-building-an-agent-in-house.html`
- `src/blog/posts/building-an-agent-in-house-build.html` (built from the PAC-221 bone shell, not from the stale `post-template.html`, which still has `/blog/` and retired `/solutions/*` nav)
- `src/blog/assets/building-an-agent-in-house.pdf`
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

## Voice-pass note

The one-pager quotes Pacer AI at $1,800 a month. That figure is not on the public `/pricing/` page. The post presents it as the one-pager's comparison figure and links `/pricing/` for current public list prices.
