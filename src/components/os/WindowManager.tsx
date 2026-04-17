import { Suspense, lazy, useMemo } from 'react';
import { Window } from './Window';
import { useOS } from './store';
import { useAllApps } from '../../hooks/useAllApps';

type Props = {
  viewport: { w: number; h: number };
};

const nativeCache = new Map<string, ReturnType<typeof lazy>>();

function getNativeComponent(
  appId: string,
  loader?: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>
) {
  if (!loader) return null;
  const cached = nativeCache.get(appId);
  if (cached) return cached;
  const LazyC = lazy(loader);
  nativeCache.set(appId, LazyC);
  return LazyC;
}

export function WindowManager({ viewport }: Props) {
  const windows = useOS((s) => s.windows);
  const allApps = useAllApps();
  const appMap = useMemo(() => new Map(allApps.map((a) => [a.id, a])), [allApps]);

  return (
    <>
      {windows.map((win) => {
        const app = appMap.get(win.appId);
        if (!app) return null;

        let body: React.ReactNode;
        if (app.type === 'iframe' && app.url) {
          body = (
            <iframe
              src={app.url}
              title={app.name}
              className="h-full w-full border-0 bg-white"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads"
            />
          );
        } else if (app.type === 'native') {
          const LazyC = getNativeComponent(app.id, app.component);
          body = LazyC ? (
            <Suspense fallback={<NativePending name={app.name} />}>
              <LazyC {...(app.componentProps ?? {})} />
            </Suspense>
          ) : (
            <NativePlaceholder name={app.name} />
          );
        } else {
          body = <NativePlaceholder name={app.name} />;
        }

        return (
          <Window key={win.id} window={win} viewport={viewport} minSize={app.minSize}>
            {body}
          </Window>
        );
      })}
    </>
  );
}

function NativePending({ name }: { name: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--color-void)] font-mono text-xs text-[var(--color-muted)]">
      loading {name}…
    </div>
  );
}

function NativePlaceholder({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-[var(--color-void)] p-6 text-center">
      <div className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-amber)]">CortechOS · Native App</div>
      <div className="text-lg font-medium text-[var(--color-text)]">{name}</div>
      <div className="max-w-xs text-xs text-[var(--color-muted)]">
        This panel is wired up in milestone M6. The window manager itself is
        already working — try dragging, resizing, minimizing, or maximizing.
      </div>
    </div>
  );
}
