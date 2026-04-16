import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { fetchOriginalRepos } from '../lib/github';

export async function GET(context: APIContext) {
  const repos = await fetchOriginalRepos('schmug');
  return rss({
    title: 'Cortech — Schmug',
    description: 'Small, useful things built at cortech.online',
    site: context.site!,
    items: repos.slice(0, 40).map((r) => ({
      title: r.name,
      description: r.description ?? '',
      link: r.html_url,
      pubDate: new Date(r.updated_at),
    })),
    customData: '<language>en-us</language>',
  });
}

export const prerender = true;
