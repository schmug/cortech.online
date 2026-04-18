import { useEffect, useRef, useState } from 'react';

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
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => {
          let next = i;
          for (let step = 0; step < items.length; step++) {
            next = (next + 1) % items.length;
            if (!items[next].disabled) return next;
          }
          return i;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => {
          let next = i;
          for (let step = 0; step < items.length; step++) {
            next = (next - 1 + items.length) % items.length;
            if (!items[next].disabled) return next;
          }
          return i;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const it = items[active];
        if (it && !it.disabled) {
          it.onClick();
          onDismiss();
        }
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onDismiss, items, active]);

  useEffect(() => {
    const first = items.findIndex((i) => !i.disabled);
    if (first >= 0) setActive(first);
    ref.current?.focus();
  }, [items]);

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
      aria-orientation="vertical"
      tabIndex={-1}
      className="absolute z-[200] min-w-[200px] overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-[var(--color-panel-hi)] py-1 shadow-2xl outline-none"
      style={{ left: px, top: py }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          role="menuitem"
          type="button"
          disabled={item.disabled}
          onMouseEnter={() => !item.disabled && setActive(i)}
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
              : i === active
                ? item.destructive
                  ? 'bg-[var(--color-hot)]/15 text-[var(--color-hot)]'
                  : 'bg-[var(--color-amber)]/15 text-[var(--color-amber)]'
                : item.destructive
                  ? 'text-[var(--color-hot)]'
                  : 'text-[var(--color-text)]',
          ].join(' ')}
        >
          {item.icon && (
            <span className="w-4 text-center" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
