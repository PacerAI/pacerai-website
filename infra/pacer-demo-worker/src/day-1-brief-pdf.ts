/**
 * "Send me October's brief as a PDF" (PAC-105): the fallback for a visitor who doesn't use Claude.
 *
 *   GET  /day-1-brief-pdf   the form (work email, company, the bot check), framed by the post at
 *                           getpacerai.com/resources/what-a-day-1-brief-contains/. WordPress strips scripts from page
 *                           HTML, so the bot check can't live in the post itself.
 *   POST /day-1-brief-pdf   JSON {email, company, token, utm_*?, page?}. Refuses a bad email or a missing company (400),
 *                           a missing token (400), a failed bot check (403) and a disposable address (400): a refused
 *                           request sends nothing and logs nothing. Otherwise it answers 200, then:
 *                             - writes one `leads` row (source 'resource', asset_slug 'day-1-brief-pdf');
 *                             - emails the PDF's short link through Resend, at most once per address per 10 minutes
 *                               (every request still gets its row), and never to an address on `email_optouts`;
 *                             - posts the lead to Slack.
 *
 * The answer is the same whether or not the email went, so the form doesn't reveal who is on the opt-out list.
 * Not demo access: nothing here touches DEMO_SIGNUPS. No Apollo contact or sequence: enrolment is Will's call.
 */
import { FRAME_HEADERS, classify, deriveWebsite, isHostingOrigin, json, type Env } from "./shared";

const ASSET_SLUG = "day-1-brief-pdf";
// The short link, never the file: the PDF behind it can be replaced without a new email going stale.
const PDF_LINK = "https://getpacerai.com/day-1-brief-pdf/";
const POST_PAGE = "/resources/what-a-day-1-brief-contains/";
const WINDOW_MS = 10 * 60 * 1000;

