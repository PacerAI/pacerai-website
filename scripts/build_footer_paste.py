#!/usr/bin/env python3
"""
Regenerate src/wpcode/footer.paste.txt from src/wpcode/footer.js.

The WPCode "Header & Footer -> Footer" field injects its contents verbatim, so the
JS has to arrive wrapped in script tags. Getting that wrapper wrong has taken the
whole site's JS down once already (a stray opening tag where a closing tag belonged
-> "Unexpected token <" -> every footer script dead, silently).

This script does the wrapping so nobody has to do it by hand, and refuses to write
if footer.js contains a literal closing script tag, which would end the wrapper early.

Usage:  python3 scripts/build_footer_paste.py [--check]
        --check  verify the paste file is current without rewriting it (for CI)
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "wpcode" / "footer.js"
OUT = ROOT / "src" / "wpcode" / "footer.paste.txt"

HEADER = """<!-- =====================================================================
     PASTE TARGET: WP Admin -> WPCode -> Header & Footer -> FOOTER
     GENERATED FILE - do not edit. Source: src/wpcode/footer.js
     Regenerate:  python3 scripts/build_footer_paste.py

     Paste this WHOLE file, script tags included.
     (If you use a WPCode "JavaScript Snippet" instead, it auto-wraps -
      paste src/wpcode/footer.js itself and leave the tags off.)

     Never minify: WordPress inserts line breaks mid-token and kills it.
     Verify after saving - console:
       document.querySelectorAll('.wp-cta-form').length
     ===================================================================== -->
"""


def build() -> str:
    js = SRC.read_text(encoding="utf-8")

    offenders = list(re.finditer(r"</\s*script", js, re.I))
    if offenders:
        lines = sorted({js[: m.start()].count("\n") + 1 for m in offenders})
        sys.exit(
            f"REFUSING to build: {SRC.relative_to(ROOT)} contains a literal closing "
            f"script tag on line(s) {lines}. Inside the wrapper it closes the block "
            f"early and every footer script dies. Split the string (e.g. '<' + '/script>')."
        )

    return HEADER + "<script>\n" + js.rstrip("\n") + "\n</script>\n"


def main() -> None:
    built = build()

    if "--check" in sys.argv:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != built:
            sys.exit(
                f"STALE: {OUT.relative_to(ROOT)} does not match {SRC.relative_to(ROOT)}. "
                f"Run: python3 scripts/build_footer_paste.py"
            )
        print(f"OK  {OUT.relative_to(ROOT)} is current ({len(built):,} chars)")
        return

    OUT.write_text(built, encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}  ({len(built):,} chars, {built.count(chr(10))} lines)")
    print("Next: paste it into WP Admin -> WPCode -> Header & Footer -> Footer, then Save.")


if __name__ == "__main__":
    main()
