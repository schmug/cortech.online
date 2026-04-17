import { useMemo } from 'react';
import { apps, type AppManifest } from '../apps/registry';
import { useFeaturedApps } from './useFeaturedApps';

export function useAllApps(): AppManifest[] {
  const featured = useFeaturedApps();
  return useMemo(() => {
    if (featured.length === 0) return apps;
    const staticIds = new Set(apps.map((a) => a.id));
    const merged = [...apps];
    for (const f of featured) {
      if (!staticIds.has(f.id)) merged.push(f);
    }
    return merged;
  }, [featured]);
}
