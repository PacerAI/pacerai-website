# Review — Resources Data Model + Nav Deploy
**Date:** 2026-04-05
**Reviewer:** Claude Code
**Approved by:** Will Sullivan
**Session scope:** Multi-deploy session covering homepage content cleanup, nav rebuild, Resources dropdown overhaul, and creation of the canonical Resources Data Model.

---

## 1. Scope of Changes

This review covers a three-stage session:

### Stage 1 — Content removal (homepage)
- Removed "Use Cases" cards section (`data-section="investor-questions"`)
- Removed "DIY Challenges" section (`data-section="diy-challenges"`)
- Added teal "Use Cases" pill anchor before first question section on homepage
- Updated stale `data-scroll-to="investor-questions"` refs → `arr-growth`

### Stage 2 — Nav rebuild (all 7 pages)
- Replaced old `<ul class="nav-dropdown">` simple list-based nav with new `<div class="dropdown">` mega-dropdown structure
- Solutions dropdown uses a 2-column grid with SVG icons and descriptions
- Sub-page navs use real URLs instead of in-page `data-scroll-to` anchors (since WordPress strips `id=` attributes)
- Added inline `_s()` helper via `<img onerror>` (WordPress strips `<script>` tags) for smooth scroll + URL hash update + hash-on-load on homepage
- Updated nav link destinations:
  - Customer Data Cube → `/solutions/customer-data-cube/`
  - ARR Snowball → `/solutions/arr-snowball-board-reporting/`
  - Team → `/team/about/` (formerly pointed to `/company/about/`)
- Fixed blog mobile nav selector (`#pacerai-homepage` → `#pacerai-blog`)

### Stage 3 — Resources dropdown + data model
- Created `docs/plan/resources_data_model.md` (canonical ICP→Problem→Pillar→Solution→Resource mapping)
- Replaced 5-item Resources dropdown with new 7-item structure:
  - Blog, ARR Snowballs, Frameworks, Model Templates, Newsletter, YouTube, For RevOps
- Added "Model Templates" filter pill to blog
- Added URL query param auto-select to blog: `/blog/?filter=<slug>`
- Added "Coming soon" empty-state for categories with 0 posts
- **AI Prompt & Skill Library** documented in data model but intentionally deferred from WP nav (Phase 2 decision required on how to surface `04_GTM/prompt-library/index.html`)

---

## 2. Files Modified

### Source HTML (deployed)
| File | WP ID | Before | After | Delta |
|------|-------|-------:|------:|------:|
| `src/homepage/index-build.html` | 25 | 67,546 | 67,983 | +437 |
| `src/blog/index-build.html` | 230 | 33,297 | 36,602 | +3,305 |
| `src/platform/overview.html` | 371 | 37,816 | 39,764 | +1,948 |
| `src/solutions/arr-snowball.html` | 372 | 42,514 | 44,088 | +1,574 |
| `src/solutions/customer-data-cube.html` | 373 | 44,404 | 46,076 | +1,672 |
| `src/team/about.html` | 374 | 35,565 | 37,409 | +1,844 |
| `src/team/contact.html` | 375 | 28,993 | 31,446 | +2,453 |

All files under the 69,000 char WordPress limit. Homepage has the tightest buffer (~1,017 chars).

### Docs updated
- `docs/plan/resources_data_model.md` — NEW (canonical data model)
- `docs/plan/prd.md` — Resources nav row updated
- `docs/design/index-build-long_page_2026_04_03.html` — Resources dropdown updated
- `docs/document/changelog.md` — 2026-04-05 entries added
- `docs/review/resources-nav-and-data-model-20260405.md` — THIS FILE (NEW)
- `docs/review/Issues.md` — new entries appended
- `docs/document/Internal_Documentation.md` — Resources + blog filter sections added

### Backups taken
- `docs/review/pre-deploy-backup-20260404-0624.json` (pre-removal of Use Cases + DIY sections)
- `docs/review/pre-deploy-backup-20260404-0649.json` (pre-nav rebuild)
- `docs/review/pre-deploy-backup-362-20260405-0731.json` through `pre-deploy-backup-375-20260405-0731.json` (pre-final deploy)
- `docs/review/post-deploy-{page}-20260405-0851.json` × 7 (post-deploy snapshots of all 7 live pages)

---

## 3. Pre-Deploy Checklist (all pages)

