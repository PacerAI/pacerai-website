/**
 * GET and POST /internal/optouts — the email opt-out list, D1 `email_optouts` (migrations/0004_email_optouts.sql).
 *
 * One list beside `leads`, so every Pacer AI sender reads and writes the same one:
 *  - the Daily Pace Briefing (pacerai-platform-claude-native) reads it before each send and skips every address on it,
 *    and writes `one_click` when a recipient uses its one-click unsubscribe;
 *  - the nightly reply detector on Will's Mac (pacerai-gtm) writes `reply_stop` when a reply asks to stop;
 *  - `manual` is an address added by hand.
 *
 * Auth: the same bearer check as GET /internal/demo-signups, with the same secret, BRIEFING_SIGNUPS_TOKEN (the
 * demo app's BRIEFING_SIGNUPS_TOKEN). With no secret set the route does not exist (404); a missing or wrong token
 * gets 401.
 *
 * GET  → 200 {"optouts": [{email, source, created_at}]}: every row, oldest first.
 * POST → JSON {"email": "...", "source": "one_click" | "reply_stop" | "manual", "detail"?: "..."}
 *        200 {"ok": true, "new": true}  the address was added;
 *        200 {"ok": true, "new": false} it was already on the list, and the first row (its source, created_at and
 *                                       detail) is kept unchanged;
 *        400 {"ok": false, "error": "bad_request" | "invalid_email" | "invalid_source" | "invalid_detail"}.
 * Either: 405 for any other method, 503 {"ok": false, "error": ...} when D1 is unbound or the query fails (for
 * example, before the migration has run). There is no delete route: taking an address off is a DELETE by hand.
 *
 * Email is trimmed and lower-cased before it is stored or compared. `detail` is optional and cut to 1,000 characters.
 */
import { json, sameSecret, type Env } from "./shared";

const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SOURCES = new Set(["one_click", "reply_stop", "manual"]);
const MAX_EMAIL = 254;
const MAX_DETAIL = 1000;

export async function handleOptouts(request: Request, env: Env): Promise<Response> {
  if (!env.BRIEFING_SIGNUPS_TOKEN) {
    return new Response("Not Found", { status: 404 });
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", allow: "GET, POST" },
    });
  }
  if (!(await sameSecret(request.headers.get("authorization") || "", `Bearer ${env.BRIEFING_SIGNUPS_TOKEN}`))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  if (!env.LEADS) {
    return json({ ok: false, error: "no_leads_table" }, 503);
  }
  return request.method === "GET" ? listOptouts(env.LEADS) : addOptout(request, env.LEADS);
}

async function listOptouts(db: D1Database): Promise<Response> {
  try {
    const rows = await db
      .prepare(`SELECT email, source, created_at FROM email_optouts ORDER BY created_at, email`)
      .all<{ email: string; source: string; created_at: string }>();
    return json({ optouts: rows.results ?? [] });
  } catch (e: any) {
    console.error(JSON.stringify({ route: "GET /internal/optouts", error: e?.message ?? "unknown" }));
    return json({ ok: false, error: "d1_error" }, 503);
  }
}

async function addOptout(request: Request, db: D1Database): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  const b = body as Record<string, unknown>;

  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (email.length > MAX_EMAIL || !EMAIL_SHAPE.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }
  const source = typeof b.source === "string" ? b.source.trim() : "";
  if (!SOURCES.has(source)) {
    return json({ ok: false, error: "invalid_source" }, 400);
  }
  let detail: string | null = null;
  if (b.detail !== undefined && b.detail !== null) {
    if (typeof b.detail !== "string") {
      return json({ ok: false, error: "invalid_detail" }, 400);
    }
    detail = b.detail.trim().slice(0, MAX_DETAIL) || null;
  }

  // First opt-out wins: a repeat leaves the existing row alone, and meta.changes tells the two apart.
  try {
    const res = await db
      .prepare(
        `INSERT INTO email_optouts (email, source, created_at, detail) VALUES (?, ?, ?, ?)
         ON CONFLICT(email) DO NOTHING`
      )
      .bind(email, source, new Date().toISOString(), detail)
      .run();
    const isNew = (res.meta?.changes ?? 0) > 0;
    console.log(JSON.stringify({ route: "POST /internal/optouts", email, source, new: isNew }));
    return json({ ok: true, new: isNew });
  } catch (e: any) {
    console.error(JSON.stringify({ route: "POST /internal/optouts", email, error: e?.message ?? "unknown" }));
    return json({ ok: false, error: "d1_error" }, 503);
  }
}
