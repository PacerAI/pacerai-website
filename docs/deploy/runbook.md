# Deploy Runbook — getpacerai.com

**READ THIS BEFORE DEPLOYING TO THE LIVE SITE.**

This runbook is executed by Claude Code. Every step must be completed in order.

---

## WordPress.com Content Constraints (CRITICAL — Read First)

These were discovered during the April 3, 2026 deployment. Violating any of these will break the live site.

| Constraint | Rule | What Happens If You Violate |
|---|---|---|
| **Content size** | Total HTML inside `<!-- wp:html -->` must be **under ~69,000 characters** | Content silently truncated — page renders partially, looks broken |
| **`id=` attributes** | Do NOT use `id=` on inner elements. Only `id="pacerai-homepage"` survives. | WordPress.com strips most `id=` attributes. Anchor links (`#section-name`) won't work. |
| **Anchor navigation** | Use `data-section="name"` attributes + JS smooth scroll instead of `id=` | See PRD Section 0 for the JS workaround pattern |
| **`<section>` tags** | `<section>` tags ARE allowed and work. Do NOT replace with `<div>`. | The March version uses 8 `<section>` tags and they render fine |
| **HTML comments** | Remove ALL `<!-- ... -->` comments before deploying | Comments may confuse the WordPress block parser |
| **External CSS** | Do NOT use `<link rel="stylesheet">` — WordPress moves it into the body and it may not load | Keep all CSS inline in a `<style>` block. Minify to stay under size limit. |
| **External JS** | Do NOT use `<script src="...">` | Same issue as CSS — keep JS inline |
| **Images** | All images must use full WordPress URLs (`https://getpacerai.com/wp-content/uploads/...`) | Local `img/` paths won't resolve on WordPress |
| **Google Fonts** | Do NOT add `<link>` tags for fonts — WordPress loads them via the theme | Adding font links wastes characters and may break |

### Size Budget

| Component | Target | Notes |
|---|---|---|
| CSS (minified inline) | ~30,000 chars max | Remove comments, collapse whitespace, shorten selectors |
| HTML body | ~35,000 chars max | Remove comments, minimal indentation |
| JavaScript | ~2,000 chars | Counter animation + mobile nav + smooth scroll |
| **Total** | **< 67,000 chars** | Leave 2K buffer under the ~69K limit |

### Pre-Deploy Size Check

Always check file size before deploying:
```python
with open('src/homepage/index-build.html') as f:
    html = f.read()
print(f"File size: {len(html):,} chars")
assert len(html) < 69000, f"FILE TOO LARGE: {len(html):,} chars (limit ~69,000)"
```

### Pre-Deploy Content Sanitization

Run this before every homepage deploy:
```python
import re

with open('src/homepage/index-build.html') as f:
    html = f.read()

# 1. Remove HTML comments (WordPress block parser chokes on them)
html = re.sub(r'<!--(?!.*wp:).*?-->', '', html, flags=re.DOTALL)

# 2. Check for forbidden id= attributes
ids = re.findall(r' id="([^"]+)"', html)
allowed_ids = {'pacerai-homepage'}
bad_ids = [i for i in ids if i not in allowed_ids]
if bad_ids:
    print(f"WARNING: These id= attributes will be stripped by WordPress: {bad_ids}")
    print("Use data-section= attributes instead")

# 3. Check for local image paths
local_imgs = re.findall(r'src="img/[^"]*"', html)
if local_imgs:
    print(f"ERROR: Local image paths found (won't work on WordPress): {local_imgs}")
    print("Upload to WordPress media library and use full URLs")

# 4. Size check
print(f"File size: {len(html):,} chars — {'OK' if len(html) < 69000 else 'TOO LARGE'}")
```

---

## Deploy Method: REST API via Python

All deploys use the WordPress REST API with Basic Auth.

### Required Environment Variables

```bash
# Set in ~/.zshrc
export WP_BASE_URL=https://getpacerai.com
export WP_USER=willsullivan5e7f50183a
export WP_APP_PASSWORD=[app password from WP admin]
```

