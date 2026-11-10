// Runs the demo Worker (infra/pacer-demo-worker/src/index.ts) under Node, for the Python tests. Not a test file itself.
//
// Nothing leaves the machine: every outbound fetch is answered here and recorded, D1 is an in-memory SQLite database,
// and KV is a map. Needs Node 23.6+ (TypeScript type stripping, node:sqlite, module.registerHooks).
//
// stdin: {"worker": path to index.ts, "env": {...}, "turnstile": true|false, "optouts": [email, ...],
//         "requests": [{"method", "path", "headers", "body"}, ...]}
// stdout: {"responses": [{"status", "headers", "body"}], "fetches": [{"url", "method", "body"}],
//          "leads": [row, ...], "kv_puts": [key, ...]}
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath, pathToFileURL } from "node:url";

// The Worker's imports are written for wrangler's bundler: no extensions, and .html / .json as modules.
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".")) return next(`${specifier}.ts`, context);
      throw error;
    }
  },
  load(url, context, next) {
    if (url.endsWith(".html")) {
      const text = readFileSync(fileURLToPath(url), "utf8");
      return { format: "module", shortCircuit: true, source: `export default ${JSON.stringify(text)};` };
    }
    if (url.endsWith(".json")) {
      return { format: "module", shortCircuit: true, source: `export default ${readFileSync(fileURLToPath(url), "utf8")};` };
    }
    return next(url, context);
  },
});

const input = JSON.parse(readFileSync(0, "utf8"));

// The `leads` table as pacerai-gtm/infra/whitepaper-worker/migrations/0001 and 0002 create it, and `email_optouts` as
// this Worker's migrations/0004 does.
const db = new DatabaseSync(":memory:");
db.exec(`
  CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL, email TEXT NOT NULL, email_domain TEXT,
    company TEXT, lead_class TEXT, source TEXT NOT NULL, asset_slug TEXT, page_url TEXT, utm_source TEXT,
    utm_medium TEXT, utm_campaign TEXT, apollo_contact_id TEXT, enrolled_sequence TEXT, ip TEXT,
    created_at TEXT NOT NULL, website TEXT, as_org TEXT
  );
  CREATE TABLE email_optouts (email TEXT PRIMARY KEY, source TEXT NOT NULL, created_at TEXT NOT NULL, detail TEXT);
`);
for (const email of input.optouts || []) {
  db.prepare("INSERT INTO email_optouts (email, source, created_at) VALUES (?, 'manual', ?)").run(email, new Date().toISOString());
}

const sqlValue = (v) => (v === undefined ? null : typeof v === "boolean" ? Number(v) : v);
const plain = (row) => (row ? { ...row } : row);
function statement(sql, args = []) {
  const values = args.map(sqlValue);
  return {
    bind: (...next) => statement(sql, next),
    async run() { const r = db.prepare(sql).run(...values); return { success: true, meta: { changes: Number(r.changes) } }; },
    async first(column) { const row = plain(db.prepare(sql).get(...values)); return row ? (column ? row[column] : row) : null; },
    async all() { return { success: true, results: db.prepare(sql).all(...values).map(plain) }; },
    async raw() { return db.prepare(sql).all(...values).map((row) => Object.values(row)); },
  };
}
const LEADS = {
  prepare: (sql) => statement(sql),
  batch: async (statements) => Promise.all(statements.map((s) => s.run())),
  exec: async (sql) => { db.exec(sql); return { count: 0 }; },
};

const kvPuts = [];
const kv = new Map();
const DEMO_SIGNUPS = {
  get: async (key) => (kv.has(key) ? kv.get(key) : null),
  put: async (key, value) => { kvPuts.push(key); kv.set(key, value); },
  delete: async (key) => { kv.delete(key); },
  list: async () => ({ keys: [...kv.keys()].map((name) => ({ name })), list_complete: true }),
};

const fetches = [];
globalThis.fetch = async (resource, init = {}) => {
  const request = resource instanceof Request ? resource : new Request(resource, init);
  const body = await request.text();
  fetches.push({ url: request.url, method: request.method, body });
  const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
  if (request.url.includes("challenges.cloudflare.com/turnstile")) return reply({ success: input.turnstile !== false });
  if (request.url.includes("api.resend.com")) return reply({ id: "re_test" });
  if (request.url.includes("hooks.slack.com")) return new Response("ok");
  return reply({});
};

const env = { ...input.env, LEADS, DEMO_SIGNUPS };
const worker = (await import(pathToFileURL(input.worker).href)).default;

const responses = [];
for (const r of input.requests) {
  const pending = [];
  const ctx = { waitUntil: (p) => pending.push(p), passThroughOnException: () => {} };
  const init = { method: r.method || "GET", headers: { "CF-Connecting-IP": "203.0.113.7", ...(r.headers || {}) } };
  if (r.body !== undefined) {
    init.body = typeof r.body === "string" ? r.body : JSON.stringify(r.body);
    init.headers["content-type"] = init.headers["content-type"] || "application/json";
  }
  const response = await worker.fetch(new Request(`https://pacer-demo-worker.will-078.workers.dev${r.path}`, init), env, ctx);
  await Promise.allSettled(pending);
  responses.push({
    status: response.status,
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
  });
}

process.stdout.write(JSON.stringify({
  responses,
  fetches,
  leads: db.prepare("SELECT * FROM leads ORDER BY id").all().map(plain),
  kv_puts: kvPuts,
}));
