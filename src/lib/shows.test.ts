import { describe, it, expect } from 'vitest';
import { SHOWS } from './shows';

const ON_SPOTIFY = SHOWS.filter((s) => s.spotifyUrl !== null);

describe('SHOWS', () => {
  it('carries every published show', () => {
    expect(SHOWS.map((s) => s.id)).toEqual(['cortech-daily', 'frontier-commits', 'show-your-work']);
  });

  // The Spotify URL is the one link a listener actually clicks. A `?si=` share
  // token pasted straight from the Spotify app attributes every visit to
  // whichever device copied it, so canonicalize on the way in.
  it.each(ON_SPOTIFY)('$id links a canonical, tracker-free Spotify show URL', (show) => {
    expect(show.spotifyUrl).toMatch(/^https:\/\/open\.spotify\.com\/show\/[A-Za-z0-9]+$/);
    expect(show.spotifyUrl).not.toContain('?');
  });

  // RSS-first: nothing publishes Show Your Work to Spotify, so a Spotify link
  // would be a dead end or, worse, someone else's show.
  it('lists Show Your Work with no Spotify link', () => {
    expect(SHOWS.find((s) => s.id === 'show-your-work')?.spotifyUrl).toBeNull();
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
