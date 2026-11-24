#!/usr/bin/env python3
"""Upload an image to the WordPress media library via REST API.

Usage:
    python3 scripts/upload_og_image.py [path-to-image]

Defaults to the CRO financial-modeling OG card. Media upload works via the
Application Password (only Yoast *meta* fields are blocked on WordPress.com),
so this gets the asset hosted and returns its source_url for the Yoast step.
"""
import os
import sys
import mimetypes
import requests

DEFAULT = "img/og/pacer-ai-og-cro-modeling.png"


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT
    base = os.environ["WP_BASE_URL"]
    auth = (os.environ["WP_USER"], os.environ["WP_APP_PASSWORD"])
    fn = os.path.basename(path)
    ctype = mimetypes.guess_type(fn)[0] or "application/octet-stream"

    with open(path, "rb") as f:
        data = f.read()

    resp = requests.post(
        f"{base}/wp-json/wp/v2/media",
        data=data,
        auth=auth,
        headers={
            "Content-Type": ctype,
            "Content-Disposition": f"attachment; filename={fn}",
        },
    )
    if resp.status_code not in (200, 201):
        print(f"FAILED — HTTP {resp.status_code}: {resp.text[:400]}")
        sys.exit(1)

    j = resp.json()
    print("OK — uploaded to WordPress media library")
    print(f"  media id   : {j.get('id')}")
    print(f"  source_url : {j.get('source_url')}")
    print(f"  dimensions : {j.get('media_details', {}).get('width')}x"
          f"{j.get('media_details', {}).get('height')}")
    print("\nNext: in WP Admin → Home (page 25) → Yoast SEO → Social,")
    print("select this image as the Social/Facebook image.")


if __name__ == "__main__":
    main()
