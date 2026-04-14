# Unified brand mark — design spec

**Date:** 2026-04-13
**Status:** Approved, ready for implementation plan
**Related:** GitHub issue #10, `docs/superpowers/specs/2026-04-12-cortechos-design.md`

## 1. Context and goals

cortech.online currently ships two inconsistent identity marks:

- **GitHub profile picture** (`github.com/schmug`) — a cyan "S" with radiating circuit traces. Predates cortech.online. Uses an off-palette cyan, no shared visual language with the site.
- **AboutApp tile** (`src/components/os/apps/AboutApp.tsx:9`) — a `👋` emoji inside an amber→hot gradient square. Called out in issue #10 as a placeholder to replace with a real mark.

Adjacent surfaces are also inconsistent: the static `/about` page has no avatar at all, no `og:image` exists, and the favicon/Logo mark (CortechOS window chrome) carries brand identity but doesn't carry any personal identity.

**Goal:** one mark that serves as both the personal avatar and the product mark, rendered consistently across GitHub, the portfolio site, and social previews.

## 2. Chosen direction

**Window-chrome + amber S, tiered variants.**

The site already ships a window-chrome logo (`public/favicon.svg`, `src/components/Logo.astro`) with an amber-stroked rounded frame and three titlebar dots (amber / cyan / hot). We extend it by placing a bold amber "S" in the window body. The S anchors the mark to the person; the window chrome anchors it to the product.

Render tests confirmed that at sizes below ~48px, the titlebar dots and divider become visual noise and starve the S of vertical room. The solution is a **tiered variant system** — standard practice (Apple, Linear, Vercel all ship tiered marks):

- **Full variant** — window chrome + titlebar divider + 3 dots + amber S. Used at 48px and above.
- **Small variant** — amber-stroked rounded tile + amber S, no dots or divider. Used below 48px.

### Rejected alternatives
- **Full mark at every size.** Rejected — unreadable at 16/32px favicon sizes; dots render as sub-pixel smudge.
- **Simplified mark only (drop window chrome entirely).** Rejected — loses the "desktop OS" cue that makes the GitHub avatar feel continuous with cortech.online. The unification argument weakens.

## 3. Mark specification

### 3.1 Full variant (≥48px render size)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="3" y="3" width="26" height="26" rx="4" fill="#0b0d12" stroke="#f6c34a" stroke-width="2"/>
  <path d="M3 10 H29" stroke="#f6c34a" stroke-width="2"/>
  <circle cx="7"  cy="6.5" r="1.25" fill="#f6c34a"/>
  <circle cx="11" cy="6.5" r="1.25" fill="#5ee3d1"/>
  <circle cx="15" cy="6.5" r="1.25" fill="#ff6a5c"/>
  <!-- S, converted to outlined <path> at export -->
  <text x="16" y="26" font-size="15" font-weight="900" fill="#f6c34a" text-anchor="middle">S</text>
</svg>
```

Canvas 32×32. Background `#0b0d12` (`--color-void`). Stroke `#f6c34a` (`--color-amber`). Titlebar dots in amber, cyan (`#5ee3d1`), hot (`#ff6a5c`). S is centered in the window body (below the divider at y=10), drawn from **Inter 900** (or equivalent geometric sans), converted to an outlined `<path>` before shipping so it renders identically regardless of font loading.

### 3.2 Small variant (<48px render size)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="2" y="2" width="28" height="28" rx="6" fill="#0b0d12" stroke="#f6c34a" stroke-width="2"/>
  <text x="16" y="24" font-size="22" font-weight="900" fill="#f6c34a" text-anchor="middle">S</text>
</svg>
```

Drops the titlebar divider and three dots. Frame slightly larger (x/y=2 instead of 3) and more rounded (rx=6) to claim the pixels back. S is sized to fill the frame.

### 3.3 Palette reference

From `src/styles/global.css`:
- `--color-void` `#0b0d12` — background
- `--color-amber` `#f6c34a` — primary accent, S color, frame stroke
- `--color-cyan` `#5ee3d1` — titlebar dot
- `--color-hot` `#ff6a5c` — titlebar dot

## 4. Asset inventory

All assets live under `public/`. SVGs are authoritative; PNGs are generated artifacts, committed for deploy convenience.

| Path | Source variant | Dimensions | Purpose |
|------|----------------|------------|---------|
| `mark.svg` (new) | full | vector | Consumed by AboutApp tile, `/about` header, OG inline |
| `mark-sm.svg` (new) | small | vector | Consumed by `registry.ts` as the About-app launcher icon |
| `favicon.svg` (overwrite) | small (identical to `mark-sm.svg`) | vector | Primary browser tab favicon — kept at root path for convention |
| `favicon.ico` (regenerate) | small | 32×32 | Legacy browser fallback |
| `mark-460.png` (new) | full | 460×460 | Upload target for GitHub profile picture |
| `apple-touch-icon.png` (new) | full | 180×180 | iOS home-screen icon |
| `og-image.png` (new) | full, centered on `#0b0d12` | 1200×630 | Social link previews (Twitter/X, LinkedIn, Slack, Discord) |

`mark-sm.svg` and `favicon.svg` hold identical content. The generation script writes both from a single source to avoid drift; see §6.

