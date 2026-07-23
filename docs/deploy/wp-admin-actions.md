# WP-Admin Actions (things the REST API can't do) — for Will / the browser extension

Companion to `docs/review/website_bone_v3_recommendations.md` (§4/§6/§9) and the SEO artifact table (title/meta per page). Everything here is done in WP Admin, not via `deploy.py`.

---

## 1. Titles & meta descriptions
See the **SEO Messaging Table** artifact (current → recommended for every page). Edit per page in **WP Admin → page → Yoast → SEO title / Meta description**. North star: **GTM Financial Modeling Agent, built for CROs**; brand suffix `| Pacer AI`; titles ≤60, metas ≤155; drop "RevOps intelligence / ARR Intelligence / AI-native consulting firm / revenue intelligence." Homepage + `/resources/` title already updated 2026-07-23.

---

## 2. Organization / Person schema — use a WPCode JSON-LD snippet

**Recommendation: WPCode snippet, not Yoast's granular fields.** Yoast (free) only exposes Organization *name / logo / social profiles* under **Settings → Site representation** — it can't set `founder`, `foundingDate`, `contactPoint`, or `alternateName`. So:

**Step A (in Yoast, free) — fix the `sameAs` at the source:** Yoast → **Settings → Site representation → Organization → Social profiles**. Set LinkedIn to `https://www.linkedin.com/company/getpacerai` (the live schema currently emits the wrong `/company/pacer-ai`) and YouTube to `https://www.youtube.com/@PacerAI`. This makes Yoast's own Organization node agree with the snippet below.

**Step B — add this WPCode snippet** (WPCode → **+ Add Snippet → HTML Snippet**; Location: **Site Wide Header**; or a JavaScript/PHP snippet if you prefer). It uses the **same `@id`** as Yoast's Organization node (`…/#organization`) so Google *merges* the extra properties into the existing node instead of creating a duplicate:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://getpacerai.com/#organization",
  "name": "Pacer AI",
  "alternateName": ["Revenue Modeling Agent", "ARR Modeling Agent"],
  "url": "https://getpacerai.com/",
  "description": "Pacer AI is the GTM Financial Modeling Agent for CROs and Sales Leaders — it builds and reconciles your ARR waterfall and revenue model inside Claude.",
  "foundingDate": "2023-05",
  "logo": {
    "@type": "ImageObject",
    "url": "https://getpacerai.com/wp-content/uploads/2025/04/PacerAI_Logo_Horizontal_Full-Color-scaled.webp"
  },
  "founder": {
    "@type": "Person",
    "name": "Will Sullivan",
    "jobTitle": "Founder",
    "description": "Former PwC M&A advisor, search-fund operator, and West Point graduate.",
    "url": "https://www.linkedin.com/in/will-sullivan98/",
    "sameAs": ["https://www.linkedin.com/in/will-sullivan98/"]
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "email": "will@getpacerai.com",
    "url": "https://getpacerai.com/team/contact/"
  },
  "sameAs": [
    "https://www.linkedin.com/company/getpacerai",
    "https://www.youtube.com/@PacerAI"
  ]
}
</script>
```

Notes: `contactPoint` uses `will@getpacerai.com` / type `sales` — change if you'd rather list a support alias or add a phone. `foundingDate` is **2023-05** (Pacer AI founded May 2023). Validate after saving at **search.google.com/test/rich-results** (paste the homepage URL) — you should see one Organization with `founder` + `sameAs`, no duplicate-Organization warning.

---

## 3. Redirects (Tools → Redirection plugin, or Yoast Premium → Redirects)

All **301 (permanent)**.

**Duplicate URLs — collapse root dupes into the `/resources/` canonical:**

| From (source) | → To (301) |
|---|---|
| `/what-is-an-arr-waterfall/` | `/resources/what-is-an-arr-waterfall/` |
| `/crpo-vs-arr/` | `/resources/what-is-current-performance-obligation/` |

*(Semrush case study currently lives at root `/semrush-adobe-acquisition-case-study/` and the `/resources/` variant redirects backward to it. Simplest: leave it at root. Only if you want it under `/resources/` for consistency, create that page first, then 301 root → it — otherwise skip.)*

**Legacy pages retired from v3 nav — send to homepage:**

| From (source) | → To (301) |
|---|---|
| `/pricing/` | `/#pricing` |
| `/solutions/arr-snowball-board-reporting/` | `/` |
| `/solutions/customer-data-cube/` | `/` |
| `/solutions/transaction-readiness/` | `/` |
| `/solutions/revops-transformation-pkg/` | `/` |
| `/solutions/gtm-transformation-pkg/` | `/` |
| `/solutions/fpanda-transformation-pkg/` | `/` |

⚠️ Before redirecting `/solutions/*`: the bone-v3 **article footers still link to those six pages**, so after the 301s those in-article links become homepage bounces. Fine short-term; ideally strip the `/solutions/*` links from the article/footer template in a later pass (repo change, then redeploy).

After adding redirects, the dupes drop out of the Yoast sitemap automatically; then also remove them from `llms.txt`.

**Page retirements (2026-07-23) — 301 to homepage anchors / new URL:**

| From (source) | → To (301) |
|---|---|
| `/team/about/` | `/#about` (points at the homepage "Why Pacer AI Exists" section; anchor added) |
| `/platform/overview/` | `/#how-it-works` (homepage "How It Works" section) |
| `/team/contact/` | `/contact/` (contact page moved to top-level; now bone, email → will@getpacerai.com) |

**Keep (do NOT redirect), just add a meta description:** `/glossary/`, `/glossary/arr-waterfall/` (they're the `DefinedTerm` targets), `/resources/arr-snowball-vs-waterfall/`.
