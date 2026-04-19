import { useMemo } from 'react';
import { apps, type AppManifest } from '../apps/registry';
import { useFeaturedApps } from './useFeaturedApps';

export function useAllApps(): AppManifest[] {
  const featured = useFeaturedApps();
  return useMemo(() => {
    let merged = apps;
    if (featured.length > 0) {
      const staticIds = new Set(apps.map((a) => a.id));
      merged = [...apps];
      for (const f of featured) {
        if (!staticIds.has(f.id)) merged.push(f);
      }
    }
    return merged.map((app) => ({
      ...app,
      _searchable: app._searchable || `${app.name} ${app.description} ${app.id}`.toLowerCase(),
    }));
  }, [featured]);
}
