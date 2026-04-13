import { useEffect } from 'react';
import { useOS } from './store';

export function useGlobalShortcuts(toggleLauncher: () => void, closeLauncher: () => void) {
  const focusedId = useOS((s) => s.focusedId);
  const closeWindow = useOS((s) => s.closeWindow);
  const windows = useOS((s) => s.windows);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleLauncher();
        return;
      }
      if (mod && e.key.toLowerCase() === 'w' && focusedId) {
        e.preventDefault();
        closeWindow(focusedId);
        return;
      }
      if (e.key === 'Escape') {
        closeLauncher();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggleLauncher, closeLauncher, focusedId, closeWindow, windows.length]);
}
