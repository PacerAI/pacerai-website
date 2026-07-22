# WordPress runbook — rename /blog/ → /resources/ (v3, page 230)

**Goal:** move the blog index (WP page **230**) and all its posts from `getpacerai.com/blog/…`
to `getpacerai.com/resources/…`, preserving SEO with 301 redirects.

**Why redirects matter:** `/blog/` and every `/blog/<slug>/` are indexed by Google + linked from
outside. Changing the slug without 301s = 404s + lost ranking. The source (this repo) already
links to `/resources/…` everywhere; this runbook is the WordPress side.

> Do this as ONE coordinated step with the v3 deploy — don't change the slug before the new
> `/resources`-linking pages are deployed, or the live nav points at a page that isn't there yet.

---

## Step 1 — Change the page slug (blog → resources)

1. WP Admin → **Pages** → open **Blog** (ID 230).
2. In the **URL / Permalink** field (Settings sidebar in the block editor, or "Edit" next to the
   permalink), change the slug from `blog` to **`resources`**.
3. **Update**. The index is now live at `https://getpacerai.com/resources/`.
4. Because the posts are **child pages of 230**, their URLs move automatically to
   `https://getpacerai.com/resources/<slug>/` (no per-post slug edits needed).

WordPress core auto-creates a redirect for the **changed slug itself** (`/blog/` → `/resources/`
via `wp_old_slug_redirect`). It does **not** auto-redirect the child paths — do Step 2 for those.

## Step 2 — 301 redirects (catch the old post URLs)

Use the **Redirection** plugin (Tools → Redirection) — or Yoast Premium → Redirects, or Safe
Redirect Manager. Add a **regex** rule so every old post URL maps to the new one:

| Source (regex) | Target | Type |
|---|---|---|
| `^/blog/(.*)$` | `/resources/$1` | 301 |

(Enable "Regex" on the rule. This covers `/blog/` → `/resources/` **and** every
`/blog/<slug>/` → `/resources/<slug>/` in one line.)

If you can't use regex, add explicit 301s for each post:
`/blog/semrush-adobe-acquisition-case-study/` → `/resources/semrush-adobe-acquisition-case-study/`,
`/blog/what-is-current-performance-obligation/` → `/resources/what-is-current-performance-obligation/`,
`/blog/grow-nrr-101-to-105-case-study/` → `/resources/grow-nrr-101-to-105-case-study/`,
`/blog/build-customer-data-cube-in-house-or-hire/` → `/resources/…`,
`/blog/what-most-companies-build-vs-what-boards-need/` → `/resources/…`, … (one per post).

> WordPress.com note: granular path redirects need the **Business/Commerce** plan (plugins
> enabled — you already run WPCode, so this should be fine). The whole-site "Site Redirect"
> feature is domain-level and is NOT what you want here.

## Step 3 — Deploy the updated source

Deploy the v3 pages that now link to `/resources/…`:
`python3 scripts/deploy.py 25 230 366` (+ the blog posts once you deploy them). The nav/footer
"Resources" link and all article links already point to `/resources/…` in this repo.

## Step 4 — Verify

```bash
curl -sI https://getpacerai.com/blog/ | grep -i location          # -> /resources/ (301)
curl -sI https://getpacerai.com/blog/what-is-current-performance-obligation/ | grep -i location
curl -sI https://getpacerai.com/resources/ | grep -i "HTTP"        # -> 200
```
- Yoast regenerates the sitemap automatically; confirm `/sitemap_index.xml` shows `/resources/…`.
- In **Google Search Console**, submit the updated sitemap (optional but speeds re-indexing).
- Click through the site: nav "Resources", footer, homepage case-study card, and the blog filter
  deep-links (`/resources#case-study`) should all resolve.

## Rollback
Change the slug back to `blog` (Step 1) and disable the Step 2 redirect rule. Core will redirect
`/resources/` → `/blog/` automatically.
