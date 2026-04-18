# CLAUDE.md

Guidance for Claude Code working in this repo. Keep concise — link out, don't duplicate.

## What this is

The portfolio at [cortech.online](https://cortech.online) — a single Astro static page that hydrates one React island. The island chooses between `OSShell` (desktop, ≥768px) and `MobileShell` (<768px). Built with Astro 6, React 19, Tailwind v4, zustand. Hosted on Cloudflare Pages, auto-deployed on merge to `main`.

## Test & verify

Run before claiming work is complete:

```sh
npm run format:check # prettier
npm run lint         # eslint
npm run typecheck    # astro check && tsc --noEmit
npm test             # vitest, ~63 unit tests, sub-second
npm run test:e2e     # playwright, auto-starts dev server on :4321
```

`npm run build` catches blog-post schema errors that the typecheck misses — run it after touching anything in `src/content/blog/` or `src/content.config.ts`.

CI runs the same commands on every PR and push to `main` — see [.github/workflows/ci.yml](.github/workflows/ci.yml). Local green = CI green.

## Deploy

Cloudflare Pages, settings in [README.md](README.md#build--deploy). `public/_routes.json` excludes everything from the Functions runtime — pure static asset serving. Pushing to `main` triggers a deploy; PRs get a preview URL automatically.

## Blog posts

Markdown in `src/content/blog/`, schema in [src/content.config.ts](src/content.config.ts), template at [src/content/blog/\_template.md](src/content/blog/_template.md). Files starting with `_` are ignored. Frontmatter: `title`, `description`, `pubDate`, `tags`, `draft`. Posts feed `/blog`, `/rss.xml`, and the desktop Blog app simultaneously.

For mobile drafting, use the **`/blog` slash command** ([.claude/commands/blog.md](.claude/commands/blog.md)) — it turns a voice/text dump into a reviewable PR in one turn.

## Window-OS conventions

The app registry, window-manager store shape, a11y contract, and deploy contract live in [docs/architecture.md](docs/architecture.md). Read it before adding an app or changing window behavior. Original design rationale: [docs/superpowers/specs/2026-04-12-cortechos-design.md](docs/superpowers/specs/2026-04-12-cortechos-design.md).

To add an app: append one entry to [src/apps/registry.ts](src/apps/registry.ts) — the launcher, desktop icons, and taskbar pick it up automatically. The mobile springboard tile-count assertion in [e2e/smoke.spec.ts](e2e/smoke.spec.ts) is derived from `apps.length + featuredRepos.length`, so it updates automatically.

Iframe apps must allow framing (no `X-Frame-Options: DENY`, no restrictive `frame-ancestors`) — the iframe-embed Playwright suite enforces this.

## Code style

- No `index.ts` barrels — import from concrete files
- Tests colocate as `.test.ts(x)` next to source
- Zustand store mutations stay inside store actions, never inline in components
- Window-relative units come from the store, not CSS — see `src/components/os/store.ts`
- Comments only when the _why_ is non-obvious. Don't restate what the code does.
- Site owner is referred to as **Schmug**, not Cory ([commit 1a5d204](https://github.com/schmug/portfolio/commit/1a5d204))
