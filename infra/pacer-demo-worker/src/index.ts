import demoHtml from "./demo.html";

/**
 * pacer-demo-worker
 * -----------------
 * Serves the self-contained Pacer AI "demo video" (a Claude app window animating over a
 * macOS-Tahoe desktop) so the getpacerai.com v3 homepage can iframe it. The demo HTML is
 * ~160K and cannot live in a WordPress page (block-size limit), so it is served here.
 *
 * The demo (src/demo.html) is a COPY of
 *   pacerai-platform-claude-native/demo-site/demo-video-by-claude.html
 * Refresh it with ./sync.sh after regenerating the demo, then redeploy.
 *
 * Framing: the response allows itself to be iframed ONLY by getpacerai.com (CSP
 * frame-ancestors) and deliberately does NOT send X-Frame-Options (which would block it).
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

    return new Response(demoHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        // Allow only the Pacer AI marketing site to embed this demo.
        "content-security-policy": "frame-ancestors https://getpacerai.com https://*.getpacerai.com;",
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
        "referrer-policy": "no-referrer",
      },
    });
  },
} satisfies ExportedHandler;
