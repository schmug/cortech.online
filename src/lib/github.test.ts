import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchOriginalRepos } from './github';

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('fetchOriginalRepos silent-failure contract', () => {
  it('returns [] when the API responds non-OK', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );
    const repos = await fetchOriginalRepos('schmug');
    expect(repos).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('returns [] when fetch rejects (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const repos = await fetchOriginalRepos('schmug');
    expect(repos).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });
});
