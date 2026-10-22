import demoHtml from "./demo.html";
import { withVideoBridge } from "./video-bridge";

// The homepage video, with the GA4 bridge added (src/video-bridge.ts) — computed once per isolate.
const demoPage = withVideoBridge(demoHtml);
import { FRAME_HEADERS, json, type Env } from "./shared";
import { recordDemoLead } from "./demo-lead";
import { handleConnectorSignIn } from "./connector-sign-in";
import { handlePricingRequest, orderPage } from "./order";
import { handleDemoSignups } from "./signups";

/**
 * pacer-demo-worker
 * -----------------
 * Serves (1) the self-contained Pacer AI "demo video" at `/` so the getpacerai.com homepage
 * can iframe it, and (2) the demo self-serve SIGNUP widget at `/signup` (email → Cloudflare
 * Turnstile → reveal the demo access password), which getpacerai.com/demo-connect iframes.
 *
 * Why the signup lives here and not on the WordPress page: WordPress strips inline <script>,
 * and serving the widget from the Worker keeps the shared password out of the page source —
 * it is only returned by POST /demo-signup AFTER Turnstile verifies (bots can't scrape it).
 *
 * Since 2026-10-21 the connector's own sign-in page (pacerai-demo-mcp) also sends each sign-in to
 * POST /internal/connector-sign-in, and both doors record the lead the same way (src/demo-lead.ts).
 *
 * Framing: responses allow embedding ONLY by getpacerai.com (CSP frame-ancestors).
 */



const CONNECTOR_URL = "https://demo.getpacerai.com/mcp";   // the HubSpot demo (pacerai-demo-hubspot-mcp), live once the domain is bound


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    // Self-serve signup POST (from the /signup widget, same-origin — no CORS needed).
    // Order capture from getpacerai.com/pricing/ (src/order.ts): the card, then its POST.
    if (url.pathname === "/pricing-request") {
      if (request.method !== "POST") {
        return json({ error: "method_not_allowed" }, 405);
      }
      return handlePricingRequest(request, env, ctx);
    }

    // The Daily Pace Briefing reads recent /demo-connect signups here (src/signups.ts; bearer token, read-only).
    if (url.pathname === "/internal/demo-signups") {
      return handleDemoSignups(request, env);
    }

    // The connector's sign-in page on pacerai-demo-mcp sends each sign-in here, so it becomes a demo lead like a
    // card signup (src/connector-sign-in.ts; bearer token, server to server).
    if (url.pathname === "/internal/connector-sign-in") {
      return handleConnectorSignIn(request, env, ctx);
    }

    if (url.pathname === "/demo-signup") {
      if (request.method !== "POST") {
        return json({ error: "method_not_allowed" }, 405);
      }
      return handleSignup(request, env, ctx);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    // The signup widget (iframed by getpacerai.com/demo-connect).
    if (url.pathname === "/signup") {
      // ?email= is passed through from a capture form elsewhere on the site
      // (e.g. the homepage hero) so the visitor doesn't type it twice.
      const prefill = (url.searchParams.get("email") || "").trim().slice(0, 254);
      return new Response(signupHtml(env.TURNSTILE_SITE_KEY, prefill), {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...FRAME_HEADERS },
      });
    }

    // The order card (iframed by getpacerai.com/pricing/ when a visitor clicks Choose).
    if (url.pathname === "/order") {
      return orderPage(url, env);
    }

    // The demo video (iframed by the homepage).
    return new Response(demoPage, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300", ...FRAME_HEADERS },
    });
  },
} satisfies ExportedHandler<Env>;


async function handleSignup(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let email = "";
  let token = "";
  let company = "";
  // Attribution, passed by the parent page (footer.js section 2b) into the iframe URL and
  // forwarded here by the widget: first-touch UTMs, landing page and the page holding the card.
  const attr = { utm_source: null as string | null, utm_medium: null as string | null, utm_campaign: null as string | null,
                 landing: null as string | null, page: null as string | null };
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const str = (v: unknown, n = 120) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
    const path = (v: unknown) => { const x = str(v, 200); return x && /^\/(?!\/)[\w\-./]*$/.test(x) ? x : null; };
    email = (str(body.email, 254) || "").toLowerCase();
    token = str(body.token, 4096) || "";
    company = str(body.company, 200) || "";
    attr.utm_source = str(body.utm_source);
    attr.utm_medium = str(body.utm_medium);
    attr.utm_campaign = str(body.utm_campaign);
    attr.landing = path(body.landing);
    attr.page = path(body.page);
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  // Basic email shape check (real verification is v2.0).
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "invalid_email" }, 400);
  }
  if (!token) {
    return json({ error: "missing_turnstile" }, 400);
  }

  // Verify the Turnstile token server-side (the bot gate).
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
  });
  const result = (await verify.json()) as { success: boolean };
  if (!result.success) {
    return json({ error: "turnstile_failed" }, 403);
  }

  // Record the lead: KV, then Apollo → D1 → Slack off the critical path (src/demo-lead.ts).
  const { vid } = await recordDemoLead(env, ctx, {
    email,
    company,
    ip,
    asOrg: (request as any).cf?.asOrganization as string | undefined,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    landing: attr.landing,
    pageUrl: `https://getpacerai.com${attr.page || "/demo-connect/"}`,
    assetSlug: "demo-access",
  });

  // Reveal access. Password comes from a Worker secret (kept in sync with the Azure MCP).
  return json({
    ok: true,
    connectorUrl: CONNECTOR_URL,
    password: env.PACER_DEMO_PASSWORD || null,
    visitor_id: `pv_${vid}`,   // GA4 user_id (see the KV comment above) — opaque, not personal data
  });
}

