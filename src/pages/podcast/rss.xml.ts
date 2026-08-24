import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { fetchEpisodes } from '../../lib/episodes';

// Apple Podcasts directory requires the iTunes namespace + a fairly strict
// set of channel-level tags. Item-level adds <enclosure> (the audio binary)
// and <itunes:duration>. The bytes-accurate `length` on <enclosure> is
// load-bearing for some podcatchers; clodcast supplies it from ffprobe.

// Every constant below is public product surface on the Spotify show
// (open.spotify.com/show/2r9MIeNT0aVkbcaLRUeMqM), not just page metadata:
// the name in search results, the blurb a stranger reads before subscribing,
// and the categories that decide where the show gets browsed. Changing
// <title> renames the public show on Spotify's next poll — a one-way door.
// Decisions and rationale: docs/podcast-metadata.md.

const PODCAST_TITLE = 'Cortech Daily';
const PODCAST_DESCRIPTION =
  'Keep up with AI and security without reading forty tabs. Every morning, about nine minutes on the eleven stories that actually moved — AI tooling and agents, security and breaches, Cloudflare and the edge, and developer ergonomics — each with a timestamped link to its source. Written and produced by Schmug of cortech.online, narrated by AI.';
const AUTHOR = 'Schmug';
const OWNER_NAME = 'Schmug';
// Spotify re-verifies show ownership through this address; it must stay
// deliverable (cortech.online is on Cloudflare Email Routing). Shared with
// Frontier Commits so show mail is separable from personal mail — which also
// means one broken routing rule takes down ownership verification for BOTH
// shows, including this already-listed one.
const OWNER_EMAIL = 'clodcast@cortech.online';
const COPYRIGHT = '© 2026 Schmug';

// Apple allows up to three categories, and only exact Apple Podcasts strings
// survive — invented ones are silently dropped. Technology takes no
// subcategory; the other two are exact parent/child pairs.
const CATEGORIES: ReadonlyArray<{ text: string; sub?: string }> = [
  { text: 'Technology' },
  { text: 'News', sub: 'Tech News' },
  { text: 'Education', sub: 'How To' },
];

// Apple Podcasts & Spotify require square cover art, 1400–3000px. og-image.png
// is 1200×630 and would bounce on submission; podcast-cover.png is 3000×3000,
// the recommended size that marketing surfaces upscale from.
const COVER_URL = 'https://cortech.online/podcast-cover.png';

// `itunes:episode` is a property of the episode, never of the feed. It used to
// be `totalEpisodes - idx` — derived from position — so back-filling an older
// episode incremented the count and shifted every newer episode's number while
// its guid stayed fixed. Nine calendar gaps are queued for back-fill, so that
// would have fired. Deriving from the publish date makes each number the one
// that date has always owned: a back-fill slots into its own gap and touches
// nothing else. Day 1 is the first published episode, 2026-06-01.
const EPISODE_EPOCH_UTC = Date.UTC(2026, 5, 1);
const MS_PER_DAY = 86_400_000;

/** Stable 1-based episode number, or null for a date at/before the epoch
 * (itunes:episode must be a positive integer, so we emit no tag instead). */
function episodeNumberFor(pubDate: Date): number | null {
  const day = Date.UTC(pubDate.getUTCFullYear(), pubDate.getUTCMonth(), pubDate.getUTCDate());
  const n = Math.round((day - EPISODE_EPOCH_UTC) / MS_PER_DAY) + 1;
  return n > 0 ? n : null;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(context: APIContext) {
  const episodes = await fetchEpisodes();
  const site = context.site!;
  const feedSelfUrl = new URL('/podcast/rss.xml', site).toString();

  const channelExtras = [
    `<atom:link href="${escapeXml(feedSelfUrl)}" rel="self" type="application/rss+xml" />`,
    `<language>en-us</language>`,
    `<itunes:author>${escapeXml(AUTHOR)}</itunes:author>`,
    `<itunes:summary>${escapeXml(PODCAST_DESCRIPTION)}</itunes:summary>`,
    `<itunes:explicit>false</itunes:explicit>`,
    `<itunes:type>episodic</itunes:type>`,
    `<itunes:image href="${escapeXml(COVER_URL)}" />`,
    ...CATEGORIES.map(({ text, sub }) =>
      sub
        ? `<itunes:category text="${escapeXml(text)}"><itunes:category text="${escapeXml(sub)}"></itunes:category></itunes:category>`
        : `<itunes:category text="${escapeXml(text)}"></itunes:category>`,
    ),
    `<copyright>${escapeXml(COPYRIGHT)}</copyright>`,
    `<itunes:owner><itunes:name>${escapeXml(OWNER_NAME)}</itunes:name><itunes:email>${escapeXml(OWNER_EMAIL)}</itunes:email></itunes:owner>`,
  ].join('');

  return rss({
    title: PODCAST_TITLE,
    description: PODCAST_DESCRIPTION,
    site,
    xmlns: {
      itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd',
      atom: 'http://www.w3.org/2005/Atom',
    },
    customData: channelExtras,
    items: episodes.map((ep) => {
      const episodeNumber = episodeNumberFor(ep.pubDate);
      const durationSeconds = Math.round(ep.duration_s);
      const itemExtras = [
        `<itunes:author>${escapeXml(AUTHOR)}</itunes:author>`,
        `<itunes:duration>${durationSeconds}</itunes:duration>`,
        episodeNumber === null ? '' : `<itunes:episode>${episodeNumber}</itunes:episode>`,
        `<itunes:explicit>${ep.explicit ? 'true' : 'false'}</itunes:explicit>`,
        ep.cover_url ? `<itunes:image href="${escapeXml(ep.cover_url)}" />` : '',
      ]
        .filter(Boolean)
        .join('');

      return {
        title: ep.title,
        description: ep.description,
        link: new URL(`/podcast/${ep.slug}/`, site).toString(),
        pubDate: ep.pubDate,
        enclosure: {
          url: ep.mp3_url,
          length: ep.mp3_bytes,
          type: 'audio/mpeg',
        },
        customData: itemExtras,
      };
    }),
  });
}

export const prerender = true;
