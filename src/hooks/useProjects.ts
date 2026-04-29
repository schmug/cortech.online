import { useEffect, useState } from 'react';
import type { FeaturedRepo } from '../apps/featuredRepos';
import type { Repo } from '../lib/github';

export type ProjectsPayload = {
  repos: Pick<
    Repo,
    | 'name'
    | 'description'
    | 'html_url'
    | 'homepage'
    | 'language'
    | 'stargazers_count'
    | 'updated_at'
  >[];
  featured?: FeaturedRepo[];
  fetchedAt: string;
};

// Module-level cache to deduplicate concurrent requests and reuse data
// Expected performance impact: Reduces redundant network requests for `/api/projects.json` to exactly 1
// when multiple components (e.g. Launcher, Desktop, WindowManager) mount simultaneously.
let cachedPayload: ProjectsPayload | null = null;
let cachedError: string | null = null;
let fetchPromise: Promise<ProjectsPayload> | null = null;

export function useProjects() {
  const [payload, setPayload] = useState<ProjectsPayload | null>(cachedPayload);
  const [error, setError] = useState<string | null>(cachedError);

  useEffect(() => {
    // If we already have a cached result, no need to fetch again
    if (cachedPayload || cachedError) {
      return;
    }

    let cancelled = false;

    // Deduplicate concurrent fetch requests using a shared promise
    if (!fetchPromise) {
      fetchPromise = fetch('/api/projects.json').then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
      );
    }

    fetchPromise
      .then((data: ProjectsPayload) => {
        cachedPayload = data;
        if (!cancelled) setPayload(data);
      })
      .catch((err) => {
        const errMsg = err instanceof Error ? err.message : 'failed to load';
        cachedError = errMsg;
        if (!cancelled) setError(errMsg);
      })
      .finally(() => {
        // Clear the promise so future failures can retry,
        // but successful calls will rely on the cache.
        if (cachedError) {
          fetchPromise = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { payload, error, loading: !payload && !error };
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}
