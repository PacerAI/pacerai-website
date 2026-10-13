import demoHtml from "./demo.html";
import { DISPOSABLE_DOMAINS } from "./disposable-domains";

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
 * Framing: responses allow embedding ONLY by getpacerai.com (CSP frame-ancestors).
 */

interface Env {
  DEMO_SIGNUPS: KVNamespace;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET: string;
  SLACK_WEBHOOK_URL?: string;
  PACER_DEMO_PASSWORD?: string;
  // Shared with whitepaper-worker (pacerai-gtm) — one `leads` table for every
  // email captured on getpacerai.com. Schema lives in that repo's migrations/.
  LEADS?: D1Database;
  // Apollo follow-up. All optional: no key → the Apollo step is skipped; no
  // sequence id → signups land on the list but nobody is enrolled.
  APOLLO_API_KEY?: string;
  APOLLO_EMAIL_ACCOUNT_ID?: string;
  APOLLO_SEQUENCE_ID_DEMO_SIGNUP?: string;
}

const APOLLO_API = "https://api.apollo.io";
// Every demo signup lands on this Apollo list, which feeds the sequence of the
// same name (pacerai-gtm/channels/data-model.md §6).
const DEMO_SIGNUP_LIST = "Signal_CONTACT_DemoSignup_Triage";
// Classes that get the follow-up email. competitor / suspicious / internal go
// on the list only; disposable never reaches Apollo.
const ENROLL_CLASSES = new Set(["valid_lead", "personal_email"]);

// Personal-domain list mirrors whitepaper-worker's classifier so a lead looks
// the same in the `leads` table no matter which Worker wrote the row.
const PERSONAL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "icloud.com", "aol.com", "proton.me", "protonmail.com",
  "me.com", "mac.com", "live.com", "msn.com",
]);
const OWN_DOMAINS = new Set(["getpacerai.com", "predictiveanalyticspartners.com"]);
// Copied from whitepaper-worker (sourced from foundation/competitors/, tier 1 + 2).
// A competitor goes on the Apollo list but never gets the follow-up email.
const COMPETITOR_DOMAINS = new Set([
  "accountaim.com", "causal.app", "cubesoftware.com",
  "datarails.com", "discern.io", "venasolutions.com",
  "anaplan.com", "board.com", "jedox.com", "matillion.com",
  "mosaic.tech", "onestream.com", "pigment.com", "planful.com",
  "prophix.com", "revoper.com", "solverglobal.com", "workday.com",
]);

// Mirrors whitepaper-worker's classifier so a lead looks the same in `leads`
// whichever Worker wrote the row.
function classifyLead(domain: string): string {
  if (OWN_DOMAINS.has(domain)) return "internal";
  if (DISPOSABLE_DOMAINS.has(domain)) return "disposable";
  if (PERSONAL_DOMAINS.has(domain)) return "personal_email";
  if (COMPETITOR_DOMAINS.has(domain)) return "competitor";
  return "valid_lead";
}

// Origin-aware wrapper, mirroring whitepaper-worker. A corporate-looking domain
// submitted from a hosting network is downgraded outright: a row reading
// "valid_lead" beside a warning triangle is a contradiction, and the triangle is
// the part that turned out to be right.
function classify(domain: string, asOrg: string | undefined): string {
  const base = classifyLead(domain);
  if (base === "valid_lead" && isHostingOrigin(asOrg)) return "suspicious";
  return base;
}

// Networks that serve automation rather than office workers. A FLAG, not a
// reclassification: a real prospect on a corporate VPN presents identically.
const HOSTING_ASNS = [
  "leaseweb", "digitalocean", "linode", "ovh", "hetzner", "vultr", "contabo",
  "amazon", "google cloud", "microsoft azure", "oracle cloud", "alibaba",
  "choopa", "quadranet", "colocrossing", "m247", "datacamp", "hostwinds",
];

function isHostingOrigin(asOrg: string | undefined): boolean {
  if (!asOrg) return false;
  const a = asOrg.toLowerCase();
  return HOSTING_ASNS.some((h) => a.includes(h));
}

// The mail domain is the site we record; Apollo enrichment doesn't feed back here.
function deriveWebsite(domain: string, leadClass: string): string | null {
  return leadClass === "valid_lead" || leadClass === "suspicious" || leadClass === "competitor"
    ? `https://${domain}`
    : null;
}

const CONNECTOR_URL = "https://pacerai-demo-mcp.azurewebsites.net/mcp";

