import { describe, it, expect } from 'vitest';
import { SHOWS, PLATFORMS, listenLinks, type Show } from './shows';

// Each platform's canonical show URL. Share sheets append trackers (Spotify's
// `?si=`, YouTube's `&si=`) and YouTube's copies a single episode's watch URL
// with the playlist tacked on; neither is the show.
const CANONICAL: Record<(typeof PLATFORMS)[number]['id'], RegExp> = {
  spotify: /^https:\/\/open\.spotify\.com\/show\/[A-Za-z0-9]+$/,
  apple: /^https:\/\/podcasts\.apple\.com\/us\/podcast\/[a-z0-9-]+\/id\d+$/,
  youtube: /^https:\/\/www\.youtube\.com\/playlist\?list=PL[\w-]+$/,
};

describe('SHOWS', () => {
  it('carries every published show', () => {
    expect(SHOWS.map((s) => s.id)).toEqual(['cortech-daily', 'frontier-commits', 'show-your-work']);
  });

  // The listen links are what a listener actually clicks, so a tracked or
  // episode-level URL is a bug even though it renders a working link.
  it.each(SHOWS)('$id links canonical, tracker-free platform URLs', (show) => {
    for (const { id } of PLATFORMS) {
      const url = show.listen[id];
      if (url !== null) expect(url, `${show.id} ${id}`).toMatch(CANONICAL[id]);
    }
  });

  it.each(SHOWS)('$id points at a site page and a feed that exist', (show) => {
    expect(show.pagePath).toMatch(/^\/[a-z-]+$/);
    expect(show.feedPath).toBe(`${show.pagePath}/rss.xml`);
    expect(show.coverSrc).toMatch(/^\/[\w-]+\.(png|jpg)$/);
  });

  it.each(SHOWS)('$id has a tagline short enough for a card', (show) => {
    expect(show.name.length).toBeGreaterThan(0);
    expect(show.tagline.length).toBeLessThanOrEqual(140);
  });
});

describe('listenLinks', () => {
  const base = SHOWS[0];

  it('returns listed platforms in PLATFORMS order, labelled', () => {
    const show: Show = {
      ...base,
      listen: { youtube: 'https://y.example', spotify: 'https://s.example', apple: null },
    };
    expect(listenLinks(show)).toEqual([
      { id: 'spotify', label: 'Spotify', url: 'https://s.example' },
      { id: 'youtube', label: 'YouTube', url: 'https://y.example' },
    ]);
  });

  // An RSS-first show is listed nowhere; every surface then leads with the feed.
  it('is empty for a show listed nowhere', () => {
    expect(listenLinks({ ...base, listen: { spotify: null, apple: null, youtube: null } })).toEqual(
      [],
    );
  });
});
