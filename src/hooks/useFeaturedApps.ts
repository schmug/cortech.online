import { useMemo } from 'react';
import { appIdForFeaturedRepo, type FeaturedRepo } from '../apps/featuredRepos';
import type { AppManifest } from '../apps/registry';
import { useProjects } from './useProjects';

const DEFAULT_SIZE = { w: 640, h: 540 };
const MIN_SIZE = { w: 360, h: 320 };

export function featuredRepoToApp(repo: FeaturedRepo): AppManifest {
  const base = {
    id: appIdForFeaturedRepo(repo.fullName),
    name: repo.name,
    description: repo.description ?? `${repo.fullName} on GitHub`,
    icon: repo.icon ?? '📦',
    defaultSize: DEFAULT_SIZE,
    minSize: MIN_SIZE,
    allowMultiple: false,
    githubRepo: repo.fullName,
  } as const;

  if (repo.homepage) {
    return {
      ...base,
      type: 'iframe',
      url: repo.homepage,
    };
  }

  return {
    ...base,
    type: 'native',
    component: () => import('../components/os/apps/RepoInfoApp'),
    componentProps: { repo },
  };
}

export function useFeaturedApps(): AppManifest[] {
  const { payload } = useProjects();
  return useMemo(() => {
    const featured = payload?.featured;
    if (!featured || featured.length === 0) return [];
    return featured.map(featuredRepoToApp);
  }, [payload?.featured]);
}
