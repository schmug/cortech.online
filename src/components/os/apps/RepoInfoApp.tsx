import type { FeaturedRepo } from '../../../apps/featuredRepos';
import { relativeTime } from '../../../hooks/useProjects';

type Props = {
  repo?: FeaturedRepo;
};

export default function RepoInfoApp({ repo }: Props) {
  if (!repo) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-void)] font-mono text-xs text-[var(--color-muted)]">
        repo metadata missing
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-void)] px-6 py-5 text-[var(--color-text)]">
      <header className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-[var(--color-border)] bg-[var(--color-panel)] text-3xl"
        >
          {repo.icon ?? '📦'}
        </span>
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-amber)]">
            {repo.private ? 'Private repo' : repo.fork ? 'Forked repo' : 'Repo'}
          </div>
          <h2 className="mt-1 truncate font-[var(--font-display)] text-xl font-semibold">
            {repo.fullName}
          </h2>
          {repo.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-dim)]">
              {repo.description}
            </p>
          )}
        </div>
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-3 font-mono text-[11px] sm:grid-cols-4">
        <Stat label="Language" value={repo.language ?? '—'} />
        <Stat label="Stars" value={`★ ${repo.stargazersCount}`} />
        <Stat label="Updated" value={repo.updatedAt ? relativeTime(repo.updatedAt) : '—'} />
        <Stat
          label="Visibility"
          value={repo.private ? 'private' : repo.fork ? 'fork' : 'public'}
        />
      </dl>

      <section className="mt-6 grid gap-2 sm:grid-cols-2">
        <LinkCard label="Open on GitHub" href={repo.htmlUrl} />
        {repo.homepage && <LinkCard label="Open live site" href={repo.homepage} accent />}
      </section>

      {repo.private && (
        <p className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]/60 px-3 py-2 text-[11px] text-[var(--color-muted)]">
          This repo is private — link opens the GitHub page but code is only visible to
          authorized users.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]/60 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{label}</dt>
      <dd className="mt-0.5 text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

function LinkCard({
  label,
  href,
  accent = false,
}: {
  label: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={[
        'group flex items-center justify-between rounded-md border px-3 py-2.5 font-mono text-xs transition',
        accent
          ? 'border-[var(--color-amber)]/60 bg-[var(--color-amber)]/10 text-[var(--color-amber)] hover:bg-[var(--color-amber)]/20'
          : 'border-[var(--color-border)] bg-[var(--color-panel)]/60 text-[var(--color-text)] hover:border-[var(--color-amber)]/60 hover:bg-[var(--color-panel-hi)]',
      ].join(' ')}
    >
      <span>{label}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
