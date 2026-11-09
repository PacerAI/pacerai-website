# SPEC: "What a Day 1 brief contains" post (PAC-221)

**Status:** Draft · **Owner:** Will Sullivan · **Date:** 2026-11-08
**Tests:** `tests/test_day_1_brief_post.py`

This repo is public. Write nothing here or in the post that isn't buyer-facing. The internal tool contract and the
internal skill stay out of this repo (PAC-104).

## What ships

A blog post that a CRO who doesn't use Claude can read and forward to their RevOps lead. It holds the 13-slide
outline, the units rule, the tie-outs, the October deck as a PDF download, and a UTM-tagged CTA.

| Thing | Value |
| --- | --- |
| Slug | `what-a-day-1-brief-contains`, under Resources: `/resources/what-a-day-1-brief-contains/` |
| Article body | `src/blog/posts/content-what-a-day-1-brief-contains.html` |
| Page | `src/blog/posts/what-a-day-1-brief-contains-build.html` |
| Metadata | An entry in `POSTS` in `src/blog/build-posts.py`, `id` = the slug, category `RevOps` |
| PDF | `src/blog/assets/october-2026-day-1-sales-review.pdf`, copied byte for byte from `~/Downloads/October 2026 Day 1 Sales Review.pdf`. Will cleared this file on 2026-11-08, and the test pins its hash. |
| PDF link | `/day-1-brief-pdf/`, a short link, the same way the tear sheet is linked (`CLAUDE.md`, 2026-10-07). The post never links the PDF file. |
| CTA link | `/demo-connect/?utm_source=getpacerai&utm_medium=blog&utm_campaign=day1-brief` |

## Acceptance criteria

1. **The outline matches the PDF page for page.** An `<ol>` under an H2 naming the slides or the outline, with 13
   top-level `<li>`, in the deck's order. Each opens with that page's headline as printed in the deck, then says in
   a buyer's words what the slide answers. Entries 7 to 13 also say what they are: 7 top movers, 8 reps, 9 close,
   10 pipe bridge, 11 to 13 appendix.
2. **The units rule has its own H2.** At or above $1M prints as `$1.53M`, under $1M prints as `$386K`. It uses
   October's figures, and no figure in the post is a value under $1M printed in millions.
3. **The tie-outs have their own H2,** worked on October's numbers, covering:
   - markets to company: $950K + $407K + $173K
   - segments to company: $1.08M + $373K + $78K
   - the bridge to Net New ARR: +$2.68M less $1.15M, to $1.53M
   - each top-movers card to the rows it shows
   - reps to the team figure
4. **Every dollar figure in the post is in the deck.** The one exception is the units rule's $1M threshold. The FAQ
   counts as part of the post.
5. **The post says the numbers are the demo book's,** not a customer's. The deck doesn't say so, and a reader would
   otherwise take a 20% miss and named reps for a real company.
6. **The PDF is downloadable from the post** through the short link, and the link's text says PDF.
7. **The CTA carries `utm_campaign=day1-brief` and reaches `/demo-connect/`.** Every `/demo-connect/` link in the
   article body carries the UTMs. The CTA's copy names the prompt, "Build my Day 1 brief".
8. **The page is a whole, current page.** It is bone, passes `scripts/validate.py --strict`, carries the article body
   unchanged, and its JSON-LD describes this post, not the post its shell came from.
9. **Buyer-facing copy, not a paste.** No tool name, call argument or build note appears in the post or the PDF.
10. **No form on this post.** The demo-connect section and the "send me the PDF" form are PAC-105's.
11. **Merged, not published.** The post isn't in `scripts/deploy.py`'s registry and no live page links to it. The
    post sends people to a prompt that doesn't work until PAC-104 ships. The test for this is deleted by the change
    that deploys.

## How to build it

**Don't run `src/blog/build-posts.py`.** Its `REPO` is a hard-coded path to the main checkout, so from a worktree it
writes somewhere else. Its loop rebuilds every post from `post-template.html`, which is still dark and has fallen
behind the live bone posts, so it would turn all of them dark.

Build the page by hand from a current bone post's shell, such as `what-is-an-arr-waterfall-build.html`:

- Take its nav, footer and CSS.
- Replace the title, breadcrumb, byline date and article.
- Replace all of its JSON-LD with this post's Article, FAQ and breadcrumb.
- Remove its `wp-cta-card` email form.

Leave the shared template alone. Fixing it isn't part of this issue.

Source for the copy: the deck wins over any other document, on slide titles and on numbers. Where the platform repo's
contract numbers a slide differently from the deck, follow the deck.

## Not in this change

- No WordPress page, media upload, Redirection entry or blog listing card. Those all happen at deploy.
- No change to `scripts/deploy.py` or `CLAUDE.md`'s page registry, because no page ID exists yet.

## Deploy, Will's run, after PAC-104 ships

Will does the voice pass first. Then:

1. Upload the PDF to WordPress media.
2. Add the Redirection entry from `/day-1-brief-pdf/` to it.
3. Create the WordPress page, parent 230, and record its ID in `scripts/deploy.py` and `CLAUDE.md`.
4. Add the card to `src/blog/index-build.html` and deploy 230.
5. Delete `test_post_is_held_back_from_the_live_site`.
6. Confirm on the live page that the PDF downloads and has 13 pages, and that the CTA lands on `/demo-connect/` with
   its UTMs.

The job's pull request must say to merge but not deploy before PAC-104 ships.
