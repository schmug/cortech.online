import { describe, it, expect } from 'vitest';
import { SHOWS } from './shows';

describe('SHOWS', () => {
  it('carries both published shows', () => {
    expect(SHOWS.map((s) => s.id)).toEqual(['cortech-daily', 'frontier-commits']);
  });

  // The Spotify URL is the one link a listener actually clicks. A `?si=` share
  // token pasted straight from the Spotify app attributes every visit to
  // whichever device copied it, so canonicalize on the way in.
  it.each(SHOWS)('$id links a canonical, tracker-free Spotify show URL', (show) => {
    expect(show.spotifyUrl).toMatch(/^https:\/\/open\.spotify\.com\/show\/[A-Za-z0-9]+$/);
    expect(show.spotifyUrl).not.toContain('?');
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
