import { apps } from '../../apps/registry';
import { renderIcon } from '../../apps/iconUtils';
import { useMobile } from './store';

const DOCK_IDS = ['about', 'support', 'projects'] as const;

export function Dock() {
  const openApp = useMobile((s) => s.openApp);
  const pinned = DOCK_IDS.map((id) => apps.find((a) => a.id === id)).filter(
    (a): a is (typeof apps)[number] => !!a,
  );

  return (
    <nav
      aria-label="Dock"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] bg-[var(--color-shadow)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="flex items-center justify-around px-6 py-3">
        {pinned.map((app) => (
          <li key={app.id}>
            <button
              type="button"
              onClick={() => openApp(app.id)}
              aria-label={`Open ${app.name}`}
              className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border border-[var(--color-border)] bg-[var(--color-panel)] text-2xl transition active:scale-95 active:border-[var(--color-amber)]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-amber)]"
            >
              <span aria-hidden="true" className="flex items-center justify-center">
                {renderIcon(app.icon, 'h-7 w-7')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
