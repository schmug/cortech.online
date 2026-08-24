import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Episode } from '../../lib/episodes';

const episodesRef: { current: Episode[] } = { current: [] };

vi.mock('../../lib/episodes', async () => {
  const actual = await vi.importActual<typeof import('../../lib/episodes')>('../../lib/episodes');
  return {
    ...actual,
    fetchEpisodes: async () => episodesRef.current,
  };
});

import { GET } from './rss.xml';

const SITE = new URL('https://cortech.online');

function makeContext() {
  return { site: SITE } as Parameters<typeof GET>[0];
}

async function getXml(): Promise<string> {
  const res = await GET(makeContext());
  return await res.text();
}

function countItems(xml: string): number {
  return xml.match(/<item>/g)?.length ?? 0;
}

function makeEpisode(overrides: Partial<Episode> = {}): Episode {
  return {
    slug: 'sample-episode',
    title: 'Sample Episode',
    description: 'desc',
    pubDate: new Date('2026-05-20T12:00:00Z'),
    mp3_url: 'https://audio.cortech.online/sample.mp3',
    mp3_bytes: 1000000,
    duration_s: 300,
    chapters: [],
    spotify_uri: null,
    cover_url: null,
    explicit: false,
    ...overrides,
  };
}

beforeEach(() => {
  episodesRef.current = [];
});

