# Unified Brand Mark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `👋` AboutApp tile (issue #10) and the off-palette cyan-S GitHub avatar with a single tiered window-chrome + amber-S mark, wired into every surface of cortech.online.

**Architecture:** Two authoritative SVGs (`public/mark.svg` full, `public/mark-sm.svg` small) drive every derivative (favicon, GitHub PNG, apple-touch-icon, OG card). A Node generation script produces the PNGs/ICO from `sharp`. App-icon renderers gain a tiny convention: if the icon string starts with `/`, render as `<img>`; otherwise render as emoji.

**Tech Stack:** Astro 6, React 19, Tailwind 4, `sharp` (already installed via Astro), `npx png-to-ico` (on-demand), Playwright 1.59 (existing smoke suite).

**Spec:** `docs/superpowers/specs/2026-04-13-unified-brand-mark-design.md`

---

## File Structure

| Path | Status | Responsibility |
|------|--------|----------------|
| `public/mark.svg` | CREATE | Full variant vector — consumed by AboutApp, `/about`, OG |
| `public/mark-sm.svg` | CREATE | Small variant vector — consumed by registry, Logo, favicon |
| `public/favicon.svg` | OVERWRITE | Identical to `mark-sm.svg` (root-path convention) |
| `public/favicon.ico` | OVERWRITE | 32×32 legacy ICO derived from `mark-sm.svg` |
| `public/mark-460.png` | CREATE | 460×460 GitHub profile upload |
| `public/apple-touch-icon.png` | CREATE | 180×180 iOS home screen |
| `public/og-image.png` | CREATE | 1200×630 social card |
| `scripts/generate-brand-assets.mjs` | CREATE | Derivative PNG/ICO generator |
| `src/components/Logo.astro` | MODIFY | Inline SVG → small variant paths |
| `src/apps/registry.ts` | MODIFY | About icon `'👋'` → `'/mark-sm.svg'` |
| `src/apps/iconUtils.tsx` | CREATE | `renderIcon(icon, className)` helper — single source of conditional render |
| `src/components/os/apps/AboutApp.tsx` | MODIFY | `<div>👋</div>` → `<img src="/mark.svg" …>` |
| `src/components/os/Launcher.tsx` | MODIFY | Use `renderIcon` |
| `src/components/os/Desktop.tsx` | MODIFY | Use `renderIcon` |
| `src/components/os/Taskbar.tsx` | MODIFY | Use `renderIcon` |
| `src/components/os/Window.tsx` | MODIFY | Use `renderIcon` |
| `src/components/os/apps/SupportApp.tsx` | MODIFY | Use `renderIcon` (line 59) |
| `src/components/mobile/MobileShell.tsx` | MODIFY | Use `renderIcon` |
| `src/pages/index.astro` | MODIFY | Static-layer conditional for path icons (line 63) |
| `src/pages/about.astro` | MODIFY | Add matching avatar above eyebrow |
| `src/layouts/Base.astro` | MODIFY | Add og:image, twitter:image, apple-touch-icon meta |
| `e2e/smoke.spec.ts` | MODIFY | Add one assertion: About avatar `<img>` has non-empty `src` |

---

## Task 1: Author the SVG sources

**Files:**
- Create: `public/mark.svg`
- Create: `public/mark-sm.svg`

- [ ] **Step 1: Write `public/mark.svg` (full variant)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect x="3" y="3" width="26" height="26" rx="4" fill="#0b0d12" stroke="#f6c34a" stroke-width="2"/>
  <path d="M3 10 H29" stroke="#f6c34a" stroke-width="2"/>
  <circle cx="7"  cy="6.5" r="1.25" fill="#f6c34a"/>
  <circle cx="11" cy="6.5" r="1.25" fill="#5ee3d1"/>
  <circle cx="15" cy="6.5" r="1.25" fill="#ff6a5c"/>
  <text x="16" y="25" font-family="Inter, 'Arial Black', Arial, 'Helvetica Neue', sans-serif" font-size="14" font-weight="900" fill="#f6c34a" text-anchor="middle">S</text>
