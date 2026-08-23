import type { APIContext } from 'astro';
import { PODCAST_SOURCE_GROUPS } from '../../lib/podcast-sources';

// OPML 2.0 subscription list of the feeds the Cortech Daily podcast *reads* —
// the show's provenance, importable into any reader in one click.
//
// Do not confuse this with /feeds.opml. That one is OUTBOUND (the feeds this
// site publishes, for subscribing to us); this one is INBOUND (what the show
// consumes). Both are OPML, and they mean opposite things, so the <title> of
// each has to make the direction obvious.
//
// The list is a point-in-time snapshot vendored in src/lib/podcast-sources.ts,
// not the runner's live config — see that file's header before refreshing it.

const OPML_TITLE = 'Cortech Daily — podcast sources';
const OWNER_NAME = 'Schmug';
// Credit the product, never github.com/schmug/donthype-me: that repo is
// private and the link would 404 for every listener who followed it.
const CURATED_IN = 'https://donthype.me';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(_context: APIContext) {
  const body = PODCAST_SOURCE_GROUPS.map((group) => {
    const feeds = group.feeds
      .map((feed) => {
        const category = feed.category ? ` category="${escapeXml(feed.category)}"` : '';
        return (
          `      <outline type="rss" text="${escapeXml(feed.title)}"` +
          ` title="${escapeXml(feed.title)}"` +
          ` xmlUrl="${escapeXml(feed.xmlUrl)}"${category} />`
        );
      })
      .join('\n');
    return `    <outline text="${escapeXml(group.name)}" title="${escapeXml(group.name)}">\n${feeds}\n    </outline>`;
  }).join('\n');

  const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(OPML_TITLE)}</title>
    <ownerName>${escapeXml(OWNER_NAME)}</ownerName>
    <docs>${escapeXml(CURATED_IN)}</docs>
  </head>
  <body>
${body}
  </body>
</opml>
`;

  return new Response(opml, {
    headers: {
      // Mirrored by a public/_headers override — Cloudflare Pages serves static
      // assets by extension, and `.opml` isn't in its MIME map. With the global
      // X-Content-Type-Options: nosniff, the served type has to be set explicitly.
      'content-type': 'text/x-opml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}

export const prerender = true;
