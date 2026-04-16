import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const entries = await getCollection('blog', ({ data }) => !data.draft);
  const posts = entries
    .map((p) => ({
      slug: p.id,
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate.toISOString(),
      updatedDate: p.data.updatedDate?.toISOString() ?? null,
      tags: p.data.tags,
    }))
    .sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));

  return new Response(JSON.stringify({ posts, fetchedAt: new Date().toISOString() }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};

export const prerender = true;
