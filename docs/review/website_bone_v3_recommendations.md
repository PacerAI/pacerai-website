# Pacer AI Website — v3 (bone) Recommendations

**Author:** Claude (overnight review for Will)
**Date:** 2026-07-22
**Scope:** getpacerai.com homepage + /resources + all articles + technical SEO/AEO + Yoast/meta + grammar + orphaned-page audit.
**Version reviewed:** v3.0.0 "Claude-bone" (live; homepage WP 25, resources WP 230, team WP 366).

---

## 0. The one goal (read this first)

> Make the site **simple and clear enough that a CRO, CFO, or PE Operating Professional thinks "I want to learn more" and reaches out** — through a CTA button or by contacting Will on LinkedIn.

Everything below is ranked against that single job. The two biggest levers are **(1) one crisp, consistent positioning line ("Revenue Modeling Agent") carried from the hero through the page title, schema, and metadata**, and **(2) a founder-direct path to reach Will** (execs convert on the person, not a BDR form). Most other items are polish or plumbing.

**Top 8 highest-leverage moves** (detail in later sections):

| # | Move | Why it matters | Where |
|---|------|----------------|-------|
| 1 | **Decide the category term and use it everywhere.** Site self-describes 3 ways: hero "Revenue Modeling Agent," Yoast title "Financial Modeling Agent for CROs," H1 "financial models for Forecasting." Pick **one** (recommend "Revenue Modeling Agent") and put it in H1 + `<title>` + meta + OG + schema. | You can't rank for or be cited for a term you don't consistently say. Today the site is invisible for every category term. | §1, §4, §6 |
| 2 | **Add a founder-direct CTA** ("Talk to Will" / short intro) alongside the demo CTA, plus a visible LinkedIn link. | This ICP reaches out to the credible operator, not a form. Highest trust-to-effort asset you have. | §2, §3 |
| 3 | **Resolve duplicate article URLs** (root `/what-is-an-arr-waterfall/` vs `/resources/what-is-an-arr-waterfall/`, and 2 more). Both live, both self-canonical → self-cannibalizing your only rankable topic. | Splitting link equity on the one thing you rank for. | §4, §9 |
| 4 | **Add `FAQPage` schema to the homepage FAQ** (the section is already visible; just tag it) and **`Article`/`BlogPosting` schema to every post**. | Fastest AEO/citation + rich-result win available. | §5 |
| 5 | **Strengthen `Organization` schema** with `founder` (Will), `description`, `contactPoint`, more `sameAs` — to defend against the **brand-name collision** (a fitness "Pacer AI" app owns the same name AND the `@PacerAI` YouTube handle). | Your brand term is contested by 6+ unrelated "Pacer" entities. | §4 |
| 6 | **Add a human-in-the-loop / professional-services line** so buyers know the agent is backed by a PwC-trained operator (de-risks the number). | Turns services into a trust signal, not a "so it's just consulting?" liability. | §3 |
| 7 | **Fix stale Yoast title/meta + missing OG images + `/team/` canonical.** Homepage title still targets "CROs / Financial Modeling Agent" (pre-v3); 3 pages share as bare links. | Metadata predates the v3 rebrand; social shares look broken. | §6 |
| 8 | **Redirect or adopt the legacy orphans** (`/solutions/*`, `/pricing/`, `/platform/overview/`, `/glossary/` all still 200 + in sitemap). | Indexable orphans dilute crawl focus and confuse the IA. | §9 |

---

## DECISIONS LOCKED (2026-07-23) + what shipped

**Will's decisions:**
- **Canonical category term = "GTM Financial Modeling Agent"** (most ownable; CFO-credible; triangulates CRO/CFO/PE). "Revenue Modeling Agent" stays as the plain-English **synonym** (nav + footer); "ARR Modeling Agent" / "Sales Planning Agent" are prose/FAQ synonyms only. Never fragment: one canonical string in every structural slot.
- **"Talk to Will" → strategy-session Calendly** (live).
- **Service-as-a-Software → glossed band + FAQ** (live).

**Shipped to live homepage (WP 25):** founder-direct CTA ("Talk to Will" + "Connect with Will on LinkedIn"); hero kicker now "GTM Financial Modeling Agent"; "How You Work With Pacer AI" Service-as-a-Software band + FAQ entry; hero rotor + pipe-nums moved to the inline injector (now animating, robust to WPCode). Duplicate NRR article deleted. Article HITL copy + bug fixes **staged** in `src/blog/posts/` (not deployed — see below).

