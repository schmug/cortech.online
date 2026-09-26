import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { fetchShowYourWorkEpisodes } from '../../lib/showYourWorkEpisodes';

// The Show Your Work feed. Like Frontier Commits, this show is RSS-first:
// nothing publishes it to a directory, so this file IS the show — the feed a
// listener subscribes to. Every constant below is therefore public product
// surface, not page metadata, and <title> is a one-way door once a directory
// or player has polled it.
// Decisions and rationale: docs/podcast-metadata.md.

const PODCAST_TITLE = 'Show Your Work';
// The disclosure sentence is a locked editorial decision (clodcast's
// show-your-work design spec, §1 and §6): the show covers the lab whose model
// writes and voices it, and has to say so wherever a stranger first meets it.
// Do not swap in Frontier Commits' "written and produced by Schmug, narrated by
// AI" credit — neither half of it is true of this show.
const PODCAST_DESCRIPTION =
  "The frontier AI labs publish a steady stream of alignment and safety research, and almost none of it is written for people who don't read papers. Every week, Show Your Work takes one post from Anthropic, OpenAI, or Google DeepMind and explains it as a conversation: an Explainer states the claim the way the lab states it, and a Skeptic asks what a newcomer would ask, then pushes back — and every pushback traces to the post's own stated limitations or to independent researchers. Short briefs cover the rest of the week, each linked to its source. The show is written and voiced by Claude, an Anthropic model, and Anthropic is one of the labs it covers. Produced by Schmug at cortech.online.";
const AUTHOR = 'Schmug';
const OWNER_NAME = 'Schmug';
// Shared with the other two shows. A directory verifies ownership through it,
// so it must stay deliverable (cortech.online is on Cloudflare Email Routing).
const OWNER_EMAIL = 'clodcast@cortech.online';
const COPYRIGHT = '© 2026 Schmug';

// Exact Apple Podcasts strings only — invented categories are silently dropped.
// All three are bare parents: Apple has no subcategory for machine-learning
// research, and Education > How To does not describe an explainer.
const CATEGORIES: ReadonlyArray<{ text: string; sub?: string }> = [
  { text: 'Technology' },
  { text: 'Science' },
  { text: 'Education' },
];

// Apple Podcasts & Spotify require square art, 1400–3000px. Cut at 3000px by
// scripts/generate-show-your-work-cover.mjs — a placeholder until clodcast's
// show art lands (docs/podcast-metadata.md).
const COVER_URL = 'https://cortech.online/show-your-work-cover.jpg';

// No <itunes:episode> here, deliberately — the same reasoning as Frontier
// Commits. It is optional for an `episodic` show, the daily feed's numbering bug
// came from deriving a number that has to be stable from something that isn't,
// and a weekly date-derived number needs an epoch that episode one hasn't
// supplied yet. Add numbering once it has a publish date, never from position
// in the feed.

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(context: APIContext) {
  const episodes = await fetchShowYourWorkEpisodes();
  const site = context.site!;
  const feedSelfUrl = new URL('/show-your-work/rss.xml', site).toString();

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
        // @astrojs/rss emits this link as the isPermaLink guid. It comes from
        // the slug (syw-week-of-<month>-<d>-<yyyy>), never the title, so a
        // retitle cannot duplicate a published episode in a player.
        link: new URL(`/show-your-work/${ep.slug}/`, site).toString(),
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
