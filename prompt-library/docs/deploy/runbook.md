# Prompt Library — Deploy Runbook

## Public Library (WordPress)

### Prerequisites
- WordPress REST API credentials set in environment (see `website-PacerAI` repo)
- Source HTML prepared (no `<html>/<head>/<body>` tags — WordPress injects these)
- QA checklist completed (`docs/review/checklist.md`)

### Steps

1. **Prepare HTML content**
   ```bash
   # Source file will be at:
   # /04_GTM/website-PacerAI/src/resources/prompt-library.html
   ```

2. **Create WordPress page** (first deploy only)
   ```bash
   # Use website-PacerAI deploy pattern
   # Parent: Resources page (get WP ID from website-PacerAI CLAUDE.md)
   # Slug: prompt-library
   ```

3. **Deploy via REST API**
   ```bash
   python3 /04_GTM/website-PacerAI/deploy.py \
     --page-id <WP_ID> \
     --source src/resources/prompt-library.html
   ```

4. **Verify**
   - Visit `https://getpacerai.com/resources/prompt-library/`
   - Check: hero renders, filters work, copy-to-clipboard works, responsive on mobile
   - Record WP page ID in `website-PacerAI/CLAUDE.md` page registry

5. **Document**
   - Append deploy entry to `docs/document/changelog.md`

### Rollback
- Re-deploy previous HTML version via REST API
- WordPress revisions available in WP admin if needed

---

## Client Library (Platform)

### Prerequisites
- `client-TDS` repo checked out and dependencies installed
- TypeScript builds cleanly (`npm run typecheck`)
- QA checklist completed

### Steps

1. **Update component**
   ```bash
   # Component location:
   # /02_Platform/client-TDS/clientTDS-chat/src/components/PromptLibrary.tsx
   ```

2. **Update prompt data**
   - Client prompts served via API endpoint: `GET /api/prompts?workspace=<KEY>`
   - Or bundled in component if static

3. **Build and test**
   ```bash
   cd /02_Platform/client-TDS/clientTDS-chat
   npm run typecheck
   npm run build:app
   npm run dev  # manual QA
   ```

4. **Deploy**
   ```bash
   cd /02_Platform/client-TDS
   azd up  # Azure App Service deploy
   ```

5. **Verify**
   - Log into client portal
   - Navigate to prompt library sidebar
   - Check: workspace-scoped prompts load, filters work, copy works, CRUD works

6. **Document**
   - Append deploy entry to `docs/document/changelog.md`

### Rollback
- `azd` supports slot swaps — swap back to previous deployment slot
- Or redeploy previous commit: `git revert HEAD && azd up`

---

## Checklist Before Any Deploy

- [ ] `docs/review/checklist.md` completed
- [ ] No console errors in local preview
- [ ] Both dark and light themes verified
- [ ] Responsive layout verified (mobile, tablet, desktop)
- [ ] `docs/document/changelog.md` updated
