# Plan: SEO, AEO and GEO for getpacerai.com

> **Related:** messaging plan → [`2026-10-05-make-plan-messaging.md`](2026-10-05-make-plan-messaging.md) · Yoast copy →
> [`../deploy/yoast-worklist.md`](../deploy/yoast-worklist.md) · WP Admin snippets →
> [`../deploy/wp-admin-actions.md`](../deploy/wp-admin-actions.md) · goal → [`../../goals/aeo-ranking.md`](../../goals/aeo-ranking.md)

**Owner:** Will (WP Admin + decisions) / agent (repo + REST) · **Set:** 2026-10-05 · **Baseline:** live audit of 14 pages +
legacy URLs on 2026-10-05 (HTML snapshots in the session scratchpad; findings summarised below).

**Terms used here.** **SEO**: ranking in search results. **AEO** (answer-engine optimisation): being the extracted direct
answer (featured snippet, FAQ, AI Overview). **GEO** (generative-engine optimisation): being found, understood and cited
by AI assistants (ChatGPT, Claude, Perplexity), which depends on crawlable text, consistent entity facts and clear
authorship.

## Why
The site was repositioned as the **Daily Pacing Agent** on 2026-10-05. The audit found that the copy changed but the
signals search engines and AI assistants actually read did not keep up:
- **The category term is undefined.** "Daily Pacing Agent" appears five times on the homepage as a label and is never
  defined in body text; the only definition is in meta tags and JSON-LD. A search for it returns no getpacerai.com result.
- **The site identity is stale where it is inherited:** WP Site Title "Get Pacer AI", WebSite schema description
  "End-to-End GTM operations visibility", `llms.txt` still says "GTM Financial Modeling Agent … PE-backed SaaS", and the
  homepage social image reads "Financial Modeling Agent for CROs".
- **Indexing leaks.** `/team/` (the founder page, the main expertise signal) is `noindex`. Any query string bypasses the
  Redirection plugin, so legacy pages and two duplicate posts are reachable and indexable; 11 redirecting URLs sit in
  the sitemap.
- **Answer extraction is uneven.** The homepage has 10 visible FAQs and no FAQPage schema; three posts have FAQ schema
  for questions that are not on the page.
- Smaller items: stale wording ("revenue intelligence", "Book a Free Diagnostic", "synthetic $100M book"), internal
  links that go through 301s (including the primary `/demo-connect` CTA), missing social images on 10 pages, and the demo
  worker's own URL being indexable.

Bot access is not the problem: crawlers that WordPress.com can verify by IP get through (WebSearch quotes the ARR
waterfall post verbatim); the 403s seen from this Mac were WordPress.com rejecting spoofed crawler user-agents.

---

## Part A: repo changes (agent) ✅ LIVE 2026-10-05

All items deployed (pages 25, 230, 366, 375, 983 + 13 posts; demo worker) and re-checked live.

- [x] **A1. Homepage defines the category in crawlable text.** *(2026-10-06: Will replaced the paragraph with "Pacer AI helps companies operate exit-ready using an advanced version of the data model Big 4 accounting firms use in M&A." The Daily Pacing Agent definition now lives in the homepage FAQ and meta.)* A 40–60 word "Pacer AI is the Daily Pacing Agent…" paragraph
      in the "Why Pacer AI Exists" section; "Operational data in. Revenue intelligence out." → "Pace to plan out.";
      "synthetic $100M book" → "synthetic $100M ARR company".
- [x] **A2. Homepage FAQ answers pacing questions, with FAQPage schema.** Add "What is a daily pacing agent?", "What does
      pace to plan mean?", "How does Pacer AI show the gap to plan?"; add FAQPage JSON-LD for every visible Q&A.
- [x] **A3. Team page:** replace "revenue intelligence" wording; add a Person node for Will Sullivan with a stable
      `@id` (`https://getpacerai.com/team/#will-sullivan`), job title, credentials and LinkedIn `sameAs`.
- [x] **A4. Resources hub:** H1 "The Pacer AI Blog" → "Pacer AI Resources"; replace "Revenue intelligence insights…";
      CollectionPage schema name/description match the hub.
- [x] **A5. Contact:** the primary CTA becomes "Schedule a Demo" (calendly.com/pacerai/demo-pacer-ai) with "Try the Demo
      Free" beside it; the diagnostic booking stays as a secondary link.
