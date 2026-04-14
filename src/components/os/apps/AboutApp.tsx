export default function AboutApp() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--color-void)] px-7 py-6 text-[var(--color-text)]">
      <header className="flex items-start gap-5">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-hot)] text-3xl shadow-[0_8px_24px_-8px_rgba(246,195,74,0.5)]"
        >
          👋
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-amber)]">About</div>
          <h1 className="mt-1 font-[var(--font-display)] text-2xl font-semibold tracking-tight">Cory</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Indie builder · Cloudflare-native · studio-of-one
          </p>
        </div>
      </header>

      <section className="mt-6 space-y-3 text-sm leading-relaxed text-[var(--color-dim)]">
        <p>
          I make small, well-scoped software that does one job well and ships. Most of it lives on Cloudflare Workers and Pages, written in TypeScript, deployed continuously.
        </p>
        <p>
          The constant threads: DNS and email security, RSS and feed discovery, contact utilities, AI / Claude Code tooling, and occasional generative-art experiments that exist mostly to make me smile.
        </p>
        <p>
          <span className="font-mono text-[var(--color-amber)]">CortechOS</span> is my attempt at a single memorable home for all of it — every icon on this desktop opens one of the things I've built, running live.
        </p>
      </section>

      <section className="mt-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">Current focus</div>
        <ul className="mt-2 grid gap-2 text-xs">
          <FocusRow badge="🛡️" title="dmarc.mx" note="DMARC, SPF, DKIM, BIMI, MTA-STS in one scan." />
          <FocusRow badge="📣" title="donthype.me" note="RSS feed discovery and reading without the hype cycle." />
          <FocusRow badge="📇" title="q-r.contact" note="Contact QR codes generated locally; no tracking." />
          <FocusRow badge="🧠" title="Claude Code tooling" note="cclog, claude-view, claudzibit, karkinos — sharper agents." />
        </ul>
      </section>

      <section className="mt-6 grid gap-2 text-xs sm:grid-cols-3">
        <LinkCard label="GitHub" href="https://github.com/schmug" value="github.com/schmug" />
        <LinkCard label="LinkedIn" href="https://www.linkedin.com/in/cory-rankin/" value="linkedin.com/in/cory-rankin" />
        <LinkCard label="Sponsor" href="https://github.com/sponsors/schmug" value="github.com/sponsors/schmug" />
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