Verify: `source ~/.zshrc && echo $WP_BASE_URL && echo $WP_USER && echo ${WP_APP_PASSWORD:0:4}...`

---

## Page Registry

Always reference `CLAUDE.md` for the authoritative page registry. Key pages:

| Page | WP ID | Source File |
|------|-------|-------------|
| Home | 25 | `src/homepage/index-build.html` |
| Blog | 230 | `src/blog/index-build.html` |
| Platform Overview | 371 | `src/platform/overview.html` |
| ARR Snowball | 372 | `src/solutions/arr-snowball.html` |
| Customer Data Cube | 373 | `src/solutions/customer-data-cube.html` |
| About (→ Team) | 374 | `src/team/about.html` |
| Contact | 375 | `src/team/contact.html` |

Parent placeholder pages (no content): Platform (362), Solutions (364), Company/Team (366).

---

## Pre-Flight Checks

### 1. Verify environment
```bash
source ~/.zshrc
echo $WP_BASE_URL && echo $WP_USER && echo ${WP_APP_PASSWORD:0:4}...
```

### 2. Backup current page (ALWAYS for homepage changes)
```bash
source ~/.zshrc
DATE=$(date +%Y%m%d-%H%M)
curl -s -u "$WP_USER:$WP_APP_PASSWORD" \
  "$WP_BASE_URL/wp-json/wp/v2/pages/25?context=edit" \
  > docs/review/pre-deploy-backup-$DATE.json
```

### 3. Run content sanitization check
See "Pre-Deploy Content Sanitization" above. Fix all errors before proceeding.

### 4. Confirm file size
```bash
wc -c src/homepage/index-build.html
# Must be under 69,000
```

---

## Deploy: Single Page

```python
import requests, os

base_url = os.environ['WP_BASE_URL']
auth = (os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])

with open('src/homepage/index-build.html') as f:
    html = f.read()

# Size guard
assert len(html) < 69000, f"File too large: {len(html):,} chars"

content = f"<!-- wp:html -->{html}<!-- /wp:html -->"
resp = requests.post(f"{base_url}/wp-json/wp/v2/pages/25", json={"content": content}, auth=auth)

if resp.status_code == 200:
    print(f"OK — {resp.json()['link']}")
else:
    print(f"FAILED — HTTP {resp.status_code}: {resp.text[:300]}")
```

## Deploy: All Pages (Batch)

Use this when shared elements (nav, footer, base CSS) have changed.

```python
import requests, os

base_url = os.environ['WP_BASE_URL']
auth = (os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])
api = f"{base_url}/wp-json/wp/v2/pages"
src = "src"

pages = [
    {"id": 25,  "title": "Home",               "file": f"{src}/homepage/index-build.html"},
    {"id": 230, "title": "Blog",               "file": f"{src}/blog/index-build.html"},
    {"id": 371, "title": "Platform Overview",   "file": f"{src}/platform/overview.html"},
    {"id": 372, "title": "ARR Snowball",        "file": f"{src}/solutions/arr-snowball.html"},
    {"id": 373, "title": "Customer Data Cube",  "file": f"{src}/solutions/customer-data-cube.html"},
    {"id": 374, "title": "About",               "file": f"{src}/team/about.html"},
    {"id": 375, "title": "Contact",             "file": f"{src}/team/contact.html"},
]

for p in pages:
    with open(p['file']) as f:
        html = f.read()
    content = f"<!-- wp:html -->{html}<!-- /wp:html -->"
    resp = requests.post(f"{api}/{p['id']}", json={"content": content}, auth=auth)
    status = "OK" if resp.status_code == 200 else f"FAIL ({resp.status_code})"
    print(f"  {status} — {p['title']} (ID {p['id']}) [{len(html):,} chars]")
```

## Deploy: New Page (First Time)

```python
# 1. Create the HTML source file in src/
# 2. Create the WordPress page:
resp = requests.post(f"{base_url}/wp-json/wp/v2/pages", json={
    "title": "Page Title",
    "slug": "page-slug",
    "parent": 364,  # Parent page ID (Platform=362, Solutions=364, Company=366)
    "status": "publish",
    "content": f"<!-- wp:html -->{html}<!-- /wp:html -->"
}, auth=auth)
new_id = resp.json()['id']
print(f"Created page ID {new_id} at {resp.json()['link']}")
# 3. IMPORTANT: Update CLAUDE.md page registry with the new ID
```

