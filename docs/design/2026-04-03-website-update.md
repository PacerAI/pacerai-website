# Deploy Updated Homepage to getpacerai.com

## Context
Replace the live WordPress homepage with the long-page v2 design. Establish proper version control first, then add missing content sections (Comparisons, DIY Challenges), update nav/footer, upload images, and deploy via WordPress REST API.

---

## Step 1: Version Control — Archive Design Versions

Move working versions to `docs/design/` so `src/` only contains the production file.

| Current Location | Archive To | Description |
|---|---|---|
| GitHub `main` branch `src/homepage/index-build.html` | `docs/design/index-build-2026-march.html` | The March version currently live on WordPress — pull from GitHub to get the clean version |
| Local `src/homepage/index-build.html` (modified) | `docs/design/index-build_long_page_2026-march-GPTs-strategy.html` | The accidental updates you made and still like |
| Local `src/homepage/index-build-v2.html` | `docs/design/index-build-long_page_2026_04_03.html` | Today's long-page redesign |

**Then:** Copy `index-build-v2.html` → `src/homepage/index-build.html` as the new production file. This is what gets deployed to WordPress (page ID 25).

```bash
# 1. Get the clean March version from GitHub
git show main:src/homepage/index-build.html > docs/design/index-build-2026-march.html

# 2. Archive the locally modified version
cp src/homepage/index-build.html docs/design/index-build_long_page_2026-march-GPTs-strategy.html

# 3. Archive v2
cp src/homepage/index-build-v2.html docs/design/index-build-long_page_2026_04_03.html

# 4. Make v2 the new production file
cp src/homepage/index-build-v2.html src/homepage/index-build.html
```

---

## Step 2: Backup Current WordPress Homepage

Before deploying, fetch and save the live WordPress content.

```python
import requests, os, json
from datetime import datetime

base_url = os.environ['WP_BASE_URL']
auth = (os.environ['WP_USER'], os.environ['WP_APP_PASSWORD'])

resp = requests.get(f"{base_url}/wp-json/wp/v2/pages/25?context=edit", auth=auth)
with open(f"docs/review/pre-deploy-backup-homepage-{datetime.now().strftime('%Y%m%d-%H%M')}.json", 'w') as f:
    json.dump(resp.json(), f, indent=2)
```

---

## Step 3: Add Content Sections to Production File

### 3a. Add "Comparisons" section
Copy the comparison section from `docs/design/index-build-2026-march.html` (the "What most companies build vs what boards actually need" two-column section + CFO pull quote). Place it after the Whitespace section and before "What is Pacer AI".

### 3b. Add "DIY Challenges" section
Copy the "What to expect if you try a DIY approach" section (6-card grid: Time, Team Size, Output, Non-Operational, Deep Expertise, New Lens) from the same March file. Place it after the Comparisons section.

### 3c. Write AEO Blog Post
Create a new blog post: **"Should I Build a Customer Data Cube In-House or Hire Someone?"**
- AEO-optimized (structured for answer engines)
- Source content from the DIY Challenges section + positioning doc's DIY wedge
- File: `src/blog/posts/diy-vs-hire-customer-data-cube.html`
- Deploy as a new WordPress blog post

---

## Step 4: Update Nav

**Current v2 nav:** Overview | Use Cases | Solutions | About

**Target nav:** Overview (dropdown: #Use Cases, #About, #Solutions) | Solutions (keep live WP pages as-is) | Resources (Blog + Comparisons) | Team (replaces About/Company)

Remove Use Cases and About as standalone nav items. Overview dropdown provides in-page anchors. Keep the existing live WordPress Solutions and Resources pages.

```html
<ul class="nav-links">
  <!-- Overview — in-page anchors -->
  <li>
    <a href="#overview">Overview <span class="chevron">&#9662;</span></a>
    <ul class="nav-dropdown">
      <li><a href="#investor-questions">Use Cases</a></li>
      <li><a href="#what-is-pacer-ai">About</a></li>
      <li><a href="#solutions">Solutions</a></li>
    </ul>
  </li>
  <!-- Solutions — existing WP pages -->
  <li>
    <a href="#solutions">Solutions <span class="chevron">&#9662;</span></a>
    <ul class="nav-dropdown">
      <li><a href="/solutions/customer-data-cube/">Customer Data Cube</a></li>
      <li><a href="/solutions/arr-snowball-board-reporting/">ARR Snowball Reporting</a></li>
      <li><a href="#transactionready">Transaction Readiness</a></li>
      <li><a href="#solutions">RevOps Transformation</a></li>
      <li><a href="#solutions">GTM Transformation</a></li>
      <li><a href="#solutions">FP&amp;A Transformation</a></li>
    </ul>
  </li>
  <!-- Resources -->
  <li>
    <a href="/blog/">Resources <span class="chevron">&#9662;</span></a>
    <ul class="nav-dropdown">
      <li><a href="/blog/">Blog</a></li>
      <li><a href="#comparison">Comparisons</a></li>
    </ul>
  </li>
  <!-- Team (replaces About/Company) -->
  <li>
    <a href="/team/">Team <span class="chevron">&#9662;</span></a>
    <ul class="nav-dropdown">
      <li><a href="#what-is-pacer-ai">Purpose &amp; Mission</a></li>
      <li><a href="/team/">Team</a></li>
      <li><a href="#transactionready">Partners</a></li>
      <li><a href="/team/">Agent Team</a></li>
    </ul>
  </li>
</ul>
```

### Rename company folder to team
```bash
mv src/company src/team
```
Update CLAUDE.md page registry accordingly. The WordPress pages (About ID 374, Contact ID 375) stay live — just update the nav links.

---

## Step 5: Update Footer

**Target columns:** Use Cases | Solutions | Team | Connect

- **Use Cases:** 6 questions matching the section headers
- **Solutions:** All 6 solution cards
- **Team:** Purpose & Mission, Team, Partners, Agent Team, Contact
- **Connect:** LinkedIn, Schedule a Call, Log In (keep as-is)

---

## Step 6: Upload Images to WordPress

Upload all local `img/` files to WordPress media library via REST API, then replace local paths with WordPress URLs in the production HTML.

**Images:** arr-waterfall-cross-sell-growth.png, market-analysis-expansion-drivers.png, cohort-market-acct-size.png, gross-retention-vintage.png, net-retention-vintage.png, expansion-whitespace-by-market.png, arr-waterfall-cross-sell.png

---

## Step 7: Deploy

1. Deploy homepage (page ID 25) via WordPress REST API
2. Update nav/footer in all other page files (blog, platform, solutions, company)
3. Deploy all updated pages
4. Deploy new blog post

---

## Step 8: Verify

1. All pages return HTTP 200
2. Visual check of homepage — images render, nav works, sections in order
3. Blog post accessible
4. Log to `docs/document/changelog.md`

---

## Decisions (Confirmed)
- **Nav structure:** Overview (anchors) | Solutions (WP pages) | Resources (Blog + Comparisons) | Team (replaces About + Partners)
- **Team page:** Will contain Purpose, Mission, Team, Partners, Agent Team
- **Rename:** `src/company` → `src/team`
- **Solutions pages:** Keep live WordPress pages as-is (don't touch)
- **Comparisons section:** Carry from v1 into production
- **DIY Challenges section:** Carry from v1 into production
- **Blog post:** AEO-optimized "Should I Build a Customer Data Cube In-House or Hire Someone?"
- **Deploy method:** WordPress REST API (Python requests)
