#!/usr/bin/env bash
# Refresh the served demo from its canonical source in the platform repo.
# Run this after regenerating the demo, then `npm run deploy`.
set -euo pipefail

SRC="${PACER_DEMO_SRC:-$HOME/Documents/pacerai/pacerai-platform-claude-native/demo-site/demo-video-by-claude.html}"
DEST="$(cd "$(dirname "$0")" && pwd)/src/demo.html"

if [[ ! -f "$SRC" ]]; then
  echo "ERROR: canonical demo not found at: $SRC" >&2
  echo "Set PACER_DEMO_SRC to override." >&2
  exit 1
fi

cp "$SRC" "$DEST"
echo "Synced demo -> src/demo.html ($(wc -c < "$DEST" | tr -d ' ') bytes)"
echo "Next: npm run deploy"