function signupHtml(siteKey: string, prefillEmail = ""): string {
  // Only ever lands in a value="" attribute; escape the characters that could
  // break out of it. Server-side validation still runs on POST regardless.
  const pf = prefillEmail.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const sk = siteKey || "";
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Get demo access — Pacer AI</title>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
<style>
  :root{--bone:#F5F4EF;--surface:#FAFAF7;--navy:#1F3864;--navy-dark:#16294a;--teal:#2E7D74;--ink:#20242B;--muted:#5F5A50;--line:#E6E1D6}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:var(--bone)}
  body{font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--ink);line-height:1.55;padding:22px}
  .card{max-width:520px;margin:0 auto;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:26px 24px}
  .kick{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9A8F78;font-weight:700;margin-bottom:8px}
  h2{font-size:21px;font-weight:800;color:var(--ink);letter-spacing:-.3px;margin-bottom:6px;font-family:'DM Sans',sans-serif}
  p{font-size:14.5px;color:var(--muted);margin-bottom:16px}
  label{display:block;font-size:13px;font-weight:700;color:var(--ink);margin:0 0 6px}
  input[type=email],input[type=text]{width:100%;font-size:15px;padding:12px 13px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font-family:inherit}
  input:focus{outline:none;border-color:var(--teal)}
  .row{margin-bottom:14px}
  button{width:100%;font-family:inherit;font-weight:700;font-size:15px;padding:13px 18px;border-radius:10px;border:1px solid var(--navy);background:var(--navy);color:#fff;cursor:pointer}
  button:hover{background:var(--navy-dark)}
  button:disabled{opacity:.5;cursor:not-allowed}
  .hide{display:none}
  .err{color:#B4232A;font-size:13.5px;margin-top:10px;min-height:1em}
  .cf{display:flex;justify-content:center;margin:6px 0 14px}
  .pw{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:20px;font-weight:700;color:var(--navy);background:var(--bone);border:1px dashed var(--teal);border-radius:10px;padding:12px 14px;text-align:center;letter-spacing:.5px;margin:4px 0 16px;user-select:all}
  ol{padding-left:20px} li{font-size:14px;margin:8px 0}
  a{color:var(--navy);font-weight:700}
  .mono{font-family:ui-monospace,Menlo,monospace;background:var(--bone);border:1px solid var(--line);border-radius:6px;padding:1px 6px;font-size:12.5px}
  .muted-note{font-size:12px;color:var(--muted);margin-top:8px}
  .walk{display:flex;align-items:center;justify-content:space-between;gap:10px 14px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}
  .walk span{font-size:13.5px;font-weight:600;color:var(--ink)}
  a.btn-walk{display:inline-block;padding:9px 14px;border-radius:10px;background:var(--teal);color:#fff;font-weight:700;font-size:14px;text-decoration:none;white-space:nowrap}
  a.btn-walk:hover{background:#25665f}
</style></head>
<body>
<div class="card">

  <div id="s1">
    <div class="kick">Pacer AI Demo</div>
    <h2>Get instant demo access</h2>
    <p>Enter your work email, pass a quick bot check, and we&rsquo;ll unlock the Pacer AI - Demo connector for you.</p>
    <div class="row">
      <label for="email">Work email</label>
      <input id="email" type="email" placeholder="you@company.com" autocomplete="email" value="${pf}">
    </div>
    <div class="row">
      <label for="company">Company <span style="font-weight:400;color:var(--muted)">(optional)</span></label>
      <input id="company" type="text" placeholder="Company name" autocomplete="organization">
    </div>
    <button id="continue">Continue</button>
    <div class="err" id="err1"></div>
    <div class="muted-note">Runs on DemoCo.ai, a synthetic company with fictional customers, reps and deals in a live HubSpot portal. We&rsquo;ll email you the demo&rsquo;s daily Pace briefing for the next 3 days, then occasionally about the demo &mdash; no spam.</div>
    <div class="walk"><span>Prefer to have someone walk you through it?</span><a class="btn-walk" href="https://calendly.com/pacerai/demo-pacer-ai" target="_blank" rel="noopener">Schedule a Walkthrough &rarr;</a></div>
  </div>

  <div id="s2" class="hide">
    <div class="kick">Step 2 of 2</div>
    <h2>Quick bot check</h2>
    <p>Confirm you&rsquo;re a real person to unlock the demo.</p>
    <div class="cf"><div id="cf"></div></div>
    <div class="err" id="err2"></div>
  </div>

  <div id="s3" class="hide">
    <div class="kick">You&rsquo;re in</div>
    <h2>Your demo access</h2>
    <p>Add the <b>Pacer AI - Demo</b> connector in Claude, sign in with your work email + this password, then type <span class="mono">pace</span>.</p>
    <div id="pwWrap">
      <label>Access password</label>
      <div class="pw" id="pw">&mdash;</div>
    </div>
    <ol>
      <li><b>Browser:</b> <a href="https://claude.ai/customize/connectors?modal=add-custom-connector&amp;connectorName=Pacer%20AI%20-%20Demo&amp;connectorUrl=https%3A%2F%2Fdemo.getpacerai.com%2Fmcp" target="_blank" rel="noopener">Add Pacer AI - Demo to Claude</a>. The name and URL are filled in &rarr; Continue &rarr; keep the defaults &rarr; Add.</li>
      <li>Or by hand: Name <b>Pacer AI - Demo</b> · URL <span class="mono">https://demo.getpacerai.com/mcp</span>.</li>
      <li>Sign in with your work email + the password above, set Tool permissions to <b>Always allow</b>, then type <span class="mono">pace</span>.</li>
    </ol>
    <div class="muted-note" id="emailNote"></div>
    <div class="walk"><span>Want help with the setup?</span><a class="btn-walk" href="https://calendly.com/pacerai/demo-pacer-ai" target="_blank" rel="noopener">Schedule a Walkthrough &rarr;</a></div>
  </div>

</div>
<script>
(function(){
  var email="", company="", attempts=0, widgetId=null, submitted=false;
  var s1=document.getElementById('s1'), s2=document.getElementById('s2'), s3=document.getElementById('s3');
  var err1=document.getElementById('err1'), err2=document.getElementById('err2');
  var SITEKEY=${JSON.stringify(sk)};
  // Attribution from the parent page (footer.js 2b) rides along with the signup POST.
  var qs=new URLSearchParams(location.search), attr={};
  ['utm_source','utm_medium','utm_campaign','landing','page'].forEach(function(k){ var v=qs.get(k); if(v){ attr[k]=v.slice(0,200); } });
  // GA4 lives on the parent page; tell it about conversions (footer.js section 0 listens).
  function report(name,params){ try{ if(window.parent!==window){ window.parent.postMessage({type:'pacer:event',name:name,params:params||{}},'https://getpacerai.com'); } }catch(e){} }
  document.querySelectorAll('a.btn-walk').forEach(function(a){
    a.addEventListener('click',function(){ report('schedule_walkthrough',{cta_location: s3.classList.contains('hide')?'signup_card':'signup_card_reveal'}); });
  });

  function valid(e){return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(e);}

  document.getElementById('continue').addEventListener('click', function(){
    email=(document.getElementById('email').value||'').trim();
    company=(document.getElementById('company').value||'').trim();
    if(!valid(email)){ err1.textContent='Please enter a valid work email.'; return; }
    err1.textContent='';
    s1.classList.add('hide'); s2.classList.remove('hide');
    renderTurnstile();
  });

  function renderTurnstile(){
    function go(){
      if(!window.turnstile){ setTimeout(go,200); return; }
      widgetId=window.turnstile.render('#cf',{
        sitekey:SITEKEY, action:'turnstile-spin-v2',
        'refresh-expired':'manual', retry:'never',
        callback:function(token){ submit(token); },
        'error-callback':function(){ onFail('Bot check failed.'); },
        'expired-callback':function(){ onFail('Check expired.'); }
      });
    }
    go();
  }

  function onFail(msg){
    attempts++;
    if(attempts>=3){ err2.textContent='Too many failed attempts. Email will@getpacerai.com and we\\'ll set you up.'; return; }
    err2.textContent=msg+' '+(3-attempts)+' tries left.';
    if(window.turnstile && widgetId!==null){ window.turnstile.reset(widgetId); }
  }

  function submit(token){
    if(submitted){ return; }          // one-shot — ignore Turnstile callback re-fires (token auto-refresh)
    submitted=true;
    err2.textContent='Verifying…';
    fetch('/demo-signup',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify(Object.assign({email:email,company:company,token:token},attr))})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d && d.ok){
          report('demo_signup',{cta_location:'signup_card', user_id: d.visitor_id||''});
          // Tear the widget down so it stops refreshing tokens + re-calling back in the background.
          if(window.turnstile && widgetId!==null){ try{ window.turnstile.remove(widgetId); }catch(e){} widgetId=null; }
          s2.classList.add('hide'); s3.classList.remove('hide');
          var pw=document.getElementById('pw');
          if(d.password){ pw.textContent=d.password; }
          else{ document.getElementById('pwWrap').classList.add('hide');
                /* Fallback only when PACER_DEMO_PASSWORD is unset. Nothing emails the
                   password today, so promise a human, not an automated send. */
                document.getElementById('emailNote').textContent='Got it \u2014 Will will send your access password to '+email+' shortly.'; }
        } else {
          submitted=false;            // allow a retry on failure
          onFail((d&&d.error==='turnstile_failed')?'Bot check failed.':'Something went wrong.');
        }
      })
      .catch(function(){ submitted=false; onFail('Network error.'); });
  }
})();
</script>
</body></html>`;
}
