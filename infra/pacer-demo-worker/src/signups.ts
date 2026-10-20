/**
 * GET /internal/demo-signups?since=YYYY-MM-DD — the /demo-connect signups since a date, read by the Daily Pace
 * Briefing on pacerai-demo-mcp (pacerai-platform-claude-native spec 023 §7.2). Each signup gets the Apollo email
 * at signup, then the next 3 daily briefings from the demo book; the briefing counts the days, not this route.
 *
 * - Read-only, behind a bearer secret: BRIEFING_SIGNUPS_TOKEN here, the same value as the demo app's
 *   BRIEFING_SIGNUPS_TOKEN (Key Vault). With no secret set the route does not exist (404).
 * - One row per email, at its FIRST demo signup ever, so a repeat submit never restarts the 3 days.
 * - Reads D1 `leads`, the table of record (source = 'demo'); never KV, never Apollo.
 * - `since` defaults to 7 days ago and is clamped to the last 31 days, so a stolen token reads a month at most.
 */
import { json, type Env } from "./shared";

const DEFAULT_DAYS = 7;
const MAX_DAYS = 31;
const DAY_MS = 86_400_000;

export async function handleDemoSignups(request: Request, env: Env): Promise<Response> {
  if (!env.BRIEFING_SIGNUPS_TOKEN) {
    return new Response("Not Found", { status: 404 });
  }
  if (request.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }
  if (!(await sameSecret(request.headers.get("authorization") || "", `Bearer ${env.BRIEFING_SIGNUPS_TOKEN}`))) {
    return json({ error: "unauthorized" }, 401);
  }
  if (!env.LEADS) {
    return json({ error: "no_leads_table" }, 503);
  }
  const now = Date.now();
  const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  let since = new URL(request.url).searchParams.get("since") || day(now - DEFAULT_DAYS * DAY_MS);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) {
    return json({ error: "bad_since", hint: "since=YYYY-MM-DD" }, 400);
  }
  if (since < day(now - MAX_DAYS * DAY_MS)) {
    since = day(now - MAX_DAYS * DAY_MS);
  }
  const rows = await env.LEADS.prepare(
    `SELECT l.email, l.company, l.lead_class, l.created_at
       FROM leads l
       JOIN (SELECT email, MIN(created_at) AS first FROM leads WHERE source = 'demo' GROUP BY email) f
         ON f.email = l.email AND f.first = l.created_at
      WHERE l.source = 'demo' AND f.first >= ?
      ORDER BY l.created_at`
  ).bind(since).all();
  return json({ since, signups: rows.results ?? [] });
}

// Compare digests, so the check takes the same time whatever the token's length or first wrong character.
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}
