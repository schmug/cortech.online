import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHOW_YOUR_WORK_MANIFEST_URL, fetchShowYourWorkEpisodes } from './showYourWorkEpisodes';
import fixture from './__fixtures__/show-your-work-episodes.json' with { type: 'json' };

// The manifest 404s until the show's first episode ships, so "degrades to an
// empty list" is the production path on the day this merges, not an edge case.

const ORIGINAL_ENV = process.env.SHOW_YOUR_WORK_MANIFEST_URL;

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { status: 200, ...init });
}

/** Stub fetch with one fixed outcome; returns the URLs it gets asked for. */
function mockFetch(outcome: Response | Error): string[] {
  const requested: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      requested.push(String(input));
      if (outcome instanceof Error) throw outcome;
      return outcome;
    }),
  );
  return requested;
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (ORIGINAL_ENV === undefined) delete process.env.SHOW_YOUR_WORK_MANIFEST_URL;
  else process.env.SHOW_YOUR_WORK_MANIFEST_URL = ORIGINAL_ENV;
});

describe('fetchShowYourWorkEpisodes manifest URL', () => {
  it('defaults to the show manifest on R2 so production needs no env var', async () => {
    delete process.env.SHOW_YOUR_WORK_MANIFEST_URL;
    const requested = mockFetch(jsonResponse([]));

    await fetchShowYourWorkEpisodes();

    expect(requested).toEqual([SHOW_YOUR_WORK_MANIFEST_URL]);
    expect(SHOW_YOUR_WORK_MANIFEST_URL).toBe(
      'https://clodcast.cortech.online/manifest-show-your-work.json',
    );
  });

  it('uses SHOW_YOUR_WORK_MANIFEST_URL when set, so e2e can serve a fixture', async () => {
    process.env.SHOW_YOUR_WORK_MANIFEST_URL = 'https://example.test/fixture.json';
    const requested = mockFetch(jsonResponse([]));

    await fetchShowYourWorkEpisodes();

    expect(requested).toEqual(['https://example.test/fixture.json']);
  });

  it('skips the fetch entirely when the override is empty', async () => {
    process.env.SHOW_YOUR_WORK_MANIFEST_URL = '  ';
    const requested = mockFetch(jsonResponse([]));

    await expect(fetchShowYourWorkEpisodes()).resolves.toEqual([]);
    expect(requested).toEqual([]);
  });
});

describe('fetchShowYourWorkEpisodes schema validation', () => {
  beforeEach(() => {
    process.env.SHOW_YOUR_WORK_MANIFEST_URL = 'https://example.test/fixture.json';
  });

  it('accepts the fixture manifest and coerces pubDate to a Date', async () => {
    mockFetch(jsonResponse(fixture));

    const episodes = await fetchShowYourWorkEpisodes();

    expect(episodes).toHaveLength(2);
    expect(episodes[0].slug).toBe('syw-week-of-october-5-2026');
    expect(episodes[0].pubDate).toBeInstanceOf(Date);
    expect(episodes[0].pubDate.toISOString()).toBe('2026-10-05T13:00:00.000Z');
    expect(episodes[0].mp3_bytes).toBe(13631488);
    expect(episodes[0].chapters).toHaveLength(3);
  });

  it('sorts newest first regardless of manifest order', async () => {
    mockFetch(jsonResponse([...fixture].reverse()));

    const episodes = await fetchShowYourWorkEpisodes();

    expect(episodes.map((ep) => ep.slug)).toEqual([
      'syw-week-of-october-5-2026',
      'syw-week-of-september-28-2026',
    ]);
  });

  it.each([
    ['a non-kebab-case slug', { slug: 'Not Kebab Case' }],
    ['a non-URL mp3_url', { mp3_url: 'not-a-url' }],
    ['a zero mp3_bytes, which would break the enclosure', { mp3_bytes: 0 }],
    ['a negative duration', { duration_s: -1 }],
    ['a missing title', { title: undefined }],
  ])('rejects the whole manifest on %s', async (_label, override) => {
    mockFetch(jsonResponse([{ ...fixture[0], ...override }]));

    await expect(fetchShowYourWorkEpisodes()).resolves.toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[show-your-work] manifest validation failed'),
    );
  });

  it('rejects a manifest that is not an array', async () => {
    mockFetch(jsonResponse({ episodes: fixture }));
    await expect(fetchShowYourWorkEpisodes()).resolves.toEqual([]);
  });
});

describe('fetchShowYourWorkEpisodes failure modes', () => {
  beforeEach(() => {
    process.env.SHOW_YOUR_WORK_MANIFEST_URL = 'https://example.test/fixture.json';
  });

  // The show has no episodes until clodcast publishes the first one; a 404 is
  // the expected steady state until then, so it must not warn.
  it('returns an empty list quietly on 404', async () => {
    mockFetch(new Response('not found', { status: 404 }));

    await expect(fetchShowYourWorkEpisodes()).resolves.toEqual([]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('warns and returns empty on a non-404 error status', async () => {
    mockFetch(new Response('boom', { status: 500, statusText: 'Internal Server Error' }));

    await expect(fetchShowYourWorkEpisodes()).resolves.toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[show-your-work] manifest'));
  });

  it('warns and returns empty when the fetch throws (offline, timeout)', async () => {
    mockFetch(new Error('The operation was aborted due to timeout'));

    await expect(fetchShowYourWorkEpisodes()).resolves.toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[show-your-work] manifest fetch failed'),
    );
  });

  it('warns and returns empty on malformed JSON', async () => {
    mockFetch(new Response('{not json', { status: 200 }));

    await expect(fetchShowYourWorkEpisodes()).resolves.toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[show-your-work] manifest parse failed'),
    );
  });
});
