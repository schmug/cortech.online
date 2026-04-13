# CortechOS — cortech.online portfolio

## Context

Cory (github.com/schmug) wants a portfolio at `cortech.online` (already owned) that both **showcases original work** and gives visitors a clear path to **support the work** (GitHub Sponsors, Stripe tip, star on GitHub). The page should lean **playful/creative** in tone — matching the creative side of the GitHub catalog (AntArt, RepoGotchi, BurgerDrop) while still presenting paid/serious products credibly.

The concept landed during brainstorming: cortech.online boots into **CortechOS** — an original, branded, web-based desktop where each "app icon" is one of Cory's live products, running inside a window via iframe. Visitors don't just see screenshots; they actually *use* dmarc.mx, q-r.contact, donthype.me, and apartment-stager without leaving the portfolio. Native panels cover bio, support CTAs, and a live project browser.

Inspired by Puter.com but **not** using Puter itself — Puter requires a Node backend + persistent storage + AGPL; we want a static SPA on Cloudflare Pages. We borrow the metaphor, build our own shell.

**Why this vs. a conventional portfolio:** maximum novelty, genuine product interactivity, a memorable "wow" that matches Cory's builder identity. The cost is 2–4 weekends of focused work versus a weekend for a static page; accepted.

---

## Architecture

- **Framework:** Astro with a single React island for the OS shell (`src/components/os/OSShell.tsx`).
- **Why Astro:** SSR/SSG a static HTML page at `/` containing bio + project list (SEO, no-JS fallback). Hydrate the OS shell as a client-side island.
- **Styling:** Tailwind CSS with a small design-token layer for the CortechOS brand (palette, type, chrome).
- **State:** `zustand` store for window manager (`openWindows`, `zOrder`, `focusedId`, `minimizedIds`), persisted to `localStorage` so repeat visitors see their last layout.
- **Windowing primitive:** `react-rnd` for drag + resize (save ~8 h vs. rolling our own).
- **Icons:** `@tabler/icons-react` or `lucide-react` for system glyphs; custom SVG for the CortechOS logo and app icons.
- **Hosting:** Cloudflare Pages, connected to a GitHub repo. `cortech.online` DNS (already Cloudflare-controlled or migrated there) points to the Pages project with apex + `www`.

### App registry

A static TypeScript module at `src/apps/registry.ts` exports an array of app manifests:

```ts
export type AppManifest = {
  id: string;
  name: string;
  icon: string | ReactNode;
  type: 'iframe' | 'native';
  // iframe
  url?: string;
  // native
  component?: () => Promise<{ default: ComponentType }>;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  allowMultiple?: boolean;
  githubRepo?: string; // for right-click "View source"
  paid?: boolean;
};
```

Everything the shell renders — desktop icons, taskbar tiles, launcher entries — derives from this list.

### Iframe app contract

Each of Cory's own apps (Cloudflare Workers / Pages) must send:

```
Content-Security-Policy: frame-ancestors 'self' https://cortech.online
```

One-line Worker change per app. Verify each embeds correctly in Chrome + Safari before launch; note any auth flows that break under third-party cookie restrictions (probably none — listed apps are unauth utilities).

---

## OS shell components

Directory: `src/components/os/`

- **`BootSplash.tsx`** — 1.2s CortechOS intro (logo, version "1.0", animated progress). Skippable via any key; auto-skipped on repeat visits (localStorage flag).
- **`Desktop.tsx`** — branded background, grid of icons from registry, right-click context menu (Open, View source on GitHub when `githubRepo` present).
- **`WindowManager.tsx`** — renders one `<Window>` per entry in `openWindows`; manages focus on click, z-order, minimize/restore animations.
- **`Window.tsx`** — wraps `react-rnd`; renders title bar with close/minimize/maximize, body slot, grid-snap on drag-end.
- **`Taskbar.tsx`** — fixed bottom strip; CortechOS launcher button (left), running-app tiles (center), clock (right).
- **`Launcher.tsx`** — ⌘K / click-to-open overlay grid of all apps with fuzzy search.
- **`apps/` subfolder** — one file per native app component (`AboutApp.tsx`, `SupportApp.tsx`, `ProjectsApp.tsx`).