</svg>
```

- [ ] **Step 2: Write `public/mark-sm.svg` (small variant)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect x="2" y="2" width="28" height="28" rx="6" fill="#0b0d12" stroke="#f6c34a" stroke-width="2"/>
  <text x="16" y="23" font-family="Inter, 'Arial Black', Arial, 'Helvetica Neue', sans-serif" font-size="20" font-weight="900" fill="#f6c34a" text-anchor="middle">S</text>
</svg>
```

- [ ] **Step 3: Visually verify in a browser**

Run: `open public/mark.svg public/mark-sm.svg`
Expected: Both SVGs render — amber window chrome (full has titlebar dots + divider, small has just the frame). A bold amber "S" centered in each. If the S looks weak or mis-aligned, the fallback font isn't what Inter would be; that's acceptable for v1.

- [ ] **Step 4: Commit**

```bash
git add public/mark.svg public/mark-sm.svg
git commit -m "feat(brand): add authoritative mark SVGs (full + small variants)

Source vectors for the unified brand mark described in
docs/superpowers/specs/2026-04-13-unified-brand-mark-design.md"
```

---

## Task 2: Write the asset generation script

**Files:**
- Create: `scripts/generate-brand-assets.mjs`

- [ ] **Step 1: Write the script**

```javascript
#!/usr/bin/env node
// scripts/generate-brand-assets.mjs
// Regenerates public/favicon.{svg,ico}, public/mark-460.png,
// public/apple-touch-icon.png, and public/og-image.png
// from the authoritative public/mark{,-sm}.svg sources.

import { readFile, writeFile, copyFile, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pub = (p) => resolve(root, 'public', p);

async function main() {
  // 1. Keep favicon.svg lockstep with mark-sm.svg
  await copyFile(pub('mark-sm.svg'), pub('favicon.svg'));

  // 2. Full-variant derivatives
  const fullSvg = await readFile(pub('mark.svg'));
  await sharp(fullSvg, { density: 600 }).resize(460, 460).png().toFile(pub('mark-460.png'));
  await sharp(fullSvg, { density: 600 }).resize(180, 180).png().toFile(pub('apple-touch-icon.png'));
  await sharp(fullSvg, { density: 600 })
    .resize(460, 460)
    .extend({ top: 85, bottom: 85, left: 370, right: 370, background: '#0b0d12' })
    .png()
    .toFile(pub('og-image.png'));

  // 3. Small-variant ICO (via npx png-to-ico, on-demand)
  const smSvg = await readFile(pub('mark-sm.svg'));
  const tmpPng = pub('favicon-32.png');
  await sharp(smSvg, { density: 600 }).resize(32, 32).png().toFile(tmpPng);
  const ico = spawnSync('npx', ['--yes', 'png-to-ico', tmpPng], { encoding: 'buffer' });
  if (ico.status !== 0) {
    throw new Error(`png-to-ico failed:\n${ico.stderr.toString()}`);
  }
  await writeFile(pub('favicon.ico'), ico.stdout);
  await unlink(tmpPng);

  console.log('✓ Brand assets regenerated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Commit the script (assets will be generated in Task 3)**

```bash
git add scripts/generate-brand-assets.mjs
git commit -m "feat(brand): add script to regenerate derivative assets from SVG sources"
```

---

## Task 3: Generate the derivative assets

**Files:**
- Overwrite: `public/favicon.svg`, `public/favicon.ico`
- Create: `public/mark-460.png`, `public/apple-touch-icon.png`, `public/og-image.png`

- [ ] **Step 1: Run the generation script**

Run: `node scripts/generate-brand-assets.mjs`
Expected stdout: `✓ Brand assets regenerated.`
Expected files present (verify with `ls -la public/`):
- `public/favicon.svg` (overwritten, same content as `mark-sm.svg`)
- `public/favicon.ico` (regenerated 32×32)
- `public/mark-460.png` (~10–30 KB)
- `public/apple-touch-icon.png` (~3–10 KB)
- `public/og-image.png` (~10–30 KB)

- [ ] **Step 2: Spot-check visually**

Run: `open public/mark-460.png public/og-image.png public/apple-touch-icon.png`
Expected: `mark-460.png` shows the full mark centered at high resolution; `og-image.png` shows the mark small-centered on a 1200×630 void background; `apple-touch-icon.png` shows the full mark. The S should be clearly bold and amber. If `sharp` rendered an empty or very thin S, the fontconfig fallback failed — see Risk Mitigation below.

**Risk mitigation — S didn't render:** If the S is missing or a thin serif in the generated PNGs, install a system bold sans:
- macOS: the fallback chain should always pick up Arial Black or Helvetica. If not: `brew install --cask font-inter` and rerun.
- If still broken, replace both `<text>` elements in `public/mark.svg` and `public/mark-sm.svg` with a hand-outlined `<path>` for "S" via https://danmarshall.github.io/google-font-to-svg-path/ (paste `S`, select Inter 900, copy the `<path d="…"/>`). Then re-run the generation script.

- [ ] **Step 3: Commit the generated assets**

```bash
git add public/favicon.svg public/favicon.ico public/mark-460.png public/apple-touch-icon.png public/og-image.png
git commit -m "feat(brand): generate derivative brand assets (favicon, OG card, touch icon, GitHub avatar)"
```

---

## Task 4: Add the `renderIcon` helper

**Files:**
- Create: `src/apps/iconUtils.tsx`

Consumers currently each do `typeof app.icon === 'string' ? app.icon : '▫'`. When `icon` is a path like `/mark-sm.svg`, we want to render an `<img>`. Centralizing the branch avoids duplication across 7 call sites.

- [ ] **Step 1: Write `src/apps/iconUtils.tsx`**

```tsx
import type { ReactNode } from 'react';

