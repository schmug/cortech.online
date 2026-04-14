import { useEffect, useState } from 'react';

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function StatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      aria-label="Status bar"
      className="flex h-7 flex-none items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-shadow)]/95 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] backdrop-blur"
    >
      <span>CortechOS mobile</span>
      <span className="tabular-nums text-[var(--color-dim)]" aria-live="polite">
        {formatTime(now)}
      </span>
    </div>
  );
}
