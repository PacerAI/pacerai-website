---
name: tear-sheet
description: Edit, export and publish the Pacer AI Tear Sheet, the 3-page PDF behind getpacerai.com/tear-sheet. It is linked from the site nav + footer and from the demo-signup and beta-tester Apollo emails. Its source is the claude.ai Design canvas "Pacer AI One-Pager". Use for "update / change the tear sheet", "publish the new tear sheet", "roll back the tear sheet", "where is the tear sheet", or /tear-sheet.
argument-hint: "[status | edit <change> | publish [pdf] | rollback [media_id]] — default: status"
---

# /tear-sheet

The Tear Sheet is a 3-page PDF (page 1: daily pacing, page 2: annual pace + expansion white space, page 3: ARR
waterfall for CFOs & sponsors). Every link to it goes through one short link, so a new version never means editing
pages or emails.

| Thing | Value |
|---|---|
| Short link | `https://getpacerai.com/tear-sheet/` — Redirection plugin entry **#18**, **302** to the current PDF |
| Source | Design canvas **Pacer AI One-Pager**: https://claude.ai/artifact/UNKgEc4riY2ANxn9y1xYNh. Artboards: `Main.dc.html` = page 1, `OptionB-Back.dc.html` = page 2, `Page4-WaterfallDetail.dc.html` = page 3 |
| Publisher | `pacerai-website/scripts/tear_sheet.py` (status / publish / rollback) |
| History | `pacerai-website/docs/tear-sheet/versions.json`: every published PDF (media id, URL, pages, bytes, sha256, note) |
| Linked from | site nav + footer on every page (`src/nav-headers.html`, `src/footer/footer.html`) → `/tear-sheet/`; Apollo `Signal_CONTACT_DemoSignup_Triage` and `Product_BetaTester` emails → `https://getpacerai.com/tear-sheet/` |

All commands run from the website repo with credentials loaded:

```bash
cd ~/Documents/pacerai/pacerai-website && source ~/.zshrc
```

## status (default)

```bash
python3 scripts/tear_sheet.py status
```

Report the live version, its date and note, and the canvas link. It also checks that the short link 302s to that
PDF and the PDF serves. If it says `UNRECORDED`, someone repointed the redirect by hand: find out what it points at
before publishing over it.

## edit <change>

1. `Artifact` → `action: "read"` on the canvas URL above. The read returns the Design type's instructions; **follow
   them** for the edit. Read `project/canvas.json`, then only the artboard files you change. Edit copies under one
   scratch folder, then publish to the **same** canvas URL with `root` + `file_path`. Change only what was asked.
2. Keep facts straight. Product names, pricing and positioning must match `pacerai-foundation`. Charts and tables
   carry "Demo data" labels; keep them. No "leverage" or "utilize". Will voice-passes any copy change, so show him
   the before and after of every sentence you touched.
3. Hand Will the canvas link and ask for the export: **in the canvas, Share › Export → PDF**. It lands in `~/Downloads`.
   This is the only manual step, because the export runs in the browser.
4. Continue with `publish`.

## publish [pdf]

1. **Pick the PDF.** Use the path given. Otherwise take the newest `~/Downloads/Pacer AI*.pdf` from the last day, and
   if more than one qualifies, ask. `Read` it (`pages: "1-3"`) and confirm it is the tear sheet and the change is
   there.
2. **Dry run**, then publish. Publishing changes the live link for everyone, so get Will's go first unless he already
   said "publish":
   ```bash
   python3 scripts/tear_sheet.py publish "<pdf>" --note "<what changed>" --dry-run
   python3 scripts/tear_sheet.py publish "<pdf>" --note "<what changed>"
   ```
   The script refuses a non-PDF, anything over 15 MB, or a file identical to a published version. It warns if the
   PDF isn't 3 pages. It uploads `pacer-ai-tear-sheet-YYYY-MM-DD.pdf`, repoints the short link, verifies the 302 and
   the served byte count, and appends to `versions.json`.
3. **Record it.** Add a line to `docs/document/changelog.md`. Then commit `docs/tear-sheet/versions.json` and the
   changelog on a branch, open a PR and merge it (pacerai-website).

There are no page deploys and no Apollo edits: the links don't change.

## rollback [media_id]

```bash
python3 scripts/tear_sheet.py rollback          # the version before the live one
python3 scripts/tear_sheet.py rollback 1063     # a specific version
```

Old PDFs stay in the media library, so every version remains a rollback target. `versions.json` records what was
published; the redirect is what's live.

## Never

- **Never link the PDF file URL anywhere.** A new version gets a new URL. A new placement links
  `https://getpacerai.com/tear-sheet/` (or `/tear-sheet/` on-site).
- **Never make the redirect a 301.** Browsers cache 301s forever and would keep serving the old PDF.
- **Never delete an old version from the media library.** It's the rollback.
- **Never upload through the WP media UI and repoint by hand.** The script verifies the result and records history.

If the short link misbehaves, the redirect lives in WP Admin → Tools → Redirection, entry `/tear-sheet/` (#18).
`status` names the mismatch.