export function renderIcon(icon: string | ReactNode, className?: string): ReactNode {
  if (typeof icon !== 'string') return icon;
  if (icon.startsWith('/')) {
    return <img src={icon} alt="" className={className} />;
  }
  return icon;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/apps/iconUtils.tsx
git commit -m "feat(brand): add renderIcon helper for emoji vs path app icons"
```

---

## Task 5: Point the About app at the new mark (TDD)

**Files:**
- Modify: `src/apps/registry.ts:67`
- Modify: `src/components/os/apps/AboutApp.tsx:5-10`
- Modify: `e2e/smoke.spec.ts` (add one assertion)

- [ ] **Step 1: Write the failing Playwright assertion**

In `e2e/smoke.spec.ts`, locate the `desktop golden path` test's assertion block after `await expect(page.locator('section[aria-label="About Cory window"]')).toBeVisible();` (around line 69). Add right after it:

```typescript
    // Brand mark regression: About window must render the mark as an <img>, not an emoji.
    const aboutAvatar = page.locator('section[aria-label="About Cory window"] img').first();
    await expect(aboutAvatar).toHaveAttribute('src', /\/mark(-sm)?\.svg$/);
```

- [ ] **Step 2: Run the Playwright test — expect failure**

Run: `npx playwright test e2e/smoke.spec.ts --project=chromium -g "golden path"`
Expected: FAIL with a timeout/locator error because no `<img>` exists in the About window yet (the avatar is still a `<div>` containing `👋`).

- [ ] **Step 3: Update `src/apps/registry.ts:67`**

Replace:
```typescript
    icon: '👋',
```
With:
```typescript
    icon: '/mark-sm.svg',
```

- [ ] **Step 4: Update `src/components/os/apps/AboutApp.tsx` lines 4–10**

Replace the entire `<header>` block starting at line 4:
```tsx
      <header className="flex items-start gap-5">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-hot)] text-3xl shadow-[0_8px_24px_-8px_rgba(246,195,74,0.5)]"
        >
          👋
        </div>
