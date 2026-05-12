---
paths:
  - "src/**"
  - "docs/deploy/**"
---

# WordPress Deploy Rules

1. **Publish always prompts.** WordPress write operations (`mcp__wordpress__*` writes) require human confirmation. Never allowlist publish or update actions.

2. **Foundation facts must match.** Before publishing any page that references pricing, product names, or ICP personas, verify against `foundation/` submodule content. Stale pricing on a live page is worse than no page.

3. **Brand compliance on every page.** No banned words (voice.yml), no banned CTA copy (foundation/products/cta-language.yml), no emojis.

4. **Images go through WordPress media library.** Upload via WordPress REST API, not by embedding external URLs. CDN caching depends on media library uploads.

5. **SEO metadata required.** Every page needs: title tag (<60 chars), meta description (<155 chars), H1 matching the primary keyword, structured data (JSON-LD) where applicable.

6. **Test locally before publish.** Use `npm run dev` or `npm run preview` to verify rendering. Visual check is the last line of defense.

7. **Pre-publish hook is enforced.** `.claude/hooks/pre-publish-check.sh` runs `scripts/validate.py --strict` automatically before any `python3 scripts/deploy.py` Bash invocation (except `--dry-run`). Voice lint (rule 3) and foundation pricing check (rule 2) are now deterministic — bypassing them requires editing foundation/ or fixing the page. Don't disable the hook to ship faster; either fix the content or update foundation, then re-run.
