# How to Write and Publish a Blog Post

This guide covers writing a new blog post and deploying it to getpacerai.com/blog/.

---

## Quick Reference

```
Write content → Save to content file → Add to build script → Build → Deploy → Update blog listing → Commit
```

**Time:** ~10 minutes with Claude Code, ~30 minutes manually.

---

## Option A: Ask Claude Code to Do Everything

Just tell Claude what you want. Examples:

```
"Write a blog post about net revenue retention for PE-backed SaaS and publish it"
"Write a post on how Pacer AI handles data unification, category RevOps, and publish it"
"Take this draft [paste text] and publish it as a blog post titled 'X'"
```

Claude will handle all steps below automatically. You'll be asked to approve the WordPress deploy.

---

## Option B: Step-by-Step (Manual or Claude-Assisted)

### Step 1: Write the Content

Write your post as plain HTML (no `<style>`, no `<head>`, just article content). Use standard tags:

```html
<h2>Section Heading</h2>
<p>Paragraph text with <a href="https://example.com">links</a> and <strong>bold</strong>.</p>

<h3>Subsection</h3>
<ul>
  <li>Bullet point</li>
  <li>Another point</li>
</ul>

<table>
  <thead><tr><th>Column 1</th><th>Column 2</th></tr></thead>
  <tbody><tr><td>Data</td><td>Data</td></tr></tbody>
</table>
```

The template handles all styling — just write semantic HTML.

**Or write in WordPress first:** Draft your post in the WordPress editor (Posts → Add New), then use Claude to pull it into the styled system.

### Step 2: Save the Content File

Save your HTML content to:
```
src/blog/posts/content-{WP_POST_ID}.html
```

If writing from scratch (not pulling from WordPress), use any temporary ID and rename later. Example:
```
src/blog/posts/content-new-post.html
```

### Step 3: Add Post Metadata to Build Script

Edit `src/blog/build-posts.py` and add your post to the `POSTS` list:

```python
{
    "id": "new-post",          # Match the content filename (or WP post ID)
    "title": "Your Full Post Title Here",
    "title_short": "Short Title",  # Used in breadcrumb
    "category": "ARR Snowballs",   # or "RevOps", or a new category
    "date": "March 15, 2026",      # Display date
    "date_iso": "2026-03-15",      # For JSON-LD schema
    "faq": [                       # 2-3 Q&A pairs for SEO
        {
            "q": "What is [topic]?",
            "a": "A concise 1-2 sentence answer."
        },
    ],
},
```

**Categories currently in use:** ARR Snowballs, RevOps

### Step 4: Build the Post

```bash
cd /Users/willsullivan/Documents/GitHub/PacerAI/04_GTM/website-PacerAI
python3 src/blog/build-posts.py
```

This generates `src/blog/posts/{id}-build.html` — a complete styled page with nav, footer, dark theme, JSON-LD schema, and mobile responsiveness.

### Step 5: Create the WordPress Page

Blog posts are deployed as **Pages** (not Posts) because WordPress Posts strip `<style>` tags.

```bash
source ~/.zshrc
```

```python
import urllib.request, urllib.error, base64, json, os

wp_user = "willsullivan5e7f50183a"
wp_pass = os.environ["WP_APP_PASSWORD"]
credentials = base64.b64encode(f"{wp_user}:{wp_pass}".encode()).decode()

with open("src/blog/posts/{id}-build.html") as f:
    html = f.read()

content = f"<!-- wp:html -->{html}<!-- /wp:html -->"
data = json.dumps({
    "title": "Your Full Post Title Here",
    "slug": "your-post-slug-with-hyphens",
    "status": "publish",
    "content": content
}).encode()

url = "https://getpacerai.com/wp-json/wp/v2/pages"
req = urllib.request.Request(url, data=data, method="POST")
req.add_header("Authorization", f"Basic {credentials}")
req.add_header("Content-Type", "application/json")

with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read().decode())
    print(f"Created page ID {result['id']} at {result['link']}")
```

**Save the page ID** — you'll need it for the build script and blog listing.

### Step 6: Update Build Script with Real ID

