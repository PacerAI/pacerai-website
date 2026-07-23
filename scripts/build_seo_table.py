#!/usr/bin/env python3
"""
SEO messaging table — single source of truth + generator.

DATA (below) is the source. Running this emits BOTH:
  - docs/review/seo-table.csv   (clean, correctly-quoted data export)
  - docs/review/seo-table.html  (styled table, = the published artifact)

To update titles/meta: edit DATA, run `python3 scripts/build_seo_table.py`,
then republish docs/review/seo-table.html as the artifact (same URL).
Mark a row implemented=True once the live Yoast value matches `rec_*` — the
generator then renders it green/✓ Live, so the table evolves v1 -> v2 as WP
Admin edits land. (Yoast title/meta are NOT REST-writable on WordPress.com,
so implementation happens in WP Admin, not via deploy.py.)
"""
import csv, html, os, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_OUT = os.path.join(REPO, "docs/review/seo-table.csv")
HTML_OUT = os.path.join(REPO, "docs/review/seo-table.html")

FIELDS = ["group","page","slug","wp_id","status","implemented",
          "cur_title","cur_meta","rec_title","rec_meta","note"]

def row(group,page,slug,wp_id,status,cur_title,cur_meta,rec_title,rec_meta,note,implemented=False):
    return dict(group=group,page=page,slug=slug,wp_id=wp_id,status=status,implemented=implemented,
                cur_title=cur_title,cur_meta=cur_meta,rec_title=rec_title,rec_meta=rec_meta,note=note)

