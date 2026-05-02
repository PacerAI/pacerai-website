#!/usr/bin/env python3
"""
Local preview server for getpacerai.com pages.
Simulates WordPress rendering quirks so you can test before deploying.

Usage:
    python3 scripts/preview.py                # Start on port 5500
    python3 scripts/preview.py --port 8080    # Custom port

Then open: http://localhost:5500/src/homepage/index-build.html

Features:
- Injects WPCode CSS/JS from src/homepage/ into <head> (simulates WPCode Header injection)
- Strips inline <script> tags from content (simulates WordPress stripping)
- Applies TT4 theme reset CSS (simulates WordPress theme overrides)
- Shows a "LOCAL PREVIEW" banner so it's never confused with the live site
"""
import http.server
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 5500

# TT4 theme reset — simulates what WordPress applies on top of page content
TT4_RESET = """
<style id="tt4-reset">
/* Simulated WordPress TT4 theme reset */
body { margin: 0; padding: 0; }
.wp-site-blocks > header, .wp-site-blocks > footer { display: none; }
</style>
"""

# Banner to distinguish from live site — injected via JS to avoid breaking page layout
PREVIEW_BANNER = """
<script id="wpcode-preview-banner">
(function(){
  var b = document.createElement('div');
  b.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:linear-gradient(90deg,#D97757,#C94C4C);color:#fff;text-align:center;padding:8px 16px;font-family:sans-serif;font-size:12px;font-weight:600;letter-spacing:0.05em;';
  b.innerHTML = 'LOCAL PREVIEW — Not WordPress. &lt;script&gt; tags stripped. <a href="#" onclick="this.parentElement.remove();return false;" style="color:#fff;margin-left:12px;text-decoration:underline;">Dismiss</a>';
  document.body.appendChild(b);
})();
</script>
"""


class PreviewHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=REPO, **kwargs)

    def do_GET(self):
        # Only transform .html files in src/
        if self.path.endswith(".html") and "/src/" in self.path:
            filepath = os.path.join(REPO, self.path.lstrip("/"))
            if os.path.exists(filepath):
                self.send_transformed(filepath)
                return

        # Serve everything else normally (images, CSS, etc.)
        super().do_GET()

    def send_transformed(self, filepath):
        with open(filepath) as f:
            content = f.read()

        # 1. Load WPCode CSS if it exists
        wpcode_css = ""
        css_path = os.path.join(REPO, "src/homepage/wpcode-homepage-css.css")
        if os.path.exists(css_path):
            with open(css_path) as f:
                wpcode_css = f"<style id='wpcode-css'>{f.read()}</style>"

        # 2. Load WPCode JS if it exists
        wpcode_js = ""
        js_path = os.path.join(REPO, "src/homepage/wpcode-typed-hero.js")
        if os.path.exists(js_path):
            with open(js_path) as f:
                wpcode_js = f"<script id='wpcode-js'>{f.read()}</script>"

        # 3. Strip inline <script> tags (simulates WordPress behavior)
        # Keep <script type="application/ld+json"> (structured data)
        stripped_scripts = []
        def strip_script(match):
            tag = match.group(0)
            if 'type="application/ld+json"' in tag:
                return tag  # Keep JSON-LD
            stripped_scripts.append(tag[:80] + "..." if len(tag) > 80 else tag)
            return f"<!-- STRIPPED by preview server: script tag removed (WordPress behavior) -->"

        content = re.sub(r'<script(?! id=[\'"]wpcode)(?:(?!type="application/ld\+json")[^>])*>.*?</script>',
                        strip_script, content, flags=re.DOTALL)

        # 4. Build the full page
        # Check if the file already has <html> wrapper
        if "<html" in content.lower():
            # File is a complete HTML document — inject into <head>
            transformed = content
        else:
            # File is a fragment (typical for wp:html content) — wrap it
            transformed = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview — getpacerai.com</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
{TT4_RESET}
{wpcode_css}
</head>
<body>
{PREVIEW_BANNER}
{content}
{wpcode_js}
</body>
</html>"""

        # 5. Add char count info as a comment at the end
        original_size = os.path.getsize(filepath)
        limit_status = "OK" if original_size < 67000 else f"OVER by {original_size - 67000:,}"
        transformed += f"\n<!-- PREVIEW: source file {original_size:,} chars | limit 67,000 | {limit_status} -->"

        if stripped_scripts:
            transformed += f"\n<!-- PREVIEW: {len(stripped_scripts)} <script> tags stripped (WordPress behavior) -->"

        # Send response
        encoded = transformed.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", len(encoded))
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()
        self.wfile.write(encoded)


def main():
    port = PORT
    if "--port" in sys.argv:
        idx = sys.argv.index("--port")
        if idx + 1 < len(sys.argv):
            port = int(sys.argv[idx + 1])

    os.chdir(REPO)
    server = http.server.HTTPServer(("", port), PreviewHandler)

    print(f"{'=' * 60}")
    print(f"PREVIEW SERVER — getpacerai.com")
    print(f"{'=' * 60}")
    print(f"Serving from: {REPO}")
    print(f"Port: {port}")
    print(f"")
    print(f"Pages:")
    for name, path in [
        ("Homepage", "src/homepage/index-build.html"),
        ("ARR Snowball", "src/solutions/arr-snowball.html"),
        ("Customer Data Cube", "src/solutions/customer-data-cube.html"),
        ("Blog Index", "src/blog/index-build.html"),
        ("Team", "src/team/team-page.html"),
    ]:
        print(f"  http://localhost:{port}/{path}")
    print(f"")
    print(f"WPCode CSS: {'loaded' if os.path.exists(os.path.join(REPO, 'src/homepage/wpcode-homepage-css.css')) else 'NOT FOUND'}")
    print(f"WPCode JS:  {'loaded' if os.path.exists(os.path.join(REPO, 'src/homepage/wpcode-typed-hero.js')) else 'NOT FOUND'}")
    print(f"")
    print(f"Press Ctrl+C to stop")
    print(f"{'=' * 60}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
