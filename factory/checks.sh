#!/usr/bin/env bash
# Everything that must pass before a change to the website merges. Runs in a job's worktree, on what's committed.
#
# This repo's gates are the same ones CI runs (.github/workflows/pre-publish.yml), plus the two staleness
# checks for generated files, plus the test suite. It needs the `foundation` submodule: without it
# validate.py silently skips the voice and pricing rules, which is the one failure worth guarding, so a
# missing submodule is a hard failure here rather than a quiet pass.
set -euo pipefail

cd "$(dirname "$0")/.."

PYTHON="${PACER_PYTHON:-$HOME/.venvs/pacer/bin/python}"
if [ ! -x "$PYTHON" ]; then
    PYTHON="$(command -v python3)"
fi
echo "[checks] python: $PYTHON"

# ---------------------------------------------------------------- foundation
# A git worktree does not populate submodules, so a job's first run has an empty foundation/.
if [ ! -f foundation/brand/voice.yml ]; then
    echo "[checks] foundation/ is empty — initialising the submodule."
    git submodule update --init --recursive foundation || true
fi
missing=0
for sentinel in foundation/brand/voice.yml \
                foundation/brand/anti-ai-writing-style.md \
                foundation/pricing/product-pricing-price-book.md; do
    if [ ! -f "$sentinel" ]; then
        echo "[checks] MISSING $sentinel" >&2
        missing=1
    fi
done
if [ "$missing" -ne 0 ]; then
    echo "[checks] foundation/ is a private submodule (PacerAI/pacerai-foundation)." >&2
    echo "[checks] Without these files validate.py skips the voice and pricing rules and passes anything." >&2
    echo "[checks] Run: git submodule update --init --recursive foundation" >&2
    exit 1
fi
echo "[checks] foundation files present."

# ---------------------------------------------------------------- the validator
# --strict treats WARNs as FAILs, which is what CI runs. No file arguments means the live, redeployable
# pages that validate.py itself declares in DEFAULT_FILES; the retired 301'd pages stay out of it.
"$PYTHON" scripts/validate.py --strict
echo "[checks] pages validate."

# ---------------------------------------------------------------- generated files are current
# The footer paste is built from the nav and footer that every page shares. A stale one ships a footer
# that disagrees with the site, and it never shows up in a diff review.
#
# scripts/build_pricing.py is deliberately NOT run here. The site has published no prices since
# 2026-11-02; /pricing/ is a 302 to the homepage and the script is retired, kept only for rollback.
# `--check` exits 1 by design, so running it would fail every job.
"$PYTHON" scripts/build_footer_paste.py --check
echo "[checks] footer paste is current."

# ---------------------------------------------------------------- the tests
"$PYTHON" -m pytest tests -q