DATA = [
 # ---- CORE ----
 row("Core","Home","/","25","minor",
     "Pacer AI — GTM Financial Modeling Agent for PE-backed SaaS",
     "Pacer AI is the GTM Financial Modeling Agent for Sales Leaders and CFOs — build and reconcile your ARR waterfall and revenue model inside Claude, in days.",
     "Pacer AI — The GTM Financial Modeling Agent for CROs",
     "Pacer AI is the GTM Financial Modeling Agent for CROs and Sales Leaders — build and reconcile your ARR waterfall and revenue model inside Claude, in days.",
     "Lead with CRO; title/meta already updated 2026-07-23"),
 row("Core","Resources hub","/resources/","230","fix",
     "Resources — Pacer AI | ARR Intelligence & RevOps Insights",
     "Insights on ARR intelligence, revenue operations, and SaaS growth strategies for PE-backed operators and CFOs.",
     "Resources — GTM Financial Modeling & ARR Guides | Pacer AI",
     "Guides on GTM financial modeling, ARR waterfalls, and revenue models for CROs and finance leaders — from the team behind the GTM Financial Modeling Agent.",
     "Drop 'ARR Intelligence & RevOps Insights'"),
 row("Core","Team","/team/","366","fix",
     "Company — Pacer AI",
     "Learn about Pacer AI — our mission, team, and approach to solving the ARR reporting gap for PE-backed SaaS companies.",
     "Team — Pacer AI | The Operator Behind the Agent",
     "Pacer AI is founder-led by Will Sullivan — a former PwC M&A advisor and West Point graduate. Meet the operator behind the GTM Financial Modeling Agent.",
     "Lead founder credibility"),
 row("Core","About","/team/about/","374","fix",
     "About — Pacer AI",
     "Pacer AI was founded to solve the ARR reporting gap for PE-backed SaaS companies. Learn about our mission, values, and the team behind the platform.",
     "About Pacer AI — Built by an M&A Operator",
     "Why Pacer AI exists: a GTM Financial Modeling Agent built by an ex-PwC M&A advisor to give CROs a revenue model that reconciles to Finance.",
     "Drop 'ARR reporting gap / PE-backed SaaS' lead"),
 row("Core","Contact","/team/contact/","375","fix",
     "Contact — Pacer AI",
     "Get in touch with Pacer AI. Request a live demo, schedule a call, or reach out about partnerships for PE-backed SaaS revenue intelligence.",
     "Contact Pacer AI — Talk to Will",
     "Book a diagnostic or reach founder Will Sullivan directly about GTM financial modeling — build and reconcile your revenue model inside Claude.",
     "Drop 'revenue intelligence'"),
 row("Core","Platform / How it works","/platform/overview/","371","fix",
     "Platform Overview — Pacer AI",
     "Pacer AI platform overview — how we unify CRM, billing, and ERP data into automated ARR snowball reports, waterfall analyses, and board-ready decks.",
     "How It Works — GTM Financial Modeling Agent | Pacer AI",
     "How Pacer AI turns CRM, billing, and ERP data into a reconciled GTM financial model — ARR waterfalls, snowballs, and board-ready output, inside Claude.",
     "Off-nav; consider folding into homepage #how-it-works"),
 # ---- ARTICLES ----
 row("Articles","What Is an ARR Waterfall?","/resources/what-is-an-arr-waterfall/","850","fix",
     "What Is an ARR Waterfall? Definition, Components, and How to Build One - Get Pacer AI","",
     "ARR Waterfall: Definition & How to Build One | Pacer AI",
     "An ARR waterfall decomposes recurring revenue into new, expansion, contraction, and churn. Components, formula, a worked example, and how to build one.",
     "Add meta; fix brand+length; root dupe 873 redirects here"),
 row("Articles","What Is cRPO?","/resources/what-is-current-performance-obligation/","865","fix",
     "What is cRPO? The Operator's Guide to Current Remaining Performance Obligations - Get Pacer AI","",
     "What Is cRPO? An Operator's Guide to Current RPO | Pacer AI",
     "cRPO (current remaining performance obligations) explained for operators — what it is, how it differs from ARR, and why acquirers and boards care.",
     "Add meta; shorten; dupe /crpo-vs-arr redirects here"),
 row("Articles","Build Data Cube In-House or Hire","/resources/build-customer-data-cube-in-house-or-hire/","491","fix",
     "Should I Build a Customer Data Cube In-House or Hire Someone? - Get Pacer AI","",
     "Build a Customer Data Cube In-House or Hire? | Pacer AI",
     "Build your customer data cube in-house or hire it out? The real cost, timeline, and maintenance trade-offs — plus the done-for-you alternative.",
     "Add meta; brand"),
 row("Articles","Board-Quality ARR Snowballs","/resources/board-quality-arr-snowballs/","781","fix",
     "Board Quality ARR Snowballs: Understand Your ARR Growth Drivers Before Your Acquirers Do - Get Pacer AI","",
     "Board-Quality ARR Snowballs: Know Your Drivers | Pacer AI",
     "Build board- and diligence-grade ARR snowballs that reveal your real growth drivers — before your acquirers' QoR does. An M&A operator's approach.",
     "Add meta; big title cut"),
 row("Articles","What Companies Build vs Boards Need","/resources/what-most-companies-build-vs-what-boards-need/","591","fix",
     "What Most Companies Build vs. What Boards Actually Need - Get Pacer AI","",
     "What Companies Build vs. What Boards Need | Pacer AI",
     "Most SaaS reporting answers the wrong question. What boards and sponsors actually need from your ARR model — and how to close the gap.",
     "Add meta; brand"),
 row("Articles","Semrush x Adobe case study","/semrush-adobe-acquisition-case-study/","888","minor",
     "Case Study: How Semrush got a premium valuation & purchase price from Adobe | Pacer AI",
     "How Semrush got acquired by Adobe for $1.9B (3.8x NTM rev, 77% premium) despite slowing growth—the RevOps playbook, from SEC filings.",
     "Semrush × Adobe: An M&A Read on a Premium Exit | Pacer AI",
     "How Semrush was acquired by Adobe for $1.9B (3.8x NTM, 77% premium) despite slowing growth — the ARR-quality read, from SEC filings.",
     "Shorten title; root URL (fine to leave)"),
 row("Articles","Why LLMs Can't Build Your Snowball","/resources/why-llms-cant-build-your-arr-snowball-from-operational-data/","441","minor",
     "Why LLMs Can't Build Your ARR Snowball from Operational Data — Pacer AI",
     "LLMs cannot reliably build ARR snowballs from CRM, billing, or ERP data. Learn why rule-based calculations and expert judgment are required — not chat agents.",
     "Why LLMs Can't Build Your ARR Snowball | Pacer AI","",
     "Trim title only; keep current meta"),
 row("Articles","What Is an ARR Snowball?","/resources/what-is-an-arr-snowball-understanding-revenue-growth/","378","minor",
     "What Is an ARR Snowball? Understanding Revenue Growth — Pacer AI",
     "An ARR snowball tracks how Annual Recurring Revenue grows or shrinks by decomposing changes into new business, expansion, contraction, and churn over time.",
     "What Is an ARR Snowball? Definition & Guide | Pacer AI","",
     "Trim title only; keep current meta"),
 row("Articles","Prevent Churn in High-Value Accounts","/resources/prevent-churn-in-high-value-accounts-with-arr-snowball/","376","minor",
     "Prevent Churn in High-Value Accounts with ARR Snowball — Pacer AI",
     "Prevent churn in high-value SaaS accounts by monitoring leading indicators and using ARR snowball analysis to surface at-risk customers before renewal dates.",
     "Prevent Churn in High-Value Accounts | Pacer AI","",
     "Trim title only; keep current meta"),
 row("Articles","ARR Snowball Analysis: Expansion Drivers","/resources/arr-snowball-analysis-find-your-expansion-drivers/","368","minor",
     "ARR Snowball Analysis: Find Your Expansion Drivers — Pacer AI",
     "Use ARR snowball analysis to identify which expansion levers drive the most growth — upsell patterns, cross-sell opportunities, and net revenue retention by cohort.",
     "ARR Snowball Analysis: Find Expansion Drivers | Pacer AI",
     "Use ARR snowball analysis to find your biggest expansion levers — upsell and cross-sell patterns and net revenue retention by cohort.",
     "Trim meta to <155"),
 row("Articles","Why ARR Waterfall Models Matter","/resources/why-arr-waterfall-models-matter-for-saas-growth/","358","ok",
     "Why ARR Waterfall Models Matter for SaaS Growth — Pacer AI",
     "ARR waterfall models break down period-over-period revenue changes into new, expansion, contraction, and churn — revealing the drivers behind SaaS growth.",
     "Why ARR Waterfall Models Matter for SaaS Growth | Pacer AI","",
     "Keep; optional brand-suffix swap"),
 row("Articles","AI for RevOps","/resources/using-ai-to-enable-revops-without-breaking-your-gtm/","360","fix",
     "Using AI to Enable RevOps (Without Breaking Your GTM) — Pacer AI",
     "How to deploy AI in revenue operations without breaking your GTM workflows. Practical guidance for PE-backed SaaS operators on data unification, anomaly detection, and predictive analytics.",
     "AI for RevOps — Without Breaking Your GTM | Pacer AI",
     "How to deploy AI in revenue operations without breaking your GTM — data unification, anomaly detection, and where an always-on agent fits.",
     "Trim meta (189 -> <155)"),
 # ---- KEEP + ADD META ----
 row("Keep+Meta","SaaS Metrics Glossary","/glossary/","0","fix",
     "SaaS Metrics Glossary - Get Pacer AI","",
     "SaaS Metrics Glossary | Pacer AI",
     "A plain-English glossary of SaaS revenue metrics — ARR, NRR/GRR, ARR waterfall, cRPO, and more — for operators and finance leaders.",
     "DefinedTerm target; add meta"),
 row("Keep+Meta","ARR Waterfall (glossary)","/glossary/arr-waterfall/","0","fix",
     "ARR Waterfall - Get Pacer AI","",
     "ARR Waterfall — Definition | Pacer AI",
     "ARR waterfall: the period-over-period decomposition of recurring revenue into new, expansion, contraction, and churn. Definition and how it's used.",
     "DefinedTerm target; add meta"),
 row("Keep+Meta","ARR Snowball vs ARR Waterfall","/resources/arr-snowball-vs-waterfall/","0","fix",
     "ARR Snowball vs. ARR Waterfall: Which Model Should You Use? - Get Pacer AI","",
     "ARR Snowball vs. ARR Waterfall: Which to Use | Pacer AI",
     "ARR snowball vs ARR waterfall — what each model shows, when to use which, and how they fit together for board and diligence reporting.",
     "Add meta; confirm repo source of truth"),
 # ---- REDIRECTS ----
 row("Redirect","/pricing/","/pricing/","111","redirect","","","","","301 -> /#pricing (stale: live meta still says $2,000/mo)"),
 row("Redirect","/what-is-an-arr-waterfall/ (root dupe)","/what-is-an-arr-waterfall/","873","redirect","","","","","301 -> /resources/what-is-an-arr-waterfall/"),
 row("Redirect","/crpo-vs-arr/ (root dupe)","/crpo-vs-arr/","0","redirect","","","","","301 -> /resources/what-is-current-performance-obligation/"),
 row("Redirect","/solutions/arr-snowball-board-reporting/","/solutions/arr-snowball-board-reporting/","372","redirect","","","","","301 -> /"),
 row("Redirect","/solutions/customer-data-cube/","/solutions/customer-data-cube/","373","redirect","","","","","301 -> /"),
 row("Redirect","/solutions/transaction-readiness/","/solutions/transaction-readiness/","554","redirect","","","","","301 -> /"),
 row("Redirect","/solutions/revops-transformation-pkg/","/solutions/revops-transformation-pkg/","651","redirect","","","","","301 -> /"),
 row("Redirect","/solutions/gtm-transformation-pkg/","/solutions/gtm-transformation-pkg/","650","redirect","","","","","301 -> /"),
 row("Redirect","/solutions/fpanda-transformation-pkg/","/solutions/fpanda-transformation-pkg/","652","redirect","","","","","301 -> /"),
]

