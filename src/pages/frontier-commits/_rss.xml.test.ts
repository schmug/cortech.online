import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../../lib/__fixtures__/frontier-episodes.json' with { type: 'json' };
import { GET } from './rss.xml';

// Driven through the real fetchFrontierEpisodes against a fixture manifest, so
// these assertions cover the whole path — manifest bytes, schema, feed — rather
// than a mocked episode list. The channel block is what Spotify's submission
// verifier reads (schmug/cortech.online#193), so every field it checks is
// pinned here: artwork, owner email, language, explicit, category, enclosure.

const SITE = new URL('https://cortech.online');
const ORIGINAL_ENV = process.env.FRONTIER_MANIFEST_URL;

function makeContext() {
  return { site: SITE } as Parameters<typeof GET>[0];
}

/** Serve `body` as the manifest for the next fetch. */
function serveManifest(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
  );
}

function serve404() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('not found', { status: 404 })),
  );
}

async function getXml(): Promise<string> {
  const res = await GET(makeContext());
  return await res.text();
}

function countItems(xml: string): number {
  return xml.match(/<item>/g)?.length ?? 0;
}

beforeEach(() => {
  process.env.FRONTIER_MANIFEST_URL = 'https://example.test/manifest-frontier-commits.json';
  serve404();
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (ORIGINAL_ENV === undefined) delete process.env.FRONTIER_MANIFEST_URL;
  else process.env.FRONTIER_MANIFEST_URL = ORIGINAL_ENV;
});

describe('frontier-commits rss.xml route', () => {
  it('emits well-formed XML that parses without error', async () => {
    serveManifest(fixture);
    const doc = new DOMParser().parseFromString(await getXml(), 'text/xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    expect(doc.documentElement.tagName).toBe('rss');
    expect(doc.documentElement.getAttribute('version')).toBe('2.0');
  });

  // The manifest 404s until clodcast publishes episode 1; the feed still has to
  // be a valid, subscribable document on that day.
  it('returns a valid empty feed while the manifest 404s', async () => {
    const xml = await getXml();
    expect(xml).toContain('<rss');
    expect(xml).toContain('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"');
    expect(countItems(xml)).toBe(0);
    // The channel is fully described even with no episodes — a directory can
    // accept the submission before the first episode lands.
    expect(xml).toContain('<itunes:owner>');
    expect(xml).toContain('<itunes:image href=');
  });

  it('titles the channel "Frontier Commits" with no special characters', async () => {
    const channelTitle = (await getXml()).match(/<title>([^<]*)<\/title>/)?.[1];
    expect(channelTitle).toBe('Frontier Commits');
    // Same SEO checklist the daily show's title was rewritten against: em
    // dashes render inconsistently across directories and "podcast" wastes a
    // searchable field.
    expect(channelTitle).not.toMatch(/[—–]/);
    expect(channelTitle).not.toMatch(/podcast/i);
  });

  it('describes the show as a weekly read of the labs’ public GitHub', async () => {
    const xml = await getXml();
    expect(xml).toContain('Every week');
    expect(xml).toContain('GitHub');
    for (const lab of ['Anthropic', 'OpenAI', 'Google DeepMind', 'xAI']) {
      expect(xml).toContain(lab);
    }
    // Spotify prunes undisclosed AI-generated shows; the disclosure is load-bearing.
    expect(xml).toContain('narrated by AI');
    expect(xml).toContain('Schmug');
  });

  it('declares the channel tags a directory submission requires', async () => {
    const xml = await getXml();
    expect(xml).toContain('<language>en-us</language>');
    expect(xml).toContain('<itunes:explicit>false</itunes:explicit>');
    expect(xml).toContain('<itunes:type>episodic</itunes:type>');
    expect(xml).toContain('<itunes:author>Schmug</itunes:author>');
    expect(xml).toContain('<itunes:summary>');
    expect(xml).toContain('<copyright>');
  });

  it('points itunes:image at the square 1400px show cover', async () => {
    const xml = await getXml();
    expect(xml).toContain('<itunes:image href="https://cortech.online/frontier-commits-cover.jpg"');
  });

  it('names clodcast@cortech.online as the owner, where Spotify mails the code', async () => {
    const xml = await getXml();
    expect(xml).toContain('<itunes:name>Schmug</itunes:name>');
    expect(xml).toContain('<itunes:email>clodcast@cortech.online</itunes:email>');
  });

  it('declares exact Apple categories, Technology first', async () => {
    const xml = await getXml();
    expect(xml).toMatch(/<itunes:category text="Technology"\s*\/>/);
    expect(xml).toMatch(
      /<itunes:category text="News"><itunes:category text="Tech News"\s*\/><\/itunes:category>/,
    );
    // Apple drops anything past three top-level categories; each match consumes
    // its nested children so they aren't double-counted.
    const topLevel =
      xml.match(
        /<itunes:category text="[^"]+"(?:\s*\/>|>(?:<itunes:category text="[^"]+"\s*\/>)*<\/itunes:category>)/g,
      ) ?? [];
    expect(topLevel.length).toBe(2);
  });

  it('declares an atom:link rel="self" pointing at this feed', async () => {
    const xml = await getXml();
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toMatch(
      /<atom:link href="https:\/\/cortech\.online\/frontier-commits\/rss\.xml" rel="self" type="application\/rss\+xml"\s*\/>/,
    );
  });
});

describe('frontier-commits rss.xml items', () => {
  beforeEach(() => {
    serveManifest(fixture);
  });

  it('emits one item per fixture episode, newest first', async () => {
    const xml = await getXml();
    expect(countItems(xml)).toBe(fixture.length);
    const items = xml.split('<item>').slice(1);
    expect(items[0]).toContain('week of August 17, 2026');
    expect(items[1]).toContain('week of August 10, 2026');
  });

  it('emits an <enclosure> with the exact byte length and audio/mpeg type', async () => {
    const itemBlock = (await getXml()).split('<item>')[1] ?? '';
    expect(itemBlock).toContain(
      'url="https://clodcast.cortech.online/2026-08-17-frontier-commits.mp3"',
    );
    expect(itemBlock).toContain('length="5242880"');
    expect(itemBlock).toContain('type="audio/mpeg"');
  });

  it('emits item-level duration, author, and explicit', async () => {
    const itemBlock = (await getXml()).split('<item>')[1] ?? '';
    expect(itemBlock).toContain('<itunes:duration>401</itunes:duration>');
    expect(itemBlock).toContain('<itunes:author>Schmug</itunes:author>');
    expect(itemBlock).toContain('<itunes:explicit>false</itunes:explicit>');
  });

  // itunes:episode is optional for an episodic show, and the daily feed's
  // renumbering bug came from deriving it from feed position. There is no
  // publish date to anchor a weekly epoch to yet, so emit nothing.
  it('omits itunes:episode rather than deriving it from feed position', async () => {
    expect(await getXml()).not.toContain('<itunes:episode>');
  });

  it('links items at /frontier-commits/<slug>/ scoped to context.site', async () => {
    expect(await getXml()).toContain(
      'https://cortech.online/frontier-commits/2026-08-17-frontier-commits/',
    );
  });

  it('entity-escapes the HTML description instead of injecting raw tags', async () => {
    const itemBlock = (await getXml()).split('<item>')[1] ?? '';
    expect(itemBlock).toContain('&lt;p&gt;');
    expect(itemBlock).not.toContain('<description><p>');
  });
});
