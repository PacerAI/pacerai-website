#!/usr/bin/env bash
# Pull the generated demo reel out of the platform repo and into this worker.
#
#   ./sync.sh <slug>    stage it as src/variants/<slug>.html   ← PREFERRED
#   ./sync.sh           legacy: write straight to src/demo.html (production input)
#
# The staged path is preferred because it never touches production. Stage → register in
# src/staging.ts → `npm run deploy:staging` → review → `./promote.sh <slug> --deploy`.
#
# Regenerate the reel first (project venv — Python 3.12; bare python3 will fail):
#   ~/.venvs/pacer/bin/python demo-site/build_demo_site.py
#
# Process doc: pacerai-content/collateral/demo_reels/README.md
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="${PACER_DEMO_SRC:-$HOME/Documents/pacerai/pacerai-platform-claude-native/demo-site/demo-video-by-claude.html}"
SLUG="${1:-}"

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: canonical demo not found at: $SRC" >&2
  echo "Set PACER_DEMO_SRC to override." >&2
  exit 1
fi

if [[ -z "$SLUG" ]]; then
  DEST="$HERE/src/demo.html"
  echo "WARNING: no slug given — writing straight to the PRODUCTION input (src/demo.html)."
  echo "         Prefer:  ./sync.sh <slug>   then ./promote.sh <slug> --deploy"
else
  if [[ ! "$SLUG" =~ ^[a-z0-9-]+$ ]]; then
    echo "ERROR: slug must be lowercase letters, digits, and hyphens: $SLUG" >&2
    exit 1
  fi
  DEST="$HERE/src/variants/$SLUG.html"
  if [[ -f "$DEST" ]]; then
    echo "ERROR: src/variants/$SLUG.html already exists." >&2
    echo "Never overwrite a slug — a new version is a new slug (e.g. ${SLUG%-v*}-v2)." >&2
    exit 1
  fi
  mkdir -p "$HERE/src/variants"
fi

cp "$SRC" "$DEST"
echo "Synced -> ${DEST#$HERE/} ($(wc -c < "$DEST" | tr -d ' ') bytes, $(shasum -a 256 "$DEST" | cut -c1-16))"

if [[ -n "$SLUG" ]]; then
  echo ""
  echo "Next:"
  echo "  1. register it in src/staging.ts (import + VARIANTS entry — the file says where)"
  echo "  2. npm run deploy:staging"
  echo "  3. review https://pacer-demo-worker-staging.will-078.workers.dev/v/$SLUG"
  echo "  4. ./promote.sh $SLUG --deploy   (when you're ready for production)"
else
  echo "Next: npm run deploy"
fi