const FRAME_HEADERS = {
  "content-security-policy": "frame-ancestors https://getpacerai.com https://*.getpacerai.com;",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  // The video and signup widget only make sense inside getpacerai.com; keep the bare workers.dev URL
  // out of search results so it never competes with the site (SEO plan 2026-10-05, A9).
  "x-robots-tag": "noindex",
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    // Self-serve signup POST (from the /signup widget, same-origin — no CORS needed).
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

    // The demo video (iframed by the homepage).
    return new Response(demoHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300", ...FRAME_HEADERS },
    });
  },
} satisfies ExportedHandler<Env>;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function handleSignup(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let email = "";
  let token = "";
  let company = "";
  try {
    const body = (await request.json()) as { email?: string; token?: string; company?: string };
    email = (body.email || "").trim().toLowerCase();
    token = (body.token || "").trim();
    company = (body.company || "").trim();
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

  const ts = new Date().toISOString();

  // Track the email (KV is the live request list; synced to demo_users.yml on review).
  // Check first so we Slack ONLY on a new email — a re-submit or a Turnstile token refresh never re-pings.
  let isNew = true;
  try {
    isNew = (await env.DEMO_SIGNUPS.get(email)) === null;
    await env.DEMO_SIGNUPS.put(email, JSON.stringify({ email, company, ip, ts }));
  } catch {
    // Non-fatal: still grant access + notify.
  }

  const domain = email.split("@")[1] ?? "";
  const asOrg = (request as any).cf?.asOrganization as string | undefined;
  const leadClass = classify(domain, asOrg);
  const requestId = `demo_${ts}_${crypto.randomUUID().slice(0, 6)}`;
  const website = deriveWebsite(domain, leadClass);

  // Everything below is off the critical path — the visitor gets their password
  // immediately and never waits on Apollo, Slack or D1.
  ctx.waitUntil(
    (async () => {
      const errors: string[] = [];

      // Apollo runs first so the D1 row and the Slack alert carry the outcome.
      // Every submit runs it; each step is idempotent, so a repeat is harmless.
      let apollo: ApolloResult;
      try {
        apollo = await syncApollo(env, email, leadClass, errors);
      } catch (e: any) {
        errors.push(`apollo: ${e?.message ?? "unknown"}`);
        apollo = { contactId: null, enrolled: false, note: "failed — check logs" };
      }

      // D1: the table of record, shared with whitepaper-worker. Every submit is
      // a row (repeats included) so the funnel stays auditable.
      if (env.LEADS) {
        try {
          await env.LEADS.prepare(
            `INSERT INTO leads (
               request_id, email, email_domain, company, lead_class, source,
               asset_slug, page_url, ip, created_at, website, as_org,
               apollo_contact_id, enrolled_sequence
             ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
          )
            .bind(
              requestId,
              email,
              domain,
              company || null,
              leadClass,
              "demo",
              "demo-access",
              "https://getpacerai.com/demo-connect",
              ip || null,
              ts,
              website,
              asOrg ?? null,
              apollo.contactId,
              apollo.enrolled ? DEMO_SIGNUP_LIST : null
            )
            .run();
        } catch (e: any) {
          errors.push(`d1_insert: ${e?.message ?? "unknown"}`);
        }
      }

      // Slack #website-leads — one channel for every captured email, matching
      // whitepaper-worker's format. Only on a genuinely new email.
      if (isNew && env.SLACK_WEBHOOK_URL) {
        const emoji =
          leadClass === "valid_lead" ? ":fire:"
          : leadClass === "internal" ? ":test_tube:"
          : leadClass === "disposable" ? ":wastebasket:"
          : leadClass === "suspicious" ? ":mag:"
          : leadClass === "competitor" ? ":eyes:"
          : ":warning:";
        try {
          await fetch(env.SLACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              text: [
                `${emoji} *Demo access request — ${leadClass.replace("_", " ")}*`,
                `*Email:* ${email}`,
                ...(company ? [`*Company:* ${company}`] : []),
                `*Classification:* ${leadClass}`,
                ...(isHostingOrigin(asOrg) ? [`*:warning: Origin:* ${asOrg} (datacenter, not an office network)`] : []),
                ...(website ? [`*Website:* ${website}`] : []),
                `*Source:* demo`,
                `*Page:* https://getpacerai.com/demo-connect`,
                `*Sequence:* ${apollo.enrolled ? DEMO_SIGNUP_LIST : `none — ${apollo.note}`}`,
                `*Apollo:* ${apollo.contactId ? `https://app.apollo.io/#/people/${apollo.contactId}` : "(no contact)"}`,
                `*Request:* ${requestId}`,
              ].join("\n"),
            }),
          });
        } catch (e: any) {
          errors.push(`slack: ${e?.message ?? "unknown"}`);
        }
      }

      console.log(
        JSON.stringify({
          ts,
          request_id: requestId,
          email,
          email_domain: domain,
          lead_class: leadClass,
          source: "demo",
          website,
          as_org: asOrg ?? null,
          hosting_origin: isHostingOrigin(asOrg),
          is_new: isNew,
          apollo: {
            ok: !errors.some((e) => e.startsWith("apollo")),
            contact_id: apollo.contactId,
            enrolled: apollo.enrolled,
            note: apollo.note,
          },
          d1: { ok: !errors.some((e) => e.startsWith("d1_")) },
          slack: { ok: !errors.some((e) => e.startsWith("slack")) },
          errors,
        })
      );
    })()
  );

  // Reveal access. Password comes from a Worker secret (kept in sync with the Azure MCP).
  return json({
    ok: true,
    connectorUrl: CONNECTOR_URL,
    password: env.PACER_DEMO_PASSWORD || null,
  });
}

