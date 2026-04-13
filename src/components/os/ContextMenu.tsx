import { useEffect, useRef } from 'react';

export type ContextMenuItem = {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

type Props = {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onDismiss: () => void;
};

export function ContextMenu({ x, y, items, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onDismiss]);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const width = 220;
  const height = items.length * 32 + 12;
  const px = Math.min(x, vw - width - 8);
  const py = Math.min(y, vh - height - 8);

  return (
    <div
      ref={ref}
      role="menu"
      className="absolute z-[200] min-w-[200px] overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-[var(--color-panel-hi)] py-1 shadow-2xl"
      style={{ left: px, top: py }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          role="menuitem"
          type="button"
          disabled={item.disabled}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onDismiss();
            }
          }}
          className={[
            'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition',
            item.disabled
              ? 'cursor-not-allowed text-[var(--color-muted)]'
              : item.destructive
                ? 'text-[var(--color-hot)] hover:bg-[var(--color-hot)]/15'
                : 'text-[var(--color-text)] hover:bg-[var(--color-amber)]/15 hover:text-[var(--color-amber)]',
          ].join(' ')}
        >
          {item.icon && <span className="w-4 text-center" aria-hidden="true">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
