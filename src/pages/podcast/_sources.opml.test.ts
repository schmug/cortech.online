import { describe, expect, it } from 'vitest';
import { GET } from './sources.opml';
import { PODCAST_SOURCE_COUNT, PODCAST_SOURCE_GROUPS } from '../../lib/podcast-sources';

const SITE = new URL('https://cortech.online');

function makeContext() {
  return { site: SITE } as Parameters<typeof GET>[0];
}

async function getOpml(): Promise<string> {
  const res = await GET(makeContext());
  return await res.text();
}

describe('podcast sources.opml route', () => {
  it('serves an OPML 2.0 document', async () => {
    const xml = await getOpml();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<opml version="2.0">');
    expect(xml).toContain('<head>');
    expect(xml).toContain('<body>');
  });

  it('serves it as an OPML content type', async () => {
    const res = await GET(makeContext());
    // Cloudflare Pages has no MIME entry for .opml and the site sends
    // X-Content-Type-Options: nosniff, so the type must be explicit here and
    // mirrored in public/_headers.
    expect(res.headers.get('content-type')).toMatch(/xml|opml/);
  });

  it('names itself as the inbound list, distinct from /feeds.opml', async () => {
    const xml = await getOpml();
    // /feeds.opml is titled "Cortech feeds" and is what the site publishes.
    // This file is what the show reads; the titles must not collide.
    expect(xml).toMatch(/<title>[^<]*sources[^<]*<\/title>/i);
    expect(xml).not.toContain('<title>Cortech feeds</title>');
  });

  it('lists every vendored feed as an rss outline', async () => {
    const xml = await getOpml();
    const feedOutlines = xml.match(/<outline\b[^>]*type="rss"[^>]*\/>/g) ?? [];
    expect(feedOutlines.length).toBe(PODCAST_SOURCE_COUNT);
    expect(feedOutlines.length).toBe(78);
  });

  it('nests the feeds under their group folders', async () => {
    const xml = await getOpml();
    // Group outlines are containers: they open, hold children, and close.
    const groupOpens = xml.match(/<outline text="[^"]*"(?!.*xmlUrl)[^>]*>\n/g) ?? [];
    expect(groupOpens.length).toBe(PODCAST_SOURCE_GROUPS.length);
    expect(xml).toContain('text="AI"');
    expect(xml).toContain('text="Security"');
    // A reader importing this should get folders, not 78 loose feeds.
    expect((xml.match(/<\/outline>/g) ?? []).length).toBe(PODCAST_SOURCE_GROUPS.length);
  });

  it('publishes no feed URL carrying a credential', async () => {
    const xml = await getOpml();
    const urls = [...xml.matchAll(/xmlUrl="([^"]+)"/g)].map((m) => m[1]);
    expect(urls.length).toBe(78);
    for (const u of urls) {
      expect(u).toMatch(/^https?:\/\//);
      expect(u).not.toMatch(/[?&](token|key|auth|secret|api_?key|password)=/i);
    }
  });

  it('escapes titles containing XML metacharacters', async () => {
    const xml = await getOpml();
    // The export contains titles with quotes and ampersands, e.g. the
    // "anthropic" Google News feed and the "News & Politics" group.
    expect(xml).not.toMatch(/text="[^"]*[<>]/);
    expect(xml).toContain('&amp;');
    expect(xml).toContain('&quot;');
  });

  it('credits the tool by product URL, never the private repo', async () => {
    const xml = await getOpml();
    expect(xml).toContain('donthype.me');
    // github.com/schmug/donthype-me is private; linking it would 404.
    expect(xml).not.toContain('github.com/schmug/donthype-me');
  });
});