# Slugs whose live Yoast title+meta have been verified to match rec_* (add as batches land).
IMPLEMENTED = {
    # Core batch — verified live 2026-07-23
    "/", "/resources/", "/team/", "/team/about/", "/team/contact/", "/platform/overview/",
    # Resources & articles batch — verified live 2026-07-23 (waterfall pending: extension edited the root dupe)
    "/resources/what-is-current-performance-obligation/",
    "/resources/build-customer-data-cube-in-house-or-hire/",
    "/resources/board-quality-arr-snowballs/",
    "/resources/what-most-companies-build-vs-what-boards-need/",
    "/semrush-adobe-acquisition-case-study/",
    "/resources/arr-snowball-analysis-find-your-expansion-drivers/",
    "/resources/why-llms-cant-build-your-arr-snowball-from-operational-data/",
    "/resources/what-is-an-arr-snowball-understanding-revenue-growth/",
    "/resources/prevent-churn-in-high-value-accounts-with-arr-snowball/",
    "/resources/why-arr-waterfall-models-matter-for-saas-growth/",
    "/resources/using-ai-to-enable-revops-without-breaking-your-gtm/",
    # Keep & add meta batch — verified live 2026-07-23
    "/glossary/", "/glossary/arr-waterfall/", "/resources/arr-snowball-vs-waterfall/",
    # Waterfall canonical (850) fixed + verified 2026-07-23 — all 21/21 live
    "/resources/what-is-an-arr-waterfall/",
}
for _r in DATA:
    if _r["slug"] in IMPLEMENTED:
        _r["implemented"] = True

