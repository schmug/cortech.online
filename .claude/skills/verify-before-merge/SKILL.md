---
name: verify-before-merge
description: Run the full pre-merge verification gate — typecheck, vitest, playwright e2e, and (if blog content changed) build. Use this skill before creating a PR, marking work ready for review, or claiming a task is complete. The repo has NO CI, so green local output here is the merge gate.
---

# verify-before-merge — the merge-gate ritual

Per [CLAUDE.md](CLAUDE.md): the repo has **no CI workflow**. Green local output from these checks is the merge gate. Never skip a step; never claim a task is done without running this.

## What runs

Run in order, capturing pass/fail for each:

1. **`npm run typecheck`** — `astro check && tsc --noEmit`. Catches type errors and most Astro template issues.
2. **`npm test`** — vitest unit suite (~63 tests, sub-second).
3. **`npm run test:e2e`** — Playwright. Auto-starts the dev server on `:4321`. Takes the longest; runs last.
4. **`npm run build`** — **only if** `git status` (or `git diff --name-only <base>`) shows changes under `src/content/blog/` or to `src/content.config.ts`. `build` is the only thing that catches blog-post schema errors; typecheck alone misses them.

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
✓ typecheck
✓ vitest (63 passed)
✓ playwright (28 passed)
✓ build                ← only when run
———
All checks passed — safe to open PR / merge.
```

On failure, report the failing check, the first few lines of its output, and stop:

```
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
