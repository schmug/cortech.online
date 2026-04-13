import type { APIRoute } from 'astro';
import { fetchOriginalRepos } from '../../lib/github';

export const GET: APIRoute = async () => {
  const full = await fetchOriginalRepos('schmug');
  const repos = full.map((r) => ({
    name: r.name,
    description: r.description,
    html_url: r.html_url,
    homepage: r.homepage,
    language: r.language,
    stargazers_count: r.stargazers_count,
    updated_at: r.updated_at,
    topics: r.topics,
  }));
  return new Response(JSON.stringify({ repos, fetchedAt: new Date().toISOString() }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};

export const prerender = true;
