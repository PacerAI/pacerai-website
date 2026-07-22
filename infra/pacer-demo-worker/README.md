# pacer-demo-worker

Cloudflare Worker that serves the Pacer AI **demo video** — the Claude app window animating over
a macOS-Tahoe desktop — so the getpacerai.com **v3 homepage** can iframe it. The demo HTML is
~160K and can't live in a WordPress page (block-size limit), so it's served from here.

Lives in the **website** repo (not gtm) because its only job is to serve the homepage iframe —
it has no GTM concern. Co-located with the site's other deploy tooling under `infra/`.

- **Serves at:** `https://pacer-demo-worker.will-078.workers.dev/`
- **Embedded by:** the homepage showcase iframe in `src/homepage/index-build.html`
  (`<iframe src="https://pacer-demo-worker.will-078.workers.dev/">`).
- **Demo source of truth:** `pacerai-platform-claude-native/demo-site/demo-video-by-claude.html`
  → copied to `src/demo.html` (refresh with `./sync.sh`).

## Structure

```
pacer-demo-worker/
├── src/index.ts     Worker entrypoint — serves demo.html with iframe-friendly headers
├── src/demo.html    The demo (copy of demo-video-by-claude.html; a build artifact)
├── src/html.d.ts    Text-module type shim
├── wrangler.toml    CF config (name, Text rule for *.html, workers_dev)
├── package.json     Local wrangler (no global install)
├── tsconfig.json    Strict TS
├── sync.sh          Refresh src/demo.html from the canonical demo
└── .gitignore
```

## Framing / security

The worker allows itself to be iframed **only** by getpacerai.com via
`Content-Security-Policy: frame-ancestors https://getpacerai.com https://*.getpacerai.com` and
deliberately does **not** send `X-Frame-Options` (which would block the embed). `/health` returns
`ok` for uptime checks.

## First-time deploy

```bash
cd pacerai-website/infra/pacer-demo-worker
npm install                 # installs wrangler locally
npx wrangler login          # interactive, opens browser (Will's Cloudflare account)
npm run deploy              # -> https://pacer-demo-worker.will-078.workers.dev
```

Verify: open `https://pacer-demo-worker.will-078.workers.dev/` (the Claude window renders on a
transparent background — the Tahoe backdrop comes from the homepage), then load getpacerai.com and
confirm the homepage showcase iframe displays it.

Redeploy after a demo change: `./sync.sh && npm run deploy`.

## Optional: custom domain (`demo.getpacerai.com`)

Nicer URL, but requires the `getpacerai.com` zone to be on **Cloudflare DNS** (the site itself is
WordPress.com-hosted, so confirm DNS first). If so: uncomment the `[[routes]]` block + set
`workers_dev = false` in `wrangler.toml`, `npm run deploy`, then update the homepage iframe `src`
to `https://demo.getpacerai.com/`. Until then, the `workers.dev` URL is the reliable default.
