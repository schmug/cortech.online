import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import PodcastsApp from './PodcastsApp';
import { SHOWS } from '../../../lib/shows';

afterEach(cleanup);

describe('PodcastsApp', () => {
  it('renders one section per show', () => {
    render(<PodcastsApp />);
    for (const show of SHOWS) {
      expect(screen.getByRole('heading', { name: show.name })).toBeTruthy();
    }
  });

  it.each(SHOWS)('$name links out to Spotify, its episodes, and its feed', (show) => {
    render(<PodcastsApp />);
    const card = screen.getByRole('heading', { name: show.name }).closest('article');
    expect(card).not.toBeNull();

    const spotify = within(card as HTMLElement).getByRole('link', { name: /spotify/i });
    expect(spotify.getAttribute('href')).toBe(show.spotifyUrl);
    // Cross-origin target=_blank without noopener hands the opened tab a live
    // window.opener handle back into CortechOS.
    expect(spotify.getAttribute('rel')).toContain('noopener');

    const episodes = within(card as HTMLElement).getByRole('link', { name: /episodes/i });
    expect(episodes.getAttribute('href')).toBe(show.pagePath);

    const feed = within(card as HTMLElement).getByRole('link', { name: /rss/i });
    expect(feed.getAttribute('href')).toBe(show.feedPath);
  });

  it.each(SHOWS)('$name shows its cover art with a non-decorative alt', (show) => {
    render(<PodcastsApp />);
    const cover = screen.getByRole('img', { name: new RegExp(`${show.name} cover`, 'i') });
    expect(cover.getAttribute('src')).toBe(show.coverSrc);
  });
});
