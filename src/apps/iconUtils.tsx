import type { ReactNode } from 'react';

export function renderIcon(icon: unknown, className?: string): ReactNode {
  if (typeof icon !== 'string') return icon as ReactNode;
  if (icon.startsWith('/')) {
    return <img src={icon} alt="" className={className} />;
  }
  return icon;
}
