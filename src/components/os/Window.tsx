import { Rnd } from 'react-rnd';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useOS, type WindowState } from './store';

type Props = {
  window: WindowState;
  viewport: { w: number; h: number };
  children: ReactNode;
  minSize?: { w: number; h: number };
};

export function Window({ window: win, viewport, children, minSize }: Props) {
  const focused = useOS((s) => s.focusedId === win.id);
  const focusWindow = useOS((s) => s.focusWindow);
  const closeWindow = useOS((s) => s.closeWindow);
  const minimizeWindow = useOS((s) => s.minimizeWindow);
  const toggleMaximize = useOS((s) => s.toggleMaximize);
  const moveWindow = useOS((s) => s.moveWindow);
  const resizeWindow = useOS((s) => s.resizeWindow);

  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (focused && !win.minimized) {
      sectionRef.current?.focus({ preventScroll: true });
    }
  }, [focused, win.minimized, win.id]);

  if (win.minimized) return null;

  const icon = typeof win.icon === 'string' ? win.icon : '▫';

  return (
    <Rnd
      position={{ x: win.x, y: win.y }}
      size={{ width: win.w, height: win.h }}
      minWidth={minSize?.w ?? 320}
      minHeight={minSize?.h ?? 220}
      bounds="parent"
      disableDragging={win.maximized}
      enableResizing={!win.maximized}
      dragHandleClassName="ct-window-drag"
      onMouseDown={() => focusWindow(win.id)}
      onDragStop={(_e, d) => moveWindow(win.id, d.x, d.y)}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        resizeWindow(win.id, ref.offsetWidth, ref.offsetHeight, pos.x, pos.y)
      }
      style={{ zIndex: win.z, position: 'absolute' }}
    >
      <section
        ref={sectionRef}
        tabIndex={-1}
        role="group"
        aria-label={`${win.title} window`}
        className={[
          'flex h-full w-full flex-col overflow-hidden rounded-[10px] border outline-none',
          focused
            ? 'border-[var(--color-amber)]/70 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.9),0_0_0_1px_var(--color-amber)_inset]'
            : 'border-[var(--color-border)] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.85)]',
          'bg-[var(--color-panel)]',
        ].join(' ')}
      >
        <header
          className={[
            'ct-window-drag flex h-[34px] shrink-0 select-none items-center gap-2 border-b px-3',
            focused
              ? 'border-[var(--color-amber)]/30 bg-[var(--color-panel-hi)]'
              : 'border-[var(--color-border)] bg-[var(--color-shadow)]',
          ].join(' ')}
          onDoubleClick={() => toggleMaximize(win.id, viewport)}
        >
          <div className="flex items-center gap-1.5" role="group" aria-label="Window actions">
            <button
              type="button"
              aria-label={`Close ${win.title}`}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(win.id);
              }}
              className="group relative h-3 w-3 rounded-full bg-[var(--color-hot)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[var(--color-amber)]"
            >
              <span className="sr-only">Close</span>
            </button>
            <button
              type="button"
              aria-label={`Minimize ${win.title}`}
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(win.id);
              }}
              className="h-3 w-3 rounded-full bg-[var(--color-amber)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[var(--color-amber)]"
            >
              <span className="sr-only">Minimize</span>
            </button>
            <button
              type="button"
              aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${win.title}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMaximize(win.id, viewport);
              }}
              className="h-3 w-3 rounded-full bg-[var(--color-cyan)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[var(--color-amber)]"
            >
              <span className="sr-only">{win.maximized ? 'Restore' : 'Maximize'}</span>
            </button>
          </div>
          <div className="mx-auto flex items-center gap-2 text-xs font-medium text-[var(--color-dim)]">
            <span aria-hidden="true">{icon}</span>
            <span>{win.title}</span>
          </div>
          <div className="font-mono text-[10px] text-[var(--color-muted)]">/{win.appId}</div>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden bg-[var(--color-void)]">{children}</div>
      </section>
    </Rnd>
  );
}
