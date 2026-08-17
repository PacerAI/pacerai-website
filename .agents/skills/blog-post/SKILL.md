---
name: blog-post
description: Write, review, and publish a blog post to getpacerai.com/blog/. Creates styled blog posts with JSON-LD schema, deploys as WordPress Pages via REST API. Supports draft preview before publishing. Use when writing new blog posts, editing existing posts, or republishing updated content.
disable-model-invocation: true
argument-hint: [topic or instruction] — e.g. "write a post about net revenue retention" or "publish draft from src/blog/posts/content-new.html"
---

# Blog Post — getpacerai.com

Write, preview, and publish blog posts to the Pacer AI marketing blog.

## Important Constraints

- Blog posts are deployed as **WordPress Pages** (not Posts) — Posts strip `<style>` tags
- Deploy via **REST API only** — MCP `wp_update_post` strips `<style>` and `<script>` tags
- Category filtering is **client-side HTML** (not WordPress taxonomy)
- Always deploy to **draft first** for preview, then publish after user approval

## Environment Setup

```bash
source ~/.zshrc 2>/dev/null
```

Required: `WP_BASE_URL`, `WP_USER`, `WP_APP_PASSWORD`

Verify: `echo $WP_BASE_URL && echo $WP_USER && echo ${WP_APP_PASSWORD:0:4}...`

## Repo Location

`~/Documents/GitHub/PacerAI/pacerai-website/`

## File Map

```
src/blog/
├── index-build.html          # Blog listing page (WP ID 230)
├── post-template.html        # Shared dark-theme template (includes nav + footer)
├── build-posts.py            # Build script: template + content → styled page
└── posts/
    ├── content-{id}.html     # Raw article HTML (input)
    └── {id}-build.html       # Complete styled page (output)

src/nav-headers.html            # CANONICAL nav header (single source of truth)
docs/design/footer/footer.html  # CANONICAL footer (single source of truth)
```

## Nav Header

The `<nav>` in `post-template.html` must match `src/nav-headers.html` (the sub-page version). When the nav is updated:

1. Edit `src/nav-headers.html` first
2. Copy the `<nav>...</nav>` block into `post-template.html`
3. Rebuild all posts: `python3 src/blog/build-posts.py`
4. Redeploy affected posts

The canonical nav includes: Overview, Solutions (mega-dropdown with Transaction + Transformation columns and SVG icons), Resources, Team, Log In, and Request Demo.

## Workflow

Follow these steps IN ORDER. Do not skip the review step.

### Step 1: Write or Receive Content

If the user provides a topic, write the blog post content as semantic HTML:
- Use `<h2>` for main sections, `<h3>` for subsections
- Use `<p>`, `<ul>`, `<ol>`, `<table>`, `<blockquote>` as appropriate
- No `<style>`, `<head>`, `<nav>`, `<footer>` — the template provides all of that
- No classes needed — the template styles all standard HTML tags

**Content guidelines (AEO-optimized):**
- **First paragraph**: Directly answer "What is [topic]?" in 1-2 sentences
- **Use H2s as questions**: "Why Does X Matter?" > "The Importance of X"
- **Include structured data**: Lists, tables, numbered steps — AI engines extract these
- **Be specific**: Real numbers, concrete examples, comparisons
- **Target audience**: PE operating partners, CFOs, RevOps leaders at $50M–$1B ARR SaaS
- **Tone**: Authoritative, data-driven, no fluff. Senior analyst voice.
- **Avoid**: "Get started free", "game-changer", "revolutionary", emojis, exclamation marks
- **Avoid overly technical jargon**: Use plain language the audience actually uses. The audience is executives, not engineers.
  - Say "rule-based calculations" not "deterministic classification engine"
  - Say "purpose-built data pipelines" not "production-grade pipelines"
  - Say "cross-system customer matching" not "entity resolution"
  - Say "analytics database" or "data pipeline" not "persistent state" or "temporal logic"
  - Say "messy data" or "every company's custom way of doing things" not "source system ambiguity"
  - Emphasize that every company has its own nuances to ARR definitions — what counts as expansion, when a downgrade becomes churn, etc. Often internal teams can't agree on these definitions, which is where an expert is needed before any tool can automate.
- **Word count**: 1,200–2,000 words for standard posts

**Linking requirements (MANDATORY):**
- **External expert sources**: Include 3-4 links to credible third-party sources (e.g., Bessemer, SaaS Capital, OpenView, Gartner, Forrester, academic papers). These build authority and AEO trust signals.
- **Internal blog post links**: Link to 2-5 existing Pacer AI blog posts where relevant. Check the `POSTS` list in `build-posts.py` for current posts and their slugs.
- **Internal page links**: Link to relevant Pacer AI pages — especially `/solutions/arr-snowball-board-reporting/`, `/solutions/customer-data-cube/`, and `/platform/overview/` where the content naturally references these capabilities.

Save to: `src/blog/posts/content-{slug}.html` (use a short slug, e.g., `content-nrr-guide.html`)

### Step 2: Prepare Metadata

Determine these values:
- **title**: Full post title (50-70 chars ideal for SEO)
- **title_short**: 2-3 word breadcrumb label
- **category**: One of the existing categories, or propose a new one
- **date**: Human-readable date (e.g., "March 15, 2026")
- **date_iso**: ISO 8601 date (e.g., "2026-03-15")
- **slug**: URL-friendly slug (lowercase, hyphens, no stop words if possible)
- **faq**: 2-3 Q&A pairs for FAQPage JSON-LD schema

**Existing categories:**
| Category | `data-category` value |
|----------|----------------------|
| ARR Snowballs | `arr-snowballs` |
| RevOps | `revops` |

### Step 3: Present for Review (MANDATORY)

