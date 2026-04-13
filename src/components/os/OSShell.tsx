import { useCallback, useEffect, useState } from 'react';
import { WindowManager } from './WindowManager';
import { Desktop } from './Desktop';
import { Taskbar } from './Taskbar';
import { Launcher } from './Launcher';
import { useGlobalShortcuts } from './useKeyboard';

const TASKBAR_H = 56;

export default function OSShell() {
  const [viewport, setViewport] = useState({ w: 1200, h: 700 });
  const [launcherOpen, setLauncherOpen] = useState(false);

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

  return (
    <div
      id="ct-desktop"
      className="ct-backdrop relative h-[100dvh] w-full overflow-hidden"
      aria-label="CortechOS desktop"
      role="application"
    >
      <div className="absolute inset-x-0 top-0 bottom-[56px]">
        <Desktop />
        <WindowManager viewport={viewport} />
      </div>
      <Taskbar onOpenLauncher={toggleLauncher} />
      <Launcher open={launcherOpen} onClose={closeLauncher} />
    </div>
  );
}
