import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { fetchFrontierEpisodes } from '../../lib/frontierEpisodes';

// The Frontier Commits feed. Unlike Cortech Daily, this show is RSS-first:
// nothing publishes it to a directory, so this file IS the show — the feed a
// listener subscribes to and the one submitted to Spotify for review. Every
// constant below is therefore public product surface, not page metadata, and
// <title> is a one-way door once a directory has polled it.
// Decisions and rationale: docs/podcast-metadata.md.

const PODCAST_TITLE = 'Frontier Commits';
const PODCAST_DESCRIPTION =
  'The frontier AI labs build in public, and most of it never makes the news. Every week, a short walk through what Anthropic, OpenAI, Google DeepMind, and xAI actually shipped on GitHub — the new repositories, the releases, the quiet archivals, and the trends underneath them — each item linked to the source it came from. Written and produced by Schmug of cortech.online, narrated by AI.';
const AUTHOR = 'Schmug';
const OWNER_NAME = 'Schmug';
// Spotify mails the show-verification code here during submission and
// re-verifies ownership through it afterwards, so it must stay deliverable
// (cortech.online is on Cloudflare Email Routing).
const OWNER_EMAIL = 'clodcast@cortech.online';
const COPYRIGHT = '© 2026 Schmug';

// Exact Apple Podcasts strings only — invented categories are silently dropped.
// Technology takes no subcategory; News/Tech News is an exact parent/child pair.
const CATEGORIES: ReadonlyArray<{ text: string; sub?: string }> = [
  { text: 'Technology' },
  { text: 'News', sub: 'Tech News' },
];

// Apple Podcasts & Spotify require square art, 1400–3000px. This is the 1400px
// show cover cut for Frontier Commits; og-image.png is 1200×630 and would
// bounce on submission.
const COVER_URL = 'https://cortech.online/frontier-commits-cover.jpg';

// No <itunes:episode> here, deliberately. It is optional for an `episodic`
// show, and the daily feed's numbering bug (docs/podcast-metadata.md) came
// from deriving a number that has to be stable from something that isn't.
// A weekly date-derived number needs an epoch, and the first episode hasn't
// shipped, so there is no epoch to anchor to yet. Emitting nothing is correct
// and safe; add numbering once episode 1 has a publish date, never from
// position in the feed.

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(context: APIContext) {
  const episodes = await fetchFrontierEpisodes();
  const site = context.site!;
  const feedSelfUrl = new URL('/frontier-commits/rss.xml', site).toString();

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
      const itemExtras = [
        `<itunes:author>${escapeXml(AUTHOR)}</itunes:author>`,
        `<itunes:duration>${Math.round(ep.duration_s)}</itunes:duration>`,
        `<itunes:explicit>${ep.explicit ? 'true' : 'false'}</itunes:explicit>`,
        ep.cover_url ? `<itunes:image href="${escapeXml(ep.cover_url)}" />` : '',
      ]
        .filter(Boolean)
        .join('');

      return {
        title: ep.title,
        description: ep.description,
        link: new URL(`/frontier-commits/${ep.slug}/`, site).toString(),
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
