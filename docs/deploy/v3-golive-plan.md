# v3.0.0 Go-Live Plan — push the Claude-bone homepage to getpacerai.com

**Chosen design:** `docs/design/homepage/bone_v3-simple.html` (Will's pick, 2026-07-22).
**Branch:** `feat/bone-redesign-v3` · **PR:** #20 · **Version:** v3.0.0.
**Nothing is live yet.** Every deploy step below is **gated on Will's approval**; the actual
WordPress writes + Cloudflare deploy are manual (Will-run) — I prepare, validate, and hand off.

---

## Phase 0 — Port the chosen concept into the WordPress homepage source ✅ DONE (2026-07-22)
`bone_v3-simple.html` ported into `src/homepage/index-build.html`: merged both `<style>` blocks
(incl. the `.a2o` "why Pacer AI exists" income-statement/ARR-movements visual), kept the wrapper +
`_s()` injector, dropped the flownote annotation, restored the demo iframe → worker URL and Tahoe
→ WP-media URL, JS stays in the WPCode footer (the concept's inlined JS is byte-identical to
`src/wpcode/footer.js`). **Validates 12/12 --strict** (54.8K chars, inline CSS 26.9K), verified by
screenshot to match the concept. *Still wants Will's voice pass on the 4 draft sections.*

_Original porting notes:_ `bone_v3-simple.html` is a standalone preview doc; production needs a WP **fragment**.

1. **Preserve current work first:** commit the working-tree `src/homepage/index-build.html`
   (Will's in-progress edits) so nothing is lost, then port over it.
2. **Strip to a fragment:** drop `<!doctype html><html><head>…</head><body>` + `</body></html>`;
   keep `<style>…</style>` + `<div id="pacerai-homepage">…</div>`.
3. **Restore production asset URLs** (the preview uses local copies):
   - demo iframe `src="demo-video-by-claude.html"` → `https://pacer-demo-worker.will-078.workers.dev/`
   - Tahoe backdrop `tahoe-bg.jpg` → `https://getpacerai.com/wp-content/uploads/2026/07/tahoe-bg.jpg`
4. **JS → WPCode footer:** move the inline `<script>` (rotor / marquee / pipeline number-stream +
   the `_s()` scroll handler) out of the page into `src/wpcode/footer.js`. Reconcile the rotor
   phrase array with whatever `bone_v3-simple` uses. Keep only the `<img onerror>` `_s()` injector
   inline (it must run in-page for anchor scrolling).
5. **Compliance (WP is unforgiving):** confirm **only** `id="pacerai-homepage"` (bone_v3-simple is
   already clean — all section anchors are `data-section`); **no HTML comments**; **char count
   < 67K** (fragment ≈ 54K after JS leaves — OK); inline `<style>` < 30K (≈ 19K — OK); footer ≥ 4
   columns; images use full `https://…/wp-content/uploads/…` URLs.
6. **Validate:** `python3 scripts/validate.py src/homepage/index-build.html --strict` → 12/12.
7. **Preview to confirm parity:** `python3 scripts/build_preview.py --open` — it should match
   `bone_v3-simple`.

> The 4 draft sections (Case Studies / Integrations / Security / Value) + the new "why Pacer AI
> exists" copy still want **Will's voice pass** before go-live. Do that on the source, then re-validate.

## Phase 1 — Pre-deploy checks
- `python3 scripts/validate.py --strict` (all pages) — homepage/blog/team must be green.
  **Blog post bodies fail on pre-existing voice words** → either voice-pass them or deploy with
  `--force` (documented choice).
- `python3 scripts/deploy.py 25 --dry-run` — confirms char budget + would-deploy.
- Confirm env: `source ~/.zshrc && echo $WP_USER && echo ${WP_APP_PASSWORD:0:4}`.

## Phase 2 — Manual WordPress + Cloudflare prep (Will-gated)
1. **Deploy the demo worker:** `cd infra/pacer-demo-worker && npm install && npx wrangler login &&
   npm run deploy` → `https://pacer-demo-worker.will-078.workers.dev/`. Verify it renders.
2. **Upload `tahoe-bg.jpg`** to WP Media (→ `…/uploads/2026/07/tahoe-bg.jpg`); relink if the path differs.
3. **Blank the WPCode Header CSS snippet** (the old ~37K dark CSS) — the bone CSS is inline now.
4. **Paste `src/wpcode/footer.js`** into the WPCode Footer snippet (non-minified).
5. **Redirects:**
   - `/resources` slug + `/blog/` → `/resources/` : **DONE live** (Will, 2026-07-22; posts auto-301).
   - Set 6 `/solutions/*` → homepage (301) and legacy `/pricing/` (111) → `/#pricing`.
   - Audit any other orphans.

## Phase 3 — Deploy (Will-gated, after Phase 0–2)
Homepage first, verify, then the rest:
```bash
python3 scripts/deploy.py 25          # homepage → verify 200 + demo iframe + bone bg + centered nav
python3 scripts/deploy.py 230 366     # resources index (230) + team (366)
# blog posts (parent 230): deploy after voice pass, or with --force
python3 scripts/deploy.py 865 491 …   # (per PAGE_REGISTRY; posts)
```
`deploy.py` auto-backs up each page to `docs/review/pre-deploy-backup-<id>-<ts>.json` first.
`about (374) / contact (375) / platform (371)` deploy once bone-converted (v3.0.x follow-up).

## Phase 4 — Verify live
- `curl -sI` → 200 on `/`, `/resources/`, `/team/`; `/blog/` → 301 `/resources/`; `/pricing/` → `/#pricing`.
- Visual: hero rotor animates, **demo iframe renders** (launch gate), pipeline runs, bone bg (no
  dark gutters), centered nav **identical across pages**, mobile nav works, Calendly CTAs open.
- Confirm the 6 `/solutions/*` 301 to homepage.

## Phase 5 — Release
- Merge **PR #20** → main. Tag `git tag -a v3.0.0 -m "v3.0.0 Claude-bone homepage"` + push tag.
- Log the deploy in `docs/document/changelog.md` (date, pages, approver) + `TASK-LOG.md` / `STATUS.md`.

## Rollback
- Re-POST `docs/review/pre-deploy-backup-25-*.json` `content.raw` to restore the old homepage instantly.
- Paste `docs/design/homepage/archive/wpcode-homepage-css_dark_2026-07-21.css` back into the WPCode
  Header snippet; remove the new redirects; revert the merge / delete tag `v3.0.0`.

## Gated / flagged (needs Will)
- **Voice/visual pass** on the draft sections + post bodies (publishes under Will's name).
- The **Cloudflare deploy** + **WP writes** (slug/redirects/WPCode/media) — Will's credentials.
- Confirm `bone_v3-simple` is final (vs `bone_v3-best/-modeling/-narrative` he also built).
