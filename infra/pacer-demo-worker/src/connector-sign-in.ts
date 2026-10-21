/**
 * POST /internal/connector-sign-in — a sign-in on the Pacer AI - Demo connector becomes a demo lead.
 *
 * Since 2026-10-21 /demo-connect has one install path: the "Add Pacer AI - Demo to Claude" button. The connector's own
 * sign-in page on pacerai-demo-mcp asks for a work email (no password) behind its own Turnstile check, then sends
 * each sign-in here, server to server. The lead is recorded exactly like a card signup (src/demo-lead.ts): KV
 * `DEMO_SIGNUPS`, Apollo list + sequence, D1 `leads` (source 'demo', asset_slug 'connector-sign-in'), Slack on a new
 * email. So GET /internal/demo-signups and the platform's demo_usage_report.py see these sign-ins as signups.
 *
 * Request:  POST, `Authorization: Bearer <CONNECTOR_SIGNIN_TOKEN>`, JSON {email, client_id, book, ip}
 *           (`ip` = the visitor's IP as the sign-in page saw it; optional. `client_id` and `book` are optional.)
 * Replies:  200 {ok:true, lead_class} · 400 {ok:false, error:"bad_request" | "invalid_email"} · 401 unauthorized ·
 *           405 not POST · 503 {ok:false, error:"not configured"} while the secret is unset.
 *
 * The datacenter flag and the "suspicious" downgrade need the visitor's network (Cloudflare's AS organization), which
 * the Worker only learns when the visitor's own browser calls it. Here the caller is the Azure app, so `as_org` stays
 * empty and classification is by email domain alone; the sign-in page's Turnstile check is the bot gate.
 */
import { json, sameSecret, type Env } from "./shared";
import { recordDemoLead } from "./demo-lead";

const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const IP_SHAPE = /^[0-9A-Fa-f:.]{2,45}$/;

export async function handleConnectorSignIn(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.CONNECTOR_SIGNIN_TOKEN) {
    return json({ ok: false, error: "not configured" }, 503);
  }
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  if (!(await sameSecret(request.headers.get("authorization") || "", `Bearer ${env.CONNECTOR_SIGNIN_TOKEN}`))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  let email = "";
  let ip = "";
  let clientId: string | null = null;
  let book: string | null = null;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const str = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
    email = (str(body.email, 254) || "").toLowerCase();
    const rawIp = str(body.ip, 64) || "";
    ip = IP_SHAPE.test(rawIp) ? rawIp : "";
    clientId = str(body.client_id, 200);
    book = str(body.book, 40);
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  if (!EMAIL_SHAPE.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const { leadClass } = await recordDemoLead(env, ctx, {
    email,
    company: "",
    ip,
    asOrg: undefined,          // the caller is the Azure app, not the visitor (see the header)
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    landing: null,
    pageUrl: "connector-sign-in",
    assetSlug: "connector-sign-in",
    slackLines: [
      `*Via:* the connector's sign-in page${book ? ` (${book} demo)` : ""}`,
      ...(clientId ? [`*Claude client:* ${clientId}`] : []),
    ],
    logFields: { asset_slug: "connector-sign-in", book, client_id: clientId },
  });

  return json({ ok: true, lead_class: leadClass });
}
