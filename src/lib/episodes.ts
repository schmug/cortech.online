import { z } from 'zod';

// The R2 manifest is the contract between clodcast (producer) and
// cortech.online (consumer). Clodcast writes one JSON file per episode
// under <bucket>/manifest.json and one mp3 under <bucket>/<slug>.mp3.
// The manifest is a flat array of EpisodeEntry — the newest episodes
// first, but the consumer sorts defensively anyway.

const chapterSchema = z.object({
  title: z.string(),
  start_ms: z.number().int().nonnegative(),
  source_url: z.url().nullable().optional(),
});

const episodeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug must be lowercase kebab-case'),
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  mp3_url: z.url(),
  mp3_bytes: z.number().int().positive(),
  duration_s: z.number().positive(),
  chapters: z.array(chapterSchema).default([]),
  spotify_uri: z.string().nullable().optional(),
  cover_url: z.url().nullable().optional(),
  explicit: z.boolean().default(false),
});

const manifestSchema = z.array(episodeSchema);

export type Chapter = z.infer<typeof chapterSchema>;
export type Episode = z.infer<typeof episodeSchema>;

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Resolve the manifest URL from env. Unset → graceful empty list, so this PR
 * can ship before clodcast publishes anything. We treat unset / 404 / parse
 * failure as "no episodes yet" rather than failing the build.
 */
function manifestUrl(): string | null {
  const url = process.env.EPISODES_MANIFEST_URL;
  return url && url.trim() ? url.trim() : null;
}

export async function fetchEpisodes(): Promise<Episode[]> {
  const url = manifestUrl();
  if (!url) return [];

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'cortech.online-portfolio', Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    console.warn(`[episodes] manifest fetch failed: ${(err as Error).message}`);
    return [];
  }

  if (res.status === 404) return [];
  if (!res.ok) {
    console.warn(`[episodes] manifest ${url} returned ${res.status} ${res.statusText}`);
    return [];
  }

  let raw: unknown;
  try {
    raw = await res.json();
  } catch (err) {
    console.warn(`[episodes] manifest parse failed: ${(err as Error).message}`);
    return [];
  }

  const parsed = manifestSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[episodes] manifest validation failed: ${parsed.error.message}`);
    return [];
  }

  return parsed.data.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Decode the HTML entities clodcast emits (named + numeric) in one pass, so
 * left-to-right replacement gets the `&amp;lt;` ordering right. Unknown
 * entities are left intact. */
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body) => {
    if (body[0] === '#') {
      const codePoint =
        body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (codePoint < 0 || codePoint > 0x10ffff) return match;
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

const CHAPTER_LINE = /^\(\d{1,2}:\d{2}(?::\d{2})?\)/;

/**
 * Reduce the manifest `description` to a plain-text lead summary.
 *
 * Clodcast emits Spotify-flavored HTML — a lead `<p>summary</p>` followed by one
 * `<p>(mm:ss) - Title - <a>source</a></p>` per chapter — because Spotify renders
 * HTML with clickable timestamps in that field. On the web the chapters are
 * rendered natively from `chapters[]`, and an escaped `{}` expression would show
 * the tags literally, so we keep only the lead prose (paragraphs before the
 * first timestamped chapter line), strip tags, and decode entities. The result
 * is always plain text — callers render it through Astro's escaping, never
 * `set:html`, so feed-derived content can't reach the DOM unescaped.
 */
export function summaryText(description: string): string {
  const toText = (s: string) =>
    decodeEntities(s.replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim();

  const paragraphs = [...description.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) =>
    toText(m[1]),
  );
  if (paragraphs.length === 0) return toText(description);

  const lead: string[] = [];
  for (const paragraph of paragraphs) {
    if (CHAPTER_LINE.test(paragraph)) break;
    if (paragraph) lead.push(paragraph);
  }
  return lead.join(' ');
}

/**
 * Format milliseconds as `H:MM:SS` (or `M:SS` under one hour) for chapter timestamps.
 */
export function formatChapterTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    const mm = String(minutes).padStart(2, '0');
    return `${hours}:${mm}:${ss}`;
  }
  return `${minutes}:${ss}`;
}
