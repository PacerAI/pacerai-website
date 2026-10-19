/**
 * Order capture for getpacerai.com/pricing/ (Will, 2026-10-14).
 *
 * The flow:
 *   1. A visitor clicks Choose on /pricing/.
 *   2. The page opens GET /order in a modal iframe. The URL carries the selection (package, billing, user and
 *      hour-block counts) and first-touch attribution, never an email.
 *   3. The card shows the order summary, recomputed HERE from price-book.json, and asks for a work email plus
 *      the bot check.
 *   4. POST /pricing-request recomputes the totals again (the page's numbers are never trusted) and then:
 *        - writes a `leads` row (source "pricing"), so the nightly lead stamping and HQ count it;
 *        - writes a `pricing_requests` row with the full selection (skipped quietly until migration 0003
 *          runs);
 *        - adds the contact to the Apollo list Signal_CONTACT_Website_PricingRequest (no sequence: Will follows
 *          up himself);
 *        - emails the summary to the visitor (reply-to Will) and to Will, through Resend;
 *        - posts to Slack.
 *      It answers with an opaque visitor id, which the card hands to the page as the GA4 user_id.
 *
 * Prices: price-book.json is written by scripts/build_pricing.py from foundation/pricing/
 * product-pricing-price-book.md. A new Price Book version means rebuild, then redeploy this Worker and page 111.
 */
import priceBook from "./price-book.json";
import {
  APOLLO_API, FRAME_HEADERS, addToList, classify, deriveWebsite, enrich, findContact, isHostingOrigin, json,
  type ApolloContact, type Env,
} from "./shared";

export const PRICING_REQUEST_LIST = "Signal_CONTACT_Website_PricingRequest";
const MAX_USERS = 200;
const MAX_BLOCKS = 8;
// After a request is sent, the card offers the "Pacer AI - onboarding" Calendly event (Will, 2026-10-19).
const ONBOARDING = "https://calendly.com/pacerai/pacer-ai-onboarding";

type PlanKey = keyof typeof priceBook.packages;

export interface Selection {
  plan: PlanKey;
  billing: "annual" | "monthly";
  pacer_users: number;
  planning_users: number;   // 0 when the package has no Planning Agent
  hour_blocks: number;      // monthly 5-hr blocks
}

export interface Quote extends Selection {
  package_name: string;
  has_planning: boolean;
  included: number;
  base: number;             // package price per month on this billing
  seat: number;             // per additional user per month on this billing
  block: number;            // per monthly 5-hr block
  extra_users: number;
  monthly_total: number;
  annual_contract_value: number | null;   // annual billing only
  price_book_version: string;
}

/** The selection from a query string or a POST body. Anything malformed falls back to the default. */
export function parseSelection(src: Record<string, unknown>): Selection | null {
  const plan = String(src.plan ?? "");
  if (!Object.prototype.hasOwnProperty.call(priceBook.packages, plan)) return null;
  const billing = src.billing === "monthly" ? "monthly" : src.billing === "annual" ? "annual" : null;
  if (!billing) return null;
  const inc = priceBook.included_users;
  const int = (v: unknown, lo: number, hi: number, d: number) => {
    const n = Math.floor(Number(v));
    return v === undefined || v === null || v === "" || !Number.isFinite(n) ? d : Math.min(hi, Math.max(lo, n));
  };
  const hasPlanning = (priceBook.packages[plan as PlanKey].agents as string[]).includes("planning");
  return {
    plan: plan as PlanKey,
    billing,
    pacer_users: int(src.pu, 1, MAX_USERS, inc),
    planning_users: hasPlanning ? int(src.fu, 1, MAX_USERS, inc) : 0,
    hour_blocks: int(src.hb, 0, MAX_BLOCKS, 0),
  };
}

