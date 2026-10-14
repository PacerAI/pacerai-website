/**
 * Helpers shared by the demo signup (index.ts) and order capture (order.ts). They live here, not in
 * index.ts, because the Workers runtime treats every runtime export of the main module as an entrypoint.
 */
import { DISPOSABLE_DOMAINS } from "./disposable-domains";

export interface Env {
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
  // Order capture (src/order.ts). No key = the request is still saved, posted to Slack and put in Apollo,
  // but no email goes out.
  RESEND_API_KEY?: string;
  ORDER_FROM?: string;       // e.g. "Pacer AI <orders@mail.getpacerai.com>" (a Resend-verified domain)
  ORDER_NOTIFY_TO?: string;  // will@getpacerai.com
}

export const APOLLO_API = "https://api.apollo.io";

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
export function classify(domain: string, asOrg: string | undefined): string {
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

export function isHostingOrigin(asOrg: string | undefined): boolean {
  if (!asOrg) return false;
  const a = asOrg.toLowerCase();
  return HOSTING_ASNS.some((h) => a.includes(h));
}

// The mail domain is the site we record; Apollo enrichment doesn't feed back here.
export function deriveWebsite(domain: string, leadClass: string): string | null {
  return leadClass === "valid_lead" || leadClass === "suspicious" || leadClass === "competitor"
    ? `https://${domain}`
    : null;
}

export const FRAME_HEADERS = {
  "content-security-policy": "frame-ancestors https://getpacerai.com https://*.getpacerai.com;",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  // The video and signup widget only make sense inside getpacerai.com; keep the bare workers.dev URL
  // out of search results so it never competes with the site (SEO plan 2026-10-05, A9).
  "x-robots-tag": "noindex",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export interface ApolloContact {
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

export async function findContact(
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
export async function addToList(
  contact: ApolloContact,
  headers: Record<string, string>,
  errors: string[],
  list: string
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
  if (current.includes(list)) return;
  const put = await fetch(`${APOLLO_API}/v1/contacts/${contact.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ label_names: [...current, list] }),
  });
  if (!put.ok) errors.push(`apollo_add_to_list: ${put.status}`);
}

// Fill blank name/title/company fields from people/match. Never overwrites.
export async function enrich(
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
