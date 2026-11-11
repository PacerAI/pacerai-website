/**
 * Order capture for getpacerai.com/pricing/ (Will, 2026-10-14; seats since Price Book v2.0, 2026-11-10).
 *
 * The flow (purchase process steps 2 and 3; PAC-260 holds the paperwork after this):
 *   1. A visitor sets seats on /pricing/ (Rep pacing, Manager pacing, SLT pacing and planning) and clicks
 *      Purchase.
 *   2. The page opens GET /order in a modal iframe. The URL carries the contract term, the seat counts
 *      (rep, mgr, slt) and first-touch attribution, never an email and never a total.
 *   3. The card shows the order, recomputed HERE from price-book.json, and collects the billing details,
 *      an optional PO number and the Order Terms checkbox. The checkbox names the MSA; the link is added
 *      when Price has drafted it (MSA_URL).
 *   4. POST /pricing-request recomputes the totals again. A total sent by the page is accepted only when
 *      it matches that recomputation. Then it:
 *        - writes a `leads` row (source "pricing"), so the nightly lead stamping and HQ count it;
 *        - writes a `pricing_requests` row with status "submitted", the seats and the billing columns
 *          (needs migrations 0005_pricing_seats.sql and 0006_orders.sql);
 *        - adds the contact to the Apollo list Signal_CONTACT_Website_PricingRequest (no sequence: Will follows
 *          up himself);
 *        - emails the order confirmation to the buyer (reply-to Will) and to Will, through Resend, with the
 *          Book your kickoff link;
 *        - posts to Slack.
 *      It answers with an opaque visitor id, which the card hands to the page as the GA4 user_id, and the
 *      kickoff URL the success screen opens.
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
const MAX_SEATS = 500;   // the page's stepper ceiling
// After the order is saved, the card and the confirmation email offer this Calendly event (Will, 2026-11-10).
const ONBOARDING = "https://calendly.com/pacerai/pacer-ai-onboarding";
// The Order Terms are the MSA. Price drafts it (PAC-260). Empty until that URL exists; the checkbox still names it.
const MSA_URL = "";

type SeatKey = keyof typeof priceBook.seats;
const SEAT_KEYS: SeatKey[] = ["rep", "manager", "slt"];
const SHORT: Record<SeatKey, string> = { rep: "Rep", manager: "Manager", slt: "SLT" };

export interface Selection {
  billing: "annual" | "monthly";   // annual = the 12-month contract
  rep: number;
  manager: number;
  slt: number;
}

export interface Quote extends Selection {
  plan: "seats";
  seats: number;
  lines: { key: SeatKey; name: string; n: number; price: number }[];   // price per user on this term
  value: number;                          // month to month: per month; 12 months: the 12-month total
  monthly_total: number;                  // per month; on 12 months the 12-month total / 12, rounded (D1 only)
  annual_contract_value: number | null;   // 12-month contract only
  setup_fee: number;                      // installation owed with an SLT seat: a service, recorded for Will, never in the seat total
  price_book_version: string;
}

/** The selection from a query string or a POST body. Missing counts take the page's default (1 Rep, 1 Manager). */
export function parseSelection(src: Record<string, unknown>): Selection | null {
  const billing = src.billing === "monthly" ? "monthly" : src.billing === "annual" ? "annual" : null;
  if (!billing) return null;
  const int = (v: unknown, d: number) => {
    const n = Math.floor(Number(v));
    return v === undefined || v === null || v === "" || !Number.isFinite(n) ? d : Math.min(MAX_SEATS, Math.max(0, n));
  };
  const s = { billing, rep: int(src.rep, 1), manager: int(src.mgr ?? src.manager, 1), slt: int(src.slt, 0) } as Selection;
  return s.rep + s.manager + s.slt > 0 ? s : null;
}