## 5. Code touch points

| File | Line(s) | Change |
|------|---------|--------|
| `public/favicon.svg` | full file | Overwrite with §3.2 small variant |
| `src/components/Logo.astro` | 10–16 | Swap inline SVG for small-variant paths |
| `src/apps/registry.ts` | 67 | `icon: '👋'` → `icon: <img src="/mark-sm.svg" alt="" />` (small variant — the launcher renders app icons at small size). Rename file to `registry.tsx` so JSX parses. `AppManifest.icon` is already `string \| ReactNode` (line 7), so no type change needed. |
| `src/components/os/apps/AboutApp.tsx` | 5–10 | Replace `<div>…👋</div>` with `<img src="/mark.svg" alt="" className="h-16 w-16 shrink-0 rounded-[16px] shadow-[0_8px_24px_-8px_rgba(246,195,74,0.5)]" />`. Drop the amber→hot gradient background — the mark carries the palette already. |
| `src/pages/about.astro` | ~6 (before eyebrow at line 7) | Add `<img src="/mark.svg" alt="" class="h-16 w-16 rounded-[16px] shadow-[0_8px_24px_-8px_rgba(246,195,74,0.5)]" />` for visual parity with the OS-app About view |
| `src/layouts/Base.astro` | after line 19 | Add meta: `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`, `<meta property="og:image" content="https://cortech.online/og-image.png" />`, `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:image" content="https://cortech.online/og-image.png" />` |
| `src/pages/index.astro` | 19–22 meta block | Add `og:image` and `twitter:image` only if not inherited from Base layout (verify during implementation) |

## 6. Generation pipeline

New file `scripts/generate-brand-assets.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Keep favicon.svg in lock-step with mark-sm.svg (single source of truth)
cp public/mark-sm.svg public/favicon.svg

# Full variant derivatives
npx -y sharp-cli -i public/mark.svg    -o public/mark-460.png       resize 460 460
npx -y sharp-cli -i public/mark.svg    -o public/apple-touch-icon.png resize 180 180
npx -y sharp-cli -i public/mark.svg    -o public/og-image.png       resize 1200 630 --fit=contain --background="#0b0d12"

# Small variant derivatives
npx -y sharp-cli -i public/mark-sm.svg -o public/favicon-32.png     resize 32 32
npx -y png-to-ico public/favicon-32.png > public/favicon.ico
rm public/favicon-32.png
```

Idempotent. Run manually whenever the SVG sources change. No new committed dev dependencies.

## 7. Verification

### Automated
1. `npm test` — existing 15 vitest tests must pass.
2. `npm run build` — no Astro or TypeScript errors, including after renaming `registry.ts` → `registry.tsx`.
3. `npm run test:e2e` — existing Playwright smoke (`e2e/`) must pass. **Add one new assertion** in the About-app section: the avatar `<img>` element has a non-empty `src` attribute and its request resolves 200. Guards against emoji-regression.

### Manual
4. `npm run dev` — verify favicon renders in browser tab (16/32px), header Logo at 22px reads cleanly, `/about` has matching avatar, opening About-inside-OS shows the full variant.
5. `npm run build && npm run preview` — serve `dist/` and hard-refresh to confirm `/favicon.ico` serves new icon (browsers cache favicons aggressively).
6. Paste deploy preview URL into **LinkedIn Post Inspector** (linkedin.com/post-inspector/) and **Slack unfurl** to confirm OG card renders the mark.

### Manual, out-of-repo
7. Upload `public/mark-460.png` via `github.com/settings/profile`. Call out in PR body as a post-merge step.

## 8. Out of scope

- The 🫠 status emoji on the GitHub profile — separate feature, unaffected by this change.
- Circuit-trace "rays" from the prior GitHub avatar — don't survive at favicon size; punt. Easy to add to an "expanded" OG-only variant later if more visual density is wanted on shares.
- Unifying the emoji icons used by other apps in `src/apps/registry.ts` (`🛡️`, `📣`, `🏠`, `📇`, `💛`, `📁`) — orthogonal work, separate issue.

## 9. Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| Font rendering drift on the S | Convert `<text>` to outlined `<path>` at export; verify in spec section §3. |
| Renaming `registry.ts` → `.tsx` breaks imports | Grep for `from '../apps/registry'` / `from '@/apps/registry'` during implementation; Astro + Vite resolve both extensions automatically, but explicit imports may need touching. |
| Favicon caching hides regressions | Verify via preview build with hard-refresh, not dev server alone. Call out in verification §7. |
| OG card renders at unexpected aspect ratio | Use `sharp-cli --fit=contain --background="#0b0d12"` to avoid cropping; test with real social platforms via Post Inspector. |

## 10. Acceptance (closes issue #10 when merged)

- AboutApp shows the full-variant mark in place of `👋`.
- `/about` page shows the same mark in a matching header tile.
- `favicon.svg`, `favicon.ico`, and `Logo.astro` all render the small variant.
- `og-image.png`, `apple-touch-icon.png` exist and are referenced from `Base.astro`.
- `mark-460.png` exists at repo root under `public/` (user uploads to GitHub manually post-merge).
- All existing tests pass; new Playwright assertion passes.
