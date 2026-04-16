import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { fetchOriginalRepos } from '../lib/github';

export async function GET(context: APIContext) {
  const [repos, posts] = await Promise.all([
    fetchOriginalRepos('schmug'),
    getCollection('blog', ({ data }) => !data.draft),
  ]);

  const repoItems = repos.map((r) => ({
    title: r.name,
    description: r.description ?? '',
    link: r.html_url,
    pubDate: new Date(r.updated_at),
    categories: ['project'],
  }));

  const postItems = posts.map((p) => ({
    title: p.data.title,
    description: p.data.description,
    link: new URL(`/blog/${p.id}/`, context.site!).toString(),
    pubDate: p.data.pubDate,
    categories: ['blog', ...p.data.tags],
  }));

  const items = [...repoItems, ...postItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 40);

  return rss({
    title: 'Cortech — Schmug',
    description: 'Small, useful things built at cortech.online',
    site: context.site!,
    items,
    customData: '<language>en-us</language>',
  });
}

export const prerender = true;
