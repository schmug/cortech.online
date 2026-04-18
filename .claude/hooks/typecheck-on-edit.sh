#!/usr/bin/env bash
# PostToolUse hook: run `npm run typecheck` after Edit/Write/MultiEdit on TS/Astro files.
# Non-blocking: surfaces errors in the transcript but never halts the workflow.
#
# Claude Code passes the tool invocation as JSON on stdin; we pull out tool_input.file_path.
set -u

payload="$(cat)"
file_path="$(printf '%s' "$payload" | node -e "
let s='';
process.stdin.on('data', d => s += d);
process.stdin.on('end', () => {
  try { process.stdout.write(JSON.parse(s).tool_input?.file_path || ''); } catch {}
});
" 2>/dev/null)"

case "$file_path" in
  *.ts|*.tsx|*.astro) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0
npm run --silent typecheck || true
exit 0
