import { apps } from '../../apps/registry';
import { useProjects, relativeTime } from '../../hooks/useProjects';

export default function MobileShell() {
  const flagships = apps.filter((a) => a.type === 'iframe');
  return (
    <div className="ct-backdrop min-h-[100dvh] pb-16 text-[var(--color-text)]">
      <Header />
      <Hero />
      <Products items={flagships} />
      <ProjectsSection />
      <Support />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-void)]/90 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-3">
        <a href="/" className="flex items-center gap-2 font-mono text-sm font-semibold">
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="3" y="3" width="26" height="26" rx="4" fill="#0b0d12" stroke="var(--color-amber)" strokeWidth="2" />
            <path d="M3 10 H29" stroke="var(--color-amber)" strokeWidth="2" />
            <circle cx="7" cy="6.5" r="1.25" fill="var(--color-amber)" />
            <circle cx="11" cy="6.5" r="1.25" fill="var(--color-cyan)" />
            <circle cx="15" cy="6.5" r="1.25" fill="var(--color-hot)" />
          </svg>
          <span>cortech</span>
        </a>
        <nav aria-label="Primary" className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
          <a href="#products" className="transition hover:text-[var(--color-text)]">Products</a>
          <a href="#support" className="transition hover:text-[var(--color-text)]">Support</a>
          <a href="https://github.com/schmug" rel="noopener" className="transition hover:text-[var(--color-text)]">GitHub</a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="px-5 pt-10 pb-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-amber)]">CortechOS 1.0 · mobile</p>
      <h1 className="mt-4 font-[var(--font-display)] text-3xl font-bold leading-tight tracking-tight">
        Hi, I'm Cory.<br />
        I build <span className="text-[var(--color-amber)]">small, useful things</span>.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-dim)]">
        Email security, contact-card utilities, AI tooling, and the occasional piece of generative art. Each link below opens the live product in a new tab.
      </p>
      <div className="mt-6 flex flex-wrap gap-2.5 text-sm">
        <a href="#products" className="rounded-md bg-[var(--color-amber)] px-4 py-2 font-semibold text-[var(--color-void)]">See products →</a>
        <a
          href="https://github.com/sponsors/schmug"
          target="_blank"
          rel="noopener"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 font-medium text-[var(--color-text)]"
        >
          Sponsor
        </a>
      </div>
    </section>
  );
}

type App = ReturnType<typeof apps.filter>[number];

