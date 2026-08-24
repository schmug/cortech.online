import { SHOWS, type Show } from '../../../lib/shows';

export default function PodcastsApp() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--color-void)] px-7 py-6 text-[var(--color-text)]">
      <header>
        <div className="font-mono text-[11px] tracking-[0.3em] text-[var(--color-amber)] uppercase">
          Podcasts
        </div>
        <h1 className="mt-1 text-2xl font-[var(--font-display)] font-semibold tracking-tight">
          Two shows, both AI-narrated.
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Written and produced by Schmug. Both are on Spotify — or paste the feed into whatever
          player you already use.
        </p>
      </header>

      <section className="mt-6 flex flex-col gap-4">
        {SHOWS.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </section>
    </div>
  );
}

function ShowCard({ show }: { show: Show }) {
  return (
    <article className="flex flex-col gap-4 rounded-[var(--ct-radius)] border border-[var(--color-border)] bg-[var(--color-panel)]/40 p-4 sm:flex-row">
      <img
        src={show.coverSrc}
        alt={`${show.name} cover art`}
        width="1400"
        height="1400"
        className="h-20 w-20 shrink-0 self-start rounded-md border border-[var(--color-border)]"
      />
      <div className="min-w-0">
        <h2 className="text-lg font-[var(--font-display)] font-semibold tracking-tight">
          {show.name}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{show.tagline}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <a
            href={show.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[var(--color-amber)] px-3 py-1.5 font-medium text-[var(--color-void)] transition hover:opacity-90"
          >
            Listen on Spotify ↗
          </a>
          <a
            href={show.pagePath}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[var(--color-text)] transition hover:border-[var(--color-amber)] hover:text-[var(--color-amber)]"
          >
            All episodes
          </a>
          <a
            href={show.feedPath}
            className="font-mono text-[var(--color-muted)] transition hover:text-[var(--color-amber)]"
          >
            RSS
          </a>
        </div>
      </div>
    </article>
  );
}