---

## App catalog (MVP)

Desktop icons at first boot, in order:

1. **dmarc.mx** — iframe · paid · `https://dmarc.mx`
2. **donthype.me** — iframe · paid · `https://donthype.me`
3. **apartment-stager** — iframe · paid · URL TBD
4. **q-r.contact** (qr-me) — iframe · `https://q-r.contact`
5. **About Cory** — native · bio, photo, what-I'm-into, contact/social links
6. **Support** — native · GitHub Sponsors button, Stripe tip link, star-top-repos CTA
7. **Projects** — native · fetches `https://api.github.com/users/schmug/repos?per_page=100&sort=updated` at Astro build time, filters `fork=false`, renders a scrollable list with description / language / last-updated; each row opens the GitHub repo.

### Open items for Cory to fill

- Taglines and brief copy for **donthype.me** and **apartment-stager** (not obvious from GitHub).
- Final URLs for each paid product.
- Bio text + a photo or avatar for the About app.
- Confirm GitHub Sponsors is enabled; if not, enable during implementation.
- Provision the Stripe Payment Link (one-time, custom amount) and drop the URL into the Support component.

### Post-MVP ideas (do not build now)

AntArt live-canvas easter-egg app; RepoGotchi; cclog live log viewer; blog/writing app; sound effects; themes; start menu with nested folders; fake file system; notifications system; multi-user anything.

---

## SEO, mobile, accessibility

### SEO

Astro renders `/` as static HTML that already contains:

- `<h1>Cory Schmug — Cortech</h1>`
- Short bio paragraph
- A visible project list (rendered from the same registry) with descriptions and links

The OS shell hydrates over this content after boot. Crawlers, screenshot previews, and no-JS visitors see a legible portfolio. Additional static routes: `/about`, `/projects` — each rendered at build time with canonical content for deep-link sharing.

### Mobile fallback

Under `768px`, the OS shell is not rendered. Instead, a vertically stacked grid of the same apps shows — cortech-branded header, app cards (icon, name, short description, primary CTA), same Support and About sections. Reuses the registry.

### Accessibility

- Every icon has a visible label and a tab stop.
- Windows are focusable; inner content receives focus when opened.
- `Esc` closes the focused window; `Alt+Tab` / `⌃Tab` cycles open windows.
- Aria labels on all controls; animations respect `prefers-reduced-motion`.

---

## Support mechanisms

Rendered in the **Support** native app and in contextual CTAs:

- **GitHub Sponsors** — primary button; link to `https://github.com/sponsors/schmug`.
- **Stripe tip** — one-time Stripe Payment Link; custom amount.
- **Star on GitHub** — list of top 5 starred repos with a single-click star CTA (GitHub star button embed is fine).
- **Paid-product CTAs** — each iframe app's window footer shows "Visit live site ↗" and, where applicable, "Upgrade / Pro" linking into the product's own paid flow (no payment handled inside cortech.online).

---

## Scope discipline

**In for MVP (target: 2 weekends):**

- Boot splash, desktop, window manager, taskbar, launcher, 4 iframe apps, 3 native panels, mobile fallback, SEO snapshot, Cloudflare Pages deploy, original CortechOS brand identity (palette, type, logo, window chrome).

**Out for MVP (deliberately — add later):**

- Start menu with folders, fake file system, themes / color schemes, login screen, sound effects, app store UI, notifications system, mini-games, drag-files-between-apps, any app not in the catalog above.

If it isn't in the "In" list, resist during MVP.

---

## Build sequence (suggested milestones)