- [x] **A6. Demo Connect:** "synthetic $100M book" wording; SoftwareApplication JSON-LD (free demo offer).
- [x] **A7. Posts:** stale wording in 264 ("Request a demo"), 288 ("revenue intelligence" ×4), Semrush ("ARR
      intelligence" ×3); mirrored into the `content-*.html` sources so a rebuild can't bring it back.
- [x] **A8. No internal links through redirects:** `/demo-connect` → `/demo-connect/`, `/team/contact/` → `/contact/`,
      `/platform/overview/` → `/#how-it-works` in the nav, footer, post template and every page.
- [x] **Accuracy fix found on the way:** the homepage hero and `/demo-connect` said the demo "runs on a synthetic $100M
      book", but the live connector is pinned to the fictional ~$7–8M startup company; both now say "a synthetic
      company with fictional accounts" (only the homepage video uses $100M dummy data).
- [x] **A9. Demo worker not indexable:** `X-Robots-Tag: noindex` on the production worker's own URL (the homepage iframe
      is unaffected).
- [x] Validate (`validate.py --strict` for pages, `--force` for posts), deploy, and re-audit the changed pages live.

## Part B: WP Admin and settings (Will; step-by-step browser prompt in the hand-off)

**Status 2026-10-06 (verified live):** B1 ✅ `/team/` indexable + in sitemap · B2 ✅ query strings now 301 · B3 ✅ sitemap
21 URLs, no legacy · B4 ✅ `og:site_name` / WebSite schema "Pacer AI · The Daily Pacing Agent for Sales Leaders" · B5 ✅
`llms.txt` rewritten (20 links, no stale terms) · B7 ✅ legalName + `/contact/` · B6 ⏳ image uploaded (media 1062,
featured image on 17 pages) but Yoast ignores featured images here: set it as the Yoast Site image + homepage Social
image · B6b ⏳ hidden footer navigation (9 `href="#"`) and the hidden post-title H1 still in the HTML · B9 ⏳ reindex.

| # | Change | Where | Why |
|---|---|---|---|
| B1 | `/team/` → indexable | Pages → Team (366) → Yoast → Advanced → "Allow search engines…" = Yes | Founder/expertise page is hidden from search |
| B2 | Query strings no longer bypass redirects | Tools → Redirection → Options → URL defaults → Query parameters = "Ignore & pass parameters to the target"; re-save existing rules if they keep their own setting | `/solutions/…?utm_source=x` serves the old page |
| B3 | Unpublish legacy pages (→ Draft) | Pages 111, 362, 364, 371, 372, 373, 374, 554, 650, 651, 652, 873, 880 (redirects keep the URLs working) | Duplicates + 301s in the sitemap |
| B4 | Site identity | Settings → General: Site Title "Pacer AI", Tagline "The Daily Pacing Agent for Sales Leaders"; Yoast → Settings → Site basics: Website name "Pacer AI", alternate "Daily Pacing Agent" | WebSite schema, `og:site_name`, `llms.txt` all inherit "Get Pacer AI / End-to-End GTM operations visibility" |
| B5 | `llms.txt` | Yoast → Settings → Site features → llms.txt → manual page selection: home, demo-connect, team, contact, resources, all posts; save | Lists 5 pages with the old positioning |
| B6 | Social image | Yoast → Settings → Site basics → Site image, and Home → Yoast → Social → image: the new `img/og/pacer-ai-daily-pacing-agent-og.png` (agent uploads it on Will's go) | Homepage artwork says "Financial Modeling Agent"; 10 pages have no og:image |
| B7 | Hidden theme markup | Appearance → Editor → Template Parts: Header/Footer — remove Navigation, Page List and default footer blocks; Templates → Pages/Single — remove Post Title | Crawlers read 27 hidden legacy links, `href="#"` placeholders and a duplicate H1 before the real content |
| B8 | WPCode Organization snippet | `contactPoint.url` → `/contact/`; add `"legalName": "Predictive Analytics Partners LLC"`; logo URL = Yoast's | Points at a 301; entity facts incomplete |
| B9 | Reindex | Google Search Console + Bing Webmaster: URL Inspection → Request indexing on `/`, `/demo-connect/`, `/team/`, `/resources/` | Index still shows the old homepage title and `/blog/` URLs |

## Part C: follow-ups (next pass)

- **Homepage size:** after A1/A2 the homepage is 66,045 chars, 955 under `validate.py`'s 67,000 limit (WordPress's hard
  limit is 68K). The next homepage addition needs room: externalise the inline CSS or trim.
- `src/blog/post-template.html` is a pre-v3 dark template (`/blog/` nav, old footer) and is not deployed; retire it or
  rebuild it from a `*-build.html` post before the next new post.

- ✅ **Post bylines (Will, 2026-10-06): Will Sullivan on all 13 posts**, linked to `/team/`, Article author =
  Person `@id https://getpacerai.com/team/#will-sullivan`. Superseded note follows.
