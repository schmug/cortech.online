# DMarcus feeding minigame — research & design

## Context

Issue #3 (`Add reactive on-screen mascot (DMarcus-style)`) already has implementation research for a **passive** `dizzied` state: tokens rain from above, bounce off the mascot, and a wobble+stars climax fires when a hit threshold is met or the user opens 3 windows within 1.5s.

This research spec replaces that passive mechanic with an **interactive virtual-pet minigame**. DMarcus is sentient: he wanders and intermittently signals hunger by opening his mouth. While his mouth is open, any cursor movement sheds "AI tokens" that fall under gravity; tokens that land in his mouth count as a feeding and grow him slightly. After ~6 successful feedings he overflows, triggers a dizzied beat, glitches, and the whole "OS" fake-reboots via the existing `BootSplash` — _without_ disturbing the user's open windows. Tokens that miss fade as debris.

The existing dizzied research (wobble keyframes, `✦` stars CSS, token vocabulary, reduced-motion fallback, token pool sizing) is **salvaged** as the "stuffed → dizzied → crash" final beat. The ambient rain and window-spam triggers are **dropped**. The minigame becomes the single source of truth for how dizzied/crash ever fires.

Scope of this document: research only. No code is written. On approval, hand off to `writing-plans` to produce an implementation plan.

## Decisions locked in

| #   | Question                                  | Choice                                                                                                                                               |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Relationship to existing dizzied research | **Merge** — minigame is the only path to dizzied/crash; ambient + window-spam triggers dropped                                                       |
| 2   | How tokens spawn from the cursor          | **Hunger-gated trail** — cursor movement only sheds tokens while DMarcus's mouth is open                                                             |
| 3   | Hunger pacing                             | **Intermittent** — every 2–4 min, mouth open ~6s, subtle tell (open mouth + faint cyan glow)                                                         |
| 4   | Growth curve                              | **Slow build** — ~6 feedings → crash, scale 1.0 → 2.0 (80px → 160px), smooth CSS transition                                                          |
| 5   | Crash visual                              | **Fake OS reboot, layout preserved** — glitch → black → `BootSplash` replay → back to desktop; easter-egg overlay `> recovered from mascot overflow` |
| 6   | Persistence                               | **Crash counter only** — `crashCount` persisted via zustand; surfaced as a one-liner in AboutApp                                                     |

## State machine

```
idle ──(random 120–240s timer fires)────────────▶ hungry
hungry ──(no catch within 6s)────────────────────▶ idle            // missed feeding, no penalty
hungry ──(first caught token)────────────────────▶ feeding
feeding ──(1.2s without another catch)───────────▶ idle            // user stops feeding mid-meal; counts as completed if ≥1 token
feeding ──(hunger window ends OR user stops)─────▶ idle (feedingsThisLife++)
idle ──(feedingsThisLife === 6)──────────────────▶ stuffed         // checked on entry to idle
stuffed ──(1.8s wobble+stars)────────────────────▶ crashing
crashing ──(800ms glitch + black overlay)────────▶ rebooting
rebooting ──(BootSplash replay completes)────────▶ idle            // scale 1.0, feedings 0, crashCount++
```

