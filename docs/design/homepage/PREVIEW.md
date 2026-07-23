# Previewing the v3 Claude-bone homepage

## The one rule
**Edit the source of truth: `src/homepage/index-build.html`.** Everything else (the preview,
the deployed page) is generated/derived from it. Never hand-edit the generated preview file —
your changes there get overwritten on the next build.

## Why the raw source looks broken in a browser
`src/homepage/index-build.html` is a **WordPress content fragment**, not a full page:
- no `<html>/<head>` and no fonts link,
- its JS lives in the WPCode **footer** snippet (`src/wpcode/footer.js`), so animations don't run,
- its demo iframe + Tahoe backdrop point at **production URLs** that aren't live until deploy.

So opening it directly (e.g. VS Code Live Server on the raw file) shows a static, backdrop-less,
demo-less page. That's expected — use the preview instead.

## The preview loop
```bash
# 1. edit src/homepage/index-build.html
# 2. rebuild the preview (wraps the source into a full doc, inlines the JS, uses local assets)
python3 scripts/build_preview.py

# 3a. open in VS Code Live Server (files in docs/design/homepage/):
#     index-build-bone_v3_2026-07-22.html   (homepage)
#     _blog.html                            (blog)
#     _team.html                            (team)
# --- or ---
# 3b. serve all previews and open the homepage in Chrome:
python3 scripts/build_preview.py --open             # or --serve to just serve
```

Preview URLs when served (port 5599):
- homepage — `http://127.0.0.1:5599/index-build-bone_v3_2026-07-22.html`
- blog — `http://127.0.0.1:5599/_blog.html`
- team — `http://127.0.0.1:5599/_team.html`

(The blog/team previews render their own inline JS; the homepage inlines the WPCode footer JS
and uses local demo/Tahoe assets. All three match the deployed look.)

The build copies the demo (`demo-video-by-claude.html`) and `tahoe-bg.jpg` next to the preview
(git-ignored) so it renders exactly like the deployed page — animated pipeline, rotor headline,
and the Claude-over-Tahoe demo playing.

## Quality gates (the "tests" — run before committing)
```bash
# 1. Automated gate (char budget, banned voice words, forbidden ids, nav/footer, pricing facts):
python3 scripts/validate.py src/homepage/index-build.html --strict

# 2. Visual gate — headless screenshot to eyeball the whole page:
python3 scripts/build_preview.py --serve &                 # start the server
npx playwright screenshot --full-page --viewport-size=1440,1000 \
    http://127.0.0.1:5599/index-build-bone_v3_2026-07-22.html /tmp/pacer-shot.png
```
Green on both → the change is safe to keep. Deploy is separate and gated (see
`docs/deploy/runbook.md`, "v3.0.0 Claude-bone deploy").