/** The same arithmetic as src/pricing/pricing.js on the page, from the Worker's own copy of the Price Book. */
export function quote(s: Selection): Quote {
  const annual = s.billing === "annual";
  const lines = SEAT_KEYS.filter((k) => s[k] > 0)
    .map((k) => ({ key: k, name: priceBook.seats[k].name, n: s[k], price: annual ? priceBook.seats[k].a : priceBook.seats[k].m }));
  const value = lines.reduce((t, l) => t + l.n * l.price, 0);
  return {
    ...s, plan: "seats", seats: s.rep + s.manager + s.slt, lines, value,
    monthly_total: annual ? Math.round(value / 12) : value,
    annual_contract_value: annual ? value : null,
    setup_fee: s.slt > 0 ? priceBook.setup.slt : 0,
    price_book_version: priceBook.version,
  };
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "1 Rep · 1 Manager · 0 SLT", as the page's team summary says it. */
export const seatLine = (q: Quote) => SEAT_KEYS.map((k) => `${q[k]} ${SHORT[k]}`).join(" · ");
/** "$600/mo" or "$6,000 for 12 months". Seats only: installation and services are priced separately. */
export const headline = (q: Quote) =>
  q.annual_contract_value !== null ? `${usd(q.value)} for 12 months` : `${usd(q.value)}/mo`;

const TOTALS = new Set(["Monthly total", "12-month total"]);

/** Summary lines shared by the card, both emails and Slack: [label, value]. */
export function summaryRows(q: Quote): [string, string][] {
  const annual = q.annual_contract_value !== null;
  const rows: [string, string][] = [
    ["Contract", annual ? "12 months, billed monthly (two months free)" : "Month to month"],
    ...q.lines.map((l): [string, string] => [l.name, `${l.n} × ${usd(l.price)}/user/${annual ? "yr" : "mo"}`]),
    annual ? ["12-month total", usd(q.value)] : ["Monthly total", `${usd(q.value)}/mo`],
  ];
  return rows;
}

const NOTE = `Installation and services are priced separately. Prices from Price Book ${priceBook.version}.`;
const REVIEW = "Will reviews every order. Your MSA, mutual NDA and invoice arrive before your kickoff.";
const PAY_NOTE = `No payment is taken here. ${REVIEW}`;

/** Calendly prefill: the buyer's name and email, and the order id in utm_content so a later webhook can match it. */
export function kickoffUrl(name: string | null, email: string, requestId: string): string {
  const u = new URL(ONBOARDING);
  if (name) u.searchParams.set("name", name);
  u.searchParams.set("email", email);
  u.searchParams.set("utm_content", requestId);
  return u.toString();
}

/** A total the page claims. Missing means the page sent none (the card does not). NaN means it sent garbage. */
function claimedTotal(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : Number.NaN;
}

function termsAccepted(v: unknown): boolean {
  return v === true || v === 1 || v === "1" || v === "true" || v === "on" || v === "yes";
}

// ── GET /order ────────────────────────────────────────────────────────────────

export function orderPage(url: URL, env: Env): Response {
  const sel = parseSelection(Object.fromEntries(url.searchParams));
  if (!sel) {
    return new Response("Choose at least one seat", { status: 400, headers: { "content-type": "text/plain; charset=utf-8", ...FRAME_HEADERS } });
  }
  return new Response(orderHtml(env.TURNSTILE_SITE_KEY || "", quote(sel)), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...FRAME_HEADERS },
  });
}

