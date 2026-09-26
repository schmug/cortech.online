import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from '../../lib/__fixtures__/show-your-work-episodes.json' with { type: 'json' };
import { GET } from './rss.xml';

// Driven through the real fetchShowYourWorkEpisodes against a fixture manifest,
// so these assertions cover the whole path — manifest bytes, schema, feed —
// rather than a mocked episode list. The show is RSS-first: this feed IS the
// show, so every channel field a directory reads is pinned here.

const SITE = new URL('https://cortech.online');
const ORIGINAL_ENV = process.env.SHOW_YOUR_WORK_MANIFEST_URL;

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
  process.env.SHOW_YOUR_WORK_MANIFEST_URL = 'https://example.test/manifest-show-your-work.json';
  serve404();
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (ORIGINAL_ENV === undefined) delete process.env.SHOW_YOUR_WORK_MANIFEST_URL;
  else process.env.SHOW_YOUR_WORK_MANIFEST_URL = ORIGINAL_ENV;
});

describe('show-your-work rss.xml route', () => {
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
    // The channel is fully described even with no episodes — a player can
    // subscribe before the first episode lands.
    expect(xml).toContain('<itunes:owner>');
    expect(xml).toContain('<itunes:image href=');
  });

  it('returns a valid empty feed without fetching when the override is empty', async () => {
    process.env.SHOW_YOUR_WORK_MANIFEST_URL = '';
    const xml = await getXml();
    expect(fetch).not.toHaveBeenCalled();
    expect(xml).toContain('<rss');
    expect(countItems(xml)).toBe(0);
  });

  it('titles the channel exactly "Show Your Work"', async () => {
    const channelTitle = (await getXml()).match(/<title>([^<]*)<\/title>/)?.[1];
    expect(channelTitle).toBe('Show Your Work');
  });

  // Locked editorial decision (clodcast show-your-work design spec §1, §6): the
  // show covers the lab whose model writes and voices it, and says so.
  it('discloses that Claude writes and voices a show that covers Anthropic', async () => {
    const xml = await getXml();
    const summary = xml.match(/<itunes:summary>([^<]*)<\/itunes:summary>/)?.[1] ?? '';
    const description = xml.match(/<description>([^<]*)<\/description>/)?.[1] ?? '';
    for (const text of [summary, description]) {
      expect(text).toContain('written and voiced by Claude, an Anthropic model');
      expect(text).toContain('Anthropic is one of the labs it covers');
    }
    // Frontier Commits' credit line says a person wrote it and "AI" narrated
    // it. Neither half is true of this show.
    expect(xml).not.toContain('narrated by AI');
    expect(xml).not.toContain('Written and produced by Schmug');
  });

  it('describes a weekly explainer of the labs’ alignment research', async () => {
    const xml = await getXml();
    expect(xml).toContain('Every week');
    expect(xml).toContain('alignment');
    for (const lab of ['Anthropic', 'OpenAI', 'Google DeepMind']) {
      expect(xml).toContain(lab);
    }
  });

  it('declares the channel tags a podcast directory requires', async () => {
    const xml = await getXml();
    expect(xml).toContain('<language>en-us</language>');
    expect(xml).toContain('<itunes:explicit>false</itunes:explicit>');
    expect(xml).toContain('<itunes:type>episodic</itunes:type>');
    expect(xml).toContain('<itunes:author>Schmug</itunes:author>');
    expect(xml).toContain('<itunes:summary>');
    expect(xml).toContain('<copyright>© 2026 Schmug</copyright>');
  });

  it('points itunes:image at the square show cover', async () => {
    const xml = await getXml();
    expect(xml).toContain('<itunes:image href="https://cortech.online/show-your-work-cover.jpg"');
  });

  it('names clodcast@cortech.online as the owner', async () => {
    const xml = await getXml();
    expect(xml).toContain('<itunes:name>Schmug</itunes:name>');
    expect(xml).toContain('<itunes:email>clodcast@cortech.online</itunes:email>');
  });

  it('declares exact Apple categories, Technology first', async () => {
    const xml = await getXml();
    // Each match consumes its nested children so they aren't double-counted.
    const topLevel =
      xml.match(
        /<itunes:category text="[^"]+"(?:\s*\/>|>(?:<itunes:category text="[^"]+"\s*\/>)*<\/itunes:category>)/g,
      ) ?? [];
    expect(topLevel.map((c) => c.match(/text="([^"]+)"/)?.[1])).toEqual([
      'Technology',
      'Science',
      'Education',
    ]);
    // All three are bare parents: Apple has no subcategory for machine-learning
    // research, and an invented one is silently dropped.
    for (const c of topLevel) expect(c).toMatch(/^<itunes:category text="[^"]+"\s*\/>$/);
  });

  it('declares an atom:link rel="self" pointing at this feed', async () => {
    const xml = await getXml();
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toMatch(
      /<atom:link href="https:\/\/cortech\.online\/show-your-work\/rss\.xml" rel="self" type="application\/rss\+xml"\s*\/>/,
    );
  });
});