function Products({ items }: { items: App[] }) {
  return (
    <section id="products" className="px-5 pt-6 pb-2">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">Products</h2>
        <span className="font-mono text-[10px] text-[var(--color-muted)]">{items.length} apps</span>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((app) => (
          <li
            key={app.id}
            className="overflow-hidden rounded-[var(--ct-radius)] border border-[var(--color-border)] bg-[var(--color-panel)]/60"
          >
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-shadow)] px-3 py-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-hot)]" />
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-amber)]" />
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-cyan)]" />
              <span className="ml-2 font-mono text-[10px] text-[var(--color-muted)]">/{app.id}</span>
              {app.paid && (
                <span className="ml-auto rounded bg-[var(--color-amber)]/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--color-amber)]">
                  paid
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="text-2xl">{typeof app.icon === 'string' ? app.icon : '▫'}</span>
                <h3 className="font-[var(--font-display)] text-base font-semibold">{app.name}</h3>
              </div>
              <p className="mt-2 text-sm text-[var(--color-dim)]">{app.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener"
                  className="rounded-md bg-[var(--color-amber)] px-3 py-1.5 font-semibold text-[var(--color-void)]"
                >
                  Open {app.name} ↗
                </a>
                {app.githubRepo && (
                  <a
                    href={`https://github.com/${app.githubRepo}`}
                    target="_blank"
                    rel="noopener"
                    className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[var(--color-dim)]"
                  >
                    Source ↗
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-md border border-dashed border-[var(--color-border)] px-3 py-2 font-mono text-[10px] text-[var(--color-muted)]">
        ⌨ On a laptop, these open as live windows inside the CortechOS desktop.
      </p>
    </section>
  );
}

function ProjectsSection() {
  const { payload, error } = useProjects();

  return (
    <section className="px-5 pt-10 pb-2">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">Projects</h2>
        {payload && <span className="font-mono text-[10px] text-[var(--color-muted)]">{payload.repos.length} on GitHub</span>}
      </div>
      {error && (
        <p className="mt-3 text-sm text-[var(--color-dim)]">
          Couldn't load repos ({error}). Visit{' '}
          <a href="https://github.com/schmug" rel="noopener" className="text-[var(--color-amber)] underline">
            github.com/schmug
          </a>{' '}
          directly.
        </p>
      )}
      {!error && !payload && (
        <p className="mt-3 font-mono text-xs text-[var(--color-muted)]">loading repos…</p>
      )}
      {payload && (
        <ul className="mt-3 divide-y divide-[var(--color-border)] rounded-[var(--ct-radius)] border border-[var(--color-border)] bg-[var(--color-panel)]/40">
          {payload.repos.slice(0, 12).map((repo) => (
            <li key={repo.name}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener"
                className="block px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-sm font-medium">{repo.name}</span>
                  <span className="font-mono text-[10px] uppercase text-[var(--color-muted)]">{repo.language ?? '—'}</span>
                </div>
                {repo.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--color-dim)]">{repo.description}</p>
                )}
                <div className="mt-1 flex gap-3 font-mono text-[10px] text-[var(--color-muted)]">
                  <span>★ {repo.stargazers_count}</span>
                  <span>{relativeTime(repo.updated_at)}</span>
                  {repo.homepage && <span className="text-[var(--color-amber)]/80">live ↗</span>}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
      {payload && payload.repos.length > 12 && (
        <a
          href="https://github.com/schmug?tab=repositories&type=source"
          target="_blank"
          rel="noopener"
          className="mt-3 block text-center font-mono text-xs text-[var(--color-amber)]"
        >
          see all {payload.repos.length} on github ↗
        </a>
      )}
    </section>
  );
}

function Support() {
  return (
    <section id="support" className="px-5 pt-10 pb-2">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">Support</h2>
      <p className="mt-3 text-sm text-[var(--color-dim)]">
        Everything on CortechOS runs on a pile of Cloudflare Workers, side projects, and evenings.
      </p>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm">
        <li>
          <a
            href="https://github.com/sponsors/schmug"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]/60 px-4 py-3"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">💛</span>
              <span>
                <span className="block font-medium">GitHub Sponsors</span>
                <span className="block text-xs text-[var(--color-muted)]">Recurring support with tiers.</span>
              </span>
            </span>
            <span className="font-mono text-xs text-[var(--color-amber)]">Open ↗</span>
          </a>
        </li>
        <li>
          <a
            href="https://github.com/schmug?tab=repositories&type=source"
            target="_blank"
            rel="noopener"
            className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]/60 px-4 py-3"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">⭐</span>
              <span>
                <span className="block font-medium">Star on GitHub</span>
                <span className="block text-xs text-[var(--color-muted)]">Free, five seconds, actually helps.</span>
              </span>
            </span>
            <span className="font-mono text-xs text-[var(--color-amber)]">Open ↗</span>
          </a>
        </li>
        <li>
          <span className="flex items-center justify-between rounded-md border border-dashed border-[var(--color-border)] px-4 py-3 opacity-60">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">☕</span>
              <span>
                <span className="block font-medium">Tip jar (Stripe)</span>
                <span className="block text-xs text-[var(--color-muted)]">Coming soon.</span>
              </span>
            </span>
            <span className="font-mono text-xs">soon</span>
          </span>
        </li>
      </ul>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-[var(--color-border)] px-5 py-5 text-xs text-[var(--color-muted)]">
      <p>© {year} Schmug · cortech.online · CortechOS v1.0</p>
      <p className="mt-2 font-mono text-[10px]">
        ⌨ Try the desktop version on a laptop for the full OS experience ↗
      </p>
    </footer>
  );
}
