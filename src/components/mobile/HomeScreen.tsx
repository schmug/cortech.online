import { apps, type AppManifest } from '../../apps/registry';
import { renderIcon } from '../../apps/iconUtils';
import { useMobile } from './store';

export function HomeScreen() {
  const openApp = useMobile((s) => s.openApp);

  return (
    <div
      id="home-screen"
      className="flex-1 overflow-y-auto px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+96px)]"
    >
      <ul className="grid grid-cols-4 gap-x-3 gap-y-5" data-testid="home-grid">
        {apps.map((app) => (
          <li key={app.id}>
            <AppTile app={app} onOpen={() => openApp(app.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type TileProps = {
  app: AppManifest;
  onOpen: () => void;
};

function AppTile({ app, onOpen }: TileProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${app.name}`}
      className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-1 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-amber)]"
    >
      <span className="relative flex h-[60px] w-[60px] items-center justify-center rounded-[18px] border border-[var(--color-border)] bg-[var(--color-panel)] text-3xl transition group-active:scale-95 group-active:border-[var(--color-amber)]/60">
        <span aria-hidden="true" className="flex items-center justify-center">
          {renderIcon(app.icon, 'h-8 w-8')}
        </span>
        {app.paid && (
          <span className="absolute -top-1 -right-1 rounded-full bg-[var(--color-amber)] px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wider text-[var(--color-void)] shadow">
            paid
          </span>
        )}
      </span>
      <span className="max-w-full truncate text-[11px] font-medium text-[var(--color-text)]">
        {app.name}
      </span>
    </button>
  );
}
