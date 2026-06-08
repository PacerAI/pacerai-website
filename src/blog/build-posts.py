#!/usr/bin/env python3
"""
Generate styled blog post build files from template + WordPress content.
Strips Gutenberg block comments, wraps in styled template.
"""
import json
import re
import html
import os
import urllib.request
import urllib.error
import base64

REPO = "/Users/willsullivan/Documents/pacerai/pacerai-website"
TEMPLATE_PATH = f"{REPO}/src/blog/post-template.html"
OUTPUT_DIR = f"{REPO}/src/blog/posts"

# Blog post metadata
POSTS = [
    {
        # Locally-authored (content-semrush-adobe-case-study.html) → keeps slug id.
        # Live WP page id: 888 · slug: semrush-adobe-acquisition-case-study · listing page 230
        "id": "semrush-adobe-case-study",
        "title": "How Semrush Got Acquired by Adobe for a Premium Despite Declining Growth",
        "title_short": "Semrush × Adobe",
        "category": "M&A Case Study",
        "date": "June 2, 2026",
        "date_iso": "2026-06-02",
        "faq": [
            {
                "q": "Why did Adobe acquire Semrush?",
                "a": "Adobe acquired Semrush for $1.9B to add a multi-product sales-execution engine spanning the digital ranking value chain — 55+ products across 7 hubs on one platform, including traditional SEO and AI-visibility tooling. Semrush had transformed from a self-serve product-led-growth model into a multi-threaded RevOps engine that doubled ARR per customer, which is what attracted Adobe despite Semrush's decelerating growth rate."
            },
            {
                "q": "How much did Adobe pay for Semrush and was it a premium?",
                "a": "Adobe paid $12.00 per share, or about $1.9B — a 77% premium to Semrush's November 18 close of $6.76. At ~3.8x NTM revenue, the price was roughly 52% above the selected public-company comp median of 2.5x, and above the top of Centerview's revenue and EBITDA comp ranges in 2 of 3 fairness-opinion methodologies."
            },
            {
                "q": "How did Semrush get acquired at a premium despite declining growth?",
                "a": "By transforming its operating model: structuring pricing and packaging for expansion, building a cross-sell and up-sell motion that grows ARR per customer by cohort, and letting gross margin and free cash flow follow. ARR per customer rose from $2,123 (FY2020) to $4,369 (FY2025), gross margin expanded 700bps, S&M fell 12 points as a share of revenue, and FCF recovered from $5M to $58M."
            },
        ],
    },
    {
        "id": "what-is-an-arr-waterfall",
        "title": "What Is an ARR Waterfall? Definition, Components, and How to Build One",
        "title_short": "What Is ARR Waterfall",
        "category": "ARR Snowballs",
        "date": "May 29, 2026",
        "date_iso": "2026-05-29",
        "faq": [
            {
                "q": "What is an ARR Waterfall in simple terms?",
                "a": "An ARR Waterfall is a chart that shows how your annual recurring revenue changed during a period by separating the additions (new customers, expansion) from the subtractions (downgrades, churn) so you can see exactly what drove the net change. It is also called an ARR bridge or ARR rollforward."
            },
            {
                "q": "What is the difference between an ARR Waterfall and an ARR Snowball?",
                "a": "An ARR Waterfall decomposes a single period's ARR change into its components (new, expansion, contraction, churn). An ARR Snowball compounds multiple periods' ending ARR forward to show trajectory over time. The Waterfall answers what happened this quarter; the Snowball answers where the business is heading."
            },
            {
                "q": "Is an ARR Waterfall the same as an ARR Bridge?",
                "a": "Yes. ARR Waterfall, ARR Bridge, ARR Rollforward, recurring revenue rollforward, and ARR walk all refer to the same single-period reconciliation of beginning ARR to ending ARR through component-level movements. The math is identical; the term varies by audience — SaaS finance teams say Waterfall, PE diligence teams say Bridge, auditors say Rollforward."
            },
            {
                "q": "What components make up an ARR Waterfall?",
                "a": "A standards-grade ARR Waterfall has six components: Beginning ARR, New ARR (from new logos), Expansion ARR (from existing customers), Reactivation ARR (from returning churned customers), Contraction ARR (downgrades), and Churned ARR (cancellations), summing to Ending ARR. Some companies aggregate Reactivation into New ARR, leaving five."
            },
            {
                "q": "How do you calculate Net Revenue Retention from the ARR Waterfall?",
                "a": "NRR equals (Beginning ARR plus Expansion ARR minus Contraction ARR minus Churned ARR) divided by Beginning ARR. New ARR is excluded because NRR measures the existing customer base only. Best-in-class public SaaS companies report NRR above 120%; PE benchmarks for mid-market SaaS typically target 105-115%."
            },
            {
                "q": "What software builds an ARR Waterfall automatically?",
                "a": "Spreadsheet templates work for sub-$10M ARR companies. Above that, dedicated platforms generate the Waterfall directly from billing and CRM data. Pacer AI's Customer Data Cube on Microsoft Fabric is purpose-built for PE-backed SaaS, automating Waterfall, Snowball, and NRR reporting from a single source of truth."
            },
            {
                "q": "How often should you update the ARR Waterfall?",
                "a": "Monthly for operating reviews, RevOps cadence, and FP&A variance analysis; quarterly for board decks, investor reporting, and PE Operating Partner reviews; and annually for the audit footnote, LP report, and budget reconciliation."
            },
        ],
    },
    {
        "id": "crpo",
        "title": "What is cRPO? The Operator's Guide to Current Remaining Performance Obligations",
        "title_short": "cRPO vs ARR",
        "category": "Diligence",
        "date": "May 28, 2026",
        "date_iso": "2026-05-28",
        "faq": [
            {
                "q": "What is cRPO?",
                "a": "cRPO (current Remaining Performance Obligations) is the 12-month forward-bookings figure on every public SaaS company's balance sheet. It is the dollar value of contracted revenue that will be recognized as revenue over the next 12 months. Required disclosure under FASB ASC 606 since 2018."
            },
            {
                "q": "How is cRPO different from ARR?",
                "a": "cRPO comes from the balance sheet — audited, GAAP, and required by ASC 606 — and covers exactly the next 12 months of contracted revenue. ARR is management-disclosed (non-GAAP), is an annualized run-rate at a point in time, and its definition varies by company. cRPO is what the auditor signed off on; ARR is what management told you."
            },
            {
                "q": "Why does cRPO matter for SaaS diligence?",
                "a": "cRPO is the leading indicator the trailing P&L cannot show. If cRPO grows faster than reported revenue, the forward book is compounding faster than recognition — bullish. If cRPO decelerates below revenue growth, the book is shrinking relative to recognition — bearish. It also survives auditor scrutiny in a way that management-defined ARR does not."
            },
            {
                "q": "What is the cRPO-RPO spread?",
                "a": "The cRPO-RPO spread is the gap between 12-month cRPO growth and total RPO growth. A widening spread (cRPO growing faster than total RPO) means contract durations are shortening — customers are signing 2-year deals where they used to sign 3-year. Workday's Q1 FY27 print showed a 460 bp spread, which CFO Zane Rowe confirmed reflected shorter renewal durations."
            },
        ],
    },
    {
        "id": "board-quality-arr-snowballs",
        "title": "Board Quality ARR Snowballs: Understand Your ARR Growth Drivers Before Your Acquirers Do",
        "title_short": "Board Quality ARR Snowballs",
        "category": "ARR Snowballs",
        "date": "April 17, 2026",
        "date_iso": "2026-04-17",
        "faq": [
            {
                "q": "What is a board-quality ARR Snowball?",
                "a": "A board-quality ARR Snowball is an M&A-grade multi-period ARR waterfall analysis that shows revenue movements (churn, product churn, downsell, upsell, cross-sell, new, lapsed, returning) at the account-product level, with % of beginning analysis, vintage and cohort cuts, and full reconciliation to financial statements."
            },
            {
                "q": "Why can't FP&A software produce M&A-grade ARR analysis?",
                "a": "FP&A and RevOps tools are built for scale with a one-size-fits-all approach. They produce basic ARR tables that prioritize presentation over perspective. M&A-grade analysis requires account-product granularity, driver decomposition, and vintage analysis that these tools cannot provide."
            },
            {
                "q": "What questions should boards and CFOs be able to answer about ARR?",
                "a": "Four key questions: (1) Can you explain the drivers of ARR growth and how you have accelerated them? (2) Which cohorts drive NRR and why? (3) How have you improved upsell and cross-sell rates? (4) What drives churn and what is your strategy to mitigate it? Plus a bonus: How much whitespace is there to sell into?"
            },
        ],
    },
    {
        "id": 778,
        "title": "How I Helped a Client Grow NRR from 101% to 105% in 6 Months",
        "title_short": "NRR Case Study",
        "category": "ARR Snowballs",
        "date": "April 17, 2026",
        "date_iso": "2026-04-17",
        "faq": [
            {
                "q": "How can PE-backed SaaS companies improve NRR before a transaction?",
                "a": "Decompose NRR into upsell, cross-sell, churn, product churn, and downsell. Identify which levers drive each movement, then implement targeted operational changes — pricing adjustments, product sunsetting, and data story alignment."
            },
            {
                "q": "What is the relationship between product churn and logo churn?",
                "a": "Customers who drop a product (product churn) often churn entirely within 12 months. Addressing product churn early — by sunsetting underperforming add-ons — can prevent downstream logo churn."
            },
            {
                "q": "How does NRR impact SaaS valuation multiples?",
                "a": "Companies with NRR above 105% are valued in a different category of comparable companies. Even a 4-point NRR improvement can meaningfully increase the valuation multiple at exit."
            },
        ],
    },
    {
        "id": 491,
        "title": "Should I Build a Customer Data Cube In-House or Hire Someone?",
        "title_short": "Build vs. Hire",
        "category": "ARR Snowballs",
        "date": "April 3, 2026",
        "date_iso": "2026-04-03",
        "faq": [
            {
                "q": "Should I build a customer data cube in-house or hire someone?",
                "a": "Most PE-backed SaaS companies that attempt a DIY customer data cube spend 6+ months, require 5-6 specialized team members, and still end up with output that is not board-ready or diligence-defensible. Hiring a specialized firm delivers M&A-grade output in weeks at a fraction of the cost."
            },
            {
                "q": "How long does it take to build a customer data cube?",
                "a": "Building a customer data cube in-house typically takes 6-12 months of cross-system data unification, classification logic development, and reporting buildout. A specialized firm like Pacer AI can deliver a complete, board-ready data cube in weeks."
            },
        ],
    },
    {
        "id": 441,
        "title": "Why LLMs Can't Build Your ARR Snowball from Operational Data",
        "title_short": "LLM Limitations",
        "category": "ARR Snowballs",
        "date": "March 10, 2026",
        "date_iso": "2026-03-10",
        "faq": [
            {
                "q": "Can LLMs build ARR snowball reports from CRM or billing data?",
                "a": "No. LLMs predict text rather than perform rule-based calculations. ARR snowball construction requires consistent period-over-period classification of every customer's revenue movements, cross-system customer matching, and three-way reconciliation — capabilities that require purpose-built data pipelines, not language models."
            },
            {
                "q": "What is the difference between bookings, billings, and revenue for ARR analysis?",
                "a": "Bookings (from CRMs like Salesforce) capture deal values at close. Billings (from Stripe or Zuora) capture invoice amounts as subscriptions are charged. Revenue (from ERPs like NetSuite) captures recognized revenue under ASC 606. Each provides a different view of the same customer relationship, and none alone is sufficient for accurate ARR snowball construction."
            },
        ],
    },
    {
        "id": 288,
        "title": "Why ARR Waterfall Models Matter for SaaS Growth",
        "title_short": "ARR Waterfall Models",
        "category": "ARR Snowballs",
        "date": "January 27, 2026",
        "date_iso": "2026-01-27",
        "faq": [
            {
                "q": "What is an ARR waterfall model?",
                "a": "An ARR waterfall model systematically breaks down period-over-period ARR changes into components: Starting ARR, New ARR, Expansion ARR, Contraction ARR, and Churned ARR, revealing the drivers behind revenue growth or decline."
            },
            {
                "q": "Why do ARR waterfall models matter for SaaS growth?",
                "a": "ARR waterfall models matter because they expose the specific revenue dynamics behind aggregate growth numbers, helping PE-backed SaaS operators identify whether growth comes from new sales, expansion, or is being offset by churn and contraction."
            },
        ],
    },
    {
        "id": 264,
        "title": "Using AI to Enable RevOps (Without Breaking Your GTM)",
        "title_short": "AI for RevOps",
        "category": "RevOps",
        "date": "January 20, 2026",
        "date_iso": "2026-01-20",
        "faq": [
            {
                "q": "How can AI improve revenue operations?",
                "a": "AI improves RevOps by automating data unification across CRM, billing, and product usage systems, enabling real-time ARR analysis, anomaly detection, and predictive churn modeling without replacing existing GTM workflows."
            },
            {
                "q": "What are the risks of using AI in RevOps?",
                "a": "The main risks include over-automating before data foundations are solid, breaking existing GTM workflows by forcing new processes, and relying on AI outputs without validating against source-of-truth financial data."
            },
        ],
    },
    {
        "id": 244,
        "title": "ARR Snowball Analysis: Find Your Expansion Drivers",
        "title_short": "Expansion Drivers",
        "category": "ARR Snowballs",
        "date": "January 12, 2026",
        "date_iso": "2026-01-12",
        "faq": [
            {
                "q": "What is ARR snowball analysis?",
                "a": "ARR snowball analysis tracks how Annual Recurring Revenue compounds over time by breaking it into components — new business, expansion, contraction, and churn — to identify which growth levers are strongest and where revenue leakage occurs."
            },
            {
                "q": "How do you find expansion revenue drivers?",
                "a": "Identify expansion drivers by analyzing upsell and cross-sell patterns across customer segments, tracking net revenue retention by cohort, and isolating which product features or usage thresholds correlate with account growth."
            },
        ],
    },
    {
        "id": 236,
        "title": "Prevent Churn in High-Value Accounts with ARR Snowball",
        "title_short": "Churn Prevention",
        "category": "ARR Snowballs",
        "date": "January 12, 2026",
        "date_iso": "2026-01-12",
        "faq": [
            {
                "q": "How do you prevent churn in high-value SaaS accounts?",
                "a": "Prevent churn by monitoring leading indicators like product usage decline, support ticket spikes, and contract renewal timelines. ARR snowball analysis surfaces at-risk accounts before renewal dates, enabling proactive intervention."
            },
            {
                "q": "What is the impact of churn on ARR growth?",
                "a": "Churn directly erodes the ARR base. Even small increases in churn rate can negate new business and expansion revenue, making net revenue retention fall below 100% and compounding revenue loss over time."
            },
        ],
    },
    {
        "id": 227,
        "title": "What Is an ARR Snowball? Understanding Revenue Growth",
        "title_short": "What Is ARR Snowball",
        "category": "ARR Snowballs",
        "date": "January 12, 2026",
        "date_iso": "2026-01-12",
        "faq": [
            {
                "q": "What is an ARR snowball?",
                "a": "An ARR snowball is a framework for tracking how Annual Recurring Revenue grows or shrinks over time by decomposing changes into new business, expansion, contraction, and churn — showing whether revenue momentum is accelerating or decelerating."
            },
            {
                "q": "How is ARR snowball different from a standard ARR report?",
                "a": "A standard ARR report shows a point-in-time snapshot. The ARR snowball shows the flow — how each component (new, expansion, contraction, churn) contributes to period-over-period ARR change, revealing the dynamics behind the number."
            },
        ],
    },
]


