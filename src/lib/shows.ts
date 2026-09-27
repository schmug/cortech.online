// The podcasts, as one list. Every show surfaces in four places — its own show
// page, the homepage static layer, the CortechOS Podcasts app, and /podcasts —
// and the platform URLs are the pieces most likely to be pasted in wrong, so
// they live here once.
//
// Share sheets paste the wrong URL: Spotify appends a `?si=` token that
// attributes every click to the copying device, and YouTube hands out one
// episode's watch URL with the playlist appended. Store the canonical show URL
// (bare Spotify show, bare Apple id, YouTube `/playlist?list=`);
// shows.test.ts fails the build on anything else.
//
// This is the *shows* list. src/pages/feeds.opml.ts is the feeds list — it
// covers every feed the site publishes, podcasts included.

/** Surfaces render listen links in this order. */
export const PLATFORMS = [
  { id: 'spotify', label: 'Spotify' },
  { id: 'apple', label: 'Apple Podcasts' },
  { id: 'youtube', label: 'YouTube' },
] as const;

export type Platform = (typeof PLATFORMS)[number]['id'];

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
  /** Null where the show is not listed. A show listed nowhere is RSS-first:
   * every surface then leads with the feed. Null rather than optional, so a
   * new entry has to say which it is for each platform. */
  listen: Record<Platform, string | null>;
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
    listen: {
      spotify: 'https://open.spotify.com/show/2r9MIeNT0aVkbcaLRUeMqM',
      apple: 'https://podcasts.apple.com/us/podcast/cortech-daily/id6816492260',
      youtube: 'https://www.youtube.com/playlist?list=PLT3WHek-cV54',
    },
  },
  {
    id: 'frontier-commits',
    name: 'Frontier Commits',
    tagline:
      'Weekly, on what Anthropic, OpenAI, Google DeepMind, and xAI actually shipped on GitHub.',
    pagePath: '/frontier-commits',
    feedPath: '/frontier-commits/rss.xml',
    coverSrc: '/frontier-commits-cover.jpg',
    listen: {
      spotify: 'https://open.spotify.com/show/1F8PcfKYdslkqwhKHt9jLV',
      apple: 'https://podcasts.apple.com/us/podcast/frontier-commits/id6816492264',
      youtube: 'https://www.youtube.com/playlist?list=PLQvBIRYzLbbI',
    },
  },
  {
    id: 'show-your-work',
    name: 'Show Your Work',
    tagline:
      'Weekly, the frontier labs’ alignment research explained — written and voiced by Claude, an Anthropic model.',
    pagePath: '/show-your-work',
    feedPath: '/show-your-work/rss.xml',
    coverSrc: '/show-your-work-cover.jpg',
    listen: {
      spotify: 'https://open.spotify.com/show/7F0dlzSs2YDdaytIwH2lAX',
      apple: 'https://podcasts.apple.com/us/podcast/show-your-work/id6816747069',
      youtube: 'https://www.youtube.com/playlist?list=PLJOeXQ7jb5Og',
    },
  },
];

export const showById = (id: string): Show | undefined => SHOWS.find((s) => s.id === id);

export type ListenLink = { id: Platform; label: string; url: string };

export const listenLinks = (show: Show): ListenLink[] =>
  PLATFORMS.flatMap(({ id, label }) => {
    const url = show.listen[id];
    return url ? [{ id, label, url }] : [];
  });
