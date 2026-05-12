#!/usr/bin/env bash
# .claude/hooks/pre-publish-check.sh
# PreToolUse hook (matcher: Bash). Blocks scripts/deploy.py invocations if
# scripts/validate.py --strict fails. Catches voice violations, foundation
# pricing drift, and existing HTML validation failures.
#
# Bypass for dry-runs and for the validator itself (avoid recursion).

set -u

input=$(cat)

# Parse the Bash command from the PreToolUse JSON. Tolerate jq missing.
if command -v jq >/dev/null 2>&1; then
  cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')
else
  # Fallback: pull command field via grep (best-effort).
  cmd=$(printf '%s' "$input" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"command"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
fi

# Not a deploy invocation? Allow.
if ! printf '%s' "$cmd" | grep -qE '(^|[ /])scripts/deploy\.py( |$)'; then
  exit 0
fi

# Dry-run? Allow (the operator is previewing, not publishing).
if printf '%s' "$cmd" | grep -qE -- '(--dry-run|\bdry-run\b)'; then
  exit 0
fi

# --force flag tries to skip in-script validation. Don't let it skip the hook.
# (No early exit — we still run validation below.)

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

if ! command -v python3 >/dev/null 2>&1; then
  printf '{"block": true, "message": "Pre-publish hook needs python3 on PATH."}' >&2
  exit 2
fi

# Run full validation. Use --strict so warnings also block (e.g., HTML comments,
# CSS bloat, footer drift). Capture output for the block message.
output=$(python3 scripts/validate.py --strict 2>&1)
rc=$?

if [[ $rc -ne 0 ]]; then
  printf '%s' "$output" | python3 -c '
import json, sys
output = sys.stdin.read()
tail = "\n".join(output.splitlines()[-80:])
msg = (
    "Pre-publish validation failed (strict).\n\n"
    f"{tail}\n\n"
    "Fix the failures above, run with --dry-run to preview, "
    "or update foundation/ if the drift is intentional."
)
print(json.dumps({"block": True, "message": msg}))
' >&2
  exit 2
fi

exit 0