Go back to `build-posts.py` and replace the temporary ID with the WordPress page ID:
```python
"id": 400,  # Replace with actual WP page ID
```

### Step 7: Update the Blog Listing Page

Edit `src/blog/index-build.html` and add a new blog card. Copy an existing card and update:

```html
<a href="/your-post-slug-with-hyphens/" class="blog-card" data-category="arr-snowballs">
  <span class="card-category">ARR Snowballs</span>
  <h2>Your Full Post Title Here</h2>
  <p>A 1-2 sentence description of the post.</p>
  <span class="card-meta">March 15, 2026</span>
</a>
```

**Important:** The `data-category` value must match the filter pills. Current values:
- `arr-snowballs` (pill: "ARR Snowballs")
- `revops` (pill: "RevOps")

If adding a new category, also add a new pill button:
```html
<button class="cat-pill" data-filter="new-category">New Category</button>
```

### Step 8: Deploy the Blog Listing

```python
# Same pattern as Step 5, but updating existing page 230:
with open("src/blog/index-build.html") as f:
    html = f.read()

content = f"<!-- wp:html -->{html}<!-- /wp:html -->"
data = json.dumps({"content": content}).encode()

url = "https://getpacerai.com/wp-json/wp/v2/pages/230"
req = urllib.request.Request(url, data=data, method="POST")
req.add_header("Authorization", f"Basic {credentials}")
req.add_header("Content-Type", "application/json")

with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read().decode())
    print(f"Updated blog listing: {result['link']}")
```

### Step 9: Commit and Push

```bash
git add src/blog/
git commit -m "feat: add blog post — Your Post Title"
git push origin main
```

### Step 10: Post-Deploy (Optional)

- Set Yoast meta description in WP Admin (Pages → find your post → Yoast panel)
- Run SEO audit: ask Claude to `/seo-aeo-audit` on the new post URL
- Log deploy in `docs/document/changelog.md`

---

## Content Guidelines

### Writing for AEO (Answer Engine Optimization)

AI search engines (ChatGPT, Perplexity, Google AI Overviews) extract content differently than traditional search. Structure posts for both:

1. **Lead with a definition** — First paragraph should directly answer "What is [topic]?"
2. **Use H2s as questions** — "Why Does X Matter?" reads better than "The Importance of X" for AI extraction
3. **Include lists and tables** — AI engines love structured, extractable data
4. **Be specific** — Use real numbers, comparisons, and concrete examples over vague claims
5. **Add FAQ pairs** — The build script generates FAQPage JSON-LD schema from the `faq` field

### Brand Voice

- **Audience:** PE operating partners, CFOs, RevOps leaders at $50M–$1B ARR SaaS companies
- **Tone:** Authoritative, data-driven, no fluff. Write like a senior analyst, not a marketer.
- **Avoid:** "Get started free", "game-changer", "revolutionary", emojis, exclamation marks
- **CTA language:** "Request a Demo", "See a Live ARR Demo"

### Categories

| Category | `data-category` value | Topics |
|----------|----------------------|--------|
| ARR Snowballs | `arr-snowballs` | ARR reporting, waterfall models, revenue decomposition, churn analysis |
| RevOps | `revops` | Revenue operations, data unification, GTM alignment, AI for ops |

To add a new category: add a pill to `index-build.html` and use the matching `data-category` value on cards.

---

## Architecture Notes

- Blog posts are WordPress **Pages** (not Posts) — Posts strip `<style>` tags
- Each post is a self-contained HTML file with inline CSS, nav, footer, and mobile JS
- The `post-template.html` provides the wrapper; `content-{id}.html` provides the article body
- JSON-LD schema (Article + FAQPage) is generated by `build-posts.py`
- Category filtering is client-side JavaScript (not WordPress taxonomy)
- Deploy via REST API only — MCP `wp_update_post` strips `<style>` and `<script>` tags

### File Map

```
src/blog/
├── index-build.html          # Blog listing page (WP ID 230)
├── post-template.html        # Shared template for all posts
├── build-posts.py            # Build script: template + content → build files
└── posts/
    ├── content-{id}.html     # Raw article content (input)
    └── {id}-build.html       # Complete styled page (output, deployed to WP)
```