```

With:
```tsx
      <header className="flex items-start gap-5">
        <img
          src="/mark.svg"
          alt=""
          aria-hidden="true"
          className="h-16 w-16 shrink-0 rounded-[16px] shadow-[0_8px_24px_-8px_rgba(246,195,74,0.5)]"
        />
```

- [ ] **Step 5: Run the Playwright test — expect pass**

Run: `npx playwright test e2e/smoke.spec.ts --project=chromium -g "golden path"`
Expected: PASS. The About window now contains `<img src="/mark.svg" …>` matching the regex.

- [ ] **Step 6: Run unit tests for regression**

Run: `npm test`
Expected: all 15 vitest tests still pass (the icon change doesn't affect logic — consumers still handle strings).

- [ ] **Step 7: Commit**

```bash
git add src/apps/registry.ts src/components/os/apps/AboutApp.tsx e2e/smoke.spec.ts
git commit -m "feat(about): replace 👋 tile with the unified brand mark

Closes #10. The AboutApp header now renders /mark.svg (full variant)
inside the existing 16×16 rounded tile. Drops the amber-gradient
background — the mark already carries the palette. Adds a Playwright
assertion to guard against emoji-regression."
```

---

## Task 6: Thread `renderIcon` through every consumer

**Files:**
- Modify: `src/components/os/Launcher.tsx:114`
- Modify: `src/components/os/Desktop.tsx:61`
- Modify: `src/components/os/Taskbar.tsx:73`
- Modify: `src/components/os/Window.tsx:32`
- Modify: `src/components/os/apps/SupportApp.tsx:59`
- Modify: `src/components/mobile/MobileShell.tsx:96`

Without this task, the About-app icon will appear as the literal string `/mark-sm.svg` in the launcher, desktop, taskbar, etc., instead of the image. Each consumer currently uses the inline ternary `typeof app.icon === 'string' ? app.icon : '▫'`; replace with `renderIcon`.

- [ ] **Step 1: Update `src/components/os/Launcher.tsx`**

At the top of the file (after the existing `apps, type AppManifest` import), add:
```tsx
import { renderIcon } from '../../apps/iconUtils';
```

On line 114, replace:
```tsx
<span className="text-xl" aria-hidden="true">{typeof app.icon === 'string' ? app.icon : '▫'}</span>
```
With:
```tsx
<span className="text-xl" aria-hidden="true">{renderIcon(app.icon, 'h-6 w-6')}</span>
```

- [ ] **Step 2: Update `src/components/os/Desktop.tsx`**

Add import near the existing registry import:
```tsx
import { renderIcon } from '../../apps/iconUtils';
```

On line 61, replace:
```tsx
{typeof app.icon === 'string' ? app.icon : '▫'}
```
With:
```tsx
{renderIcon(app.icon, 'h-10 w-10')}
```

- [ ] **Step 3: Update `src/components/os/Taskbar.tsx`**

Add import:
```tsx
import { renderIcon } from '../../apps/iconUtils';
```

On line 73, replace:
```tsx
<span aria-hidden="true">{typeof win.icon === 'string' ? win.icon : '▫'}</span>
```
With:
```tsx
<span aria-hidden="true">{renderIcon(win.icon, 'h-4 w-4')}</span>
```

- [ ] **Step 4: Update `src/components/os/Window.tsx`**

Add import at the top:
```tsx
import { renderIcon } from '../../apps/iconUtils';
```

On line 32, replace:
```tsx
const icon = typeof win.icon === 'string' ? win.icon : '▫';
```
With:
```tsx
const icon = renderIcon(win.icon, 'h-4 w-4');
```

The `icon` variable is rendered later in the file inside JSX (grep to confirm it's interpolated as `{icon}` — if it's wrapped in a `<span>` that expects a string, the `<img>` will render correctly inside the span). If `icon` is ever compared to a string literal anywhere in the file, flag it.

- [ ] **Step 5: Update `src/components/os/apps/SupportApp.tsx` line 59**

Add import at the top:
```tsx
import { renderIcon } from '../../../apps/iconUtils';
```

Replace:
```tsx
<span aria-hidden="true" className="text-base">{typeof app.icon === 'string' ? app.icon : '▫'}</span>
```
With:
```tsx
<span aria-hidden="true" className="text-base">{renderIcon(app.icon, 'h-4 w-4')}</span>
```

(Do **not** touch line 105 — that's a different `props.icon` that's already a string.)

- [ ] **Step 6: Update `src/components/mobile/MobileShell.tsx`**

Add import:
```tsx
import { renderIcon } from '../../apps/iconUtils';
```

On line 96, replace:
```tsx
<span aria-hidden="true" className="text-2xl">{typeof app.icon === 'string' ? app.icon : '▫'}</span>
```
With:
```tsx
<span aria-hidden="true" className="text-2xl">{renderIcon(app.icon, 'h-8 w-8')}</span>
```

- [ ] **Step 7: Run unit + type checks**

Run: `npm test && npm run typecheck`
Expected: 15/15 vitest pass; `astro check` + `tsc --noEmit` report zero errors.

- [ ] **Step 8: Run the Playwright smoke**

Run: `npx playwright test e2e/smoke.spec.ts --project=chromium`
Expected: all existing tests pass; the About avatar assertion still passes; no regressions in launcher/desktop icon rendering.

- [ ] **Step 9: Manual dev spot-check**

Run: `npm run dev`
Open `http://localhost:4321`, dismiss the splash, verify:
- About icon on the desktop grid renders as the small brand mark (not the string `/mark-sm.svg`)
- Opening About shows the full mark in the window header
- Launcher (⌘K) shows the mark in the About row
- Taskbar shows the mark next to "About Cory"