/** The same arithmetic as src/pricing/pricing.js on the page, from the Worker's own copy of the Price Book. */
export function quote(s: Selection): Quote {
  const pkg = priceBook.packages[s.plan];
  const annual = s.billing === "annual";
  const inc = priceBook.included_users;
  const hasPlanning = (pkg.agents as string[]).includes("planning");
  const base = annual ? pkg.a : pkg.m;
  const seat = annual ? priceBook.user_license.a : priceBook.user_license.m;
  const block = annual ? priceBook.services.monthly_block.a : priceBook.services.monthly_block.m;
  const extra = Math.max(0, s.pacer_users - inc) + (hasPlanning ? Math.max(0, s.planning_users - inc) : 0);
  const monthly = base + extra * seat + s.hour_blocks * block;
  return {
    ...s, package_name: pkg.name, has_planning: hasPlanning, included: inc, base, seat, block,
    extra_users: extra, monthly_total: monthly, annual_contract_value: annual ? monthly * 12 : null,
    price_book_version: priceBook.version,
  };
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Summary lines shared by the card, both emails and Slack: [label, value]. */
export function summaryRows(q: Quote): [string, string][] {
  const users = (n: number) =>
    n > q.included ? `${n} (${q.included} included, ${n - q.included} more at ${usd(q.seat)}/user/mo)` : `${n} (${q.included} included)`;
  const rows: [string, string][] = [
    ["Package", q.package_name],
    ["Billing", q.billing === "annual" ? "Annual contract, billed monthly" : "Month-to-month"],
    ["Pacer users", users(q.pacer_users)],
  ];
  if (q.has_planning) rows.push(["Planning users", users(q.planning_users)]);
  rows.push(["Monthly 5-hr blocks", q.hour_blocks ? `${q.hour_blocks} (${usd(q.hour_blocks * q.block)}/mo)` : "None"]);
  rows.push(["Monthly total", `${usd(q.monthly_total)}/mo`]);
  if (q.annual_contract_value !== null) rows.push(["Annual contract value", usd(q.annual_contract_value)]);
  return rows;
}

// ── GET /order ────────────────────────────────────────────────────────────────

export function orderPage(url: URL, env: Env): Response {
  const sel = parseSelection(Object.fromEntries(url.searchParams));
  if (!sel) {
    return new Response("Unknown package", { status: 400, headers: { "content-type": "text/plain; charset=utf-8", ...FRAME_HEADERS } });
  }
  return new Response(orderHtml(env.TURNSTILE_SITE_KEY || "", quote(sel)), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...FRAME_HEADERS },
  });
}

