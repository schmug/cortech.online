import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import PodcastsApp from './PodcastsApp';
import { SHOWS, type Show } from '../../../lib/shows';

afterEach(cleanup);

describe('PodcastsApp', () => {
  it('renders one section per show', () => {
    render(<PodcastsApp />);
    for (const show of SHOWS) {
      expect(screen.getByRole('heading', { name: show.name })).toBeTruthy();
    }
  });

  function cardFor(show: Show): HTMLElement {
    const card = screen.getByRole('heading', { name: show.name }).closest('article');
    expect(card).not.toBeNull();
    return card as HTMLElement;
  }

  it.each(SHOWS)('$name links out to its episodes and its feed', (show) => {
    render(<PodcastsApp />);
    const card = cardFor(show);

    const episodes = within(card).getByRole('link', { name: /episodes/i });
    expect(episodes.getAttribute('href')).toBe(show.pagePath);

    const feed = within(card).getByRole('link', { name: /rss/i });
    expect(feed.getAttribute('href')).toBe(show.feedPath);
  });

  it.each(SHOWS.filter((s) => s.spotifyUrl !== null))('$name links out to Spotify', (show) => {
    render(<PodcastsApp />);
    const spotify = within(cardFor(show)).getByRole('link', { name: /spotify/i });
    expect(spotify.getAttribute('href')).toBe(show.spotifyUrl);
    // Cross-origin target=_blank without noopener hands the opened tab a live
    // window.opener handle back into CortechOS.
    expect(spotify.getAttribute('rel')).toContain('noopener');
  });

  // An RSS-first show has no Spotify page; the feed is its way in.
  it.each(SHOWS.filter((s) => s.spotifyUrl === null))('$name offers no Spotify link', (show) => {
    render(<PodcastsApp />);
    expect(within(cardFor(show)).queryByRole('link', { name: /spotify/i })).toBeNull();
  });

  it.each(SHOWS)('$name shows its cover art with a non-decorative alt', (show) => {
    render(<PodcastsApp />);
    const cover = screen.getByRole('img', { name: new RegExp(`${show.name} cover`, 'i') });
    expect(cover.getAttribute('src')).toBe(show.coverSrc);
  });
});