## Upload Images to WordPress Media Library

```python
import requests, os

base_url = os.environ['WP_BASE_URL']
auth = (os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])

filepath = "path/to/image.png"
filename = os.path.basename(filepath)

with open(filepath, 'rb') as f:
    resp = requests.post(
        f"{base_url}/wp-json/wp/v2/media",
        headers={
            'Content-Disposition': f'attachment; filename={filename}',
            'Content-Type': 'image/png'
        },
        data=f.read(),
        auth=auth
    )

if resp.status_code == 201:
    print(f"OK — {resp.json()['source_url']}")
else:
    print(f"FAILED — {resp.status_code}: {resp.text[:200]}")
```

**Note:** WordPress.com does NOT allow `.css` or `.js` file uploads. Only images (png, jpg, gif, webp).

---

## Deploy: Blog Post

See **[Blog Post Guide](blog-post-guide.md)** for the complete workflow.

Quick version: ask Claude Code to "write a blog post about [topic] and publish it."

---

## Post-Deploy Verification

### 1. HTTP status check
```bash
source ~/.zshrc
for url in \
  "https://getpacerai.com/" \
  "https://getpacerai.com/blog/" \
  "https://getpacerai.com/platform/overview/" \
  "https://getpacerai.com/solutions/arr-snowball-board-reporting/" \
  "https://getpacerai.com/solutions/customer-data-cube/" \
  "https://getpacerai.com/company/about/" \
  "https://getpacerai.com/company/contact/"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$code  $url"
done
```

### 2. Content rendering check (homepage)
```bash
# Verify key sections exist in the rendered HTML
curl -s https://getpacerai.com/ | grep -c 'class="hero"'
curl -s https://getpacerai.com/ | grep -c '</footer>'
curl -s https://getpacerai.com/ | grep -c 'data-section'
```

### 3. Log the deploy
Append to `docs/document/changelog.md` with date, page IDs, changes, and backup reference.

### 4. Lighthouse audit (optional)
```bash
npx lighthouse https://getpacerai.com --output=json --output-path=docs/review/lighthouse-$(date +%Y%m%d).json
```

---

## Rollback Procedure

Restore from backup:
```python
import json, requests, os

backup = json.load(open('docs/review/pre-deploy-backup-[DATE].json'))
content = backup['content']['raw']

resp = requests.post(
    f"{os.environ['WP_BASE_URL']}/wp-json/wp/v2/pages/25",
    json={"content": content},
    auth=(os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])
)
print(f"Rollback {'OK' if resp.status_code == 200 else 'FAILED'}")
```

**Latest known-good backup:** `docs/review/pre-deploy-backup-homepage-20260403-1006.json` (March version)

---

## Content Format

Every page source file follows this structure:

```html
<style>
  /* TT4 overrides: hide theme chrome, force dark bg, remove constraints */
  /* CSS variables, component styles, responsive breakpoints */
  /* ALL CSS MUST BE INLINE — no external stylesheets */
  /* MINIFY CSS to stay under 69K total page size */
</style>
<div id="pacerai-homepage">
  <nav>...</nav>
  <section class="hero">...</section>
  <section class="section">...</section>
  <footer>...</footer>
</div>
<script>/* Mobile nav + counter animation + smooth scroll */</script>
```

Rules:
- No `<html>`, `<head>`, or `<body>` tags — WordPress manages the document shell
- Content is wrapped in `<!-- wp:html -->...<!-- /wp:html -->` during deploy
- Google Fonts loaded by WordPress — no `<link>` tags needed
- All CSS scoped under `#pacerai-homepage`
- `<section>` tags work — use them for major page sections
- NO `id=` attributes except on the outermost wrapper (`id="pacerai-homepage"`)
- Use `data-section="name"` for anchor targets instead of `id=`
- NO HTML comments in deployed content
- All images must use full `https://getpacerai.com/wp-content/uploads/` URLs