describe('show-your-work rss.xml items', () => {
  beforeEach(() => {
    serveManifest(fixture);
  });

  it('emits one item per fixture episode, newest first', async () => {
    const xml = await getXml();
    expect(countItems(xml)).toBe(fixture.length);
    const items = xml.split('<item>').slice(1);
    expect(items[0]).toContain('week of October 5, 2026');
    expect(items[1]).toContain('week of September 28, 2026');
  });

  it('emits an <enclosure> with the exact byte length and audio/mpeg type', async () => {
    const itemBlock = (await getXml()).split('<item>')[1] ?? '';
    expect(itemBlock).toContain(
      'url="https://clodcast.cortech.online/show-your-work/syw-week-of-october-5-2026.mp3"',
    );
    expect(itemBlock).toContain('length="13631488"');
    expect(itemBlock).toContain('type="audio/mpeg"');
  });

  it('emits item-level duration, author, and explicit', async () => {
    const itemBlock = (await getXml()).split('<item>')[1] ?? '';
    expect(itemBlock).toContain('<itunes:duration>868</itunes:duration>');
    expect(itemBlock).toContain('<itunes:author>Schmug</itunes:author>');
    expect(itemBlock).toContain('<itunes:explicit>false</itunes:explicit>');
  });

  // Same reasoning as Frontier Commits: optional for an episodic show, and there
  // is no publish date to anchor a weekly epoch to until episode one ships.
  it('omits itunes:episode rather than deriving it from feed position', async () => {
    expect(await getXml()).not.toContain('<itunes:episode>');
  });

  it('links items at /show-your-work/<slug>/ scoped to context.site', async () => {
    expect(await getXml()).toContain(
      'https://cortech.online/show-your-work/syw-week-of-october-5-2026/',
    );
  });

  // The guid is the page URL, marked isPermaLink, and built from the slug. A
  // directory treats a changed guid as a new episode, so a retitle must never
  // move it.
  it('uses the slug-derived page URL as an isPermaLink guid', async () => {
    const guids = [...(await getXml()).matchAll(/<guid isPermaLink="true">([^<]*)<\/guid>/g)].map(
      (m) => m[1],
    );
    expect(guids).toEqual(fixture.map((ep) => `https://cortech.online/show-your-work/${ep.slug}/`));
  });

  it('keeps the guid when an episode is retitled', async () => {
    serveManifest(fixture.map((ep) => ({ ...ep, title: `Renamed: ${ep.title}` })));
    const itemBlock = (await getXml()).split('<item>')[1] ?? '';
    expect(itemBlock).toContain('Renamed: ');
    expect(itemBlock).toContain(
      '<guid isPermaLink="true">https://cortech.online/show-your-work/syw-week-of-october-5-2026/</guid>',
    );
  });

  it('entity-escapes the HTML description instead of injecting raw tags', async () => {
    const itemBlock = (await getXml()).split('<item>')[1] ?? '';
    expect(itemBlock).toContain('&lt;p&gt;');
    expect(itemBlock).not.toContain('<description><p>');
  });
});
