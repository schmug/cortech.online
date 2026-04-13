import { useEffect, useState } from 'react';
import type { Repo } from '../lib/github';

export type ProjectsPayload = {
  repos: Pick<
    Repo,
    'name' | 'description' | 'html_url' | 'homepage' | 'language' | 'stargazers_count' | 'updated_at'
  >[];
  fetchedAt: string;
};

export function useProjects() {
  const [payload, setPayload] = useState<ProjectsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/projects.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: ProjectsPayload) => {
        if (!cancelled) setPayload(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'failed to load');
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