- [ ] **Step 10: Commit**

```bash
git add src/components/os/Launcher.tsx src/components/os/Desktop.tsx src/components/os/Taskbar.tsx src/components/os/Window.tsx src/components/os/apps/SupportApp.tsx src/components/mobile/MobileShell.tsx
git commit -m "feat(os): route app icons through renderIcon helper

When an icon string starts with '/', renders it as <img>. Preserves
existing emoji behavior for all other apps. Fixes the About-app icon
rendering as literal text in Launcher/Desktop/Taskbar/Mobile."
```

---

## Task 7: Swap `Logo.astro` to the small variant

**Files:**
- Modify: `src/components/Logo.astro:10-16`

- [ ] **Step 1: Replace lines 10–16 in `src/components/Logo.astro`**

Replace the `<svg>` block:
```astro
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect x="3" y="3" width="26" height="26" rx="4" fill="#0b0d12" stroke="#f6c34a" stroke-width="2"/>
    <path d="M3 10 H29" stroke="#f6c34a" stroke-width="2"/>
    <circle cx="7" cy="6.5" r="1.25" fill="#f6c34a"/>
    <circle cx="11" cy="6.5" r="1.25" fill="#5ee3d1"/>
    <circle cx="15" cy="6.5" r="1.25" fill="#ff6a5c"/>
  </svg>
```

With:
```astro
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect x="2" y="2" width="28" height="28" rx="6" fill="#0b0d12" stroke="#f6c34a" stroke-width="2"/>
    <text x="16" y="23" font-family="Inter, 'Arial Black', Arial, 'Helvetica Neue', sans-serif" font-size="20" font-weight="900" fill="#f6c34a" text-anchor="middle">S</text>
  </svg>
```

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: no errors; `dist/` produced.

- [ ] **Step 3: Manual verify the header**

Run: `npm run dev`, open `http://localhost:4321`, observe the site header — the mark to the left of "cortech.online" should now be an amber-stroked void tile with a bold amber "S" (no titlebar dots).

- [ ] **Step 4: Commit**

```bash
git add src/components/Logo.astro
git commit -m "refactor(brand): swap Logo.astro to small-variant mark

At the 22px header size, the titlebar dots/divider render as sub-pixel
smudge. The small variant (frame + bold S) is crisp at every scale."
```

---

## Task 8: Add OG + Twitter + apple-touch-icon meta to `Base.astro`

