# CortechOS

The portfolio at [cortech.online](https://cortech.online) — an Astro-rendered landing that hydrates into a tiny desktop OS where each window is one of my projects. Mobile viewport falls back to a vertical card grid.

![CortechOS desktop with the About Schmug window open](docs/screenshot-desktop.png)

> Animated demo: [`docs/screenshot-desktop.gif`](docs/screenshot-desktop.gif) — boot → ⌘K launcher → open Projects → drag.

## Run locally

Requires Node `>=22.12.0`.

```sh
npm install
npm run dev          # http://localhost:4321
```

## Build & deploy

```sh
npm run build        # → dist/
```

Cloudflare Pages:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 |

`public/_routes.json` ships `{ include: [], exclude: ["/*"] }` so Pages bypasses the Functions runtime entirely — every path is served as a static asset. See [`docs/architecture.md`](docs/architecture.md#deploy-contract) for why.

## Tech stack

- **Astro 6** static site (`output: 'static'`) with one React island
- **React 19** for the interactive shell, `lazy()`-split into `OSShell` (≥768px) and `MobileShell` (<768px)
- **Tailwind v4** via `@tailwindcss/vite`
- **zustand** (with `persist` middleware) for the window-manager store
- **react-rnd** for draggable / resizable windows
- **lucide-react** for icons

## Tests

```sh
npm test             # vitest — unit tests for store + helpers
npm run test:e2e     # playwright — desktop golden path, mobile fallback, iframe embed
npm run typecheck    # astro check && tsc --noEmit
```

## Architecture

[`docs/architecture.md`](docs/architecture.md) covers the layering, app registry contract, window-manager store shape, a11y contract, and deploy contract — start there if you want to add an app or change a behavior.

The original product spec — vision, build sequence, open questions — lives at [`docs/superpowers/specs/2026-04-12-cortechos-design.md`](docs/superpowers/specs/2026-04-12-cortechos-design.md).

## License

[MIT](LICENSE) © [Schmug](https://github.com/schmug)