### ⚠️ Will's manual actions (can't be done via REST API)

**1. WPCode footer snippet is broken — fix the closing tag.** The live footer `<script>` ends with a stray `<script>` where `</script>` should be → "Unexpected token '<'" kills the whole footer script. Homepage animations were rerouted around it, but sections 1–5 (legacy forms/typed-line on other pages) still need it. **Fix:** in WPCode, change the Footer snippet type to **"JavaScript Snippet"** (auto-wraps) and paste `src/wpcode/footer.js` **with no `<script>` tags** — or ensure the field ends with a real `</script>`.

**2. Yoast title/meta (WP Admin → Yoast, per page) — homepage is stale ("Financial Modeling Agent for CROs" / "AI-native consulting firm"):**
- **Title:** `Pacer AI — GTM Financial Modeling Agent for PE-backed SaaS`
- **Meta description:** `Pacer AI is the GTM Financial Modeling Agent for Sales Leaders and CFOs — build and reconcile your ARR waterfall and revenue model inside Claude, in days.`
- **og:title:** match the title. **/resources/** title: change "Blog" → "Resources".

**3. Organization/Person schema (Yoast Knowledge Graph settings or a WPCode JSON-LD snippet):** add `founder` = Will Sullivan (Person, ex-PwC M&A / West Point), `description`, `alternateName: ["Revenue Modeling Agent","ARR Modeling Agent"]`, `foundingDate`, `contactPoint`. **Fix the `sameAs` LinkedIn mismatch:** schema lists `linkedin.com/company/pacer-ai` but the site uses `linkedin.com/company/getpacerai` — make them match. **Keep** `youtube.com/@PacerAI` (confirmed yours). Add Will's `linkedin.com/in/will-sullivan98`.

**4. Redirects (Redirection plugin / Yoast Premium):** the duplicate-URL and `/solutions/*` + `/pricing/` 301s in §9.

**5. Deploying the staged articles** needs either `--force` (pre-existing voice-debt in the *original* prose blocks `validate.py`) or a separate voice-cleanup pass — your call. The HITL copy + bug fixes I added are clean; the blockers are old words ("leverage", "utilize", "framework", etc.) in the original article bodies.

**6. Paid SEO for "Pacer AI": not recommended now** — the "pacer ai" SERP is Placer.ai's ecosystem (brand *confusion*, not poaching); nobody's bidding against your term. Fix meta + schema (free) to win your own knowledge panel first; reserve paid for retargeting / LinkedIn-to-ICP.

---

## 1. Positioning — the core strategic fix

**Problem:** the site describes itself with three different category nouns depending on where you look:

- **Hero / nav / footer (visible v3 copy):** "**Revenue Modeling Agent** for Sales Leaders."
- **Yoast `<title>` (WP Admin, pre-v3):** "Pacer AI — **Financial Modeling Agent for CROs**."
- **H1 (rendered):** "Pacer AI helps Sales Leaders build **financial models for Forecasting**."
- **`og:title`:** "Pacer AI **the** Financial Modeling Agent for CROs" (yet another variant).

For a human this is survivable; for Google, AI answer engines, and a skimming exec it reads as three different products. Will named the terms he wants to own: **"Revenue Modeling Agent," "Sales Modeling Agent," "GTM Financial Model."**

**Recommendation — commit to one primary + deliberate synonyms:**

- **Primary category term:** **"Revenue Modeling Agent"** (already the visible brand line; it's specific, ownable, and unclaimed by competitors). Use it verbatim in H1, `<title>`, meta description, `og:title`, and schema `name`/`description`.
- **Secondary synonyms** (use naturally in body + articles, don't fragment the brand): "Sales Modeling Agent," "GTM financial model," "ARR waterfall modeling."
- **Audience line:** keep "for Sales Leaders" but make the body explicitly name **CFOs and PE Operating Partners** too — right now the hero speaks only to Sales Leaders while the ICP includes CFO/PE. One sub-line ("…the model your CFO, board, and sponsor sign off on") covers all three without diluting the hero.

This single alignment is the highest-ROI change on the site: it fixes SEO targeting, AEO entity clarity, and exec legibility at once.

---

## 2. Homepage — conversion recommendations (best-practice-driven)

Applying 2026 B2B AI-agent / exec-conversion best practices to the current bone homepage:

1. **Hero: lead with one concrete outcome, ≤8-word H1.** Current H1 ("…build financial models for [rotor]") is close but abstract. Consider a plainer promise the buyer feels: e.g. **"The ARR model your board signs off on — built in days."** Keep the rotor as a sub-line, not the H1's payload. (Winning benchmarks: Chili Piper, Vanta — outcome, not category.)
2. **Keep the demo above the fold — it's your best asset.** The Claude-over-Tahoe iframe is exactly the "show, don't tell" pattern execs need to grasp the product in seconds. Make sure it loads fast and is visible without a big scroll on mobile. Consider a 1-line caption: "Watch the agent build an ARR waterfall inside Claude."
3. **Single-CTA discipline + a sticky CTA.** The page now has one CTA (good — you removed "Talk to a RevOps Expert"). Add a **sticky/persistent CTA** that follows on scroll so the "reach out" action is always one tap away. Avoid re-introducing competing buttons.
4. **Make the primary CTA founder-direct for this persona.** "Free Diagnostic" (Calendly) is fine as the action, but for CRO/CFO/PE the highest-converting framing is **"Talk to Will"** (founder intro) — execs want the ex-PwC operator, not a booking bot. Consider A/B: "Book a Free Diagnostic" vs "Talk to Will (15 min)."
5. **Foreground Will's credibility earlier.** The Team section (ex-PwC M&A, West Point, $25Bn+ diligence) is your strongest trust signal for skeptical finance buyers — currently it sits low. Pull a one-line founder credential into the hero or just under the proof stats ("Built by a PwC-trained M&A operator").
6. **Proof: specific + verifiable beats logo walls.** The "$25Bn+ / $2Bn+ / 50+" stats and the CFO quote are good. Make sure any logos are real customers or clearly labeled "diligence experience," not implied endorsements (finance buyers punish ambiguity). The Adobe × Semrush case study is a great credible artifact — link it prominently.
7. **Present services as a de-risking ladder under the product** (see §3) — not a competing "consulting" pitch.
8. **Add a visible LinkedIn path.** Will's personal LinkedIn (not just the company page) is a legitimate secondary "learn more" route for this ICP — quiet, lower on the page, but present.

---

## 3. Human-in-the-loop / professional-services line

Will's ask: make clear that **Pacer AI customers also get professional service and human assistance** (done-with-you / done-for-you). Best practice: frame it as **de-risking** ("the agent builds the model; a PwC-trained operator stands behind the number"), placed *under* the product story so it reinforces rather than dilutes it.

**Recommended placements + exact wording:**

- **Best single spot — the "Value" section (add a 4th tile or extend "Capacity").** Suggested tile:
  > **Founder-led, not fire-and-forget.** Every engagement is backed by a PwC-trained M&A operator. The agent builds the model; a human who has sat in the diligence seat stands behind the number.
- **Team section (one added line under Will's bio):**
  > Pacer AI pairs the agent with hands-on, founder-led service — we build alongside your team and stay on the number through board and diligence.
- **FAQ (add one Q&A):**
  > **Is Pacer AI just software, or do you help?** Both. The Revenue Modeling Agent does the heavy modeling, and every engagement includes founder-led service — done-with-you or done-for-you — so the model is built, reconciled, and defended by a person, not just generated.
- **Micro-line near the primary CTA:**
  > Founder-led. You'll work directly with Will.

Pick one primary (the Value tile) + the FAQ entry; the others are optional reinforcement.

---

## 4. SEO recommendations

**Current standing (live search checks):**
- Ranks **#1 only for branded long-tail** "Pacer AI revenue modeling" (+ one ARR-snowball post). Strong but narrow.
- **"Pacer AI" (bare brand):** buried ~#6 under unrelated "Pacer" entities — a **fitness/running "Pacer AI" app** (App Store + `@PacerAI` YouTube — same name *and* handle as your schema's `sameAs`), Pacer ETFs, mypacer.com, pacer.co, pacer.legal, Wikipedia. **Brand cannibalization is real.**
- **"Revenue Modeling Agent," "Sales Modeling Agent," "GTM Financial Model":** does **not** rank. The exact phrases appear in no title/meta/H1/schema.

**Recommendations:**

1. **Category term in H1/title/meta/schema** (see §1) — precondition for ranking on "Revenue Modeling Agent."
2. **Brand-disambiguation via schema + entity consistency:** enrich `Organization` (add `founder: Will Sullivan`, `description`, `contactPoint`, `foundingDate`, additional `sameAs` — LinkedIn company + Will's personal + Crunchbase/Apollo). **Verify the `@PacerAI` YouTube in your `sameAs` is actually yours and not the fitness app's** — if it's not yours, remove it immediately (you're currently pointing Google at a competitor's channel as "same as" you).
3. **Kill duplicate URLs (critical):** the same article exists at `/what-is-an-arr-waterfall/` **and** `/resources/what-is-an-arr-waterfall/`, both 200, both self-canonical. Same risk for `/crpo-vs-arr/` and `/semrush-adobe-acquisition-case-study/`. **Pick the `/resources/` version as canonical, 301 the root twin, remove the loser from the sitemap and `llms.txt`.**
4. **Topical-authority cluster in /resources:** build 8–12 interlinked pieces on revenue/ARR modeling for PE-backed SaaS (ARR bridge/waterfall, NRR/GRR, cohort/vintage, QoE, board decks, PE value creation, bookings-vs-revenue). Each spoke links up to a hub page and laterally to siblings with descriptive anchors. This is the engine for both category SEO and AI citations.
5. **Title/meta patterns:** front-load the primary term, ~50–60 char titles, benefit-led ~150–160 char descriptions (e.g. "ARR Waterfall: How to Build One | Pacer AI").
6. **Internal linking from the homepage** into the top 2–3 resource articles (currently the resources hub is a leaf; it should feed and be fed by the money pages).
7. **Legacy `/solutions/*`, `/pricing/`, `/platform/overview/`, `/glossary/`** are 200 + indexed but off-nav → decide keep-and-link or 301 (see §9).

---

## 5. AEO recommendations (get cited by ChatGPT / Claude / Perplexity / AI Overviews)

In 2026 AI-citation weighting favors **FAQ schema quality, answer-first formatting, and statistical density** over backlinks. Concrete moves:

1. **`FAQPage` schema on the homepage FAQ** — the FAQ is already visible; it currently has **no** FAQPage schema. This is the single fastest AEO win. Keep schema text identical to the visible Q&A.
2. **`Article`/`BlogPosting` schema on every `/resources/` post** — with `author` (Will Sullivan, `Person` w/ credentials), `datePublished`, `dateModified`, `headline`, `publisher`. Posts are currently generic `WebPage` — the biggest blocker to article citations.
3. **Answer-first blocks:** under each key H2, a tight **40–80 word direct answer**, then expand. Makes each section independently extractable. Your best FAQ answers (bookings-vs-ARR, "what does a VP RevOps own") already do this — extend the pattern to the homepage sections and article intros.
4. **Definitional + comparison content:** "What is a Revenue Modeling Agent?", "ARR waterfall vs ARR snowball," "Pacer AI vs a BI dashboard vs an FP&A hire." LLMs pull definitions and balanced comparison tables heavily.
5. **Statistical density + sourcing:** you already cite specific numbers ($25Bn+, 50+ waterfalls, the CFO quote) — keep every claim specific and, where possible, sourced.
6. **Freshness:** genuine `dateModified` updates surface in Perplexity in days, Claude/AI Overviews in weeks.
7. **`llms.txt` exists (Yoast auto-generated) but points at the duplicate root URLs and omits most posts — curate it manually** to reference canonical `/resources/` URLs and the full post list. (Note: llms.txt is a low-cost B2A surface, not a traffic lever — the schema does the real AEO work.)
8. **Entity consistency** across site + LinkedIn + directories (name, description, founder) — reinforces the entity graph and helps disambiguate from the other "Pacer AI."

---

## 6. Meta tags / Yoast findings + fixes

Yoast SEO v28.1 is active; `yoast_head` present on all pages. Verbatim current state:

| Page | `<title>` | Meta description | Canonical | OG image |
|------|-----------|------------------|-----------|----------|
| **/** | "Pacer AI — Financial Modeling Agent for CROs" (44) | "Pacer AI automates ARR Waterfall modeling, ARR Snowball board reporting, and M&A grade Quality of Revenue analytics." (115) | ✅ | ✅ 1200×630 |
| **/resources/** | "Blog — Pacer AI \| ARR Intelligence & RevOps Insights" (52) | "Insights on ARR intelligence, revenue operations…" (110) | ✅ | ❌ missing |
| **/team/** | "Company — Pacer AI" (18) | "Learn about Pacer AI — our mission, team…" (116) | ❌ **missing** | ⚠️ 460×460 headshot, not a social card |
| **/team/about/** | "About — Pacer AI" (16) | "…solve the ARR reporting gap…" (147, near limit) | ✅ | ❌ missing |
| **/team/contact/** | "Contact — Pacer AI" (18) | "Get in touch with Pacer AI…" (136) | ✅ | ❌ missing |

**Fixes (all in WP Admin → Yoast per page — meta can't be set via REST API on WordPress.com):**

1. **Homepage title/meta are stale (pre-v3).** Update to the committed positioning: e.g. title **"Pacer AI — The Revenue Modeling Agent for Sales Leaders"** (49) and a meta that leads with "Revenue Modeling Agent." Resolve the **title vs `og:title` vs schema `name`** three-way mismatch → one headline.
2. **`/resources/` title still says "Blog"** — change to "Resources" to match the rename (e.g. "Resources — ARR & Revenue Modeling Insights | Pacer AI").
3. **Add `/team/` canonical** (only main page missing it).
4. **Add proper 1200×630 OG images** to `/resources/`, `/team/about/`, `/team/contact/`, and swap the 460×460 headshot on `/team/` for a real 1.91:1 card. Today these share as bare text links on LinkedIn/Slack — bad for a founder who distributes via LinkedIn.
5. **Twitter cards:** `twitter:card=summary_large_image` is set but there's no `twitter:image/title/description` — it falls back to OG, so fixing OG (above) fixes X too.
6. Titles/descriptions are otherwise well within limits and non-duplicated — good.

---

## 7. Grammar & copy fixes — homepage

Concrete, quote-level (visible copy). Most are minor; the punctuation ones are worth fixing.

| Location | Current | Issue | Suggested |
|----------|---------|-------|-----------|
| CTA tagline (Get Started) | "Model, Plan, Track Pace to Target." | Run-on / missing punctuation | **"Model. Plan. Track. Pace to target."** (or "Model, Plan, Track — Pace to Target.") |
| Buy-In section | "Pacer AI builds a semantic model, with defined calculations — so you get the same answer…" | Unnecessary comma after "model" | "…builds a semantic model with defined calculations — so you get…" |
| Value / Speed tile | "…not a 6–12 month internal build that is stale on arrival." | Compound modifier needs hyphen | "…not a **6–12-month** internal build…" |
| Use Cases heading | "Revenue Models built for Sales Activity, Behaviors and Context" | Number agreement + missing Oxford comma | "…for Sales **Activities, Behaviors, and Context**" |
| Pricing | "Pacer AI uses an alignment-based pricing model to align Pacer AI with its clients' goals." | Repeats "Pacer AI … Pacer AI"; circular ("alignment… to align") | "Pacer AI uses an alignment-based pricing model that ties our success to our clients' goals." *(confirm against foundation voice — pricing copy was deliberately worded)* |
| FAQ — VP RevOps answer | "Across the 30 B2B SaaS job descriptions Pacer AI analyzed in 2026…" | Will previously flagged the "30 job postings" framing as too LinkedIn-y for the site | Soften to "Across dozens of B2B SaaS RevOps job descriptions we analyzed…" or drop the count |
| H1 (raw) | "Sales Leaders`<br>`build…" | `<br>` with no space → raw text reads "Leadersbuild" (screen readers/scrapers). Cosmetic. | Add a space or use CSS line break; ensure raw text has a space |
| Emphasis caps | "Finance teams report **R**evenue. Sales teams generate **R**evenue." | "Revenue" capitalized mid-sentence (intentional emphasis) | Fine if deliberate; flag only for consistency |

*(Article-level grammar is in §8.)*

---

## 8. /resources hub + article-by-article review

**Deploy state (important — corrected 2026-07-23):** the hub index (WP 230) is **live on bone-v3**, but **all 12–13 article pages are still live in the OLD DARK (pre-v3) theme** (verified: every `/resources/<slug>/` returns 200 with `#080E1C`, not `#F5F4EF`). The bone-v3 rewrites (in `src/blog/posts/*-build.html`, now carrying the HITL copy + bug fixes) are **staged and NOT deployed** — so the articles are one theme-generation behind the homepage. Bottleneck to pushing them is **not** unfinished writing; it's threefold: (1) `deploy.py`'s registry maps only **2** build files to WP IDs (491, crpo=865) — the rest live as WP posts whose IDs aren't in the repo, so tooling can't update them until each build file is mapped to its live WP post ID; (2) `validate.py` voice-lint blocks deploy on **pre-existing** banned words in the original prose; (3) they were gated on Will's review. `778`/NRR is the only one not live at all (404).

### 8a. The hub itself (`/resources/`)
- **It's bone, but still branded "Blog."** The WP page title + Yoast title still say **"Blog,"** and the H1 the theme renders is literally "Blog." Rename to **"Resources"** (title, Yoast, and any in-fragment heading) to match the URL and nav.
- **Doesn't tie the hub to the product.** A first-time exec doesn't learn what Pacer *sells* from the hub intro. Add a one-line "what Pacer AI does" (the Revenue Modeling Agent line) + a single primary CTA above the fold.
- **Too many filters for the post count.** ~9 category buttons over ~11 cards; several categories map to 0–1 posts and will feel empty. Collapse to the **4–5 populated** ones.
- **"Coming soon" section reads as unfinished** to a PE buyer on what should be a money page — remove or replace with real content.
- **CTA competition:** "Free Diagnostic" competes with Substack + Login on the hub. Pick one primary.
- **Live `/research/` 404 in the footer** (see §8c) is present on the hub too.

### 8b. Article inventory (14 build files; 2 live, 12 staged)
Two clear tiers of quality:
- **ICP-grade originals (keep, just hygiene):** Semrush×Adobe case study, cRPO, board-quality ARR snowballs, 491 (build-vs-hire), 778 (NRR 101→105), build-vs-need comparison, 441 (why LLMs can't build your snowball). Sharp, diligence-oriented, exactly right for CRO/CFO/PE.
- **Generic 2026-01 batch (rewrite or de-emphasize):** 227, 236, 244, 288, 264 — thin on Pacer's POV and **stuffed with low-authority citations** (CUfinder.io, InfluenceFlow.io, Younium, Averi.ai, etc.). For a PE reader this *lowers* credibility and dilutes link equity.

### 8c. Shared-template issues (fix once, apply to all 14)
- **Breadcrumb label bug:** crumb reads **"Blog"** but links to `/resources/` → rename text to "Resources."
- **Footer `/research/` → HTTP 404** on every article (and the hub). Remove or repoint the footer "Resources" column link.
- **Post-CTA is always "See Your ARR Snowball. Live."** — generic on the M&A/cRPO/RevOps pieces where an ARR snowball isn't the subject. Vary it.
- **No `<title>`/meta in fragments** — expected (Yoast supplies), but **verify Yoast title (<60) + meta (<155) per post**.

### 8d. Positioning gap (highest-leverage content fix)
**Zero of 14 articles mention "Revenue Modeling Agent" or "works in Claude."** Bodies describe Pacer as an *"AI-native consulting firm"* / *"AI-enabled M&A advisors"* delivering via *"Microsoft Fabric… Power BI and Excel."* Meanwhile the shared footer says *"The Revenue Modeling Agent for Sales Leaders."* **The blog is one product-generation behind the homepage.** Standardize the company descriptor and thread the "Revenue Modeling Agent, reconciled to finance, runs in Claude" line into at least the top-of-funnel pieces (ties directly to §1).

### 8e. Grammar / typos (exact quote → fix)
| File | Current | Fix |
|------|---------|-----|
| board-quality | "impacting **CaC** payback" | **CAC** |
| board-quality | "**over 25+** multi-billion-dollar … deals" | "more than 25" **or** "25+", not both |
| semrush | "Establish Sales & Marketing efficiency, FCF follows too." | comma splice → "…efficiency, **and** FCF follows." |
| semrush | "$25**Bn** in Tech M&A" | standardize to **$25B+** (matches 491/comparison) |
| semrush vs board-quality | Weighbridge linked 2 ways (`weighbridge.co` vs `xiliary.com/weighbridge/tdd/`) | pick one |
| articles vs foundation | "**Veach.AI**" (articles) vs "**Veach.Co**" (pricing foundation) | reconcile partner brand name |
| 236 | "12% impact on valuation … **according to OPEXEngine**" but link → `axial.net` | fix attribution/source mismatch |
| 778 vs others | curly quotes in 778, straight elsewhere | normalize (cosmetic) |

### 8f. Broken links & weak CTAs
- **244 — HARD 404 (live-risk):** in-body link → `/2026/01/12/what-is-an-arr-snowball-…/` (old dated permalink) 404s. Fix to `/resources/what-is-an-arr-snowball-understanding-revenue-growth/`.
- **All 14 — `/research/` footer 404** (above).
- **Redirect-chain internal links (301, should point to final slug):** 441, semrush, board-quality, and the waterfall article link to root permalinks that 301 to `/resources/…`. Update to the final `/resources/` slugs.
- **CTA gaps:** board-quality "Get a Sample Board Package →" points to bare homepage (should be Calendly); 264 "Request a demo" → homepage (should be Calendly); **288, 244, 227, 236 have no in-body CTA** at all — add a closing contact line.

### 8g. SEO/schema status (article-level)
- H1 present + unique on all 14 (good). JSON-LD `Article` (+ `FAQPage` on most) is in place; the waterfall article adds `DefinedTerm` + `BreadcrumbList` (excellent — use as the template).
- Only 491 + comparison carry the bolded `aeo-snippet` answer-first lead; others open with a strong answer paragraph but without the class — minor AEO consistency gap. Standardize the answer-first block across all.

### 8h. Human-in-the-loop insertions (exact copy, brand-voice)
The articles over-index on "platform/automation" and under-sell that a **human M&A expert is in the loop** — exactly what a PE buyer pays for. Best spots:
- **491 (Build vs. Hire)** — after "Hire a Specialized Firm":
  > "You're not buying software you have to run. Pacer AI delivers this **done-for-you** — an ex-PwC M&A advisor builds and defends the cube alongside your team, then keeps it current every month. Prefer in-house? Our **done-with-you** retainer gives your analyst that same expert on call."
- **board-quality → "The Third Option: AI-Enabled M&A Advisors":**
  > "The engagement doesn't end at diligence. Pacer AI stays on **done-with-you or done-for-you**, so the M&A-grade view is maintained while you operate — not rebuilt under deal pressure."
- **778 (NRR 101→105) closer:**
  > "Every move here was **done with the client's team**, not handed over as a report — which is why the capability transferred to the acquirer."
- **comparison + 441** — one line each that the agent is **operated by an M&A advisor**, not self-serve.
- **288 / 244 / 227 / 236** — end each with: *"Want an expert to build this with you? Talk to a Pacer AI advisor →"* (Calendly) — also fixes their missing CTA.

---

## 9. Orphaned pages & redirect audit (live HTTP status)

**Requested legacy URLs:**

| URL | Live status | v3 intent | Verdict |
|-----|-------------|-----------|---------|
| `/pricing/` | **200** | 301 → `/#pricing` | ❌ **redirect not shipped** |
| `/blog/` | **301 → /resources/** | 301 → /resources/ | ✅ correct |
| `/solutions/arr-snowball-board-reporting/` | **200** | retire → homepage | ❌ still live + indexed |
| `/solutions/customer-data-cube/` | **200** | 301 → homepage | ❌ still live |
| `/solutions/transaction-readiness/` | **200** | 301 → homepage | ❌ still live |
| `/solutions/revops-transformation-pkg/` | **200** | 301 → homepage | ❌ still live |
| `/solutions/gtm-transformation-pkg/` | **200** | 301 → homepage | ❌ still live |
| `/solutions/fpanda-transformation-pkg/` | **200** | 301 → homepage | ❌ still live |
| `/platform/overview/` | 200 | kept | ✅ (pending bone conversion) |
| `/team/about/`, `/team/contact/` | 200 | kept | ✅ |

⚠️ **The `/pricing/` + 6× `/solutions/*` 301s were never shipped** — those pages are live and indexed. And the **bone-v3 article footers still link all six `/solutions/*` pages**, so retiring them turns dozens of in-article links into homepage bounces. **Decide explicitly:** either (a) ship the planned 301s *and* strip `/solutions/*` from the article nav/footers, or (b) keep the solutions pages and add Service schema (§4). Right now they're **half-retired** — the worst state.

**Duplicate / root-level indexed pages (from Yoast `page-sitemap.xml`):**

| URL | Status | Recommendation |
|-----|--------|----------------|
| `/what-is-an-arr-waterfall/` | 200 | **Duplicate** of `/resources/what-is-an-arr-waterfall/` (also 200, self-canonical) → **301 root → /resources/** |
| `/crpo-vs-arr/` | 200 | Root duplicate/alt of `/resources/what-is-current-performance-obligation/` → 301 → /resources/ |
| `/semrush-adobe-acquisition-case-study/` | 200 (canonical) | Sits at root while its own breadcrumb points to /resources/; `/resources/semrush-…` currently 301s **backwards** to root. **Flip it: 301 root → /resources/** + fix canonical |
| `/resources/arr-snowball-vs-waterfall/` | 200 | Real post (referenced by the waterfall article) but **not among the 14 repo build files** — confirm it has a source of truth |
| `/glossary/`, `/glossary/arr-waterfall/` | 200 | **Keep** — the waterfall article's `DefinedTerm` schema points here |
| `/research/` | **404** | Referenced by **all 14 article footers** + hub — remove the link or create the page |
| NRR 101→105 (`778` / `grow-nrr`) | 404 (not deployed) | Repo has a **byte-identical duplicate** (`778-build.html` == `grow-nrr-101-to-105-build.html`) — **delete one + pick a slug before deploying** |

---

## 10. Prioritized action plan

**P0 — do first (biggest conversion/SEO impact, low effort):**
- Commit to "Revenue Modeling Agent" and align H1 + Yoast title/meta + `og:title` + schema `name` (§1, §6).
- Add `FAQPage` schema to homepage FAQ; add `Article` schema to posts (§5).
- Verify/fix the `@PacerAI` YouTube `sameAs` (remove if not yours) + add `founder`/`description` to Organization schema (§4) — **brand-collision defense.**
- Add the human-in-the-loop Value tile + FAQ entry (§3).
- **Content, before the 12 staged posts ever go live:** delete the duplicate NRR article (§9); fix the 244 hard 404 + `/research/` footer 404 across all 14 files (§8c/§8f); repoint the board-quality/264 CTAs to Calendly (§8f).

**P1 — this week:**
- Founder-direct CTA ("Talk to Will") + sticky CTA + visible LinkedIn (§2).
- Resolve duplicate root vs `/resources/` article URLs (301 the root twins; fix the Semrush backwards redirect) (§4, §9).
- Fix stale `/resources/` "Blog"→"Resources" title, `/team/` canonical, missing OG images (§6, §8a).
- Homepage grammar fixes (§7) + article typos (§8e).
- **Decide `/solutions/*` + `/pricing/`: ship the 301s AND strip them from article footers, or keep + add Service schema** — stop the half-retired state (§9).
- Thread "Revenue Modeling Agent" positioning + standardize company descriptor across top-of-funnel posts (§8d).
- Curate `llms.txt` to canonical URLs (§5).

**P2 — ongoing:**
- Build the /resources topical cluster (8–12 interlinked pieces) with internal linking (§4); rename hub "Blog"→"Resources," collapse filters, drop "Coming soon" (§8a).
- Definitional + comparison AEO content; standardize answer-first blocks across articles (§5, §8g).
- Rewrite or de-emphasize the generic 2026-01 batch (227/236/244/288/264) — low-authority citations hurt PE credibility (§8b).
- Convert remaining inner pages (platform/about/contact) to bone.

---

## Appendix — what's already done (v3.0.0, live & verified 2026-07-22/23)
Homepage bone rebuild live (WP 25) with the Claude-over-Tahoe demo; mobile hamburger menu working (verified by real-browser tap); mobile a2o reflow; single CTA (removed "Talk to a RevOps Expert"); footer-bottom/© strip removed; `/resources` hub live on bone (WP 230); bone team page live (WP 366); `/blog/`→`/resources/` 301 working; PR #20 merged; **v3.0.0 tagged.** This doc covers what's *next*.