- ~~**Decision for Will: post bylines.**~~ Five posts show "Pacer AI" as the byline and use an Organization author in
  schema; two show "Will Sullivan". AI assistants weigh a named expert author. Attributing posts to Will publishes under
  his name, so this is his call: (a) Will Sullivan on all, linked to `/team/#will-sullivan`, or (b) keep "Pacer AI".
- Schema hygiene in posts: remove the hand-coded BreadcrumbList where Yoast already emits one; give `mainEntityOfPage`
  an `@id`; align Article `datePublished` with the visible date (needs the true publish dates).
- Posts whose FAQ schema has no visible FAQ (NRR, Board-quality, Semrush): add the visible FAQ section.
- Rebuild the three pages that aren't in the repo (WP 851 ARR snowball vs waterfall, 853 `/glossary/`, 855
  `/glossary/arr-waterfall/`) in the bone design; give `/glossary/` real term links + DefinedTermSet; standardise the
  ARR Snowball definition (three versions exist today).
- Social images per post; re-host the snowball post's og:image (currently on a third-party bucket).
- `/demo-connect/` iframes the **staging** worker for its reel; move it to production.

## Measures
- `"Daily Pacing Agent"` query returns getpacerai.com (Google + Claude/ChatGPT/Perplexity search) — currently no.
- `/team/` indexed; no `/solutions/`, `/blog/`, `/crpo-vs-arr/`, `/what-is-an-arr-waterfall/` in the index (GSC Pages report).
- Homepage FAQ eligible as rich result (Rich Results Test); og:image present on every indexed page.
- The email-capture measures in [`../../goals/email-capture.md`](../../goals/email-capture.md) (captures/week by source).

## Verification
Re-run the live audit checks per change: page HTML for the definition paragraph and FAQ JSON-LD (parse it), the
removed wording, `curl -I` for the worker's `X-Robots-Tag`, link targets return 200 (no 301 hops), and after Part B:
`/team/` robots meta, `?utm_source=x` on a legacy URL returns 301, `og:site_name`, `llms.txt` content.

## Part B follow-up: browser prompt (2026-10-07)

Calendar reminder: Wed 2026-10-07 08:30 MT. Log in to Google Search Console, Bing Webmaster Tools and
getpacerai.com/wp-admin in the browser Claude drives, then paste:

````
You're finishing SEO work for getpacerai.com. I'm logged in to Google Search Console, Bing Webmaster Tools and
WordPress Admin. Change only what's listed; never edit page content. If a screen differs from what I describe, or a
property/site isn't found, stop and tell me. Do the parts in order.

PART 1 — Google Search Console (https://search.google.com/search-console)
1. Select the getpacerai.com property (Domain or https://getpacerai.com/ URL-prefix, whichever exists).
2. For each URL, paste it into the "Inspect any URL" bar at the top, wait for the result, click "Request indexing",
   wait for "Indexing requested", then move on:
   https://getpacerai.com/
   https://getpacerai.com/demo-connect/
   https://getpacerai.com/team/
   https://getpacerai.com/resources/
3. Left menu → Sitemaps → add/resubmit: sitemap_index.xml → Submit. Report the status shown.

PART 2 — Bing Webmaster Tools (https://www.bing.com/webmasters)
1. Select the getpacerai.com site.
2. URL Inspection → inspect each of the same 4 URLs → "Request indexing" (or use "URL Submission" with all 4).
3. Sitemaps → submit https://getpacerai.com/sitemap_index.xml (or "Resubmit" if it's listed). Report the status.

PART 3 — WordPress Admin (https://getpacerai.com/wp-admin)
1. Yoast SEO → Settings → Site basics → "Site image": choose the media item "pacer-ai-daily-pacing-agent-og"
   (Pacer AI — Daily Pacing Agent social image). Save.
2. Pages → Home → Edit → Yoast SEO → Social → replace the Facebook/X image (currently "pacer-ai-og-cro-modeling")
   with "pacer-ai-daily-pacing-agent-og". Update. Don't touch the page content.
3. Appearance → Editor → Patterns → Template Parts → Footer: delete the Navigation block whose links are
   Team / History / Careers / Privacy Policy / Terms and Conditions / Contact Us / Facebook / Instagram / Twitter
   (they all point to "#"). Save.
4. Appearance → Editor → Templates → "Pages": delete the "Title" (Post Title) block. Save. Repeat for "Single Posts"
   if it has one.

Finish with a list: each step → "done" / "unchanged" / "problem: …", including any Search Console/Bing status text.
````
