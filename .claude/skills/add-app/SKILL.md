---
name: add-app
description: Add a new CortechOS app to the registry — appends an AppManifest entry, bumps the mobile springboard tile-count assertion in e2e/smoke.spec.ts, and (for iframe apps) verifies the target URL allows framing. Use when the user says "add an app", "register this project as an app", or similar.
---

# add-app — register a new CortechOS app

CortechOS is data-driven: one entry in [src/apps/registry.ts](src/apps/registry.ts) wires up the launcher, desktop icons, and taskbar. The only thing the registry **doesn't** touch automatically is the mobile springboard e2e assertion — that's a hard-coded number in [e2e/smoke.spec.ts](e2e/smoke.spec.ts) and forgetting to bump it is the #1 recurring footgun.

## Inputs

Ask the user (in one batch) for any missing details:

- **Type**: `native` (React component) or `iframe` (external URL)
- **id**: short kebab-case; must be unique within the registry
- **name**: display name (e.g. `"dmarc.mx"`)
- **description**: one-line, shown in the launcher and desktop icon tooltip
- **icon**: either an emoji (`"📇"`) or a path to an SVG under `/public/` (`"/mark-sm.svg"`)
- For **iframe** apps: `url` (full URL) and `githubRepo` (`owner/repo`, optional)
- For **native** apps: path to the component file (defaults to `src/components/os/apps/<PascalCaseId>App.tsx`)
- **defaultSize**: `{ w, h }` in px (existing iframe apps use `{ 960, 680 }`, native apps vary)
- **minSize** (optional): only needed if the default is large; mirrors existing entries

## Step 1 — Append the registry entry

Edit [src/apps/registry.ts](src/apps/registry.ts). Append to the `apps` array, following the shape of adjacent entries exactly. Example iframe shape:

```ts
{
  id: 'example',
  name: 'example.com',
  description: 'One-line blurb.',
  icon: '🧭',
  type: 'iframe',
  url: 'https://example.com',
  defaultSize: { w: 960, h: 680 },
  githubRepo: 'schmug/example',
},
```

Native shape:

```ts
{
  id: 'example',
  name: 'Example',
  description: 'One-line blurb.',
  icon: '🧭',
  type: 'native',
  component: () => import('../components/os/apps/ExampleApp'),
  defaultSize: { w: 640, h: 560 },
  allowMultiple: false,
},
```

For a native app you'll also need to create the component file at the referenced path. Keep it minimal — export a default React component.

## Step 2 — Bump the mobile springboard tile-count assertion

**This is the footgun.** Open [e2e/smoke.spec.ts](e2e/smoke.spec.ts) and find the assertion `expect(await tiles.count()).toBe(N)` inside the `mobile springboard` describe block (currently around line 218). Increment `N` by 1 (or by however many entries you added).

The matching desktop assertion and dock tests don't depend on the total count — the springboard tile count is the only one to update.

## Step 3 — For iframe apps: verify framing is allowed

The iframe-embed Playwright suite enforces that iframe app URLs don't block framing. Before adding an iframe app, verify manually:

```sh
curl -sSI "<url>" | grep -iE "x-frame-options|content-security-policy"
```

Reject the app (or work with the target site owner) if:
- Response has `X-Frame-Options: DENY` (or `SAMEORIGIN` on a different origin)
- Response has `Content-Security-Policy: frame-ancestors 'none'` (or a list that excludes `cortech.online`)

If Playwright MCP is available, prefer navigating to the URL and checking in DevTools — catches edge cases like meta-tag CSP.

## Step 4 — Verify

Run the full gate:

```sh
npm run typecheck
npm test
npm run test:e2e
```

All three must pass before committing. If the tile-count assertion fails, go back to Step 2.

## Step 5 — Commit

```sh
git checkout -b claude/add-app-<id>
git add src/apps/registry.ts e2e/smoke.spec.ts
# For native apps, also add the component file.
git commit -m "$(cat <<'EOF'
feat(apps): add <name> to the app registry

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

## Out of scope

- Custom desktop-icon positioning (icons auto-lay out)
- Taskbar pinning / reordering (handled at runtime by the store)
- Adding to the mobile dock (separate change — only 3 apps live there)
