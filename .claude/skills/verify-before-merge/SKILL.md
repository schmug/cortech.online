---
name: verify-before-merge
description: Run the same checks CI runs (format:check, lint, typecheck, vitest, playwright, build) locally for fast feedback before pushing. Use before creating a PR, marking work ready for review, or claiming a task is complete — so CI catches nothing unexpected.
---

# verify-before-merge — run CI checks locally

CI (`.github/workflows/ci.yml`) runs format:check, lint, typecheck, vitest, playwright, and build on every PR. Running those same commands locally first catches issues in seconds instead of minutes of CI churn.

## What runs

Run in order, capturing pass/fail for each:

1. **`npm run format:check`** — prettier. Fast. If it fails, run `npm run format` to auto-fix, then re-run.
2. **`npm run lint`** — eslint. If it fails, try `npm run lint:fix` first.
3. **`npm run typecheck`** — `astro check && tsc --noEmit`. Catches type errors and most Astro template issues.
4. **`npm test`** — vitest unit suite (sub-second).
5. **`npm run test:e2e`** — Playwright. Auto-starts the dev server on `:4321`. Takes the longest.
6. **`npm run build`** — always runs in CI. Locally, skip it unless `src/content/blog/` or `src/content.config.ts` changed — `build` is the only thing that catches blog-post schema errors, and it's slow.

## Step 1 — Decide whether `build` is needed

```sh
# Show files modified since branching off main (or uncommitted).
changed="$( { git diff --name-only origin/main...HEAD; git status --porcelain | awk '{print $2}'; } | sort -u )"
echo "$changed" | grep -E '^(src/content/blog/|src/content\.config\.ts$)' >/dev/null && NEEDS_BUILD=1 || NEEDS_BUILD=0
```

If blog content/schema didn't change, skip `build` — e2e already exercises the built-bundle path in dev mode, and `build` is slow.

## Step 2 — Run checks

Run sequentially (not in parallel — e2e spins up a dev server that would conflict with build):

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
# Only when NEEDS_BUILD=1:
npm run build
```

If a check fails, stop. Fix the root cause and re-run from that check onwards. **Do not** mark the skill successful on partial passes.

## Step 3 — Report

Output a compact verdict, one line per check:

```
✓ format:check
✓ lint
✓ typecheck
✓ vitest (85 passed)
✓ playwright (28 passed)
✓ build                ← only when run
———
All checks passed — safe to open PR / merge.
```

On failure, report the failing check, the first few lines of its output, and stop:

```
✓ format:check
✓ lint
✓ typecheck
✗ vitest — 2 failed
  FAIL  src/components/os/store.test.ts
    Window focus › increments nextZ
      expected 3 to be 4
———
Fix the failing tests before continuing.
```

## When to skip this skill

- Pure docs edits that don't touch `src/content/**` (e.g. README, `docs/*.md`) — typecheck alone is enough.
- Config-only changes to `.claude/` or `.github/` — none of the suites cover these.

## Out of scope

- Running `npm run test:coverage` — only when explicitly asked; slower than plain `test`.
- Linting — there's no lint script configured.
- Deploying — Cloudflare Pages deploys on merge to `main` automatically.
