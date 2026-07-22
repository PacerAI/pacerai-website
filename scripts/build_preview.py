#!/usr/bin/env python3
"""
Build a browser-openable preview of the v3 Claude-bone homepage.

WHY: `src/homepage/index-build.html` is a WordPress CONTENT FRAGMENT — no <html>/<head>,
its JS lives in the WPCode footer snippet (src/wpcode/footer.js), and its demo iframe +
Tahoe background point at PRODUCTION URLs that aren't live until deploy. So opening the raw
source in a browser shows a static, backdrop-less, demo-less page. This script wraps the
source into a full HTML document, inlines the WPCode JS (so the rotor / marquee / pipeline
animate), and points the demo iframe + Tahoe backdrop at LOCAL copies — so the preview looks
exactly like the deployed page.

SOURCE OF TRUTH stays `src/homepage/index-build.html`. This script only GENERATES a preview
from it — never edit the generated file; edit the source and re-run.

Usage:
    python3 scripts/build_preview.py            # regenerate the preview file + local assets
    python3 scripts/build_preview.py --serve     # ...then serve it at http://127.0.0.1:5599/
    python3 scripts/build_preview.py --serve --port 8080

Output (git-ignored assets, committed HTML):
    docs/design/homepage/index-build-bone_v3_2026-07-22.html   (the preview doc)
    docs/design/homepage/demo-video-by-claude.html             (local demo copy, git-ignored)
    docs/design/homepage/tahoe-bg.jpg                          (local backdrop copy, git-ignored)

Open it either way:
  - VS Code Live Server on the committed HTML, OR
  - the --serve URL printed below.
"""
import os
import sys
import shutil
import http.server
import socketserver

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, "src/homepage/index-build.html")
JS = os.path.join(REPO, "src/wpcode/footer.js")
OUT_DIR = os.path.join(REPO, "docs/design/homepage")
OUT = os.path.join(OUT_DIR, "index-build-bone_v3_2026-07-22.html")

# Production URLs in the source → local relative names in the preview.
DEMO_PROD = "https://pacer-demo-worker.will-078.workers.dev/"
DEMO_LOCAL = "demo-video-by-claude.html"
TAHOE_PROD = "https://getpacerai.com/wp-content/uploads/2026/07/tahoe-bg.jpg"
TAHOE_LOCAL = "tahoe-bg.jpg"

# Canonical demo assets (override with PACER_DEMO_SRC to point elsewhere).
DEMO_SRC = os.environ.get(
    "PACER_DEMO_SRC",
    os.path.join(os.path.dirname(REPO), "pacerai-platform-claude-native/demo-site/demo-video-by-claude.html"),
)
TAHOE_SRC = os.path.join(os.path.dirname(DEMO_SRC), "assets/tahoe-bg.jpg")

HEAD = (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    '<title>Pacer AI — v3 Claude-bone homepage (preview)</title>\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">\n'
    "</head><body>\n"
)


def build():
    body = open(SRC).read()
    js = open(JS).read()
    preview = body.replace(DEMO_PROD, DEMO_LOCAL).replace(TAHOE_PROD, TAHOE_LOCAL)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, "w") as f:
        f.write(HEAD + preview + f"\n<script>\n{js}\n</script>\n</body></html>\n")

    for src, name in ((DEMO_SRC, DEMO_LOCAL), (TAHOE_SRC, TAHOE_LOCAL)):
        dest = os.path.join(OUT_DIR, name)
        if os.path.exists(src):
            shutil.copy(src, dest)
        else:
            print(f"  WARN: demo asset not found: {src} (preview will miss {name})")

    rel = os.path.relpath(OUT, REPO)
    print(f"Built preview -> {rel}")
    print("Open it via VS Code Live Server, or run with --serve.")
    return OUT


def serve(path, port):
    directory = os.path.dirname(path)
    fname = os.path.basename(path)

    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k):
            super().__init__(*a, directory=directory, **k)

        def log_message(self, *a):
            pass

    with socketserver.TCPServer(("127.0.0.1", port), H) as httpd:
        url = f"http://127.0.0.1:{port}/{fname}"
        print(f"\nServing preview at:  {url}\n(Ctrl-C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped.")


def main():
    out = build()
    if "--serve" in sys.argv:
        port = 5599
        if "--port" in sys.argv:
            port = int(sys.argv[sys.argv.index("--port") + 1])
        serve(out, port)


if __name__ == "__main__":
    main()
