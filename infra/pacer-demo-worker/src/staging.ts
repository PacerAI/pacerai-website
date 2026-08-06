// ─────────────────────────────────────────────────────────────────────────────
// REGISTER A NEW VARIANT HERE — two lines, nothing else.
//   1. import it below (Workers bundle at build time; dynamic paths won't work)
//   2. add it to VARIANTS
// Then: npm run deploy:staging
// ─────────────────────────────────────────────────────────────────────────────
import croArrV1 from "./variants/cro-arr-v1.html";

const VARIANTS: Record<string, { html: string; title: string }> = {
  "cro-arr-v1": { html: croArrV1, title: "CRO ARR Planning — $100M to $150M" },
};

// Kept in sync with pacerai-content/collateral/demo_reels/registry.yaml → production_variant.
// Display only; this Worker never serves production traffic.
const PRODUCTION_VARIANT = "cro-arr-v1";

/**
 * pacer-demo-worker-staging
 * -------------------------
 * The DEV half of the demo-reel pipeline. Serves every reel variant in src/variants/
 * at /v/{slug} so a new reel (or a new version of an existing one) can be reviewed and
 * shared BEFORE it goes anywhere near the getpacerai.com homepage embed.
 *
 * This is a separate Worker from production on purpose. `src/index.ts` still imports
 * exactly ONE html file, so its bundle never changes shape as this catalog grows —
 * adding a tenth variant here carries zero risk to live traffic.
 *
 * Promote a variant to production with ./promote.sh <slug> --deploy.
 * Full process: pacerai-content/collateral/demo_reels/README.md
 *
 * Routes
 *   /            index of all variants (which one is live, links to each)
 *   /v/{slug}    that variant's reel
 *   /health      "ok"
 */
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    const variantMatch = url.pathname.match(/^\/v\/([a-z0-9-]+)\/?$/);
    if (variantMatch) {
      const variant = VARIANTS[variantMatch[1]];
      if (!variant) return html(notFoundPage(variantMatch[1]), 404);
      return html(variant.html);
    }

    if (url.pathname === "/") return html(indexPage());

    return html(notFoundPage(url.pathname), 404);
  },
} satisfies ExportedHandler;

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Staging allows self-framing so the index can preview variants inline.
      "content-security-policy":
        "frame-ancestors 'self' https://getpacerai.com https://*.getpacerai.com;",
      // No caching on staging — you want to see the variant you just deployed.
      "cache-control": "no-store",
      // Staging is a public *.workers.dev URL. Keep it out of search results.
      "x-robots-tag": "noindex, nofollow",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
}

const SHELL = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${title}</title>
<style>
  :root{--bg:#F5F2EA;--ink:#0B1530;--muted:#5A6478;--line:#DFD8C8;--card:#fff;--accent:#38A898}
  @media (prefers-color-scheme:dark){:root{--bg:#0B1530;--ink:#F5F2EA;--muted:#93A0BA;--line:#22304F;--card:#111C36}}
  *{box-sizing:border-box}
  body{margin:0;padding:48px 24px;background:var(--bg);color:var(--ink);
       font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .wrap{max-width:760px;margin:0 auto}
  .tag{display:inline-block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;
       color:var(--accent);font-weight:700;margin:0 0 10px}
  h1{font-size:28px;margin:0 0 8px;letter-spacing:-.01em}
  p.lede{color:var(--muted);margin:0 0 32px}
  a.card{display:block;text-decoration:none;color:inherit;background:var(--card);
         border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin:0 0 12px}
  a.card:hover{border-color:var(--accent)}
  .slug{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;font-weight:600}
  .title{color:var(--muted);font-size:13px;margin-top:3px}
  .live{float:right;font-size:10px;font-weight:700;letter-spacing:.08em;background:var(--accent);
        color:#fff;padding:3px 8px;border-radius:99px}
  footer{margin-top:32px;padding-top:20px;border-top:1px solid var(--line);
         color:var(--muted);font-size:13px}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;
       background:var(--bg);border:1px solid var(--line);padding:1px 5px;border-radius:4px}
</style></head><body><div class="wrap">${body}</div></body></html>`;

function indexPage(): string {
  const cards = Object.entries(VARIANTS)
    .map(
      ([slug, v]) => `<a class="card" href="/v/${slug}">
      ${slug === PRODUCTION_VARIANT ? '<span class="live">IN PRODUCTION</span>' : ""}
      <div class="slug">${slug}</div><div class="title">${v.title}</div></a>`,
    )
    .join("");
  return SHELL(
    "Pacer Demo Reels — Staging",
    `<div class="tag">Staging · not for distribution</div>
     <h1>Demo Reels</h1>
     <p class="lede">Every reel variant, served for review before promotion. The production URL
     serves only the promoted reel.</p>
     ${cards}
     <footer>Promote with <code>./promote.sh &lt;slug&gt; --deploy</code>.<br>
     Process: <code>pacerai-content/collateral/demo_reels/README.md</code></footer>`,
  );
}

function notFoundPage(what: string): string {
  const list = Object.keys(VARIANTS)
    .map((s) => `<a class="card" href="/v/${s}"><div class="slug">${s}</div></a>`)
    .join("");
  return SHELL(
    "Not found — Pacer Demo Reels Staging",
    `<div class="tag">404</div><h1>No variant named that</h1>
     <p class="lede">Nothing registered for <code>${escapeHtml(what)}</code>. Available variants:</p>
     ${list}
     <footer>Add one: drop the HTML in <code>src/variants/</code>, register it in
     <code>src/staging.ts</code>, then <code>npm run deploy:staging</code>.</footer>`,
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
