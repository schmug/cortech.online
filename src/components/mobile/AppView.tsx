import { Suspense, lazy, useEffect, useMemo, useState, type ComponentType } from 'react';
import { apps } from '../../apps/registry';
import { useMobile } from './store';
import { StatusBar } from './StatusBar';

type Props = {
  appId: string;
};

export function AppView({ appId }: Props) {
  const closeApp = useMobile((s) => s.closeApp);
  const app = apps.find((a) => a.id === appId);

  // Trigger slide-up on mount by flipping data-entered from false → true on the next frame.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const NativeComponent = useMemo<ComponentType | null>(() => {
    if (!app || app.type !== 'native' || !app.component) return null;
    return lazy(app.component);
  }, [app]);

  if (!app) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${app.name} app`}
      data-entered={entered}
      className="mobile-app-view fixed inset-0 z-30 flex flex-col bg-[var(--color-void)]"
    >
      <StatusBar />

      <button
        type="button"
        onClick={closeApp}
        aria-label="Back to home"
        className="absolute left-3 top-9 z-10 flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/90 px-3 py-1.5 font-mono text-[11px] text-[var(--color-text)] shadow backdrop-blur transition active:scale-95 active:border-[var(--color-amber)]/60"
      >
        <span aria-hidden="true">←</span>
        <span>back</span>
      </button>

      <div className="flex-1 overflow-hidden">
        {app.type === 'iframe' && app.url ? (
          <iframe
            src={app.url}
            title={app.name}
            sandbox="allow-same-origin allow-scripts"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        ) : NativeComponent ? (
          <div className="h-full overflow-auto">
            <Suspense fallback={<NativeFallback />}>
              <NativeComponent />
            </Suspense>
          </div>
        ) : null}
      </div>

      <style>{`
        .mobile-app-view {
          transform: translateY(100%);
          opacity: 0;
          transition: transform 220ms ease-out, opacity 220ms ease-out;
        }
        .mobile-app-view[data-entered="true"] {
          transform: translateY(0);
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .mobile-app-view {
            transform: none !important;
            transition: opacity 120ms linear !important;
          }
        }
      `}</style>
    </div>
  );
}

function NativeFallback() {
  return (
    <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--color-muted)]">
      loading…
    </div>
  );
}