def write_csv():
    with open(CSV_OUT,"w",newline="") as f:
        w=csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for r in DATA:
            r2=dict(r); r2["implemented"]="yes" if r["implemented"] else "no"
            w.writerow(r2)

# ---------- HTML ----------
CSS = """<style>
:root{--bg:#F5F4EF;--surface:#FAFAF7;--surface-2:#EFEDE5;--ink:#20242B;--muted:#5F5A50;--faint:#8A8377;--line:#E6E1D6;--navy:#1F3864;--teal:#2E7D74;--fix:#B26B12;--fix-bg:#F6ECD9;--good:#2E7D74;--good-bg:#E1EFE9;--redir:#7A7468;--redir-bg:#EAE7DE;--mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;--sans:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
@media (prefers-color-scheme:dark){:root{--bg:#16181C;--surface:#1E2127;--surface-2:#262A31;--ink:#F1EFE9;--muted:#A79F91;--faint:#7E7869;--line:#31353D;--navy:#9CBAE8;--teal:#74C6A3;--fix:#E0A75A;--fix-bg:#3A2F1C;--good:#74C6A3;--good-bg:#1D2E27;--redir:#9A9384;--redir-bg:#2A2820;}}
:root[data-theme="light"]{--bg:#F5F4EF;--surface:#FAFAF7;--surface-2:#EFEDE5;--ink:#20242B;--muted:#5F5A50;--faint:#8A8377;--line:#E6E1D6;--navy:#1F3864;--teal:#2E7D74;--fix:#B26B12;--fix-bg:#F6ECD9;--good:#2E7D74;--good-bg:#E1EFE9;--redir:#7A7468;--redir-bg:#EAE7DE;}
:root[data-theme="dark"]{--bg:#16181C;--surface:#1E2127;--surface-2:#262A31;--ink:#F1EFE9;--muted:#A79F91;--faint:#7E7869;--line:#31353D;--navy:#9CBAE8;--teal:#74C6A3;--fix:#E0A75A;--fix-bg:#3A2F1C;--good:#74C6A3;--good-bg:#1D2E27;--redir:#9A9384;--redir-bg:#2A2820;}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.5;font-size:15px;-webkit-font-smoothing:antialiased;}
.wrap{max-width:1180px;margin:0 auto;padding:40px 24px 80px;}
.eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--teal);font-weight:700;margin:0 0 10px;}
h1{font-size:clamp(26px,4vw,36px);line-height:1.1;margin:0 0 10px;letter-spacing:-.02em;text-wrap:balance;font-weight:800;}
.lede{color:var(--muted);max-width:66ch;margin:0 0 22px;font-size:15.5px;}
.northstar{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin:0 0 8px;}
.northstar h2{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 12px;font-weight:700;}
.rules{display:flex;flex-wrap:wrap;gap:8px;}
.rule{font-size:13px;background:var(--surface-2);border:1px solid var(--line);border-radius:999px;padding:5px 12px;color:var(--ink);}
.rule b{color:var(--navy);}
.rule.drop{color:var(--muted);text-decoration:line-through;text-decoration-color:var(--fix);text-decoration-thickness:1.5px;}
section{margin-top:36px;}
.sec-h{display:flex;align-items:baseline;gap:12px;margin:0 0 6px;}
.sec-h h2{font-size:19px;margin:0;font-weight:800;letter-spacing:-.01em;}
.sec-h .count{font-family:var(--mono);font-size:12px;color:var(--faint);}
.sec-sub{color:var(--muted);font-size:13.5px;margin:0 0 16px;}
.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--surface);}
table{border-collapse:collapse;width:100%;min-width:760px;}
thead th{text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);font-weight:700;padding:12px 16px;border-bottom:1px solid var(--line);white-space:nowrap;position:sticky;top:0;background:var(--surface);}
tbody td{padding:14px 16px;border-bottom:1px solid var(--line);vertical-align:top;}
tbody tr:last-child td{border-bottom:none;}
tbody tr:hover{background:var(--surface-2);}
.page{font-weight:700;color:var(--ink);font-size:14.5px;}
.slug{font-family:var(--mono);font-size:11.5px;color:var(--muted);margin-top:3px;word-break:break-all;}
.wpid{font-family:var(--mono);font-size:11px;color:var(--faint);}
.cell-label{font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--faint);font-weight:700;margin:0 0 3px;}
.txt{font-size:13.5px;color:var(--ink);}
.txt.cur{color:var(--muted);}
.rec .txt{color:var(--ink);}
.meta{font-size:12.5px;color:var(--muted);margin-top:7px;}
.rec .meta{color:var(--ink);}
.len{font-family:var(--mono);font-size:10.5px;color:var(--faint);font-variant-numeric:tabular-nums;}
.len.over{color:var(--fix);font-weight:700;}
.len.miss{color:var(--fix);font-weight:700;}
.rec{background:linear-gradient(0deg,var(--good-bg),transparent 140%);}
.done td{background:linear-gradient(0deg,var(--good-bg),transparent 120%);}
.chip{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:3px 9px;border-radius:999px;white-space:nowrap;}
.chip.fix{background:var(--fix-bg);color:var(--fix);}
.chip.minor,.chip.ok{background:var(--good-bg);color:var(--good);}
.chip.redir{background:var(--redir-bg);color:var(--redir);}
.chip.live{background:var(--good);color:#fff;}
col.c-page{width:20%} col.c-cur{width:34%} col.c-rec{width:38%} col.c-act{width:8%}
.redir-row td{color:var(--muted);}
.arrow{color:var(--teal);font-weight:700;}
footer{margin-top:44px;padding-top:20px;border-top:1px solid var(--line);color:var(--faint);font-size:12.5px;}
code{font-family:var(--mono);font-size:.92em;background:var(--surface-2);padding:1px 5px;border-radius:4px;}
@media (max-width:640px){.wrap{padding:28px 14px 60px}}
</style>"""

