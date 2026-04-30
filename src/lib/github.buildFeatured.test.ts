import { describe, expect, it } from 'vitest';
import { featuredRepos, type FeaturedRepoConfig } from '../apps/featuredRepos';
import { buildFeaturedRepos, type Repo } from './github';

const repo = (overrides: Partial<Repo> = {}): Repo => ({
  name: 'scubascore',
  description: 'Dive log scoring',
  html_url: 'https://github.com/schmug/scubascore',
  homepage: null,
  language: 'Python',
  stargazers_count: 1,
  updated_at: '2026-04-01T00:00:00Z',
  fork: false,
  archived: false,
  topics: [],
  ...overrides,
});

describe('buildFeaturedRepos', () => {
  it('enriches a public, non-fork repo from the API response', () => {
    const configs: FeaturedRepoConfig[] = [{ fullName: 'schmug/scubascore', icon: '🤿' }];
    const out = buildFeaturedRepos([repo()], configs);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      fullName: 'schmug/scubascore',
      name: 'scubascore',
      icon: '🤿',
      language: 'Python',
      private: false,
      fork: false,
    });
  });

  it('includes forks when they are named in the config', () => {
    const configs: FeaturedRepoConfig[] = [{ fullName: 'schmug/cupid' }];
    const out = buildFeaturedRepos(
      [repo({ name: 'cupid', fork: true, language: 'Pascal' })],
      configs,
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ fullName: 'schmug/cupid', fork: true, language: 'Pascal' });
  });

  it('matches config fullName against repo.name case-insensitively', () => {
    const configs: FeaturedRepoConfig[] = [{ fullName: 'schmug/FeedBat' }];
    const out = buildFeaturedRepos([repo({ name: 'FeedBat', language: 'JavaScript' })], configs);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('FeedBat');
  });

  it('falls back to manual metadata for repos missing from the API (private)', () => {
    const configs: FeaturedRepoConfig[] = [
      {
        fullName: 'schmug/school-calendar',
        icon: '📅',
        manual: {
          description: 'Private tool',
          language: 'TypeScript',
          htmlUrl: 'https://github.com/schmug/school-calendar',
        },
      },
    ];
    const out = buildFeaturedRepos([], configs);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      fullName: 'schmug/school-calendar',
      private: true,
      language: 'TypeScript',
      description: 'Private tool',
    });
    expect(out[0].updatedAt).toBeNull();
  });

  it('drops entries that are neither in the API response nor have a manual override', () => {
    const configs: FeaturedRepoConfig[] = [{ fullName: 'schmug/ghost' }];
    expect(buildFeaturedRepos([], configs)).toEqual([]);
  });

  it('normalises an empty-string homepage to null', () => {
    const configs: FeaturedRepoConfig[] = [{ fullName: 'schmug/qr-me' }];
    const out = buildFeaturedRepos([repo({ name: 'qr-me', homepage: '' })], configs);
    expect(out[0].homepage).toBeNull();
  });

  it('preserves order from the config, not the API response', () => {
    const configs: FeaturedRepoConfig[] = [{ fullName: 'schmug/b' }, { fullName: 'schmug/a' }];
    const out = buildFeaturedRepos([repo({ name: 'a' }), repo({ name: 'b' })], configs);
    expect(out.map((r) => r.name)).toEqual(['b', 'a']);
  });

  // Regression for issue #27: with the production featuredRepos config, an
  // empty API response silently degrades to only the manual-fallback entries.
  // Locks in the silent-drop behaviour so any future config change that adds
  // more manual fallbacks will need to update this assertion deliberately.
  it('keeps only manual-fallback entries when given an empty repo list', () => {
    const out = buildFeaturedRepos([], featuredRepos);
    const survivors = out.map((r) => r.fullName);
    const expected = featuredRepos.filter((c) => c.manual).map((c) => c.fullName);
    expect(survivors).toEqual(expected);
    expect(out.every((r) => r.private === true)).toBe(true);
  });
});
