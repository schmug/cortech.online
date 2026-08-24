// The two podcasts, as one list. Both shows surface in four places — their own
// show page, the homepage static layer, the CortechOS Podcasts app, and the
// primary nav — and the Spotify URL is the piece most likely to be pasted in
// wrong, so it lives here once.
//
// Spotify's share sheet appends a `?si=` token that attributes every click to
// the device that copied the link. The canonical form is the bare show URL;
// shows.test.ts fails the build if a tracked one lands here.
//
// This is the *shows* list. src/pages/feeds.opml.ts is the feeds list — it
// covers every feed the site publishes, podcasts included.

export type Show = {
  id: string;
  name: string;
  /** One line, card-sized. Shown on the homepage and in the Podcasts app. */
  tagline: string;
  /** The show's page on this site. */
  pagePath: string;
  feedPath: string;
  /** Square cover art under /public, 1400px source. */
  coverSrc: string;
  spotifyUrl: string;
};

export const SHOWS: Show[] = [
  {
    id: 'cortech-daily',
    name: 'Cortech Daily',
    tagline:
      'About nine minutes each morning on AI, security, and Cloudflare — every item linked to its source.',
    pagePath: '/podcast',
    feedPath: '/podcast/rss.xml',
    coverSrc: '/podcast-cover.png',
    spotifyUrl: 'https://open.spotify.com/show/2r9MIeNT0aVkbcaLRUeMqM',
  },
  {
    id: 'frontier-commits',
    name: 'Frontier Commits',
    tagline:
      'Weekly, on what Anthropic, OpenAI, Google DeepMind, and xAI actually shipped on GitHub.',
    pagePath: '/frontier-commits',
    feedPath: '/frontier-commits/rss.xml',
    coverSrc: '/frontier-commits-cover.jpg',
    spotifyUrl: 'https://open.spotify.com/show/1F8PcfKYdslkqwhKHt9jLV',
  },
];

export const showById = (id: string): Show | undefined => SHOWS.find((s) => s.id === id);