describe('podcast rss.xml route', () => {
  it('returns a valid empty feed when no episodes exist', async () => {
    const xml = await getXml();
    expect(xml).toContain('<rss');
    expect(xml).toContain('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"');
    expect(countItems(xml)).toBe(0);
  });

  it('declares an atom:link rel="self" pointing at the feed URL', async () => {
    const xml = await getXml();
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    // The serializer in @astrojs/rss may emit the self-closing tag with or
    // without a space before "/>", so match by structural pieces rather than
    // the exact whitespace.
    expect(xml).toMatch(
      /<atom:link href="https:\/\/cortech\.online\/podcast\/rss\.xml" rel="self" type="application\/rss\+xml"\s*\/>/,
    );
  });

  it('declares required channel-level iTunes tags', async () => {
    const xml = await getXml();
    expect(xml).toContain('<itunes:author>');
    expect(xml).toContain('<itunes:explicit>false</itunes:explicit>');
    expect(xml).toContain('<itunes:type>episodic</itunes:type>');
    expect(xml).toContain('<itunes:image href=');
    expect(xml).toContain('<itunes:category text=');
    expect(xml).toContain('<itunes:owner>');
  });

  // The channel block is public product surface on Spotify: the show name in
  // search, the blurb a stranger reads before subscribing, and the categories
  // that decide where it gets browsed. Pin every field so a future edit has to
  // be deliberate rather than accidental. Rationale: docs/podcast-metadata.md.
  it('names clodcast@cortech.online as the owner, where Spotify mails the code', async () => {
    // Both shows now route owner mail to one address, so show mail is separable
    // from personal mail rather than from each other. This address is where
    // Spotify re-verifies ownership of an already-listed show, so it must stay
    // deliverable on Cloudflare Email Routing — losing it means losing the
    // ability to prove ownership of a live show. Rationale:
    // docs/podcast-metadata.md.
    const xml = await getXml();
    expect(xml).toContain('<itunes:name>Schmug</itunes:name>');
    expect(xml).toContain('<itunes:email>clodcast@cortech.online</itunes:email>');
  });

  it('titles the channel "Cortech Daily" with no special characters', async () => {
    const xml = await getXml();
    // The channel <title> is the first one in the document.
    const channelTitle = xml.match(/<title>([^<]*)<\/title>/)?.[1];
    expect(channelTitle).toBe('Cortech Daily');
    // The old em-dash/"Podcast" title tripped Spotify's SEO checklist: dashes
    // render inconsistently across directories and "Podcast" wastes the field.
    expect(channelTitle).not.toMatch(/[—–]/);
    expect(channelTitle).not.toMatch(/podcast/i);
    expect(xml).not.toContain('Daily Digest Podcast');
  });

  it('leads the description with listener value and discloses AI narration', async () => {
    const xml = await getXml();
    expect(xml).toContain('Keep up with AI and security without reading forty tabs.');
    // Spotify prunes undisclosed AI-generated shows; the disclosure is load-bearing.
    expect(xml).toContain('narrated by AI');
    expect(xml).toContain('Schmug');
  });

  it('declares three exact Apple categories with their subcategories', async () => {
    const xml = await getXml();
    // The serializer collapses empty elements to self-closing form, so match
    // structurally rather than on exact bytes (same reason as atom:link above).
    expect(xml).toMatch(/<itunes:category text="Technology"\s*\/>/);
    expect(xml).toMatch(
      /<itunes:category text="News"><itunes:category text="Tech News"\s*\/><\/itunes:category>/,
    );
    expect(xml).toMatch(
      /<itunes:category text="Education"><itunes:category text="How To"\s*\/><\/itunes:category>/,
    );
    // Exactly three top-level categories: Apple drops anything beyond three.
    // Each match consumes its nested children, so they aren't counted twice.
    const topLevel =
      xml.match(
        /<itunes:category text="[^"]+"(?:\s*\/>|>(?:<itunes:category text="[^"]+"\s*\/>)*<\/itunes:category>)/g,
      ) ?? [];
    expect(topLevel.length).toBe(3);
  });

  it('declares a channel <copyright>', async () => {
    const xml = await getXml();
    expect(xml).toContain('<copyright>');
    expect(xml).toContain('Schmug');
  });

  it('points itunes:image at the 3000x3000 cover art', async () => {
    const xml = await getXml();
    expect(xml).toContain('<itunes:image href="https://cortech.online/podcast-cover.png"');
  });

  it('credits "Schmug" as the channel and item author', async () => {
    episodesRef.current = [makeEpisode()];
    const xml = await getXml();
    // channel + item level both render the constant
    const authorTags = xml.match(/<itunes:author>Schmug<\/itunes:author>/g) ?? [];
    expect(authorTags.length).toBe(2);
  });

  it('names "Schmug" as the iTunes owner contact', async () => {
    const xml = await getXml();
    expect(xml).toContain('<itunes:name>Schmug</itunes:name>');
  });

  it('emits an <enclosure> with byte length and audio/mpeg type', async () => {
    episodesRef.current = [
      makeEpisode({
        mp3_url: 'https://audio.cortech.online/abc.mp3',
        mp3_bytes: 4192384,
      }),
    ];

    const xml = await getXml();
    expect(xml).toContain('url="https://audio.cortech.online/abc.mp3"');
    expect(xml).toContain('length="4192384"');
    expect(xml).toContain('type="audio/mpeg"');
  });

  it('emits item-level <itunes:duration> in whole seconds', async () => {
    episodesRef.current = [makeEpisode({ duration_s: 524.6 })];
    const xml = await getXml();
    expect(xml).toContain('<itunes:duration>525</itunes:duration>');
  });

  it('numbers episodes from the publish date, newest highest', async () => {
    episodesRef.current = [
      makeEpisode({ slug: 'newer', pubDate: new Date('2026-06-02T12:00:00Z') }),
      makeEpisode({ slug: 'older', pubDate: new Date('2026-06-01T12:00:00Z') }),
    ];
    const items = (await getXml()).split('<item>').slice(1);
    expect(items[0]).toContain('<itunes:episode>2</itunes:episode>');
    expect(items[1]).toContain('<itunes:episode>1</itunes:episode>');
  });

  // Regression: the number used to be `totalEpisodes - idx`, derived from
  // position in the feed. Back-filling any of the 9 known calendar gaps would
  // have shifted every newer episode's number while keeping its guid. Deriving
  // from pubDate makes the number a property of the episode, not of the feed.
  it('does not renumber existing episodes when an older one is back-filled', async () => {
    const numbersBySlug = async (eps: Episode[]) => {
      episodesRef.current = eps;
      const xml = await getXml();
      return Object.fromEntries(
        xml
          .split('<item>')
          .slice(1)
          .map((block) => [
            block.match(/<guid[^>]*>[^<]*\/podcast\/([^/]+)\//)?.[1],
            block.match(/<itunes:episode>(\d+)<\/itunes:episode>/)?.[1],
          ]),
      );
    };

    const jun04 = makeEpisode({ slug: 'jun-04', pubDate: new Date('2026-06-04T12:00:00Z') });
    const jun02 = makeEpisode({ slug: 'jun-02', pubDate: new Date('2026-06-02T12:00:00Z') });
    const jun01 = makeEpisode({ slug: 'jun-01', pubDate: new Date('2026-06-01T12:00:00Z') });
    const backfilled = makeEpisode({ slug: 'jun-03', pubDate: new Date('2026-06-03T12:00:00Z') });

    const before = await numbersBySlug([jun04, jun02, jun01]);
    const after = await numbersBySlug([jun04, backfilled, jun02, jun01]);

    expect(before).toEqual({ 'jun-04': '4', 'jun-02': '2', 'jun-01': '1' });
    // Every pre-existing episode keeps the number it was published with.
    for (const slug of ['jun-04', 'jun-02', 'jun-01']) {
      expect(after[slug]).toBe(before[slug]);
    }
    expect(after['jun-03']).toBe('3');
  });

  it('omits itunes:episode for an episode predating the numbering epoch', async () => {
    // itunes:episode must be a positive integer; anything at or before the
    // epoch has no valid number, so emit no tag rather than 0 or a negative.
    episodesRef.current = [makeEpisode({ pubDate: new Date('2026-05-31T12:00:00Z') })];
    const itemBlock = (await getXml()).split('<item>')[1] ?? '';
    expect(itemBlock).not.toContain('<itunes:episode>');
  });

  it('uses /podcast/<slug>/ absolute links scoped to context.site', async () => {
    episodesRef.current = [makeEpisode({ slug: 'foo-bar' })];
    const xml = await getXml();
    expect(xml).toContain('https://cortech.online/podcast/foo-bar/');
  });

  it('entity-escapes Spotify-flavored HTML descriptions instead of injecting raw tags', async () => {
    // The manifest description is HTML; in RSS that is delivered as
    // entity-escaped markup (the standard for show notes), so podcatchers
    // decode and render it — never raw, unescaped tags in the XML.
    episodesRef.current = [
      makeEpisode({ description: '<p>Lead summary.</p><p>(0:00) - Intro</p>' }),
    ];
    const xml = await getXml();
    const itemBlock = xml.split('<item>')[1] ?? '';
    expect(itemBlock).toContain('&lt;p&gt;Lead summary.&lt;/p&gt;');
    expect(itemBlock).not.toContain('<description><p>');
  });

  it('marks explicit episodes per-item', async () => {
    episodesRef.current = [makeEpisode({ explicit: true })];
    const xml = await getXml();
    const itemBlock = xml.split('<item>')[1] ?? '';
    expect(itemBlock).toContain('<itunes:explicit>true</itunes:explicit>');
  });
});
