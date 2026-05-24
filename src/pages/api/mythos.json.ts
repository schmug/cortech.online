import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import snapshot from '../../content/mythos/_data/snapshot.json';

export const GET: APIRoute = async () => {
  const entries = await getCollection('mythos');
  const posts = entries
    .map((p) => ({
      slug: p.id,
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate.toISOString(),
      triggers: p.data.triggers,
      cve_ids: p.data.cve_ids,
      projects: p.data.projects,
    }))
    .sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));

  return new Response(JSON.stringify({ snapshot, posts, fetchedAt: new Date().toISOString() }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};

export const prerender = true;