// ── Apollo: list + follow-up sequence ────────────────────────────────────────
// Ported from pacerai-gtm: find-before-create and list-merge from
// scripts/luma-to-apollo.py, enrich + enroll from infra/whitepaper-worker.

interface ApolloResult {
  contactId: string | null;
  enrolled: boolean;
  // Human-readable outcome for Slack when nobody was enrolled.
  note: string;
}

interface ApolloContact {
  id: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  title?: string | null;
  organization_name?: string | null;
  linkedin_url?: string | null;
  label_ids?: string[];
  created_at?: string;
}

async function syncApollo(
  env: Env,
  email: string,
  leadClass: string,
  errors: string[]
): Promise<ApolloResult> {
  if (leadClass === "disposable") return { contactId: null, enrolled: false, note: "disposable address, not sent to Apollo" };
  if (!env.APOLLO_API_KEY) return { contactId: null, enrolled: false, note: "Apollo not configured" };
  const headers = { "Content-Type": "application/json", "X-Api-Key": env.APOLLO_API_KEY };

  // 1. Find before create. POST /v1/contacts does NOT dedupe on email, and a
  //    homepage-hero visitor already got a contact from whitepaper-worker.
  //    A failed lookup is "unknown", not "no match" — never create on it.
  let contact: ApolloContact | null;
  try {
    contact = await findContact(env, email, headers);
  } catch (e: any) {
    errors.push(`apollo_lookup: ${e?.message ?? "unknown"}`);
    return { contactId: null, enrolled: false, note: "Apollo lookup failed, add by hand" };
  }

  // 2. Get them on the list.
  if (!contact) {
    const res = await fetch(`${APOLLO_API}/v1/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, label_names: [DEMO_SIGNUP_LIST] }),
    });
    if (!res.ok) {
      errors.push(`apollo_create_contact: ${res.status}`);
      return { contactId: null, enrolled: false, note: "Apollo create failed" };
    }
    contact = ((await res.json()) as { contact?: ApolloContact }).contact ?? null;
    if (!contact?.id) {
      errors.push("apollo_create_contact: no id returned");
      return { contactId: null, enrolled: false, note: "Apollo create failed" };
    }
  } else {
    await addToList(contact, headers, errors);
  }

  // 3. Enrich. The email opens "Hi {{first_name}}", and contact create does
  //    not enrich. Only when the name is missing — each match costs a credit.
  if (!contact.first_name) await enrich(contact, email, headers, errors);

  // 4. Enroll.
  if (!ENROLL_CLASSES.has(leadClass)) return { contactId: contact.id, enrolled: false, note: `list only (${leadClass})` };
  if (!env.APOLLO_SEQUENCE_ID_DEMO_SIGNUP || !env.APOLLO_EMAIL_ACCOUNT_ID) {
    return { contactId: contact.id, enrolled: false, note: "list only (no sequence configured)" };
  }
  if (!contact.first_name) {
    return { contactId: contact.id, enrolled: false, note: "no first name, enroll by hand" };
  }
  const seqId = env.APOLLO_SEQUENCE_ID_DEMO_SIGNUP;
  const res = await fetch(`${APOLLO_API}/v1/emailer_campaigns/${seqId}/add_contact_ids`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contact_ids: [contact.id],
      emailer_campaign_id: seqId,
      send_email_from_email_account_id: env.APOLLO_EMAIL_ACCOUNT_ID,
    }),
  });
  if (!res.ok) {
    errors.push(`apollo_enroll: ${res.status}`);
    return { contactId: contact.id, enrolled: false, note: "Apollo enroll failed" };
  }
  // Apollo reports refusals here rather than as an error: already in the
  // sequence, or a stage safeguard (e.g. contact stage "Interested").
  const skipped = ((await res.json()) as { skipped_contact_ids?: Record<string, unknown> }).skipped_contact_ids ?? {};
  if (Object.keys(skipped).length) {
    errors.push(`apollo_enroll_skipped: ${JSON.stringify(skipped)}`);
    return { contactId: contact.id, enrolled: false, note: `Apollo skipped: ${JSON.stringify(Object.values(skipped))}` };
  }
  return { contactId: contact.id, enrolled: true, note: "enrolled" };
}

async function findContact(
  env: Env,
  email: string,
  headers: Record<string, string>
): Promise<ApolloContact | null> {
  // D1 first: whitepaper-worker records the contact it just made, and Apollo's
  // search index can lag a create by seconds.
  if (env.LEADS) {
    let knownId: string | null = null;
    try {
      const row = await env.LEADS.prepare(
        `SELECT apollo_contact_id FROM leads
          WHERE email = ? AND apollo_contact_id IS NOT NULL
          ORDER BY created_at DESC LIMIT 1`
      )
        .bind(email)
        .first<{ apollo_contact_id: string }>();
      knownId = row?.apollo_contact_id ?? null;
    } catch {
      // D1 unavailable: fall through to Apollo search.
    }
    if (knownId) {
      const res = await fetch(`${APOLLO_API}/v1/contacts/${knownId}`, { headers });
      if (res.ok) {
        const c = ((await res.json()) as { contact?: ApolloContact }).contact;
        if (c?.id) return c;
      }
      // Deleted or merged in Apollo: fall through to search.
    }
  }

  const res = await fetch(`${APOLLO_API}/v1/contacts/search`, {
    method: "POST",
    headers,
    body: JSON.stringify({ q_keywords: email, page: 1, per_page: 25 }),
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const contacts = ((await res.json()) as { contacts?: ApolloContact[] }).contacts ?? [];
  const matches = contacts.filter((c) => (c.email ?? "").trim().toLowerCase() === email);
  if (!matches.length) return null;
  // Oldest record wins — it carries the accumulated enrichment and history.
  matches.sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")));
  return matches[0];
}

// PUT label_names REPLACES every list the contact is on, so resolve the current
// ids to names, union ours in, and write the union back. If any id can't be
// resolved, write nothing: a partial union would silently strip a list.
async function addToList(
  contact: ApolloContact,
  headers: Record<string, string>,
  errors: string[]
): Promise<void> {
  const res = await fetch(`${APOLLO_API}/v1/labels`, { headers });
  if (!res.ok) {
    errors.push(`apollo_labels: ${res.status}`);
    return;
  }
  const raw = (await res.json()) as unknown;
  const labels = (Array.isArray(raw) ? raw : (raw as { labels?: unknown[] }).labels ?? []) as {
    id?: string;
    _id?: string;
    name?: string;
  }[];
  const nameById = new Map(labels.map((l) => [l.id ?? l._id ?? "", l.name ?? ""]));
  const ids = contact.label_ids ?? [];
  const current = ids.map((id) => nameById.get(id)).filter((n): n is string => !!n);
  if (current.length !== ids.length) {
    errors.push("apollo_labels: unresolved label id, list not written");
    return;
  }
  if (current.includes(DEMO_SIGNUP_LIST)) return;
  const put = await fetch(`${APOLLO_API}/v1/contacts/${contact.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ label_names: [...current, DEMO_SIGNUP_LIST] }),
  });
  if (!put.ok) errors.push(`apollo_add_to_list: ${put.status}`);
}