def e(s): return html.escape(s or "")
def L(s):  # length flag span
    n=len(s or "")
    return n

def title_len_span(t):
    n=len(t or "")
    cls="len over" if n>60 else "len"
    return f'<span class="{cls}">{n}</span>'
def meta_len_span(m):
    if not m: return '<span class="len miss">meta missing</span>'
    n=len(m); cls="len over" if n>155 else "len"
    return f'<span class="{cls}">{n}</span>'

def content_rows(rows):
    out=[]
    for r in rows:
        done = r["implemented"]
        chip = 'live' if done else r["status"]
        chiptxt = '✓ Live' if done else r["status"].capitalize()
        rec_meta = r["rec_meta"] or "Keep current meta."
        if done:
            out.append(f'''<tr class="done">
  <td><div class="page">{e(r["page"])}</div><div class="slug">{e(r["slug"])}</div><div class="wpid">WP {e(r["wp_id"])}</div></td>
  <td class="rec"><div class="cell-label">Title (live) {title_len_span(r["rec_title"])}</div><div class="txt">{e(r["rec_title"])}</div><div class="meta">{e(r["rec_meta"] or r["cur_meta"])} {meta_len_span(r["rec_meta"] or r["cur_meta"])}</div></td>
  <td><div class="cell-label">Note</div><div class="meta" style="margin-top:0">{e(r["note"])}</div></td>
  <td><span class="chip live">{chiptxt}</span></td>
</tr>''')
        else:
            out.append(f'''<tr>
  <td><div class="page">{e(r["page"])}</div><div class="slug">{e(r["slug"])}</div><div class="wpid">WP {e(r["wp_id"])}</div></td>
  <td class="cur"><div class="cell-label">Title {title_len_span(r["cur_title"])}</div><div class="txt cur">{e(r["cur_title"])}</div><div class="meta">{e(r["cur_meta"]) if r["cur_meta"] else ""} {meta_len_span(r["cur_meta"])}</div></td>
  <td class="rec"><div class="cell-label">Title {title_len_span(r["rec_title"])}</div><div class="txt">{e(r["rec_title"])}</div><div class="meta">{e(rec_meta)} {meta_len_span(r["rec_meta"]) if r["rec_meta"] else ""}</div></td>
  <td><span class="chip {chip}">{chiptxt}</span></td>
</tr>''')
    return "\n".join(out)

