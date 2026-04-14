import { useState } from 'react';
import { apps, type AppManifest } from '../../apps/registry';
import { renderIcon } from '../../apps/iconUtils';
import { useOS } from './store';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';

type MenuState = { x: number; y: number; app: AppManifest } | null;

export function Desktop() {
  const openApp = useOS((s) => s.openApp);
  const [menu, setMenu] = useState<MenuState>(null);

  const onContext = (e: React.MouseEvent, app: AppManifest) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, app });
  };

  const buildItems = (app: AppManifest): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [
      { label: 'Open', icon: '↗', onClick: () => openApp(app) },
    ];
    if (app.url) {
      items.push({
        label: 'Open in new tab',
        icon: '⎋',
        onClick: () => window.open(app.url, '_blank', 'noopener'),
      });
    }
    if (app.githubRepo) {
      items.push({
        label: 'View source on GitHub',
        icon: '⟘',
        onClick: () => window.open(`https://github.com/${app.githubRepo}`, '_blank', 'noopener'),
      });
    }
    return items;
  };

  return (
    <>
      <div
        className="absolute inset-x-6 top-6 bottom-[72px] grid content-start gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, 92px)' }}
        aria-label="CortechOS desktop icons"
        role="grid"
      >
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            onDoubleClick={() => openApp(app)}
            onClick={() => openApp(app)}
            onContextMenu={(e) => onContext(e, app)}
            className="group flex flex-col items-center gap-1.5 rounded-md p-2 text-center transition hover:bg-[var(--color-panel)]/60 focus:bg-[var(--color-panel)]/80 focus:outline focus:outline-2 focus:outline-[var(--color-amber)] focus:outline-offset-2"
            aria-label={`Open ${app.name}`}
            title={app.description}
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-panel)] text-2xl shadow-[0_4px_0_rgba(0,0,0,0.35)] transition group-hover:border-[var(--color-amber)]/60"
              aria-hidden="true"
            >
              {renderIcon(app.icon, 'h-10 w-10')}
            </span>
            <span className="line-clamp-2 text-xs font-medium text-[var(--color-text)]">
              {app.name}
            </span>
            {app.paid && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-amber)]">paid</span>
            )}
          </button>
        ))}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={buildItems(menu.app)}
          onDismiss={() => setMenu(null)}
        />
      )}
    </>
  );
}