def strip_gutenberg_comments(content):
    """Remove Gutenberg block comments like <!-- wp:paragraph --> etc."""
    content = re.sub(r'<!-- /?wp:\w+[^>]*-->\s*', '', content)
    # Also remove class attributes added by Gutenberg
    content = re.sub(r' class="wp-block-heading"', '', content)
    content = re.sub(r' class="wp-block-list"', '', content)
    content = re.sub(r' class="wp-block-separator has-alpha-channel-opacity"', '', content)
    content = re.sub(r' class="has-fixed-layout"', '', content)
    content = re.sub(r'<figure class="wp-block-table">(.*?)</figure>', r'\1', content, flags=re.DOTALL)
    return content.strip()


def fetch_post_content(post_id):
    """Fetch post content from WordPress REST API."""
    url = f"https://getpacerai.com/wp-json/wp/v2/posts/{post_id}"
    wp_user = "willsullivan5e7f50183a"
    wp_pass = os.environ.get("WP_APP_PASSWORD", "")

    if not wp_pass:
        # Try reading from local cache files
        cache_file = f"{REPO}/src/blog/posts/cache-{post_id}.json"
        if os.path.exists(cache_file):
            with open(cache_file, 'r') as f:
                data = json.load(f)
                return data.get('content', {}).get('rendered', '')
        print(f"  WARNING: No WP_APP_PASSWORD set and no cache for post {post_id}")
        return None

    credentials = base64.b64encode(f"{wp_user}:{wp_pass}".encode()).decode()
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Basic {credentials}")

    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data.get('content', {}).get('rendered', '')
    except urllib.error.URLError as e:
        print(f"  ERROR fetching post {post_id}: {e}")
        return None


