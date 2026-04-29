import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchAllRepos, fetchOriginalRepos } from './github';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete process.env.GITHUB_TOKEN;
});

describe('fetchAllRepos failure contract', () => {
  it('throws when the API responds non-OK so the build fails loudly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'rate limited',
        json: async () => ({}),
      }),
    );
    await expect(fetchOriginalRepos('schmug')).rejects.toThrow(/403/);
  });

  it('throws when fetch rejects (network error) instead of swallowing it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(fetchOriginalRepos('schmug')).rejects.toThrow('network down');
  });
});

describe('fetchAllRepos auth header', () => {
  it('omits Authorization when GITHUB_TOKEN is unset', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    await fetchAllRepos('schmug');
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('sends Authorization: Bearer when GITHUB_TOKEN is set', async () => {
    process.env.GITHUB_TOKEN = 'ghp_test123';
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    await fetchAllRepos('schmug');
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer ghp_test123');
  });

  it('omits the GITHUB_TOKEN hint from error message when authenticated', async () => {
    process.env.GITHUB_TOKEN = 'ghp_test123';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'forbidden',
        json: async () => ({}),
      }),
    );
    await expect(fetchAllRepos('schmug')).rejects.toThrow(
      expect.objectContaining({ message: expect.not.stringContaining('GITHUB_TOKEN') }),
    );
  });
});

describe('fetchAllRepos private-repo defense in depth', () => {
  it('filters out repos with private: true even though the endpoint should never return them', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { name: 'public-thing', fork: false, archived: false, private: false },
          { name: 'leaked-private', fork: false, archived: false, private: true },
          { name: 'no-private-field', fork: false, archived: false },
        ],
      }),
    );
    const repos = await fetchAllRepos('schmug');
    const names = repos.map((r) => r.name);
    expect(names).toContain('public-thing');
    expect(names).toContain('no-private-field');
    expect(names).not.toContain('leaked-private');
  });
});