function orderHtml(siteKey: string, q: Quote): string {
  const rows = summaryRows(q)
    .map(([k, v]) => `<tr${TOTALS.has(k) ? ' class="tot"' : ""}><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("");
  const sel = JSON.stringify({ billing: q.billing, rep: q.rep, mgr: q.manager, slt: q.slt });
  const msa = MSA_URL
    ? `<a href="${esc(MSA_URL)}" target="_blank" rel="noopener">Master Services Agreement</a>`
    : "Master Services Agreement";
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Your order — Pacer AI</title>
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
  input[type="checkbox"]{width:18px;height:18px;padding:0;margin-top:2px;flex:none;accent-color:var(--navy)}
  .check{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;font-weight:500;line-height:1.45;margin:2px 0 14px;color:var(--ink)}
  .row{margin-bottom:12px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  @media(max-width:420px){.two{grid-template-columns:1fr}}
  button{width:100%;font-family:inherit;font-weight:700;font-size:15px;padding:13px 18px;border-radius:10px;border:1px solid var(--navy);background:var(--navy);color:#fff;cursor:pointer}
  button:hover{background:var(--navy-dark)}
  button:disabled{opacity:.5;cursor:not-allowed}
  a.btn{display:block;text-align:center;text-decoration:none;font-weight:700;font-size:15px;padding:13px 18px;border-radius:10px;border:1px solid var(--navy);background:var(--navy);color:#fff}
  a.btn:hover{background:var(--navy-dark)}
  .hide{display:none}
  .err{color:#B4232A;font-size:13.5px;margin-top:10px;min-height:1em}
  .cf{display:flex;justify-content:center;margin:4px 0 12px}
  .note{font-size:12px;color:var(--muted);margin-top:10px}
  a{color:var(--navy);font-weight:700}
</style></head>
<body>
<div class="card">
  <div id="s1">
    <div class="kick">Your order</div>
    <h2>Confirm your seats</h2>
    <table>${rows}</table>
    <div class="row">
      <label for="email">Work email</label>
      <input id="email" type="email" placeholder="you@company.com" autocomplete="email" required>
    </div>
    <div class="row"><label for="name">Name <span>(optional)</span></label><input id="name" type="text" autocomplete="name"></div>
    <div class="row">
      <label for="company">Company legal name</label>
      <input id="company" type="text" autocomplete="organization" required>
    </div>
    <div class="row">
      <label for="billing-email">Billing email <span>(defaults to your work email)</span></label>
      <input id="billing-email" type="email" autocomplete="email">
    </div>
    <div class="row">
      <label for="street">Billing address</label>
      <input id="street" type="text" autocomplete="street-address" placeholder="Street" required>
    </div>
    <div class="two">
      <div class="row"><label for="city">City</label><input id="city" type="text" autocomplete="address-level2" required></div>
      <div class="row"><label for="region">State or region</label><input id="region" type="text" autocomplete="address-level1" required></div>
    </div>
    <div class="two">
      <div class="row"><label for="postal">Postal code</label><input id="postal" type="text" autocomplete="postal-code" required></div>
      <div class="row"><label for="country">Country</label><input id="country" type="text" autocomplete="country-name" required></div>
    </div>
    <div class="row">
      <label for="po">PO number <span>(optional)</span></label>
      <input id="po" type="text" autocomplete="off" maxlength="64">
    </div>
    <label class="check" for="terms">
      <input id="terms" type="checkbox">
      <span>I agree that this order is governed by the Pacer AI ${msa}, sent for signature before the kickoff.</span>
    </label>
    <div class="cf"><div id="cf"></div></div>
    <button id="send" disabled>Purchase</button>
    <div class="err" id="err"></div>
    <div class="note">${esc(PAY_NOTE)} ${esc(NOTE)}</div>
  </div>
  <div id="s2" class="hide">
    <div class="kick">Order received</div>
    <h2>Your confirmation is on its way</h2>
    <p id="sentTo"></p>
    <a class="btn" id="kickoff" href="${esc(ONBOARDING)}" target="_blank" rel="noopener">Book your kickoff</a>
    <p class="note">${esc(REVIEW)}</p>
  </div>
</div>
<script>
(function(){
  var SITEKEY=${JSON.stringify(siteKey)}, SEL=${sel}, token='', widgetId=null, busy=false;
  var qs=new URLSearchParams(location.search), attr={};
  ['utm_source','utm_medium','utm_campaign','landing','page'].forEach(function(k){ var v=qs.get(k); if(v){ attr[k]=v.slice(0,200); } });
  var send=document.getElementById('send'), err=document.getElementById('err');
  var emailEl=document.getElementById('email'), billEl=document.getElementById('billing-email');
  function post(msg){ try{ if(window.parent!==window){ window.parent.postMessage(msg,'https://getpacerai.com'); } }catch(e){} }
  function resize(){ post({type:'pacer:resize',height:document.documentElement.scrollHeight}); }
  function valid(e){ return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(e); }
  function val(id){ return (document.getElementById(id).value||'').trim(); }
  emailEl.addEventListener('change',function(){ if(!billEl.value.trim()) billEl.value=emailEl.value.trim(); });
  document.getElementById('kickoff').addEventListener('click',function(){ post({type:'pacer:event',name:'schedule_walkthrough',params:{cta_location:'order_card_onboarding'}}); });
  (function go(){
    if(!window.turnstile){ setTimeout(go,200); return; }
    widgetId=window.turnstile.render('#cf',{ sitekey:SITEKEY, action:'pricing-request',
      callback:function(t){ token=t; send.disabled=false; resize(); },
      'expired-callback':function(){ token=''; send.disabled=true; },
      'error-callback':function(){ err.textContent='Bot check failed. Reload and try again, or email will@getpacerai.com.'; } });
    resize();
  })();
  send.addEventListener('click',function(){
    var email=val('email');
    var billing=val('billing-email')||email;
    var company=val('company');
    var street=val('street'), city=val('city'), region=val('region'), postal=val('postal'), country=val('country');
    if(!valid(email)){ err.textContent='Please enter a valid work email.'; return; }
    if(!company){ err.textContent='Please enter your company legal name.'; return; }
    if(!valid(billing)){ err.textContent='Please enter a valid billing email.'; return; }
    if(!street||!city||!region||!postal||!country){ err.textContent='Please complete the billing address.'; return; }
    if(!document.getElementById('terms').checked){ err.textContent='Please agree to the Order Terms.'; return; }
    if(!token||busy){ return; }
    busy=true; send.disabled=true; err.textContent='Sending…';
    fetch('/pricing-request',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify(Object.assign({
        email:email, name:val('name'), company:company, billing_email:billing,
        billing_street:street, billing_city:city, billing_region:region, billing_postal:postal, billing_country:country,
        po_number:val('po'), terms:true, token:token
      },SEL,attr))})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d&&d.ok){
          post({type:'pacer:event',name:'pricing_request',params:{plan:d.plan,billing:d.billing,value:d.value,currency:'USD',user_id:d.visitor_id||''}});
          if(d.kickoff_url) document.getElementById('kickoff').href=d.kickoff_url;
          document.getElementById('sentTo').textContent='We sent the confirmation to '+email+'.';
          document.getElementById('s1').classList.add('hide'); document.getElementById('s2').classList.remove('hide'); resize();
          if(window.turnstile&&widgetId!==null){ try{ window.turnstile.remove(widgetId); }catch(e){} }
        } else {
          busy=false; token=''; if(window.turnstile&&widgetId!==null){ window.turnstile.reset(widgetId); }
          var code=d&&d.error;
          err.textContent=code==='disposable_email'?'Please use your work email.'
            :code==='turnstile_failed'?'Bot check failed. Please try again.'
            :code==='missing_company'?'Please enter your company legal name.'
            :(code==='missing_billing'||code==='invalid_billing_email')?'Please complete the billing email and address.'
            :code==='terms'?'Please agree to the Order Terms.'
            :code==='total_mismatch'?'This total does not match the Price Book. Reload and try again.'
            :'Something went wrong. Please try again or email will@getpacerai.com.';
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
  const emailOk = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  const email = (str(body.email, 254) || "").toLowerCase();
  const token = str(body.token, 4096) || "";
  const name = str(body.name, 120);
  const company = str(body.company, 200);
  const billingEmail = (str(body.billing_email, 254) || email).toLowerCase();
  const street = str(body.billing_street, 200);
  const city = str(body.billing_city, 120);
  const region = str(body.billing_region, 120);
  const postal = str(body.billing_postal, 32);
  const country = str(body.billing_country, 80);
  const po = str(body.po_number, 64);
  const attr = { utm_source: str(body.utm_source), utm_medium: str(body.utm_medium), utm_campaign: str(body.utm_campaign),
                 landing: path(body.landing), page: path(body.page) };
  const sel = parseSelection(body);
  if (!sel) return json({ error: "bad_selection" }, 400);
  if (!emailOk(email)) return json({ error: "invalid_email" }, 400);
  if (!company) return json({ error: "missing_company" }, 400);
  if (!emailOk(billingEmail)) return json({ error: "invalid_billing_email" }, 400);
  if (!street || !city || !region || !postal || !country) return json({ error: "missing_billing" }, 400);
  if (!termsAccepted(body.terms)) return json({ error: "terms" }, 400);
  // The seat total is computed here. A total the page sends is rejected when it disagrees.
  const q = quote(sel);
  const claimed = claimedTotal(body.value);
  const claimedMonth = claimedTotal(body.monthly_total);
  if ((claimed !== null && claimed !== q.value) || (claimedMonth !== null && claimedMonth !== q.monthly_total)) {
    return json({ error: "total_mismatch" }, 400);
  }
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
  if (classify(billingEmail.split("@")[1] ?? "", asOrg) === "disposable") return json({ error: "disposable_email" }, 400);

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
  const kickoff = kickoffUrl(name, email, requestId);
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
        ).bind(requestId, email, domain, company, leadClass, "pricing", `pricing-seats-${q.billing}`, pageUrl,
               attr.utm_source, attr.utm_medium, attr.utm_campaign, ip || null, ts, website, asOrg ?? null, contactId, null).run();
      } catch (e: any) { errors.push(`d1_leads: ${e?.message ?? "unknown"}`); }
      try {
        await env.LEADS.prepare(
          `INSERT INTO pricing_requests (request_id, created_at, email, name, company, lead_class, plan, billing,
             pacer_users, planning_users, hour_blocks, rep_seats, manager_seats, slt_seats, setup_fee,
             monthly_total, annual_contract_value, price_book_version,
             utm_source, utm_medium, utm_campaign, landing, page_url, apollo_contact_id, status,
             billing_email, billing_street, billing_city, billing_region, billing_postal, billing_country,
             po_number, terms_accepted_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        // The v1 NOT NULL columns stay filled: pacer_users = Rep + Manager pacing seats, planning_users = SLT
        // seats, hour_blocks = 0 (retired in v2.0). Seat columns: migration 0005. Billing columns: 0006.
        // Legal name reuses company. Status is written here; D1 cannot ALTER the old default.
        ).bind(requestId, ts, email, name, company, leadClass, q.plan, q.billing, q.rep + q.manager, q.slt, 0,
               q.rep, q.manager, q.slt, q.setup_fee, q.monthly_total, q.annual_contract_value, q.price_book_version,
               attr.utm_source, attr.utm_medium, attr.utm_campaign, attr.landing, pageUrl, contactId, "submitted",
               billingEmail, street, city, region, postal, country, po, ts).run();
      } catch (e: any) { errors.push(`d1_pricing_requests: ${e?.message ?? "unknown"}`); }
    }

    let mail = "not sent: no RESEND_API_KEY";
    if (env.RESEND_API_KEY && recent < 3) {
      mail = await sendEmails(env, q, {
        email, name, company, leadClass, cameFrom, pageUrl, contactId, requestId,
        billingEmail, street, city, region, postal, country, po, kickoff,
      }, errors);
    } else if (recent >= 3) {
      mail = "not sent: repeat request within 10 minutes";
    }

    if (env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: [
            `${leadClass === "internal" ? ":test_tube:" : ":moneybag:"} *Order: ${seatLine(q)}, ${headline(q)}*`,
            `*Email:* ${email}`,
            ...(name ? [`*Name:* ${name}`] : []),
            `*Company legal name:* ${company}`,
            `*Billing email:* ${billingEmail}`,
            `*Billing address:* ${[street, city, region, postal, country].join(", ")}`,
            `*PO number:* ${po || "—"}`,
            ...(q.setup_fee > 0 ? [`*SLT installation:* ${usd(q.setup_fee)} on the first invoice, not in the seat total`] : []),
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
      plan: q.plan, billing: q.billing, rep: q.rep, manager: q.manager, slt: q.slt, value: q.value, mail, apollo_contact_id: contactId, errors }));
  })());

  return json({ ok: true, request_id: requestId, visitor_id: `pv_${vid}`, plan: q.plan, billing: q.billing,
                value: q.value, monthly_total: q.monthly_total, annual_contract_value: q.annual_contract_value,
                setup_fee: q.setup_fee, kickoff_url: kickoff });
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
  email: string; name: string | null; company: string; leadClass: string; cameFrom: string;
  pageUrl: string; contactId: string | null; requestId: string;
  billingEmail: string; street: string; city: string; region: string; postal: string; country: string;
  po: string | null; kickoff: string;
}

