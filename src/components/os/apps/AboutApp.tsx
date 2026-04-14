import { bio, currentFocus, socialLinks, tagline } from '../../../data/about';

export default function AboutApp() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--color-void)] px-7 py-6 text-[var(--color-text)]">
      <header className="flex items-start gap-5">
        <img
          src="/mark.svg"
          alt=""
          aria-hidden="true"
          className="h-16 w-16 shrink-0 rounded-[16px] shadow-[0_8px_24px_-8px_rgba(246,195,74,0.5)]"
        />
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-amber)]">About</div>
          <h1 className="mt-1 font-[var(--font-display)] text-2xl font-semibold tracking-tight">Cory</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{tagline}</p>
        </div>
      </header>

      <section className="mt-6 space-y-3 text-sm leading-relaxed text-[var(--color-dim)]">
        {bio.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>

      <section className="mt-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">Current focus</div>
        <ul className="mt-2 grid gap-2 text-xs">
          {currentFocus.map(({ badge, title, note }) => (
            <FocusRow key={title} badge={badge} title={title} note={note} />
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-2 text-xs sm:grid-cols-3">
        {socialLinks.map(({ label, href, value }) => (
          <LinkCard key={label} label={label} href={href} value={value} />
        ))}
      </section>
    </div>
  );
}

function FocusRow({ badge, title, note }: { badge: string; title: string; note: string }) {
  return (
    <li className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]/60 px-3 py-2">
      <span aria-hidden="true" className="text-base">{badge}</span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[11px] text-[var(--color-text)]">{title}</div>
        <div className="truncate text-[11px] text-[var(--color-muted)]">{note}</div>
      </div>
    </li>
  );
}

function LinkCard({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="group rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-3 transition hover:border-[var(--color-amber)]/60 hover:bg-[var(--color-panel-hi)]"
    >
      <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
      <div className="mt-0.5 font-mono text-xs text-[var(--color-text)] group-hover:text-[var(--color-amber)]">{value} ↗</div>
    </a>
  );
}
