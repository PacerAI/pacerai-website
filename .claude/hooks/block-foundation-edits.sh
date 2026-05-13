#!/usr/bin/env bash
# .claude/hooks/block-foundation-edits.sh
#
# Reference implementation — canonical per ADR-0002 and architecture-work-stream.md §"Hook Specifications".
# Deploy by copying to each foundation-consuming repo:
#
#   cp company-architecture/templates/hooks/block-foundation-edits.sh \
#      pacerai-{platform,gtm,website}/.claude/hooks/block-foundation-edits.sh
#   chmod +x pacerai-{platform,gtm,website}/.claude/hooks/block-foundation-edits.sh
#
# Then register in each repo's .claude/settings.json under hooks.PreToolUse
# (see templates/hooks/settings-snippet.json).
#
# Behavior: reads tool input from stdin as JSON. If the Edit/Write target is
# inside ./foundation/, exits 2 with a block message. Otherwise exits 0.

input=$(cat)
target_path=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.path // ""')

if [[ "$target_path" == *"/foundation/"* ]] || [[ "$target_path" == "foundation/"* ]]; then
  echo '{"block": true, "message": "Edits to foundation/ are blocked. Foundation is a read-only submodule. To change canonical doctrine, edit ~/Documents/pacerai/pacerai-foundation/ directly, push, then run: git submodule update --remote foundation"}' >&2
  exit 2
fi

exit 0
