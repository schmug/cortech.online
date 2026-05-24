import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPayload, FetchError } from './fetch';

describe('fetchPayload()', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON on 200', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ as_of: '2026-05-24T00:00:00Z' }), { status: 200 }),
    );
    const result = await fetchPayload('https://example/payload.json');
    expect((result as { as_of: string }).as_of).toBe('2026-05-24T00:00:00Z');
  });

  it('throws FetchError on non-200', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response('nope', { status: 503 }),
    );
    await expect(fetchPayload('https://example/payload.json')).rejects.toThrow(FetchError);
  });

  it('throws FetchError on malformed JSON', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response('not json', { status: 200 }),
    );
    await expect(fetchPayload('https://example/payload.json')).rejects.toThrow(FetchError);
  });
});