export async function handleDay1BriefPdf(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method === "POST") return handleRequest(request, env, ctx);
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD, POST" } });
  }
  return new Response(formHtml(env.TURNSTILE_SITE_KEY || ""), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...FRAME_HEADERS },
  });
}

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const str = (v: unknown, n = 120) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
  const path = (v: unknown) => { const x = str(v, 200); return x && /^\/(?!\/)[\w\-./]*$/.test(x) ? x : null; };
  const email = (str(body.email, 254) || "").toLowerCase();
  const company = str(body.company, 200);
  const token = str(body.token, 4096) || "";
  const utm = { source: str(body.utm_source), medium: str(body.utm_medium), campaign: str(body.utm_campaign) };
  const page = path(body.page);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "invalid_email" }, 400);
  if (!company) return json({ error: "missing_company" }, 400);
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

  const ts = new Date().toISOString();
  const requestId = `resource_${ts}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const pageUrl = `https://getpacerai.com${page || POST_PAGE}`;
  const website = deriveWebsite(domain, leadClass);
  const cameFrom = [utm.source && `${utm.source}${utm.medium ? ` / ${utm.medium}` : ""}`,
                    utm.campaign && `campaign ${utm.campaign}`].filter(Boolean).join(" · ");

  ctx.waitUntil((async () => {
    const errors: string[] = [];
    let mail = "not sent";

    // The send decision is made before this request's own row goes in, so the first request counts none.
    let repeat = false;
    let optedOut = false;
    let checked = false;
    if (env.LEADS) {
      try {
        const row = await env.LEADS.prepare(
          `SELECT COUNT(*) AS n FROM leads WHERE email = ? AND source = 'resource' AND asset_slug = ? AND created_at > ?`
        ).bind(email, ASSET_SLUG, new Date(Date.now() - WINDOW_MS).toISOString()).first<{ n: number }>();
        repeat = (row?.n ?? 0) > 0;
        const out = await env.LEADS.prepare(`SELECT 1 AS found FROM email_optouts WHERE email = ?`)
          .bind(email).first<{ found: number }>();
        optedOut = !!out;
        checked = true;
      } catch (e: any) { errors.push(`d1_checks: ${e?.message ?? "unknown"}`); }

      try {
        await env.LEADS.prepare(
          `INSERT INTO leads (request_id, email, email_domain, company, lead_class, source, asset_slug, page_url,
             utm_source, utm_medium, utm_campaign, ip, created_at, website, as_org, apollo_contact_id, enrolled_sequence)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        ).bind(requestId, email, domain, company, leadClass, "resource", ASSET_SLUG, pageUrl,
               utm.source, utm.medium, utm.campaign, ip || null, ts, website, asOrg ?? null, null, null).run();
      } catch (e: any) { errors.push(`d1_leads: ${e?.message ?? "unknown"}`); }
    }

    // No send unless both checks ran: an opt-out that couldn't be read is treated as held, and a repeat that
    // couldn't be counted as a repeat.
    if (!env.RESEND_API_KEY) mail = "not sent: no RESEND_API_KEY";
    else if (!checked) mail = "not sent: opt-outs and repeats could not be checked";
    else if (optedOut) mail = "not sent: on the opt-out list";
    else if (repeat) mail = "not sent: repeat request within 10 minutes";
    else mail = await sendPdfLink(env, email, errors);

    // A repeat within the window is saved but doesn't ping Slack again.
    if (env.SLACK_WEBHOOK_URL && !repeat) {
      try {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: [
            `${leadClass === "valid_lead" ? ":page_facing_up:" : leadClass === "internal" ? ":test_tube:" : ":warning:"} *Day 1 brief PDF request — ${leadClass.replace("_", " ")}*`,
            `*Email:* ${email}`,
            `*Company:* ${company}`,
            `*Classification:* ${leadClass}`,
            ...(isHostingOrigin(asOrg) ? [`*:warning: Origin:* ${asOrg} (datacenter, not an office network)`] : []),
            ...(website ? [`*Website:* ${website}`] : []),
            `*Source:* resource`,
            `*Page:* ${pageUrl}`,
            ...(cameFrom ? [`*Came from:* ${cameFrom}`] : []),
            `*Email sent:* ${mail}`,
            `*Request:* ${requestId}`,
          ].join("\n") }),
        });
      } catch (e: any) { errors.push(`slack: ${e?.message ?? "unknown"}`); }
    }

    // The row and the Slack alert carry a clean request; a log line is for one that hit a snag.
    if (errors.length) {
      console.error(JSON.stringify({ ts, request_id: requestId, source: "resource", asset_slug: ASSET_SLUG,
        email_domain: domain, lead_class: leadClass, mail, errors }));
    }
  })());

  return json({ ok: true, request_id: requestId });
}

async function sendPdfLink(env: Env, email: string, errors: string[]): Promise<string> {
  const from = env.ORDER_FROM || "Pacer AI <orders@mail.getpacerai.com>";
  const replyTo = env.ORDER_NOTIFY_TO || "will@getpacerai.com";
  const message = {
    from, to: [email], reply_to: replyTo,
    subject: "October's Day 1 brief, as a PDF",
    html: `<div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#20242B;max-width:560px">
<p>Hi,</p>
<p>Here is the October Day 1 brief: <a href="${PDF_LINK}" style="color:#1F3864">${PDF_LINK}</a></p>
<p>It is 13 pages and is built on Pacer AI&rsquo;s demo data, not a customer&rsquo;s. Reply to this email with any questions.</p>
<p>Will Sullivan<br>Pacer AI &middot; <a href="https://getpacerai.com" style="color:#1F3864">getpacerai.com</a></p>
</div>`,
    text: `Hi,\n\nHere is the October Day 1 brief: ${PDF_LINK}\n\nIt is 13 pages and is built on Pacer AI's demo data, not a customer's. Reply to this email with any questions.\n\nWill Sullivan\nPacer AI · getpacerai.com`,
  };
  // Trimmed: a key pasted with a space or newline is otherwise rejected as invalid.
  const key = (env.RESEND_API_KEY || "").trim();
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (res.ok) return "sent";
    const body = (await res.text()).slice(0, 300);
    let why = "";
    try { why = String((JSON.parse(body) as { message?: string }).message || "").slice(0, 120); } catch { /* not JSON */ }
    errors.push(`resend: ${res.status} ${body}`);
    return `failed (${res.status}${why ? `: ${why}` : ""})`;
  } catch (e: any) {
    errors.push(`resend: ${e?.message ?? "unknown"}`);
    return "failed";
  }
}

function formHtml(siteKey: string): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Send me October's brief as a PDF — Pacer AI</title>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
<style>
  :root{--bone:#F5F4EF;--surface:#FAFAF7;--navy:#1F3864;--navy-dark:#16294a;--teal:#2E7D74;--ink:#20242B;--muted:#5F5A50;--line:#E6E1D6}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:var(--bone)}
  body{font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--ink);line-height:1.5;padding:14px}
  .card{max-width:520px;margin:0 auto;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px 22px}
  .kick{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9A8F78;font-weight:700;margin-bottom:8px}
  h2{font-size:20px;font-weight:800;color:var(--ink);letter-spacing:-.3px;margin-bottom:6px}
  p{font-size:14.5px;color:var(--muted);margin-bottom:14px}
  label{display:block;font-size:13px;font-weight:700;color:var(--ink);margin:0 0 6px}
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
</style></head>
<body>
<div class="card">
  <div id="s1">
    <div class="kick">Day 1 brief</div>
    <h2>Get October&rsquo;s brief as a PDF</h2>
    <p>Tell us where to send it. It is the 13-page deck this post walks through.</p>
    <div class="two">
      <div class="row"><label for="email">Work email</label><input id="email" name="email" type="email" placeholder="you@company.com" autocomplete="email"></div>
      <div class="row"><label for="company">Company</label><input id="company" name="company" type="text" placeholder="Company name" autocomplete="organization"></div>
    </div>
    <div class="cf"><div id="cf"></div></div>
    <button id="send" disabled>Send me October&rsquo;s brief as a PDF</button>
    <div class="err" id="err"></div>
  </div>
  <div id="s2" class="hide">
    <div class="kick">Sent</div>
    <h2>Check your inbox</h2>
    <p id="sentTo"></p>
  </div>
</div>
<script>
(function(){
  var SITEKEY=${JSON.stringify(siteKey)}, token='', widgetId=null, busy=false;
  // Attribution from the post (footer.js 2b) rides along with the request.
  var qs=new URLSearchParams(location.search), attr={};
  ['utm_source','utm_medium','utm_campaign','page'].forEach(function(k){ var v=qs.get(k); if(v){ attr[k]=v.slice(0,200); } });
  var send=document.getElementById('send'), err=document.getElementById('err');
  function valid(e){ return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(e); }
  (function go(){
    if(!window.turnstile){ setTimeout(go,200); return; }
    widgetId=window.turnstile.render('#cf',{ sitekey:SITEKEY, action:'day-1-brief-pdf',
      callback:function(t){ token=t; send.disabled=false; },
      'expired-callback':function(){ token=''; send.disabled=true; },
      'error-callback':function(){ err.textContent='Bot check failed. Reload and try again.'; } });
  })();
  send.addEventListener('click',function(){
    var email=(document.getElementById('email').value||'').trim(), company=(document.getElementById('company').value||'').trim();
    if(!valid(email)){ err.textContent='Please enter a valid work email.'; return; }
    if(!company){ err.textContent='Please enter your company.'; return; }
    if(!token||busy){ return; }
    busy=true; send.disabled=true; err.textContent='Sending…';
    fetch('/day-1-brief-pdf',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify(Object.assign({email:email,company:company,token:token},attr))})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d&&d.ok){
          document.getElementById('sentTo').textContent='We sent the October brief to '+email+'.';
          document.getElementById('s1').classList.add('hide'); document.getElementById('s2').classList.remove('hide');
          if(window.turnstile&&widgetId!==null){ try{ window.turnstile.remove(widgetId); }catch(e){} }
        } else {
          busy=false; token=''; if(window.turnstile&&widgetId!==null){ window.turnstile.reset(widgetId); }
          err.textContent=(d&&d.error==='disposable_email')?'Please use your work email.':(d&&d.error==='turnstile_failed')?'Bot check failed. Please try again.':'Something went wrong. Please try again.';
        }
      })
      .catch(function(){ busy=false; send.disabled=!token; err.textContent='Network error. Please try again.'; });
  });
})();
</script>
</body></html>`;
}
