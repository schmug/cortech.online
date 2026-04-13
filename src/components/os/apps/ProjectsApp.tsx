import { useEffect, useMemo, useState } from 'react';
import type { Repo } from '../../../lib/github';

type Payload = { repos: Repo[]; fetchedAt: string };

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

export default function ProjectsApp() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/projects.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: Payload) => {
        if (!cancelled) setPayload(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!payload) return [];
    if (!query) return payload.repos;
    const q = query.toLowerCase();
    return payload.repos.filter((r) =>
      `${r.name} ${r.description ?? ''} ${r.language ?? ''}`.toLowerCase().includes(q)
    );
  }, [payload, query]);

  return (
    <div className="flex h-full flex-col bg-[var(--color-void)] text-[var(--color-text)]">
      <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-panel)]/80 px-5 py-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-amber)]">Projects</div>
            <h2 className="mt-0.5 font-[var(--font-display)] text-lg font-semibold">github.com/schmug</h2>
          </div>
          {payload && (
            <span className="font-mono text-[10px] text-[var(--color-muted)]">
              {filtered.length} / {payload.repos.length}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-shadow)] px-3 py-1.5">
          <span className="font-mono text-[11px] text-[var(--color-amber)]">›</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, language, or description"
            className="flex-1 bg-transparent text-xs text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
            aria-label="Filter projects"
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        {error && (
          <div className="rounded-md border border-[var(--color-hot)]/40 bg-[var(--color-hot)]/5 p-4 text-xs text-[var(--color-dim)]">
            Couldn't load repos ({error}). Visit{' '}
            <a href="https://github.com/schmug" target="_blank" rel="noopener" className="text-[var(--color-amber)] hover:underline">
              github.com/schmug
            </a>{' '}
            directly.
          </div>
        )}
        {!error && !payload && (
          <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--color-muted)]">
            loading repos…
          </div>
        )}
        {payload && (
          <ul className="divide-y divide-[var(--color-border)]">
            {filtered.length === 0 && (
              <li className="py-6 text-center text-xs text-[var(--color-muted)]">
                No repos match "<span className="font-mono text-[var(--color-text)]">{query}</span>".
              </li>
            )}
            {filtered.map((repo) => (
              <li key={repo.name}>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener"
                  className="block px-1 py-2 transition hover:bg-[var(--color-panel-hi)]"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-amber)]">{repo.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{repo.language ?? '—'}</span>
                  </div>
                  {repo.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--color-dim)]">{repo.description}</p>
                  )}
                  <div className="mt-1 flex gap-3 font-mono text-[10px] text-[var(--color-muted)]">
                    <span>★ {repo.stargazers_count}</span>
                    <span>{relativeTime(repo.updated_at)}</span>
                    {repo.homepage && (
                      <span className="text-[var(--color-amber)]/80">live ↗</span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {payload && (
        <footer className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-shadow)] px-5 py-2 font-mono text-[10px] text-[var(--color-muted)]">
          cached at {new Date(payload.fetchedAt).toLocaleString()}
        </footer>
      )}
    </div>
  );
}
