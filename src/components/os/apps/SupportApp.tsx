import { apps } from '../../../apps/registry';
import { renderIcon } from '../../../apps/iconUtils';

export default function SupportApp() {
  const paidApps = apps.filter((a) => a.paid);

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-void)] px-7 py-6 text-[var(--color-text)]">
      <header>
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-amber)]">Support</div>
        <h1 className="mt-1 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
          Keep the small things small.
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Everything on CortechOS runs on a pile of Cloudflare Workers, side projects, and evenings. A few ways to pitch in —
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Tier
          icon="💛"
          title="GitHub Sponsors"
          note="Recurring support with tiers. Best if you want your name listed here."
          cta="Sponsor me"
          href="https://github.com/sponsors/schmug"
        />
        <Tier
          icon="☕"
          title="Tip jar (Stripe)"
          note="One-time, any amount. Coming soon."
          cta="Coming soon"
          href="#"
          disabled
        />
        <Tier
          icon="⭐"
          title="Star on GitHub"
          note="Free, takes five seconds, actually helps projects get found."
          cta="Open my repos"
          href="https://github.com/schmug?tab=repositories&type=source"
        />
        <Tier
          icon="🗣️"
          title="Tell a friend"
          note="If a tool here solved a real problem, share it. Referrals are the best currency."
          cta="Copy link"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText('https://cortech.online');
            }
          }}
        />
      </section>

      <section className="mt-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">What your support funds</div>
        <ul className="mt-3 grid gap-2 text-xs">
          {paidApps.map((app) => (
            <li key={app.id} className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]/60 px-3 py-2">
              <span aria-hidden="true" className="text-base">{renderIcon(app.icon, 'h-4 w-4')}</span>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[11px] text-[var(--color-text)]">{app.name}</div>
                <div className="truncate text-[11px] text-[var(--color-muted)]">{app.description}</div>
              </div>
              {app.url && (
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener"
                  className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-amber)]"
                >
                  open ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Business / sponsorship inquiries: open the <span className="font-mono text-[var(--color-text)]">About</span> app for contact details.
      </p>
    </div>
  );
}

function Tier(props: {
  icon: string;
  title: string;
  note: string;
  cta: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const base =
    'flex h-full flex-col justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-4 transition';
  const active = 'hover:border-[var(--color-amber)]/60 hover:bg-[var(--color-panel-hi)]';
  const disabled = 'opacity-50 cursor-not-allowed';
  const cls = `${base} ${props.disabled ? disabled : active}`;

  const content = (
    <>
      <div>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-lg">{props.icon}</span>
          <div className="font-medium text-[var(--color-text)]">{props.title}</div>
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">{props.note}</p>
      </div>
      <div className="mt-3 font-mono text-[11px] text-[var(--color-amber)]">
        {props.cta} {!props.disabled && '→'}
      </div>
    </>
  );

  if (props.onClick) {
    return (
      <button type="button" onClick={props.onClick} className={`${cls} text-left`}>
        {content}
      </button>
    );
  }
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener"
      aria-disabled={props.disabled}
      onClick={(e) => props.disabled && e.preventDefault()}
      className={cls}
    >
      {content}
    </a>
  );
}