**STOP HERE and present the content to the user for review.**

Show them:
1. The **title** and **slug** (proposed URL)
2. The **full article content** (formatted, readable)
3. The **category** and **FAQ pairs**
4. Ask: "Ready to preview as a draft, or want to make changes?"

**Do NOT proceed to Step 4 until the user explicitly approves.**

If the user requests changes, edit the content file and re-present.

### Step 4: Add to Build Script

Edit `src/blog/build-posts.py` — add a new entry to the `POSTS` list:

```python
{
    "id": "new-slug",  # Temporary — will be replaced with WP page ID
    "title": "Your Full Post Title",
    "title_short": "Short Label",
    "category": "ARR Snowballs",
    "date": "March 15, 2026",
    "date_iso": "2026-03-15",
    "faq": [
        {"q": "Question?", "a": "Concise answer."},
    ],
},
```

### Step 5: Build the Styled Page

```bash
cd ~/Documents/GitHub/PacerAI/pacerai-website
python3 src/blog/build-posts.py
```

Verify the build file was created at `src/blog/posts/{id}-build.html`.

### Step 6: Deploy as Draft

Create the WordPress page with `status: "draft"` so the user can preview it.

```python
source ~/.zshrc

python3 -c "
import urllib.request, base64, json, os

wp_user = 'willsullivan5e7f50183a'
wp_pass = os.environ['WP_APP_PASSWORD']
creds = base64.b64encode(f'{wp_user}:{wp_pass}'.encode()).decode()

with open('src/blog/posts/{id}-build.html') as f:
    html = f.read()

content = '<!-- wp:html -->' + html + '<!-- /wp:html -->'
payload = json.dumps({
    'title': 'Your Full Post Title',
    'slug': 'your-post-slug',
    'status': 'draft',
    'content': content
}).encode()

req = urllib.request.Request('https://getpacerai.com/wp-json/wp/v2/pages', data=payload, method='POST')
req.add_header('Authorization', f'Basic {creds}')
req.add_header('Content-Type', 'application/json')

with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read().decode())
    print(f'Draft created: page ID {result[\"id\"]}')
    print(f'Preview: {result[\"link\"]}')
    print(f'WP Admin preview: https://getpacerai.com/?page_id={result[\"id\"]}&preview=true')
"
```

**Tell the user:**
> "Draft published. Preview it here: [preview URL]
> Review in WP Admin: [admin preview URL]
> When you're happy with it, say 'publish' and I'll make it live."

### Step 7: Wait for User Approval (MANDATORY)

**STOP and wait.** The user must explicitly say to publish (e.g., "publish", "looks good", "go ahead", "ship it").

If the user requests changes:
1. Edit the content file
2. Rebuild with `python3 src/blog/build-posts.py`
3. Update the draft via REST API (POST to `/wp-json/wp/v2/pages/{PAGE_ID}`)
4. Tell the user to re-preview

### Step 8: Publish

Once approved, change the page status to `publish`:

```python
payload = json.dumps({'status': 'publish'}).encode()
req = urllib.request.Request(
    f'https://getpacerai.com/wp-json/wp/v2/pages/{PAGE_ID}',
    data=payload, method='POST'
)
req.add_header('Authorization', f'Basic {creds}')
req.add_header('Content-Type', 'application/json')
```

### Step 9: Update Build Script with Real ID

Go back to `src/blog/build-posts.py` and replace the temporary slug ID with the WordPress page ID:

```python
"id": 400,  # Was "new-slug", now real WP page ID
```

### Step 10: Update Blog Listing

Edit `src/blog/index-build.html` — add a new blog card at the TOP of the card grid (newest first):

```html
<a href="/your-post-slug/" class="blog-card" data-category="arr-snowballs">
  <span class="card-category">ARR Snowballs</span>
  <h2>Your Full Post Title</h2>
  <p>1-2 sentence description.</p>
  <span class="card-meta">March 15, 2026</span>
</a>
```

If adding a new category, also add a pill button:
```html
<button class="cat-pill" data-filter="new-category">New Category</button>
```

Deploy the updated blog listing:
```python
# POST updated content to page 230
```

### Step 11: Commit and Push

```bash
git add src/blog/
git commit -m "feat: add blog post — Your Post Title"
git push origin main
```

### Step 12: Set Yoast SEO Meta

Use MCP to set Yoast meta description and page title — no WP Admin needed:

```
mcp__wordpress-site__wp_update_post_meta(
    ID={PAGE_ID},
    meta={
        "_yoast_wpseo_metadesc": "150-char meta description with primary keyword",
        "_yoast_wpseo_title": "Post Title — Pacer AI"
    }
)
```

### Step 13: Post-Publish Checklist

Tell the user:
- [ ] Verify the post at its live URL
- [ ] Verify the post appears on /blog/ with correct category filtering
- [ ] Log deploy in `docs/document/changelog.md`

## Editing an Existing Post

To update a previously published post:

1. Edit the content file: `src/blog/posts/content-{id}.html`
2. Rebuild: `python3 src/blog/build-posts.py`
3. Present changes to user for review
4. Deploy via REST API: `POST /wp-json/wp/v2/pages/{PAGE_ID}`
5. Commit and push

## Categories Reference

| Category | `data-category` | Description |
|----------|-----------------|-------------|
| ARR Snowballs | `arr-snowballs` | ARR reporting, waterfall models, revenue decomposition, churn |
| RevOps | `revops` | Revenue operations, data unification, GTM, AI for ops |

To add a new category:
1. Add a `<button class="cat-pill" data-filter="new-slug">Category Name</button>` to `index-build.html`
2. Use `data-category="new-slug"` on blog cards
3. No WordPress taxonomy changes needed — filtering is client-side JS
