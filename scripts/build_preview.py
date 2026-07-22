#!/usr/bin/env python3
"""
Build browser-openable previews of the v3 Claude-bone pages.

WHY: the src/*.html files are WordPress CONTENT FRAGMENTS — no <html>/<head>, the homepage's
JS lives in the WPCode footer snippet, and the homepage's demo iframe + Tahoe background point
at PRODUCTION URLs that aren't live until deploy. So opening the raw source in a browser shows
a static, backdrop-less, demo-less page. This script wraps each source into a full HTML
document (fonts + inlined JS where needed + local demo/Tahoe assets) so the preview looks
exactly like the deployed page.

SOURCE OF TRUTH stays the src/*.html files. This only GENERATES previews from them — never
edit the generated files; edit the source and re-run.

Usage:
    python3 scripts/build_preview.py            # regenerate all previews + local assets
    python3 scripts/build_preview.py --serve     # ...then serve at http://127.0.0.1:5599/
    python3 scripts/build_preview.py --open       # ...serve AND open the homepage in the browser
    python3 scripts/build_preview.py --serve --port 8080

Outputs (in docs/design/homepage/):
    index-build-bone_v3_2026-07-22.html   homepage preview  (committed design reference)
    _blog.html                            blog preview      (git-ignored)
    _team.html                            team preview      (git-ignored)
    demo-video-by-claude.html, tahoe-bg.jpg   local homepage assets (git-ignored)

Preview URLs when --serve:
    http://127.0.0.1:5599/index-build-bone_v3_2026-07-22.html   (homepage)
    http://127.0.0.1:5599/_blog.html                            (blog)
    http://127.0.0.1:5599/_team.html                            (team)
"""
import os
import sys
import shutil
import subprocess
import http.server
import socketserver

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO, "docs/design/homepage")
JS = os.path.join(REPO, "src/wpcode/footer.js")

DEMO_PROD = "https://pacer-demo-worker.will-078.workers.dev/"
DEMO_LOCAL = "demo-video-by-claude.html"
TAHOE_PROD = "https://getpacerai.com/wp-content/uploads/2026/07/tahoe-bg.jpg"
TAHOE_LOCAL = "tahoe-bg.jpg"
DEMO_SRC = os.environ.get(
    "PACER_DEMO_SRC",
    os.path.join(os.path.dirname(REPO), "pacerai-platform-claude-native/demo-site/demo-video-by-claude.html"),
)
TAHOE_SRC = os.path.join(os.path.dirname(DEMO_SRC), "assets/tahoe-bg.jpg")

HOMEPAGE_OUT = "index-build-bone_v3_2026-07-22.html"

# name -> (source file, output file, inline-the-WPCode-JS?, rewrite-homepage-assets?)
PAGES = {
    "homepage": ("src/homepage/index-build.html", HOMEPAGE_OUT, True, True),
    "blog":     ("src/blog/index-build.html",     "_blog.html", False, False),
    "team":     ("src/team/team-page.html",       "_team.html", False, False),
}

HEAD = (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    '<title>Pacer AI — v3 Claude-bone preview</title>\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">\n'
    "</head><body>\n"
)


def build():
    os.makedirs(OUT_DIR, exist_ok=True)
    js = open(JS).read()
    for name, (src_rel, out_name, inline_js, rewrite_assets) in PAGES.items():
        body = open(os.path.join(REPO, src_rel)).read()
        if rewrite_assets:
            body = body.replace(DEMO_PROD, DEMO_LOCAL).replace(TAHOE_PROD, TAHOE_LOCAL)
        doc = HEAD + body
        if inline_js:
            doc += f"\n<script>\n{js}\n</script>"
        doc += "\n</body></html>\n"
        with open(os.path.join(OUT_DIR, out_name), "w") as f:
            f.write(doc)
        print(f"  {name:9} -> docs/design/homepage/{out_name}")

    # local homepage assets (git-ignored)
    for src, name in ((DEMO_SRC, DEMO_LOCAL), (TAHOE_SRC, TAHOE_LOCAL)):
        if os.path.exists(src):
            shutil.copy(src, os.path.join(OUT_DIR, name))
        else:
            print(f"  WARN: asset not found: {src}")
    print("Open via VS Code Live Server, or run with --serve (--open to launch a browser).")


def serve(port, open_browser):
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k):
            super().__init__(*a, directory=OUT_DIR, **k)

        def log_message(self, *a):
            pass

    urls = {n: f"http://127.0.0.1:{port}/{o}" for n, (_, o, _, _) in PAGES.items()}
    with socketserver.TCPServer(("127.0.0.1", port), H) as httpd:
        print("\nPreview URLs:")
        for n, u in urls.items():
            print(f"  {n:9} {u}")
        if open_browser:
            # Prefer Chrome; fall back to the default browser.
            if subprocess.run(["open", "-a", "Google Chrome", urls["homepage"]], check=False).returncode != 0:
                subprocess.run(["open", urls["homepage"]], check=False)
        print("\n(Ctrl-C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped.")


def main():
    build()
    if "--serve" in sys.argv or "--open" in sys.argv:
        port = 5599
        if "--port" in sys.argv:
            port = int(sys.argv[sys.argv.index("--port") + 1])
        serve(port, open_browser="--open" in sys.argv)


if __name__ == "__main__":
    main()
