/**
 * Records one demo lead: KV `DEMO_SIGNUPS`, then (off the critical path) Apollo → D1 `leads` → Slack → a log line.
 *
 * Two callers, one record, so a demo lead looks the same whichever door it came through:
 *  - POST /demo-signup (index.ts): the /demo-connect signup card, after its Turnstile check.
 *  - POST /internal/connector-sign-in (connector-sign-in.ts): the connector's own sign-in page on pacerai-demo-mcp,
 *    which runs its own Turnstile check and sends each sign-in here.
 * Both write `source = 'demo'` and a `demo_` request_id, so GET /internal/demo-signups (the Daily Pace Briefing) and
 * pacerai-gtm's website-leads.py treat them alike. `asset_slug` tells them apart: 'demo-access' or 'connector-sign-in'.
 *
 * Kept out of index.ts because the Workers runtime treats every runtime export of the main module as an entrypoint.
 */
import {
  APOLLO_API, addToList, classify, deriveWebsite, enrich, findContact, isHostingOrigin,
  type ApolloContact, type Env,
} from "./shared";

// Every demo lead lands on this Apollo list, which feeds the sequence of the
// same name (pacerai-gtm/channels/data-model.md §6).
const DEMO_SIGNUP_LIST = "Signal_CONTACT_DemoSignup_Triage";
// Classes that get the follow-up email. competitor / suspicious / internal go
// on the list only; disposable never reaches Apollo.
const ENROLL_CLASSES = new Set(["valid_lead", "personal_email"]);

export interface DemoLead {
  email: string;                 // lower-cased and shape-checked by the caller
  company: string;               // "" when not given
  ip: string;                    // the visitor's IP, "" when unknown
  // The visitor's network (Cloudflare's AS organization). Drives the datacenter flag and the suspicious downgrade.
  // Only known when the visitor's own browser made the request; undefined otherwise.
  asOrg: string | undefined;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing: string | null;        // first-touch landing page, for the Slack "Came from" line
  pageUrl: string;
  assetSlug: string;
  // Extra "*Label:* value" lines for the Slack alert and fields for the log line (connector sign-ins only).
  slackLines?: string[];
  logFields?: Record<string, unknown>;
}

export interface DemoLeadResult {
  leadClass: string;
  vid: string;                   // opaque visitor id, stable per email (GA4 user_id is pv_<vid>)
  requestId: string;
}

export async function recordDemoLead(env: Env, ctx: ExecutionContext, lead: DemoLead): Promise<DemoLeadResult> {
  const { email, company, ip, asOrg } = lead;
  const ts = new Date().toISOString();

  // Track the email (KV is the live request list; synced to demo_users.yml on review).
  // Check first so we Slack ONLY on a new email — a re-submit or a Turnstile token refresh never re-pings.
  // `vid` is the visitor id GA4 gets as its user_id (opaque, never the email): stable per email, kept in this
  // KV record and at the end of the D1 request_id, which carries apollo_contact_id. So a GA4 user_id
  // pv_<vid> traces to the Apollo contact: SELECT apollo_contact_id FROM leads WHERE request_id LIKE '%_<vid>'.
  let isNew = true;
  let vid = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  try {
    const prev = await env.DEMO_SIGNUPS.get(email);
    isNew = prev === null;
    if (prev) {
      try { const old = JSON.parse(prev) as { vid?: string }; if (old.vid && /^[0-9a-f]{16}$/.test(old.vid)) vid = old.vid; } catch { /* keep new */ }
    }
    await env.DEMO_SIGNUPS.put(email, JSON.stringify({ email, company, ip, ts, vid }));
  } catch {
    // Non-fatal: still grant access + notify.
  }

  const domain = email.split("@")[1] ?? "";
  const leadClass = classify(domain, asOrg);
  const requestId = `demo_${ts}_${vid}`;
  const cameFrom = [lead.utm_source && `${lead.utm_source}${lead.utm_medium ? ` / ${lead.utm_medium}` : ""}`,
                    lead.utm_campaign && `campaign ${lead.utm_campaign}`,
                    lead.landing && `landed on ${lead.landing}`].filter(Boolean).join(" · ");
  const website = deriveWebsite(domain, leadClass);

  // Everything below is off the critical path — the visitor never waits on Apollo, Slack or D1.
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
               asset_slug, page_url, utm_source, utm_medium, utm_campaign,
               ip, created_at, website, as_org, apollo_contact_id, enrolled_sequence
             ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
          )
            .bind(
              requestId,
              email,
              domain,
              company || null,
              leadClass,
              "demo",
              lead.assetSlug,
              lead.pageUrl,
              lead.utm_source,
              lead.utm_medium,
              lead.utm_campaign,
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
                `*Page:* ${lead.pageUrl}`,
                ...(lead.slackLines ?? []),
                ...(cameFrom ? [`*Came from:* ${cameFrom}`] : []),
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
          ...(lead.logFields ?? {}),
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

  return { leadClass, vid, requestId };
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
    await addToList(contact, headers, errors, DEMO_SIGNUP_LIST);
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
