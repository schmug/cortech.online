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

// Module-level cache to prevent duplicate requests when multiple
// components (Desktop, WindowManager, Launcher) mount simultaneously.
let cachedPayload: ProjectsPayload | null = null;
let fetchPromise: Promise<ProjectsPayload> | null = null;

export function useProjects() {
  const [payload, setPayload] = useState<ProjectsPayload | null>(cachedPayload);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (cachedPayload) {
      setPayload(cachedPayload);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch('/api/projects.json').then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
      );
    }

    fetchPromise
      .then((data: ProjectsPayload) => {
        if (!cancelled) {
          cachedPayload = data;
          setPayload(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'failed to load');
          fetchPromise = null; // Reset on failure to allow retries
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
