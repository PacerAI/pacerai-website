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

REPO = "/Users/willsullivan/Documents/GitHub/PacerAI/04_GTM/website-PacerAI"
TEMPLATE_PATH = f"{REPO}/src/blog/post-template.html"
OUTPUT_DIR = f"{REPO}/src/blog/posts"

# Blog post metadata
POSTS = [
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