function addressLine(who: Who): string {
  return [who.street, who.city, who.region, who.postal, who.country].join(", ");
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
  const billed: [string, string][] = [
    ["Legal name", who.company],
    ["Billing email", who.billingEmail],
    ["Billing address", addressLine(who)],
    ...(who.po ? [["PO number", who.po] as [string, string]] : []),
  ];
  const kickoffButton =
    `<p style="margin:18px 0"><a href="${esc(who.kickoff)}" style="display:inline-block;background:#1F3864;color:#ffffff;font-weight:700;text-decoration:none;padding:12px 18px;border-radius:8px">Book your kickoff</a></p>`;

  const visitor = {
    from, to: [who.email], reply_to: will,
    subject: `Your Pacer AI order: ${seatLine(q)}`,
    html: `<div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#20242B;max-width:560px">
<p>${esc(hi)}</p>
<p>This confirms the order you placed on getpacerai.com/pricing/.</p>
${table(billed)}
${kickoffButton}
<p>${esc(REVIEW)}</p>
<p style="color:#5F5A50;font-size:13px">${esc(NOTE)} No payment has been taken.</p>
<p>Pacer AI &middot; <a href="https://getpacerai.com" style="color:#1F3864">getpacerai.com</a></p>
</div>`,
    text: `${hi}\n\nThis confirms the order you placed on getpacerai.com/pricing/.\n\n${text(billed)}\n\nBook your kickoff: ${who.kickoff}\n\n${REVIEW}\n\n${NOTE} No payment has been taken.\n\nPacer AI · getpacerai.com`,
  };
  const about: [string, string][] = [
    ["Email", who.email], ["Name", who.name || "—"], ["Company legal name", who.company],
    ["Billing email", who.billingEmail], ["Billing address", addressLine(who)], ["PO number", who.po || "—"],
    ...(q.setup_fee > 0 ? [["SLT installation", `${usd(q.setup_fee)} on the first invoice, not in the seat total`] as [string, string]] : []),
    ["Kickoff", who.kickoff],
    ["Classification", who.leadClass],
    ["Came from", who.cameFrom || "—"], ["Page", who.pageUrl],
    ["Apollo", who.contactId ? `https://app.apollo.io/#/people/${who.contactId}` : "(no contact)"], ["Request", who.requestId],
  ];
  const internal = {
    from, to: [will], reply_to: who.email,
    subject: `Order: ${who.company}, ${seatLine(q)}, ${headline(q)}`,
    html: `<div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#20242B">${table(about)}${kickoffButton}<p>${esc(REVIEW)}</p></div>`,
    text: `${text(about)}\n\n${REVIEW}\n\nBook your kickoff: ${who.kickoff}`,
  };

  // Trim: a key pasted with a space or newline is otherwise rejected as invalid. The shape note (never the
  // key itself) tells Slack when the stored value is not a Resend key at all.
  const key = (env.RESEND_API_KEY || "").trim();
  const shape = /^re_[A-Za-z0-9_]{20,}$/.test(key) ? "" : "; the stored RESEND_API_KEY does not look like a Resend key (re_…)";
  const out: string[] = [];
  for (const [label, msg] of [["visitor", visitor], ["Will", internal]] as const) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
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
  return out.join(", ") + (out.some((o) => o.includes("401")) ? shape : "");
}