function orderHtml(siteKey: string, q: Quote): string {
  const rows = summaryRows(q)
    .map(([k, v], i, all) => `<tr${i >= all.length - (q.annual_contract_value !== null ? 2 : 1) ? ' class="tot"' : ""}><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("");
  const sel = JSON.stringify({ plan: q.plan, billing: q.billing, pu: q.pacer_users, fu: q.planning_users, hb: q.hour_blocks });
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Your selection — Pacer AI</title>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
<style>
  :root{--bone:#F5F4EF;--surface:#FAFAF7;--card:#F1EFE8;--navy:#1F3864;--navy-dark:#16294a;--teal:#2E7D74;--ink:#20242B;--muted:#5F5A50;--line:#E6E1D6}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:var(--bone)}
  body{font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--ink);line-height:1.5;padding:18px}
  .card{max-width:520px;margin:0 auto;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:24px 22px}
  .kick{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9A8F78;font-weight:700;margin-bottom:8px}
  h2{font-size:21px;font-weight:800;color:var(--ink);letter-spacing:-.3px;margin-bottom:6px}
  p{font-size:14.5px;color:var(--muted);margin-bottom:14px}
  table{width:100%;border-collapse:collapse;font-size:14px;margin:4px 0 16px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
  th{font-weight:600;color:var(--muted);width:44%}
  td{font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums}
  tr:last-child th,tr:last-child td{border-bottom:0}
  tr.tot td{font-weight:800}
  label{display:block;font-size:13px;font-weight:700;color:var(--ink);margin:0 0 6px}
  label span{font-weight:400;color:var(--muted)}
  input{width:100%;font-size:15px;padding:11px 13px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font-family:inherit}
  input:focus{outline:none;border-color:var(--teal)}
  .row{margin-bottom:12px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  @media(max-width:420px){.two{grid-template-columns:1fr}}
  button{width:100%;font-family:inherit;font-weight:700;font-size:15px;padding:13px 18px;border-radius:10px;border:1px solid var(--navy);background:var(--navy);color:#fff;cursor:pointer}
  button:hover{background:var(--navy-dark)}
  button:disabled{opacity:.5;cursor:not-allowed}
  .hide{display:none}
  .err{color:#B4232A;font-size:13.5px;margin-top:10px;min-height:1em}
  .cf{display:flex;justify-content:center;margin:4px 0 12px}
  .note{font-size:12px;color:var(--muted);margin-top:10px}
  a{color:var(--navy);font-weight:700}
</style></head>
<body>
<div class="card">
  <div id="s1">
    <div class="kick">Your selection</div>
    <h2>${esc(q.package_name)}</h2>
    <table>${rows}</table>
    <p>We&rsquo;ll email this summary to you and to Will Sullivan, who sets up your kickoff. No payment is taken here.</p>
    <div class="row">
      <label for="email">Work email</label>
      <input id="email" type="email" placeholder="you@company.com" autocomplete="email">
    </div>
    <div class="two">
      <div class="row"><label for="name">Name <span>(optional)</span></label><input id="name" type="text" autocomplete="name"></div>
      <div class="row"><label for="company">Company <span>(optional)</span></label><input id="company" type="text" autocomplete="organization"></div>
    </div>
    <div class="cf"><div id="cf"></div></div>
    <button id="send" disabled>Email me this summary</button>
    <div class="err" id="err"></div>
    <div class="note">The first CRM integration is included. Prices from Price Book ${esc(q.price_book_version)}.</div>
  </div>
  <div id="s2" class="hide">
    <div class="kick">Sent</div>
    <h2>Your summary is on its way</h2>
    <p id="sentTo"></p>
    <p>Ready to get started? <a href="${ONBOARDING}" target="_blank" rel="noopener" id="walk">Book your onboarding call</a>.</p>
  </div>
</div>
<script>
(function(){
  var SITEKEY=${JSON.stringify(siteKey)}, SEL=${sel}, token='', widgetId=null, busy=false;
  var qs=new URLSearchParams(location.search), attr={};
  ['utm_source','utm_medium','utm_campaign','landing','page'].forEach(function(k){ var v=qs.get(k); if(v){ attr[k]=v.slice(0,200); } });
  var send=document.getElementById('send'), err=document.getElementById('err');
  function post(msg){ try{ if(window.parent!==window){ window.parent.postMessage(msg,'https://getpacerai.com'); } }catch(e){} }
  function resize(){ post({type:'pacer:resize',height:document.documentElement.scrollHeight}); }
  function valid(e){ return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(e); }
  document.getElementById('walk').addEventListener('click',function(){ post({type:'pacer:event',name:'schedule_walkthrough',params:{cta_location:'order_card_onboarding'}}); });
  (function go(){
    if(!window.turnstile){ setTimeout(go,200); return; }
    widgetId=window.turnstile.render('#cf',{ sitekey:SITEKEY, action:'pricing-request',
      callback:function(t){ token=t; send.disabled=false; resize(); },
      'expired-callback':function(){ token=''; send.disabled=true; },
      'error-callback':function(){ err.textContent='Bot check failed. Reload and try again, or email will@getpacerai.com.'; } });
    resize();
  })();
  send.addEventListener('click',function(){
    var email=(document.getElementById('email').value||'').trim();
    if(!valid(email)){ err.textContent='Please enter a valid work email.'; return; }
    if(!token||busy){ return; }
    busy=true; send.disabled=true; err.textContent='Sending…';
    fetch('/pricing-request',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify(Object.assign({email:email,name:document.getElementById('name').value,company:document.getElementById('company').value,token:token},SEL,attr))})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d&&d.ok){
          post({type:'pacer:event',name:'pricing_request',params:{plan:d.plan,billing:d.billing,value:d.monthly_total,currency:'USD',user_id:d.visitor_id||''}});
          document.getElementById('sentTo').textContent='We sent it to '+email+'. Will replies within one business day.';
          document.getElementById('s1').classList.add('hide'); document.getElementById('s2').classList.remove('hide'); resize();
          if(window.turnstile&&widgetId!==null){ try{ window.turnstile.remove(widgetId); }catch(e){} }
        } else {
          busy=false; token=''; if(window.turnstile&&widgetId!==null){ window.turnstile.reset(widgetId); }
          err.textContent=(d&&d.error==='disposable_email')?'Please use your work email.':(d&&d.error==='turnstile_failed')?'Bot check failed. Please try again.':'Something went wrong. Please try again or email will@getpacerai.com.';
        }
      })
      .catch(function(){ busy=false; send.disabled=!token; err.textContent='Network error. Please try again.'; });
  });
  window.addEventListener('load',resize);
})();
</script>
</body></html>`;
}

// ── POST /pricing-request ─────────────────────────────────────────────────────

export async function handlePricingRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const str = (v: unknown, n = 120) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
  const path = (v: unknown) => { const x = str(v, 200); return x && /^\/(?!\/)[\w\-./]*$/.test(x) ? x : null; };
  const email = (str(body.email, 254) || "").toLowerCase();
  const token = str(body.token, 4096) || "";
  const name = str(body.name, 120);
  const company = str(body.company, 200);
  const attr = { utm_source: str(body.utm_source), utm_medium: str(body.utm_medium), utm_campaign: str(body.utm_campaign),
                 landing: path(body.landing), page: path(body.page) };
  const sel = parseSelection(body);
  if (!sel) return json({ error: "bad_selection" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "invalid_email" }, 400);
  if (!token) return json({ error: "missing_turnstile" }, 400);

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
  });
  if (!((await verify.json()) as { success: boolean }).success) return json({ error: "turnstile_failed" }, 403);

  const domain = email.split("@")[1] ?? "";
  const asOrg = (request as any).cf?.asOrganization as string | undefined;
  const leadClass = classify(domain, asOrg);
  // The Worker emails whatever address is typed, so a throwaway address is refused outright.
  if (leadClass === "disposable") return json({ error: "disposable_email" }, 400);

  const q = quote(sel);
  const ts = new Date().toISOString();
  // GA4 user_id: reuse the visitor id a demo signup gave this email, so both conversions join up in GA4.
  // Read-only: DEMO_SIGNUPS is the demo access list and a pricing request must not appear on it.
  let vid = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  try {
    const prev = await env.DEMO_SIGNUPS.get(email);
    const old = prev ? (JSON.parse(prev) as { vid?: string }) : null;
    if (old?.vid && /^[0-9a-f]{16}$/.test(old.vid)) vid = old.vid;
  } catch { /* keep the new id */ }
  const requestId = `pricing_${ts}_${vid}`;
  const pageUrl = `https://getpacerai.com${attr.page || "/pricing/"}`;
  const website = deriveWebsite(domain, leadClass);
  const cameFrom = [attr.utm_source && `${attr.utm_source}${attr.utm_medium ? ` / ${attr.utm_medium}` : ""}`,
                    attr.utm_campaign && `campaign ${attr.utm_campaign}`,
                    attr.landing && `landed on ${attr.landing}`].filter(Boolean).join(" · ");

  ctx.waitUntil((async () => {
    const errors: string[] = [];

    // Repeat clicks: at most 3 requests per email per 10 minutes send email; every request is still saved.
    let recent = 0;
    if (env.LEADS) {
      try {
        const row = await env.LEADS.prepare(
          `SELECT COUNT(*) AS n FROM leads WHERE email = ? AND source = 'pricing' AND created_at > ?`
        ).bind(email, new Date(Date.now() - 10 * 60 * 1000).toISOString()).first<{ n: number }>();
        recent = row?.n ?? 0;
      } catch (e: any) { errors.push(`d1_count: ${e?.message ?? "unknown"}`); }
    }

    let contactId: string | null = null;
    try { contactId = await syncApolloPricing(env, email, name, company, errors); }
    catch (e: any) { errors.push(`apollo: ${e?.message ?? "unknown"}`); }

    if (env.LEADS) {
      try {
        await env.LEADS.prepare(
          `INSERT INTO leads (request_id, email, email_domain, company, lead_class, source, asset_slug, page_url,
             utm_source, utm_medium, utm_campaign, ip, created_at, website, as_org, apollo_contact_id, enrolled_sequence)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        ).bind(requestId, email, domain, company, leadClass, "pricing", `pricing-${q.plan}-${q.billing}`, pageUrl,
               attr.utm_source, attr.utm_medium, attr.utm_campaign, ip || null, ts, website, asOrg ?? null, contactId, null).run();
      } catch (e: any) { errors.push(`d1_leads: ${e?.message ?? "unknown"}`); }
      try {
        await env.LEADS.prepare(
          `INSERT INTO pricing_requests (request_id, created_at, email, name, company, lead_class, plan, billing,
             pacer_users, planning_users, hour_blocks, monthly_total, annual_contract_value, price_book_version,
             utm_source, utm_medium, utm_campaign, landing, page_url, apollo_contact_id, status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        ).bind(requestId, ts, email, name, company, leadClass, q.plan, q.billing, q.pacer_users, q.planning_users,
               q.hour_blocks, q.monthly_total, q.annual_contract_value, q.price_book_version, attr.utm_source,
               attr.utm_medium, attr.utm_campaign, attr.landing, pageUrl, contactId, "requested").run();
      } catch (e: any) { errors.push(`d1_pricing_requests: ${e?.message ?? "unknown"}`); }
    }

    let mail = "not sent: no RESEND_API_KEY";
    if (env.RESEND_API_KEY && recent < 3) {
      mail = await sendEmails(env, q, { email, name, company, leadClass, cameFrom, pageUrl, contactId, requestId }, errors);
    } else if (recent >= 3) {
      mail = "not sent: repeat request within 10 minutes";
    }

    if (env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: [
            `${leadClass === "internal" ? ":test_tube:" : ":moneybag:"} *Pricing request: ${q.package_name}, ${usd(q.annual_contract_value ?? q.monthly_total)}${q.annual_contract_value ? " ACV" : "/mo"}*`,
            `*Email:* ${email}`,
            ...(name ? [`*Name:* ${name}`] : []),
            ...(company ? [`*Company:* ${company}`] : []),
            `*Classification:* ${leadClass}`,
            ...(isHostingOrigin(asOrg) ? [`*:warning: Origin:* ${asOrg} (datacenter, not an office network)`] : []),
            ...summaryRows(q).map(([k, v]) => `*${k}:* ${v}`),
            ...(cameFrom ? [`*Came from:* ${cameFrom}`] : []),
            `*Emails:* ${mail}`,
            `*Apollo:* ${contactId ? `https://app.apollo.io/#/people/${contactId} (list ${PRICING_REQUEST_LIST})` : "(no contact)"}`,
            `*Request:* ${requestId}`,
          ].join("\n") }),
        });
      } catch (e: any) { errors.push(`slack: ${e?.message ?? "unknown"}`); }
    }

    console.log(JSON.stringify({ ts, request_id: requestId, source: "pricing", email_domain: domain, lead_class: leadClass,
      plan: q.plan, billing: q.billing, monthly_total: q.monthly_total, mail, apollo_contact_id: contactId, errors }));
  })());

  return json({ ok: true, request_id: requestId, visitor_id: `pv_${vid}`, plan: q.plan, billing: q.billing,
                monthly_total: q.monthly_total, annual_contract_value: q.annual_contract_value });
}

