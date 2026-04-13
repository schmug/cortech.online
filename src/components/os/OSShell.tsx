import { useEffect, useState } from 'react';
import { WindowManager } from './WindowManager';
import { useOS } from './store';
import { apps } from '../../apps/registry';

export default function OSShell() {
  const [viewport, setViewport] = useState({ w: 1200, h: 700 });
  const openApp = useOS((s) => s.openApp);
  const windows = useOS((s) => s.windows);
  const resetLayout = useOS((s) => s.resetLayout);

  useEffect(() => {
    const deriveViewport = () => {
      const el = document.getElementById('ct-desktop');
      if (!el) return;
      setViewport({ w: el.clientWidth, h: el.clientHeight });
    };
    deriveViewport();
    window.addEventListener('resize', deriveViewport);
    return () => window.removeEventListener('resize', deriveViewport);
  }, []);

  return (
    <div
      id="ct-desktop"
      className="ct-backdrop relative h-[100dvh] w-full overflow-hidden"
      aria-label="CortechOS desktop"
      role="application"
    >
      <WindowManager viewport={viewport} />

      {windows.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-[var(--color-muted)]">
            Desktop is empty — use the launcher below to open an app.
          </p>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-shadow)]/95 px-3 py-2 shadow-2xl backdrop-blur">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">launcher · M3</span>
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => openApp(app)}
            className="flex items-center gap-2 rounded-md border border-transparent bg-[var(--color-panel)] px-2 py-1 text-xs text-[var(--color-text)] transition hover:border-[var(--color-amber)]/50 hover:text-[var(--color-amber)]"
            title={app.description}
          >
            <span aria-hidden="true">{typeof app.icon === 'string' ? app.icon : '▫'}</span>
            <span>{app.name}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={resetLayout}
          className="ml-2 rounded-md border border-[var(--color-border)] px-2 py-1 font-mono text-[10px] text-[var(--color-muted)] transition hover:border-[var(--color-hot)]/60 hover:text-[var(--color-hot)]"
        >
          reset
        </button>
      </div>
    </div>
  );
}
