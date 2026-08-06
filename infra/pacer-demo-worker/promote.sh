#!/usr/bin/env bash
# Promote a staged demo-reel variant to PRODUCTION.
#
#   ./promote.sh <slug>            dry run — show what would change, touch nothing
#   ./promote.sh <slug> --deploy   copy to src/demo.html AND deploy to production
#
# Production is https://pacer-demo-worker.will-078.workers.dev/, iframed by the
# getpacerai.com homepage. That is live traffic, so a deploy is never the default.
#
# Rollback is this same command pointed at the previous slug — every previously
# promoted variant stays in src/variants/ for exactly that reason.
#
# Process doc: pacerai-content/collateral/demo_reels/README.md
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SLUG="${1:-}"
DEPLOY="${2:-}"
PROD_URL="https://pacer-demo-worker.will-078.workers.dev/"

if [[ -z "$SLUG" || "$SLUG" == -* ]]; then
  echo "usage: ./promote.sh <slug> [--deploy]" >&2
  echo "" >&2
  echo "available variants:" >&2
  for f in "$HERE"/src/variants/*.html; do
    [[ -e "$f" ]] || { echo "  (none — stage one with ./sync.sh <slug>)" >&2; break; }
    echo "  $(basename "$f" .html)" >&2
  done
  exit 2
fi

SRC="$HERE/src/variants/$SLUG.html"
DEST="$HERE/src/demo.html"

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: no staged variant at src/variants/$SLUG.html" >&2
  echo "Stage it first:  ./sync.sh $SLUG   (then register it in src/staging.ts)" >&2
  exit 1
fi

sha() { shasum -a 256 "$1" | cut -d' ' -f1; }
OUT_SHA="$(sha "$DEST")"
IN_SHA="$(sha "$SRC")"

echo "promote: $SLUG"
echo "  outgoing  src/demo.html          ${OUT_SHA:0:16}  $(wc -c < "$DEST" | tr -d ' ') bytes"
echo "  incoming  src/variants/$SLUG.html  ${IN_SHA:0:16}  $(wc -c < "$SRC" | tr -d ' ') bytes"

if [[ "$OUT_SHA" == "$IN_SHA" ]]; then
  echo "  → identical; production already serves this reel. Nothing to do."
  exit 0
fi

if [[ "$DEPLOY" != "--deploy" ]]; then
  echo ""
  echo "DRY RUN — nothing written. To actually promote:"
  echo "  ./promote.sh $SLUG --deploy"
  exit 0
fi

cp "$SRC" "$DEST"
echo "  ✓ copied → src/demo.html"

npm run deploy
echo ""
echo "  ✓ deployed → $PROD_URL"
echo ""
echo "Now close the loop:"
echo "  1. verify $PROD_URL and the getpacerai.com homepage embed"
echo "  2. commit src/demo.html in pacerai-website"
echo "  3. update pacerai-content/collateral/demo_reels/registry.yaml"
echo "     → production_variant: $SLUG, and append to promotion_log"