/** Contact on the pricing-request list. No sequence: Will follows up himself. */
async function syncApolloPricing(env: Env, email: string, name: string | null, company: string | null,
                                 errors: string[]): Promise<string | null> {
  if (!env.APOLLO_API_KEY) return null;
  const headers = { "Content-Type": "application/json", "X-Api-Key": env.APOLLO_API_KEY };
  let contact: ApolloContact | null;
  try {
    contact = await findContact(env, email, headers);
  } catch (e: any) {
    errors.push(`apollo_lookup: ${e?.message ?? "unknown"}`);
    return null;   // a failed lookup is "unknown", not "no match": never create on it
  }
  if (!contact) {
    const [first, ...rest] = (name || "").split(/\s+/).filter(Boolean);
    const res = await fetch(`${APOLLO_API}/v1/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, label_names: [PRICING_REQUEST_LIST],
        ...(first ? { first_name: first } : {}), ...(rest.length ? { last_name: rest.join(" ") } : {}),
        ...(company ? { organization_name: company } : {}) }),
    });
    if (!res.ok) { errors.push(`apollo_create_contact: ${res.status}`); return null; }
    contact = ((await res.json()) as { contact?: ApolloContact }).contact ?? null;
    if (!contact?.id) { errors.push("apollo_create_contact: no id returned"); return null; }
  } else {
    await addToList(contact, headers, errors, PRICING_REQUEST_LIST);
  }
  if (!contact.first_name) await enrich(contact, email, headers, errors);
  return contact.id;
}

interface Who {
  email: string; name: string | null; company: string | null; leadClass: string; cameFrom: string;
  pageUrl: string; contactId: string | null; requestId: string;
}

async function sendEmails(env: Env, q: Quote, who: Who, errors: string[]): Promise<string> {
  const from = env.ORDER_FROM || "Pacer AI <orders@mail.getpacerai.com>";
  const will = env.ORDER_NOTIFY_TO || "will@getpacerai.com";
  const rows = summaryRows(q);
  const table = (extra: [string, string][] = []) =>
    `<table style="border-collapse:collapse;font:14px/1.5 -apple-system,Segoe UI,sans-serif;color:#20242B">${
      [...rows, ...extra].map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#5F5A50">${esc(k)}</td><td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`).join("")
    }</table>`;
  const text = (extra: [string, string][] = []) => [...rows, ...extra].map(([k, v]) => `${k}: ${v}`).join("\n");
  const hi = who.name ? `Hi ${who.name.split(/\s+/)[0]},` : "Hi,";
  const headline = q.annual_contract_value !== null ? `${usd(q.annual_contract_value)} ACV` : `${usd(q.monthly_total)}/mo`;

  const visitor = {
    from, to: [who.email], reply_to: will,
    subject: `Your Pacer AI pricing summary: ${q.package_name}`,
    html: `<div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#20242B;max-width:560px">
<p>${esc(hi)}</p>
<p>Here is the selection you made on getpacerai.com/pricing/.</p>
${table()}
<p style="color:#5F5A50;font-size:13px">The first CRM integration is included. Prices from Price Book ${esc(q.price_book_version)}. No payment has been taken.</p>
<p>Will Sullivan will reply within one business day to set up your kickoff and send the order form. Reply to this email with any questions.</p>
<p>Pacer AI &middot; <a href="https://getpacerai.com" style="color:#1F3864">getpacerai.com</a></p>
</div>`,
    text: `${hi}\n\nHere is the selection you made on getpacerai.com/pricing/.\n\n${text()}\n\nThe first CRM integration is included. Prices from Price Book ${q.price_book_version}. No payment has been taken.\n\nWill Sullivan will reply within one business day to set up your kickoff and send the order form. Reply to this email with any questions.\n\nPacer AI · getpacerai.com`,
  };
  const about: [string, string][] = [
    ["Email", who.email], ["Name", who.name || "—"], ["Company", who.company || "—"], ["Classification", who.leadClass],
    ["Came from", who.cameFrom || "—"], ["Page", who.pageUrl],
    ["Apollo", who.contactId ? `https://app.apollo.io/#/people/${who.contactId}` : "(no contact)"], ["Request", who.requestId],
  ];
  const internal = {
    from, to: [will], reply_to: who.email,
    subject: `Pricing request: ${who.company || who.email.split("@")[1]}, ${q.package_name}, ${headline}`,
    html: `<div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#20242B">${table(about)}</div>`,
    text: text(about),
  };

  const out: string[] = [];
  for (const [label, msg] of [["visitor", visitor], ["Will", internal]] as const) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
      if (res.ok) out.push(`${label} sent`);
      else {
        // Resend's own message goes to Slack: a 401 or 403 says "API key is invalid" or "domain is not
        // verified", which is the fix (docs/deploy/order-email-setup.md).
        const body = (await res.text()).slice(0, 300);
        let why = "";
        try { why = String((JSON.parse(body) as { message?: string }).message || "").slice(0, 120); } catch { /* not JSON */ }
        out.push(`${label} failed (${res.status}${why ? `: ${why}` : ""})`);
        errors.push(`resend_${label}: ${res.status} ${body}`);
      }
    } catch (e: any) {
      out.push(`${label} failed`); errors.push(`resend_${label}: ${e?.message ?? "unknown"}`);
    }
  }
  return out.join(", ");
}