// Fill blank name/title/company fields from people/match. Never overwrites.
async function enrich(
  contact: ApolloContact,
  email: string,
  headers: Record<string, string>,
  errors: string[]
): Promise<void> {
  try {
    const res = await fetch(`${APOLLO_API}/v1/people/match`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, reveal_personal_emails: false }),
    });
    if (!res.ok) {
      errors.push(`apollo_enrich: ${res.status}`);
      return;
    }
    const person = ((await res.json()) as { person?: any }).person;
    if (!person) return;
    const found: Record<string, string | undefined> = {
      first_name: person.first_name,
      last_name: person.last_name,
      title: person.title,
      organization_name: person.organization?.name,
      linkedin_url: person.linkedin_url,
    };
    const updates: Record<string, string> = {};
    for (const [k, v] of Object.entries(found)) {
      if (v && !contact[k as keyof ApolloContact]) updates[k] = v;
    }
    if (!Object.keys(updates).length) return;
    const put = await fetch(`${APOLLO_API}/v1/contacts/${contact.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });
    if (put.ok && updates.first_name) contact.first_name = updates.first_name;
  } catch (e: any) {
    errors.push(`apollo_enrich: ${e?.message ?? "unknown"}`);
  }
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
    <div class="muted-note">Runs on a synthetic company with fictional accounts. We&rsquo;ll email you occasionally about the demo &mdash; no spam.</div>
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
      <li><b>Browser:</b> open <a href="https://claude.ai/new?modal=add-custom-connector#customize/connectors" target="_blank" rel="noopener">claude.ai add-custom-connector</a>.</li>
      <li>Name <b>Pacer AI - Demo</b> · URL <span class="mono">https://pacerai-demo-mcp.azurewebsites.net/mcp</span> &rarr; Continue &rarr; keep the defaults &rarr; Add.</li>
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
      body:JSON.stringify({email:email,company:company,token:token})})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d && d.ok){
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
