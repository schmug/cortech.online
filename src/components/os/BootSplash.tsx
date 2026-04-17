import { useCallback, useEffect, useState } from 'react';
import { useOS } from './store';

type Phase = 'playing' | 'fading' | 'hidden';

const STATUS_LINES = [
  'cortechos: starting kernel…',
  'cortechos: mounting apps…',
  'cortechos: loading desktop…',
  'cortechos: ready.',
];

const SESSION_KEY = 'cortechos:booted';

function alreadyBootedThisSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function BootSplash() {
  const setBooted = useOS((s) => s.setBooted);
  const [phase, setPhase] = useState<Phase>(() =>
    alreadyBootedThisSession() ? 'hidden' : 'playing'
  );
  const [statusIndex, setStatusIndex] = useState(0);

  const markBooted = useCallback(() => {
    setPhase('hidden');
    setBooted(true);
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage can throw in private modes — splash still hides.
    }
  }, [setBooted]);

  useEffect(() => {
    if (phase === 'hidden') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = reduced ? 400 : 1500;
    const fadeOut = reduced ? 150 : 350;

    const lineTimers: ReturnType<typeof setTimeout>[] = [];
    STATUS_LINES.forEach((_, i) => {
      lineTimers.push(
        setTimeout(() => setStatusIndex(i), Math.floor((total / STATUS_LINES.length) * i))
      );
    });
    const t1 = setTimeout(() => setPhase('fading'), total);
    const t2 = setTimeout(markBooted, total + fadeOut);

    return () => {
      lineTimers.forEach(clearTimeout);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, markBooted]);

  useEffect(() => {
    if (phase === 'hidden') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key) markBooted();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', markBooted);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', markBooted);
    };
  }, [phase, markBooted]);

  if (phase === 'hidden') return null;

  return (
    <div
      className={[
        'absolute inset-0 z-[300] flex flex-col items-center justify-center bg-[var(--color-void)] transition-opacity',
        phase === 'fading' ? 'opacity-0 duration-300' : 'opacity-100 duration-0',
      ].join(' ')}
      aria-label="CortechOS booting"
      role="status"
    >
      <div className="ct-boot-glow flex flex-col items-center gap-6">
        <svg width="72" height="72" viewBox="0 0 32 32" aria-hidden="true" className="ct-boot-logo">
          <rect x="3" y="3" width="26" height="26" rx="4" fill="#0b0d12" stroke="var(--color-amber)" strokeWidth="2" />
          <path d="M3 10 H29" stroke="var(--color-amber)" strokeWidth="2" />
          <circle cx="7" cy="6.5" r="1.25" fill="var(--color-amber)" />
          <circle cx="11" cy="6.5" r="1.25" fill="var(--color-cyan)" />
          <circle cx="15" cy="6.5" r="1.25" fill="var(--color-hot)" />
        </svg>

        <div className="text-center">
          <div className="font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            CortechOS
          </div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
            v1.0 · a small operating system for a small studio
          </div>
        </div>

        <div className="relative h-[3px] w-[240px] overflow-hidden rounded bg-[var(--color-panel)]">
          <div className="ct-boot-bar absolute inset-y-0 left-0 bg-[var(--color-amber)]" />
        </div>

        <div className="h-4 font-mono text-[11px] text-[var(--color-muted)]" aria-live="polite">
          {STATUS_LINES[statusIndex]}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]/70">
        press any key to skip
      </div>

      <style>{`
        .ct-boot-logo { animation: ct-logo-pulse 1.4s ease-in-out infinite; }
        .ct-boot-bar { animation: ct-boot-fill 1.4s cubic-bezier(0.2, 0.8, 0.4, 1) forwards; }
        @keyframes ct-logo-pulse {
          0%, 100% { filter: drop-shadow(0 0 0 var(--color-amber)); opacity: 1; }
          50% { filter: drop-shadow(0 0 8px var(--color-amber)); opacity: 0.9; }
        }
        @keyframes ct-boot-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ct-boot-logo, .ct-boot-bar { animation: none !important; }
          .ct-boot-bar { width: 100%; }
        }
      `}</style>
    </div>
  );
}