Precedence vs `sleepy` (existing issue #3 state): `sleepy > hungry`. Hunger timer does not fire while sleepy; on wake (any `mousemove`/`keydown`), the remaining hunger countdown resumes from where it was paused.

One "feeding" = one hunger window in which the user landed ≥1 token in the mouth. A single hunger window can yield multiple token catches but still counts as exactly one feeding for growth purposes. Per-feeding growth is a fixed step (≈0.167 scale units) so the 6th feeding always lands at scale 2.0.

## Mechanics

### Hunger timer

- On every entry to `idle`, schedule `setTimeout(fire, uniform(120000, 240000))`.
- Clear on unmount, explicit state override (test hook), crash sequence start, and `sleepy` entry.
- On fire: `setMascotState('hungry')`, open mouth sprite, attach faint `box-shadow` cyan halo.
- If no catch within 6000ms: revert to `idle` (no growth, no penalty).

### Token trail (hunger-gated)

- `TokenRain.tsx` owns one shared `requestAnimationFrame` loop.
- Spawning is gated: spawn only when `mascotState === 'hungry' || 'feeding'` AND a `document` `mousemove` fired in the last frame.
- Spawn cadence: one token per ≥80ms of cursor travel, capped at 30 live tokens (pooled; oldest recycled).
- Token physics: `vy += GRAVITY * dt`; `vx` inherits 15% of cursor velocity, clamped; `rotation` drifts via `vrot`.
- Rendering: `transform: translate3d(x, y, 0) rotate(rot)` for compositor-only updates.
- Token text pool (reuse existing research): `the, </s>, <|im_start|>, [CLS], [SEP], GPT, attn, kv, λ, ∇, log p, ▁tok, 0xFA`. Mono 11px, `var(--color-cyan)` @ 60% opacity.
- `pointer-events: none` on the whole rain layer.
- Pauses the RAF loop when `document.visibilityState === 'hidden'` and when no tokens are alive and the mascot is not hungry/feeding.

### Catch detection

- Mouth AABB: ~18px × 12px offset from the mascot body origin; recomputed when `mascotScale` changes or on window resize.
- Per frame, for each live token: AABB intersection with the mouth rect. On hit:
  - Token removed (caught — does not fall further or fade).
  - If `mascotState === 'hungry'`, transition to `feeding`.
  - `catchesThisWindow++` (local to `TokenRain`, not store).
- When the hunger window closes (timeout expires OR user goes idle 1.2s after a catch), if `catchesThisWindow ≥ 1`:
  - Call `recordFeeding()` on the store: `feedingsThisLife++`, `mascotScale += (2.0 - 1.0) / 6`, smooth `transition: transform 400ms ease-out`.
  - If `feedingsThisLife === 6`: schedule `stuffed` transition on the next tick.
- Uncaught tokens continue falling under gravity; once they pass the mascot's bottom edge, they fade to 0 opacity over 600ms and are returned to the pool.

## Crash + reboot orchestration

1. **stuffed** (1800ms): wobble + `✦` stars — reuse the dizzied keyframes documented in the existing issue #3 research comment (`mascot-wobble`, `mascot-stars`).
2. **crashing** (400ms): CSS filter glitch on `#ct-desktop` (`hue-rotate(20deg) contrast(1.3)` + small translate jitter via keyframes); mascot fades to 0.
3. **black overlay** (200ms fade-in + 200ms hold): full-viewport `position: fixed; inset: 0; background: var(--color-void)` above everything except reboot text.
4. **easter egg overlay** appears during the hold: bottom-left, `font-mono text-[11px] text-[var(--color-cyan)]`, content `> recovered from mascot overflow`. Fades with the black overlay as BootSplash starts.
5. **BootSplash replay**: remount `<BootSplash />` with a fresh `key={rebootId}` so its `useEffect` re-fires. `BootSplash` currently gates on `hasBooted`; cleanest integration path is to temporarily flip `hasBooted = false` during reboot and let the existing component flow drive itself, **without** calling `resetLayout()`. Windows stay exactly where they were.
6. **finishReboot**: `setMascotState('idle')`, `mascotScale = 1.0`, `feedingsThisLife = 0`, `crashCount++`, schedule next hunger timer.

## Accessibility

- `prefers-reduced-motion: reduce`:
  - No token rain (TokenRain early-returns).
  - Scale changes are instant (no transition).
  - No glitch filter, no black-screen fade, no BootSplash replay — skip directly from `stuffed → idle` with a brief static `?_?` pose for 1.2s instead.
  - Wobble + stars replaced with static `?_?`.
- Mascot hidden on mobile (already handled by `RootShell`'s `OSShell`-vs-`MobileShell` branch).
- All new keyframes respect the existing global `@media (prefers-reduced-motion: reduce)` rule in `src/styles/global.css`.

## Store changes (`src/components/os/store.ts`)

```ts
type MascotState = 'idle' | 'hungry' | 'feeding' | 'stuffed' | 'dizzied' | 'crashing' | 'rebooting';

type OSState = {
  // ...existing
  mascotState: MascotState;
  mascotScale: number; // 1.0 ..= 2.0
  feedingsThisLife: number; // 0 ..= 6
  crashCount: number; // persisted
  setMascotState: (s: MascotState) => void;
  recordFeeding: () => void; // bumps feedings + scale; may schedule stuffed
  beginReboot: () => void; // crashing → rebooting orchestration
  finishReboot: () => void; // resets mascot, increments crashCount, reschedules hunger
};
```

Persist config — allow-list via `partialize` so only `crashCount` survives reloads:

```ts
{
  name: 'cortechos:v1',
  partialize: (s) => ({
    crashCount: s.crashCount,
    // plus any existing persisted fields already in store.ts
  }),
}
```

All other new mascot fields boot fresh every session.

## AboutApp surface (`src/components/apps/AboutApp.tsx`)

Add one line near the footer, only rendered when `crashCount > 0` so first-time visitors don't see a spoiler:

```tsx
const crashCount = useOS((s) => s.crashCount);
{
  crashCount > 0 && (
    <p className="font-mono text-[11px] text-[var(--color-muted)]">
      dmarcus has crashed this device {crashCount} time{crashCount === 1 ? '' : 's'}
    </p>
  );
}
```

## Critical files

**New:**

- `src/components/os/Mascot.tsx` — port dmarcheck CSS creature; moods for idle/hungry/feeding/stuffed/dizzied; scale via `--mascot-scale` custom property on the body element.
- `src/components/os/TokenRain.tsx` — pooled token particles, gated spawn, RAF loop, catch detection.
- `src/components/os/useHungerTimer.ts` — schedule/teardown of hunger windows, integrates with sleepy precedence.
- `src/components/os/useIdleTimer.ts` — sleepy detection per existing issue #3 research (kept separate so non-minigame moods still work).
- Inline `<style>` or dedicated `mascot.css` — keyframes (`mascot-wobble`, `mascot-stars`, `mascot-glitch`, hunger-glow pulse), reduced-motion fallbacks.

**Modify:**

- `src/components/os/store.ts` — add mascot fields and actions (lines ~22–37 area for type; action implementations in the zustand body); configure `partialize` allow-list.
- `src/components/os/store.test.ts` — add coverage (below).
- `src/components/os/OSShell.tsx` — mount `<Mascot />` inside the `ct-desktop` layer (above desktop, below launcher); attach idle + hunger hooks.
- `src/components/os/BootSplash.tsx` — verify `key`-based remount works for reboot; minimal change expected since it already reacts to `hasBooted`.
- `src/components/apps/AboutApp.tsx` — render the `crashCount` line.
- `e2e/smoke.spec.ts` — assertions below.

## Reuse callouts

- **`BootSplash.tsx:13`** — already handles reduced-motion, keyboard-skip, status line sequencing, and fade-out. Reboot reuses it verbatim via `key={rebootId}`; do not duplicate its behavior in a new component.
- **`src/styles/global.css:54`** — existing `@media (prefers-reduced-motion: reduce)` rule. New keyframes need to no-op under it; the existing rule may already cover all `animation` declarations, in which case no extra CSS is needed.
- **Existing dizzied research** (issue #3 comment) — `✦` stars CSS, `mascot-wobble` keyframe, token vocabulary, token pool sizing (30), 11px cyan mono rendering. Port these directly rather than redesigning.
- **`RootShell.tsx`** mobile branch — Mascot mounts only inside `OSShell`, so mobile exclusion is automatic.

## Verification

### Unit tests (vitest, extend `store.test.ts`)

- `setMascotState` updates state and triggers `sleepy > hungry` precedence correctly.
- `recordFeeding` increments `feedingsThisLife` and `mascotScale` by the correct step; schedules `stuffed` on the 6th.
- `finishReboot` resets `mascotState`, `mascotScale`, `feedingsThisLife`; increments `crashCount`.
- Persist: after `useOS.persist.rehydrate()`, `crashCount` survives but `mascotState`, `mascotScale`, `feedingsThisLife` all reset to defaults.
- Pure catch detection: `tokenRect × mouthRect → hit/no-hit` fixture table.

### Playwright (`e2e/smoke.spec.ts`)

- Mascot renders at `[data-testid="mascot"]` on desktop viewport; absent on mobile viewport.
- Test hooks on `window.__cortechos` (gated to `import.meta.env.DEV === true` or a test-only build flag): `setMascotState(state)`, `recordFeeding()`, `beginReboot()`, `finishReboot()`.
- Force `stuffed → crashing → rebooting → idle` via hooks; assert:
  - Mascot is present with scale 1.0 after reboot.
  - `crashCount` increments by 1.
  - Any window open before the sequence is still open after (layout preserved).
- With `prefers-reduced-motion: reduce` emulated, assert TokenRain does not mount and the crash sequence completes without the black overlay.

### Manual smoke

- `npm run dev`, leave the tab focused for ~3 minutes, watch for the hunger tell.
- Wiggle the cursor over the open mouth to feed; observe growth after each meal.
- After 6 feedings: observe glitch → black → `> recovered from mascot overflow` → BootSplash → desktop restored.
- Reload the page; open AboutApp; confirm the crash counter line is present.
- Toggle `prefers-reduced-motion` in DevTools; repeat — no rain, no glitch, no BootSplash replay.

## Out of scope (explicitly not building)

- High-score table, leaderboards, achievement UI.
- Unlockable cosmetics (party hat, survivor badge) — deferred from option C during brainstorming.
- Touch variant of the minigame — mascot is desktop-only per issue #3.
- Sound effects.
- Other mascot moods (`excited`, `scared`, `proud`, `building`) — covered by the baseline issue #3 implementation and not affected by this research.
- Difficulty tuning UI, debug panel beyond the test hooks.

## Open implementation questions (resolve in writing-plans)

- Whether `BootSplash` remount via `key={rebootId}` needs to be paired with a `hasBooted = false` flip, or whether the component can accept a `force?: boolean` prop for the reboot path. Read `BootSplash.tsx` in detail during planning and pick the smaller change.
- Exact spawn cadence tuning (80ms vs 120ms per cursor-travel frame) — calibrate during manual playtest; cheap to adjust.