**Files:**
- Modify: `src/layouts/Base.astro:19-29`

- [ ] **Step 1: Replace lines 19–29 of `src/layouts/Base.astro`**

Replace:
```astro
			<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="theme-color" content="#0b0d12" />
			<meta name="generator" content={Astro.generator} />
			<title>{fullTitle}</title>
			<meta name="description" content={meta} />
			{canonical && <link rel="canonical" href={canonical} />}
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={meta} />
			<meta property="og:type" content="website" />
			<meta name="twitter:card" content="summary" />
```

With:
```astro
			<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
			<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="theme-color" content="#0b0d12" />
			<meta name="generator" content={Astro.generator} />
			<title>{fullTitle}</title>
			<meta name="description" content={meta} />
			{canonical && <link rel="canonical" href={canonical} />}
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={meta} />
			<meta property="og:type" content="website" />
			<meta property="og:image" content="https://cortech.online/og-image.png" />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:image" content="https://cortech.online/og-image.png" />
```

- [ ] **Step 2: Build and check the rendered HTML**

Run: `npm run build && grep -A1 'og:image\|apple-touch\|twitter:' dist/about/index.html`
Expected: the new meta tags present in the built HTML for `/about`.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat(seo): add og:image, twitter:image, and apple-touch-icon meta

Points at the brand-mark assets generated in public/. Upgrades
twitter:card from 'summary' to 'summary_large_image' so the mark shows
at full width in link previews."
```

---

## Task 9: Handle path-icons in the SSR static layer

**Files:**
- Modify: `src/pages/index.astro:63`

The Astro static layer (rendered for crawlers + no-JS) currently does `<span class="text-xl">{app.icon}</span>`. With About's icon now `/mark-sm.svg`, that would render as the literal string. Astro doesn't ship `renderIcon` (React-only), so handle the branch inline.

- [ ] **Step 1: Replace line 63 in `src/pages/index.astro`**

Replace:
```astro
										<span class="text-xl">{app.icon}</span>
```

With:
```astro
										{typeof app.icon === 'string' && app.icon.startsWith('/')
											? <img src={app.icon} alt="" class="h-6 w-6" />
											: <span class="text-xl">{app.icon}</span>}
```

Note: `flagships` on line 6 filters to iframe apps only, so About isn't in the static layer today. This change is defensive — keeps the static layer robust if/when a path-based icon ends up there.

- [ ] **Step 2: Build and inspect**

Run: `npm run build && grep -A2 'products' dist/index.html | head -40`
Expected: existing emoji icons (🛡️, 📣, 🏠, 📇) still render as spans; no broken markup.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "fix(ssr): static-layer icon rendering tolerates path-based icons"
```

---

## Task 10: Add matching avatar to the static `/about` page

**Files:**
- Modify: `src/pages/about.astro:6-9`

- [ ] **Step 1: Update the header block**

In `src/pages/about.astro`, replace lines 6–9:
```astro
	<section class="mx-auto max-w-2xl px-6 pt-16 pb-10">
		<p class="font-mono text-[11px] uppercase tracking-[0.35em] text-[var(--color-amber)]">About</p>
		<h1 class="mt-5 font-[var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">Cory</h1>
```

With:
```astro
	<section class="mx-auto max-w-2xl px-6 pt-16 pb-10">
		<div class="flex items-start gap-5">
			<img
				src="/mark.svg"
				alt=""
				class="h-16 w-16 shrink-0 rounded-[16px] shadow-[0_8px_24px_-8px_rgba(246,195,74,0.5)]"
			/>
			<div>
				<p class="font-mono text-[11px] uppercase tracking-[0.35em] text-[var(--color-amber)]">About</p>
				<h1 class="mt-2 font-[var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">Cory</h1>
			</div>
		</div>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open `http://localhost:4321/about`. The top of the page should show the full brand mark next to the "About / Cory" stack, matching the AboutApp window.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(about): add matching brand-mark avatar to static /about page