def build_faq_jsonld(faq_items):
    """Generate FAQ JSON-LD from a list of Q&A dicts."""
    if not faq_items:
        return ""
    faq_schema = {
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": item["q"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item["a"]
                }
            }
            for item in faq_items
        ]
    }
    # Return with leading comma for @graph array placement
    return ",\n    " + json.dumps(faq_schema, indent=6)


def build_post(template, post_meta, content):
    """Replace template placeholders with post data."""
    # Strip Gutenberg comments from content
    clean_content = strip_gutenberg_comments(content)

    # Build FAQ JSON-LD if present
    faq_items = post_meta.get("faq", [])
    faq_json = build_faq_jsonld(faq_items)

    output = template
    output = output.replace("{{TITLE}}", post_meta["title"])
    output = output.replace("{{TITLE_SHORT}}", post_meta["title_short"])
    output = output.replace("{{CATEGORY}}", post_meta["category"])
    output = output.replace("{{DATE}}", post_meta["date"])
    output = output.replace("{{DATE_ISO}}", post_meta["date_iso"])
    output = output.replace("{{FAQ_JSON}}", faq_json)
    output = output.replace("{{CONTENT}}", clean_content)

    return output


def main():
    # Read template
    with open(TEMPLATE_PATH, 'r') as f:
        template = f.read()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Pre-loaded content from MCP (hardcoded since we already fetched it)
    # We'll use the raw post_content we already have
    print("Building blog post files from template...")

    for post in POSTS:
        post_id = post["id"]
        print(f"\n  Building post {post_id}: {post['title_short']}...")

        # Read cached content file
        content_file = f"{OUTPUT_DIR}/content-{post_id}.html"
        if not os.path.exists(content_file):
            print(f"    Content file not found: {content_file}")
            print(f"    Run: save content files first")
            continue

        with open(content_file, 'r') as f:
            content = f.read()

        output = build_post(template, post, content)

        output_file = f"{OUTPUT_DIR}/{post_id}-build.html"
        with open(output_file, 'w') as f:
            f.write(output)

        print(f"    Saved: {output_file}")
        print(f"    Size: {len(output):,} chars")

    print("\nDone! Build files ready for deploy.")


if __name__ == "__main__":
    main()
