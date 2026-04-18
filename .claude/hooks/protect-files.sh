#!/usr/bin/env bash
# PreToolUse hook: block edits to deploy-contract and secret files unless the user confirms.
# Exit 2 → Claude Code surfaces the message and asks for confirmation before proceeding.
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
  */public/_routes.json|public/_routes.json)
    echo "Protected: public/_routes.json controls the Cloudflare Pages static-vs-Functions split (see docs/architecture.md). Confirm before editing." >&2
    exit 2
    ;;
  */package-lock.json|package-lock.json)
    echo "Protected: package-lock.json — prefer running 'npm install <pkg>' over hand-editing." >&2
    exit 2
    ;;
  */.env|.env|*/.env.*|.env.*)
    echo "Protected: .env files may contain secrets. Confirm before editing." >&2
    exit 2
    ;;
esac

exit 0