Parity with the AboutApp window header — same mark, same tile styling,
same amber glow shadow."
```

---

## Task 11: Full verification sweep

**Files:** None — verification only.

- [ ] **Step 1: Unit tests**

Run: `npm test`
Expected: 15/15 pass.

- [ ] **Step 2: Type + Astro check**

Run: `npm run typecheck`
Expected: zero errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 4: Full Playwright smoke**

Run: `npx playwright test`
Expected: all existing smoke tests pass (desktop golden path, mobile fallback, iframe embed). The new About-avatar assertion passes.

- [ ] **Step 5: Favicon sanity in a real browser**

Run: `npm run preview` (serves the production build).
Open in Chrome + Safari, hard-refresh, verify:
- Tab favicon shows the small mark (amber frame + S) at 16/32px
- `/` renders with Logo.astro small mark in the header
- `/about` renders with the full mark
- Open About in the OS — full mark in the window header
- Open Launcher and Desktop — About icon shows the small mark, not text

- [ ] **Step 6: OG preview**

Deploy to a preview URL (Cloudflare Pages branch preview), then:
- Paste the preview URL into https://www.linkedin.com/post-inspector/
- Paste into a Slack DM to yourself

Expected: OG card shows the mark on the void background with the site title/description.

- [ ] **Step 7: Issue #10 linkage — check commits reference it**

Run: `git log --oneline origin/main..HEAD | head -20`
Expected: the About-app commit (from Task 5) mentions `Closes #10`. If it doesn't, amend the branch README or PR body to include the close directive.

---

## Task 12: Open the PR

- [ ] **Step 1: Push the branch**

Run: `git push -u origin <branch-name>`

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "Unified brand mark (closes #10)" --body "$(cat <<'EOF'
## Summary

- Replaces the `👋` AboutApp tile and the off-palette cyan-S GitHub avatar with a single tiered window-chrome + amber-S mark.
- Full variant (window chrome + titlebar dots + S) at ≥48px; small variant (frame + S) at <48px.
- Wires the mark through the AboutApp window, `/about` header, site Logo, favicon, apple-touch-icon, and OG/Twitter social card.
- Adds a `renderIcon` helper so the About-app icon renders as `<img>` in launcher/desktop/taskbar/mobile while every other app's emoji icon continues to work unchanged.

## Post-merge action (manual)

Upload `public/mark-460.png` to `github.com/settings/profile` to replace the cyan-S profile picture.

## Design spec

`docs/superpowers/specs/2026-04-13-unified-brand-mark-design.md`

## Test plan

- [x] `npm test` — 15/15 pass
- [x] `npm run typecheck` — clean
- [x] `npm run build` — clean
- [x] `npx playwright test` — all existing smoke tests pass, plus the new About-avatar assertion
- [x] Manual: favicon crisp at 16/32px in Chrome + Safari after hard-refresh
- [x] Manual: `/about`, AboutApp window, launcher, desktop, and taskbar all render the mark
- [ ] OG preview: paste the deploy-preview URL into LinkedIn Post Inspector and Slack

Closes #10

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Confirm PR URL**

The `gh pr create` output will include the PR URL. Share it with the user.

---

## Self-Review Notes

- **Spec coverage:** all ten acceptance criteria in §10 of the spec map to at least one task here (mark.svg via Task 1; AboutApp via Task 5; /about via Task 10; favicon.svg via Task 3; Logo via Task 7; og-image/apple-touch via Task 3 + Task 8; mark-460.png via Task 3 + Task 12 post-merge note).
- **Placeholder scan:** none (no TBD/TODO/etc.).
- **Type consistency:** `renderIcon` signature in Task 4 matches its call sites in Task 6.
- **Spec gap:** spec §5 says "rename `registry.ts` → `registry.tsx`". This plan **explicitly deviates** — it keeps `registry.ts` as-is and uses a `/…` path string convention instead, because rewriting consumers is simpler than routing React elements through the Astro static-layer in `index.astro:63`. The `AppManifest.icon` type already accepts `string | ReactNode`, so this is strictly a less-invasive path to the same outcome.
