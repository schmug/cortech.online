import type { APIRoute } from 'astro';
import { buildFeaturedRepos, fetchAllRepos } from '../../lib/github';

export const GET: APIRoute = async () => {
  const all = await fetchAllRepos('schmug');
  // Fail the build instead of shipping a near-blank desktop. An empty list
  // means we hit GitHub's unauthenticated rate limit (or the user has zero
  // public repos) — in either case the previous good deploy stays live. See
  // issue #27.
  if (all.length === 0) {
    throw new Error(
      'fetchAllRepos returned 0 repos — refusing to ship a blank /api/projects.json. ' +
        'Set GITHUB_TOKEN to lift the unauthenticated 60/hr rate limit.',
    );
  }
  const originals = all.filter((r) => !r.fork && !r.archived);
  const repos = originals.map((r) => ({
    name: r.name,
    description: r.description,
    html_url: r.html_url,
    homepage: r.homepage,
    language: r.language,
    stargazers_count: r.stargazers_count,
    updated_at: r.updated_at,
    topics: r.topics,
  }));
  const featured = buildFeaturedRepos(all);
  return new Response(JSON.stringify({ repos, featured, fetchedAt: new Date().toISOString() }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};

export const prerender = true;
