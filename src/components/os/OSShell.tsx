import { useCallback, useEffect, useRef, useState } from 'react';
import { WindowManager } from './WindowManager';
import { Desktop } from './Desktop';
import { Taskbar } from './Taskbar';
import { Launcher } from './Launcher';
import { BootSplash } from './BootSplash';
import { useGlobalShortcuts } from './useKeyboard';
import { useOS } from './store';

const TASKBAR_H = 56;

export default function OSShell() {
  const [viewport, setViewport] = useState({ w: 1200, h: 700 });
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const lastWindowIds = useRef<string[]>([]);
  const windows = useOS((s) => s.windows);

  const toggleLauncher = useCallback(() => setLauncherOpen((v) => !v), []);
  const closeLauncher = useCallback(() => setLauncherOpen(false), []);

  useGlobalShortcuts(toggleLauncher, closeLauncher);

  useEffect(() => {
    const deriveViewport = () => {
      const el = document.getElementById('ct-desktop');
      if (!el) return;
      setViewport({ w: el.clientWidth, h: Math.max(200, el.clientHeight - TASKBAR_H) });
    };
    deriveViewport();
    window.addEventListener('resize', deriveViewport);
    return () => window.removeEventListener('resize', deriveViewport);
  }, []);

  useEffect(() => {
    const prev = lastWindowIds.current;
    const curr = windows.map((w) => w.id);
    const opened = curr.filter((id) => !prev.includes(id));
    const closed = prev.filter((id) => !curr.includes(id));
    if (opened.length > 0) {
      const w = windows.find((w) => w.id === opened[0]);
      if (w) setAnnouncement(`${w.title} opened`);
    } else if (closed.length > 0) {
      setAnnouncement('Window closed');
    }
    lastWindowIds.current = curr;
  }, [windows]);

  return (
    <div
      id="ct-desktop"
      className="ct-backdrop relative h-[100dvh] w-full overflow-hidden"
      aria-label="CortechOS desktop"
      role="application"
    >
      <a
        href="#ct-desktop-icons"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[400] focus:rounded focus:bg-[var(--color-amber)] focus:px-3 focus:py-1 focus:text-[var(--color-void)] focus:outline-none"
      >
        Skip to desktop icons
      </a>

      <div className="absolute inset-x-0 top-0 bottom-[56px]" id="ct-desktop-icons">
        <Desktop />
        <WindowManager viewport={viewport} />
      </div>
      <Taskbar onOpenLauncher={toggleLauncher} />
      <Launcher open={launcherOpen} onClose={closeLauncher} />
      <BootSplash />

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
