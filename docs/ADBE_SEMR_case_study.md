# Runbook — Adobe × Semrush M&A Case Study (carousel → blog post)

Repeatable runbook for converting the Adobe/Semrush LinkedIn carousel into the
getpacerai.com blog post, and for re-deploying / patching it. Pattern generalizes
to future carousel → blog conversions.

- **Source carousel:** `pacerai-content/projects/adbe-semr-acquisition/collateral/carousels/carousel-adbe-semr-final.html`
- **Post slug:** `semrush-adobe-acquisition-case-study`
- **Post title:** How Semrush Got Acquired by Adobe for a Premium Despite Declining Growth
- **Categories:** Case Study · M&A · RevOps (card `data-category="case-study manda revops"`)
- **Approach:** native HTML port — text + tables rebuilt as selectable semantic HTML (dark-theme template styles them); charts/diagram/photos embedded as PNG/JPG `<figure>`s with rich `alt` + `<figcaption>` (source lines) for AEO/SEO. Wording verbatim from the carousel.
- **Work-gate (POLICY.md v2.0):** task mode (a `/blog-post` skill exists). Log in `pacerai-website/TASK-LOG.md`.

## Files

| File | Role |
|------|------|
| `src/blog/posts/content-semrush-adobe-case-study.html` | article body (input) |
| `src/blog/posts/semrush-adobe-case-study-build.html` | styled page (build output) |
| `src/blog/build-posts.py` | POSTS entry `id: "semrush-adobe-case-study"` |
| `src/blog/index-build.html` | 2 new pills (`case-study`, `manda`) + multi-category filter patch + blog card |
| `img/blog/adbe-semrush-case-study/` | source-of-truth copy of all 9 images |
| `docs/ADBE_SEMR_case_study.md` | this runbook |

## Image manifest (upload to WP Media Library)

Save all 9 in `img/blog/adbe-semrush-case-study/` (committed backup), then upload
to WP Media with the **exact filename**. WP serves them at
`https://getpacerai.com/wp-content/uploads/YYYY/MM/<filename>` (the post HTML
currently references the **2026/06** month folder — patch if uploaded in a
different month).

| # | Filename | Origin | How produced |
|---|----------|--------|--------------|
| 1 | `semrush-arr-growth-new-vs-existing-customer.png` | `…/board_decks/semrush-earnings/charts/chart-new-customer-existing-customer-growth-semrush-mckinsey.html` | Chrome headless screenshot @2×, top-cropped |
| 2 | `semrush-fcf-path-to-exit.png` | `…/charts/chart-semrush-path-to-exit.html` | Chrome headless @2× |
| 3 | `semrush-plg-to-revops-transformation.png` | slide-3 diagram markup + connector JS (rebuilt standalone) | Chrome headless @2×, whitespace-trimmed |
| 4 | `semrush-arr-per-customer-band-migration.png` | `…/charts/chart-semrush-arr-bands.html` | Chrome headless @2×, top-cropped |
| 5 | `semrush-product-categories-g2-leader.png` | `pacerai-research/companies/semrush/presentations/Semrush product categories.png` | copy + rename |
| 6 | `adobe-products-and-strategy.png` | `pacerai-research/companies/adobe/presentations/Adobe Products & Strategy.png` | copy + rename |
| 7 | `will-sullivan-pacer-ai.jpeg` | `pacerai-content/assets/img/Will Sullivan - LinkedIn Photo.jpeg` | copy + rename |
| 8 | `alexander-veach-veach-ai.jpeg` | `pacerai-gtm/channels/partner/Veach.ai - Alexander Veach.jpeg` | copy + rename |
| 9 | `brendan-cody-kenny-weighbridge.jpeg` | `pacerai-gtm/channels/partner/Xiliary Systems  - Brendan Cody Kenny.jpeg` | copy + rename |

### Re-rendering charts (if data changes)

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
  --force-device-scale-factor=2 --virtual-time-budget=5000 \
  --window-size=1200,600 --screenshot=out.png "file:///abs/path/to/chart.html"
```
Top-crop with PIL to drop the redundant data table beneath the chart. The slide-3
diagram standalone wrapper used for figure 3 is documented inline in the
conversion (transform-layout markup + `drawTransform`/`alignPLG` JS from the
carousel).

## Slide → section mapping

| Carousel slide | Post section | Figure |
|----------------|--------------|--------|
| 1 Cover | Lead + 3-step playbook | Fig 1 (ARR growth stack) |
| 2 Operating model | "From a Covid IPO…" + FY20–FY25 table | Fig 2 (FCF path) |
| 3 PLG → RevOps | "From Self-Serve PLG…" + cultural-change table | Fig 3 (transformation diagram) |
| 4 Cohort growth | "…acquire and grow larger customers" + band table + blockquote | Fig 4 (ARR band migration) |
| 5 What Adobe bought | Semrush + Adobe product/pricing lists | Fig 5 (G2), Fig 6 (Adobe strategy) |
| 6 Valuation | 4 valuation tables + board-acceptance lists | — |
| 7 CTA | Advisor bios + transaction-readiness framework | Fig 7–9 (headshots) |

## Build & deploy

```bash
cd ~/Documents/pacerai/pacerai-website
source ~/.zshrc                      # WP_APP_PASSWORD, WP_USER
python3 src/blog/build-posts.py      # -> posts/semrush-adobe-case-study-build.html
```

Deploy **draft** then **publish** via WP REST API (Pages, not Posts — Posts strip
`<style>`). `wp_user = willsullivan5e7f50183a`. POST build HTML wrapped in
`<!-- wp:html -->…<!-- /wp:html -->` to `/wp-json/wp/v2/pages` (`status:draft`),
preview, then PATCH `status:publish`. See `.claude/skills/blog-post/SKILL.md`
steps 6–9 for the exact Python.

On publish: replace the temp `"id": "semrush-adobe-case-study"` in `build-posts.py`
with the real WP page id, deploy the updated `index-build.html` to page 230, set
Yoast meta, and log the close-line in `TASK-LOG.md`.

## Open items

- **Image URLs** assume the `2026/06` upload month; verify after WP upload and
  patch the build HTML if different (or if WP appended `-1` on a name collision).
- **Multi-category filter:** `index-build.html` filter patched to
  `.split(/\s+/).indexOf(filter)>-1` so the card shows under Case Study, M&A, and
  RevOps pills.
- **Title** is the one piece of new copy (carousel had no single headline).