| Check | Status |
|---|---|
| File size < 69,000 chars | ✅ All 7 pages |
| No HTML comments in deployed content | ✅ Removed via regex sanitize |
| No `id=` attributes except `id="pacerai-homepage"` | ✅ Verified |
| All image URLs use `https://getpacerai.com/wp-content/uploads/` | ✅ |
| No inline `<script>` relied on for critical path JS | ✅ Uses `<img onerror>` helper instead |
| Resources dropdown has 7 items | ✅ |
| New "Model Templates" filter pill present | ✅ |
| URL query param auto-select logic in blog JS | ✅ |
| "Coming soon" empty-state HTML + toggle JS | ✅ |

---

## 4. Post-Deploy Verification (live)

### HTTP status — all pages
| URL | Status |
|---|---|
| https://getpacerai.com/ | 200 |
| https://getpacerai.com/blog/ | 200 |
| https://getpacerai.com/platform/overview/ | 200 |
| https://getpacerai.com/solutions/arr-snowball-board-reporting/ | 200 |
| https://getpacerai.com/solutions/customer-data-cube/ | 200 |
| https://getpacerai.com/team/about/ | 200 |
| https://getpacerai.com/team/contact/ | 200 |

### Resources dropdown (homepage + sub-page)
Browser-verified via Claude in Chrome:
- Homepage: 7 links present — Blog, ARR Snowballs, Frameworks, Model Templates, Newsletter (new tab), YouTube (new tab), For RevOps ✅
- `/team/about/`: 7 links present (same structure) ✅

### Blog filter auto-select
- `https://getpacerai.com/blog/?filter=arr-snowballs` → "ARR Snowballs" pill active, 6 cards visible, empty-state hidden ✅
- `https://getpacerai.com/blog/?filter=model-templates` → "Model Templates" pill active, 0 cards visible, **"Coming soon / New posts on the way"** empty-state visible ✅

### Curl content checks (all 7 pages)
```
filter=arr-snowballs: 1   filter=frameworks: 1
filter=model-templates: 1  filter=revops: 1
```
All 4 new filter links present in the rendered HTML of every page.

---

## 5. Known Issues / Follow-ups

### RESOLVED this session
- ✅ Broken Overview dropdown links (scroll-to missing target)
- ✅ Placeholder `href="#"` on "ARR Snowball Guide" and "Templates & Frameworks" Resources links
- ✅ Nav inconsistency between homepage and sub-pages
- ✅ Smooth scroll blocked on homepage (documented: WordPress strips `<script>`, mitigated via `<img onerror>` helper)
- ✅ Blog mobile nav selector using wrong wrapper ID

### NEW — Phase 2 follow-ups
1. **AI Prompt & Skill Library surfacing** — documented in data model but not live on WP. Options: iframe `04_GTM/prompt-library/index.html`, copy static HTML to new WP page, or build dedicated `/resources/prompt-library/` page that renders `prompts.json`. **Decision needed from Will.**
2. **Seed empty blog categories** — Frameworks (0 posts), Model Templates (0 posts), AI & Agents (0 posts). Recommended priority: Frameworks first since it's most prominent in the nav.
3. **Native smooth scroll workaround** — currently using instant `window.scrollTo()` because smooth was blocked in testing. If smooth scroll is desired, revisit.
4. **Homepage size budget** — 1,017 chars buffer is tight. Any future additions should first minify existing CSS.

### PRE-EXISTING (not addressed this session)
- Homepage slug is still `no-title` — needs Will's review to change permalink
- Yoast page title should be "Pacer AI — ARR Intelligence for PE-Backed SaaS" (set in WP admin)

---

## 6. Rollback Plan

If any issue surfaces, restore any of the 7 pages from their backup snapshots:

```python
import json, requests, os

# Example: restore homepage from post-deploy snapshot
backup = json.load(open('docs/review/post-deploy-home-20260405-0851.json'))
content = backup['content']['raw']
resp = requests.post(
    f"{os.environ['WP_BASE_URL']}/wp-json/wp/v2/pages/25",
    json={"content": content},
    auth=(os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])
)
print(f"Rollback {'OK' if resp.status_code == 200 else 'FAILED'}")
```

Earlier backups (pre-deploy) are also available in `docs/review/pre-deploy-backup-*.json` for restoring to prior states.

---

## 7. Sign-off

- **Pre-deploy review:** ✅ Passed
- **Post-deploy verification:** ✅ Passed
- **User approval:** ✅ Will Sullivan
- **Deploy date:** 2026-04-05