def redirect_rows(rows):
    out=[]
    for r in rows:
        target=r["note"].split("->")[-1].strip() if "->" in r["note"] else r["note"]
        why=r["note"].split("->")[0].replace("301","").strip(" (")
        out.append(f'''<tr class="redir-row"><td><div class="slug">{e(r["slug"])}</div><div class="wpid">WP {e(r["wp_id"])}</div></td><td><span class="arrow">301 →</span> <code>{e(target)}</code></td></tr>''')
    return "\n".join(out)

def build_html():
    groups={}
    for r in DATA: groups.setdefault(r["group"],[]).append(r)
    def table(rows, cols_head):
        return f'''<div class="tablewrap"><table>
<colgroup><col class="c-page"><col class="c-cur"><col class="c-rec"><col class="c-act"></colgroup>
<thead>{cols_head}</thead>
<tbody>
{content_rows(rows)}
</tbody></table></div>'''
    core=groups.get("Core",[]); arts=groups.get("Articles",[]); keep=groups.get("Keep+Meta",[]); redir=groups.get("Redirect",[])
    n_done=sum(1 for r in DATA if r["implemented"])
    ver="v2" if n_done else "v1"
    head='<tr><th>Page</th><th>Current (live)</th><th>Recommended</th><th>Action</th></tr>'
    body=f'''{CSS}
<div class="wrap">
<header>
  <p class="eyebrow">getpacerai.com · SEO / metadata · {ver} · {n_done}/{len([r for r in DATA if r["group"]!="Redirect"])} implemented</p>
  <h1>Title &amp; Meta — Current vs. Recommended</h1>
  <p class="lede">Every indexed page, its live Yoast title and meta description, and a recommended rewrite aligned to one message. Edit in <b>WP Admin → page → Yoast</b> (not REST-writable). Generated from <code>docs/review/seo-table.csv</code>. Titles ≤60 chars, metas ≤155.</p>
  <div class="northstar">
    <h2>The one message everything should ladder up to</h2>
    <div class="rules">
      <span class="rule"><b>GTM Financial Modeling Agent</b> — the canonical category</span>
      <span class="rule">Built for <b>CROs</b> &amp; Sales Leaders (CFOs secondary)</span>
      <span class="rule">Build &amp; reconcile your <b>ARR / revenue model inside Claude</b></span>
      <span class="rule">Brand suffix: <b>| Pacer AI</b></span>
      <span class="rule drop">RevOps intelligence</span>
      <span class="rule drop">ARR Intelligence</span>
      <span class="rule drop">AI-native consulting firm</span>
      <span class="rule drop">PE-backed SaaS <em>as the lead</em></span>
    </div>
  </div>
</header>
<section><div class="sec-h"><h2>Core pages</h2><span class="count">{len(core)} pages</span></div><p class="sec-sub">The pages that carry the positioning. Highest priority.</p>{table(core,head)}</section>
<section><div class="sec-h"><h2>Resources &amp; articles</h2><span class="count">{len(arts)} pages</span></div><p class="sec-sub">Keep the keyword titles; fix <code>- Get Pacer AI</code> → <code>| Pacer AI</code>, add the missing metas, trim titles over ~60.</p>{table(arts,head)}</section>
<section><div class="sec-h"><h2>Keep &amp; add meta</h2><span class="count">{len(keep)} pages</span></div><p class="sec-sub">Glossary / comparison pages to keep (DefinedTerm targets) — just add a meta description.</p>{table(keep,head)}</section>
<section><div class="sec-h"><h2>Legacy &amp; redirect</h2><span class="count">{len(redir)} URLs</span></div><p class="sec-sub">Don't optimize — <b>301</b> these (Redirection plugin / Yoast Premium).</p>
<div class="tablewrap"><table><thead><tr><th>URL</th><th>Action</th></tr></thead><tbody>
{redirect_rows(redir)}
</tbody></table></div></section>
<footer>Generated from <code>docs/review/seo-table.csv</code> by <code>scripts/build_seo_table.py</code> · char counts flag title&gt;60 / meta&gt;155 / missing meta · mark rows <code>implemented=yes</code> as WP-Admin edits land and re-run for v2.</footer>
</div>'''
    with open(HTML_OUT,"w") as f: f.write(body)

if __name__=="__main__":
    write_csv(); build_html()
    n=len(DATA); done=sum(1 for r in DATA if r["implemented"])
    print(f"Wrote {CSV_OUT}\nWrote {HTML_OUT}\n{n} rows, {done} implemented")
    # optional: also copy html to a path given as arg (e.g. the artifact file)
    if len(sys.argv)>1:
        import shutil; shutil.copy(HTML_OUT, sys.argv[1]); print(f"Copied HTML -> {sys.argv[1]}")
