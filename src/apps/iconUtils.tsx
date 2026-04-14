import type { ReactNode } from 'react';

export function renderIcon(icon: string | ReactNode, className?: string): ReactNode {
  if (typeof icon !== 'string') return icon;
  if (icon.startsWith('/')) {
    return <img src={icon} alt="" className={className} />;
  }
  return icon;
}
