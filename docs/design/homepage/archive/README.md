# Homepage design archive

Historical only — do not consume programmatically. Kept for audit trail and rollback.

## Superseded 2026-07-21 by v3.0.0 (Claude-bone redesign)

The dark-navy (`#080E1C`) homepage and its shared chrome were replaced by the light
**Claude-bone** (`#F5F4EF`) design. Source of truth for the new design is
`src/homepage/index-build.html` (v3.0.0).

| Archived file | Was | Superseded by |
|---|---|---|
| `index-build-dark-navy_2026-07-21.html` | live homepage (WP 25) HTML | `src/homepage/index-build.html` |
| `wpcode-homepage-css_dark_2026-07-21.css` | ~37K dark CSS in the WPCode **Header** snippet | inline `<style>` in the new homepage (WPCode Header CSS snippet is blanked at deploy) |
| `footer-dark_2026-07-21.html` | dark canonical footer | `src/footer/footer.html` (bone) |
| `../nav_headers/archive/nav-headers-dark_2026-07-21.html` | dark canonical nav (dropdowns) | `src/nav-headers.html` (bone, flat, centered) |

**Rollback:** re-POST the pre-deploy backup JSON in `docs/review/pre-deploy-backup-25-*.json`
to restore live content instantly; paste `wpcode-homepage-css_dark_2026-07-21.css` back into
the WPCode Header snippet; or redeploy `index-build-dark-navy_2026-07-21.html`. See
`docs/deploy/runbook.md` (Rollback) and `docs/document/changelog.md` (v3.0.0).
