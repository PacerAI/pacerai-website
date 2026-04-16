## Website Deploy & Phase 4 — Claude Code Prompt

You are deploying updates to getpacerai.com. The homepage HTML has already been updated at `src/homepage/index-build.html` (63,276 chars, under the 69K limit). Read CLAUDE.md and docs/deploy/runbook.md for deploy credentials and process.

### Task 1: Deploy Homepage (Phase 1-3 combined)

1. `source ~/.zshrc` and verify WP env vars are set
2. Backup current homepage: `curl -s -u "$WP_USER:$WP_APP_PASSWORD" "$WP_BASE_URL/wp-json/wp/v2/pages/25?context=edit" > docs/review/pre-deploy-backup-$(date +%Y%m%d-%H%M).json`
3. Verify file size: `python3 -c "f=open('src/homepage/index-build.html').read();print(len(f));assert len(f)<69000"`
4. Deploy page ID 25 per runbook (wrap in `<!-- wp:html -->...<!-- /wp:html -->`)
5. Verify: `curl -s -o /dev/null -w "%{http_code}" https://getpacerai.com/`
6. Content check: `curl -s https://getpacerai.com/ | grep -c 'data-section'` (expect 14)

### Task 2: Update Nav/Footer on Other Pages

The nav and footer changed. Extract the new `<nav>...</nav>` and `<footer>...</footer>` from `src/homepage/index-build.html` and replace them in these files, then deploy each:

| Page | WP ID | Source File |
|------|-------|-------------|
| Blog | 230 | src/blog/index-build.html |
| Platform Overview | 371 | src/platform/overview.html |
| ARR Snowball | 372 | src/solutions/arr-snowball.html |
| Customer Data Cube | 373 | src/solutions/customer-data-cube.html |
| About | 374 | src/company/about.html |
| Contact | 375 | src/company/contact.html |

Batch deploy all pages per runbook. Verify all return HTTP 200.

### Task 3: Phase 4 — AEO Blog Post

Write and deploy a blog post: **"Should I Build a Customer Data Cube In-House or Hire Someone?"**

Sources:
- DIY Challenges section content from docs/plan/prd.md (Section 5)
- Positioning doc: `01_Foundation/strategy/Positioning_by_ChatGPT.md` (DIY wedge section)
- Use the blog post template at `src/blog/post-template.html`

Blog post requirements:
- AEO-optimized (target featured snippets for the title question)
- Include the 6 DIY challenge areas (Time, Team, Output, Non-Operational, Deep Expertise, New Lens)
- Position Pacer AI as the alternative to DIY
- CTA: "Get a Sample Board Package" → calendly.com/pacerai
- Deploy as a new WordPress post (not page) via REST API
- Log the post ID

### Task 4: Verification & Changelog

1. Run HTTP 200 check on all pages
2. Log all deploys to `docs/document/changelog.md` with date, page IDs, changes, backup reference

### Critical Rules (from PRD Section 0):
- Total HTML per page must stay under 69,000 characters
- No `id=` attributes except `id="pacerai-homepage"` — use `data-section=`
- Keep `<section>` tags (they work)
- Remove all HTML comments before deploying
- All images use WordPress URLs
- Keep CSS inline in `<style>` — no external links