1. **M0 — Project setup (2 h)**: `npm create astro@latest`, Tailwind, React integration, Cloudflare Pages deploy pipeline, domain wired up with a placeholder page.
2. **M1 — Static SEO layer (3 h)**: render `/`, `/about`, `/projects` statically from the registry; no OS shell yet. Ship-able state #1.
3. **M2 — CortechOS brand (4 h)**: palette, type pairing, logo, window chrome, icon system, desktop background. Design language locked.
4. **M3 — Window manager (10 h)**: `<Window>`, `<WindowManager>`, zustand store, open/close/focus/drag/resize/minimize/maximize. Unit-testable independently.
5. **M4 — Desktop + taskbar + launcher (8 h)**: icons, right-click menu, taskbar running-apps, ⌘K launcher.
6. **M5 — Boot splash (2 h)**: intro animation, skip-on-repeat.
7. **M6 — Native apps (6 h)**: About, Support, Projects. Projects fetches GitHub at build time via Astro.
8. **M7 — Iframe apps (4 h)**: add `frame-ancestors` headers to each Worker; wire registry entries; verify embed in Chrome + Safari.
9. **M8 — Mobile fallback (5 h)**: responsive check, render card grid under 768px.
10. **M9 — Accessibility + polish (4 h)**: keyboard nav, reduced-motion, aria, last visual passes.
11. **M10 — Launch (2 h)**: production deploy to Cloudflare Pages, DNS flip, smoke test, share.

Estimated total: **~50 h** with Claude pair-programming — realistically **15–25 h** of Cory's time.

---

## Critical files

New (all paths relative to repo root):

- `astro.config.mjs`
- `tailwind.config.ts`
- `src/pages/index.astro` — static layer + OS shell island mount
- `src/pages/about.astro` — static about
- `src/pages/projects.astro` — static project list
- `src/apps/registry.ts` — app manifest list
- `src/components/os/OSShell.tsx` — root React island
- `src/components/os/BootSplash.tsx`
- `src/components/os/Desktop.tsx`
- `src/components/os/WindowManager.tsx`
- `src/components/os/Window.tsx`
- `src/components/os/Taskbar.tsx`
- `src/components/os/Launcher.tsx`
- `src/components/os/apps/AboutApp.tsx`
- `src/components/os/apps/SupportApp.tsx`
- `src/components/os/apps/ProjectsApp.tsx`
- `src/components/os/store.ts` — zustand window store
- `src/components/os/useKeyboard.ts` — Esc / Alt+Tab handlers
- `src/components/mobile/MobileShell.tsx`
- `src/styles/tokens.css` — CortechOS brand tokens

Modify (in each of Cory's deployed product repos — separate PRs):

- Add `Content-Security-Policy: frame-ancestors 'self' https://cortech.online` to response headers (typically a 1-line Worker or `_headers` change on Pages).

---

## Verification

End-to-end checks before declaring done:

1. **Local dev:** `npm run dev` — boots, splash plays, desktop renders, icons clickable, each iframe app loads in a window.
2. **Iframe headers:** `curl -I https://dmarc.mx` shows the `frame-ancestors` CSP; manually confirm in Chrome + Safari that each app embeds without console errors.
3. **SEO snapshot:** `curl https://cortech.online | grep -i 'cory\|dmarc\|sponsor'` — returns the static bio and project content; verify with `view-source:` in a browser.
4. **Mobile:** open on a phone (or Chrome devtools at 390×844) — no OS shell, card grid renders, same apps linkable.
5. **Keyboard:** open site with mouse disabled — can Tab to icons, Enter to open, Esc to close, ⌘K opens launcher.
6. **Reduced motion:** in Chrome devtools > Rendering > "prefers-reduced-motion: reduce" — no animations play.
7. **Support mechanisms:** GitHub Sponsors button opens `/sponsors/schmug`; Stripe tip link opens the Payment Link; star CTAs point at the right repos.
8. **Lighthouse:** Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95 on mobile.
9. **Cloudflare:** `cortech.online` and `www.cortech.online` both serve the site, TLS healthy, no mixed-content warnings.

---

## Open questions to confirm during implementation

- Taglines and URLs for **donthype.me** and **apartment-stager**.
- Bio copy and an avatar/photo for the About app.
- Whether GitHub Sponsors is enabled on `schmug` today — if not, enable during M6.
- Stripe Payment Link URL.
- Which 5 repos should get "Star me" priority in Support (current top-updated set: dmarcheck, cclog, qr-me, youtube-rss-extractor, claude-view — confirm).
