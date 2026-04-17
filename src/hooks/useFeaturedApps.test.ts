import { describe, expect, it } from 'vitest';
import type { FeaturedRepo } from '../apps/featuredRepos';
import { featuredRepoToApp } from './useFeaturedApps';

const base: FeaturedRepo = {
  fullName: 'schmug/scubascore',
  name: 'scubascore',
  icon: '🤿',
  description: 'Dive log scoring',
  htmlUrl: 'https://github.com/schmug/scubascore',
  homepage: null,
  language: 'Python',
  stargazersCount: 1,
  updatedAt: '2026-04-01T00:00:00Z',
  fork: false,
  archived: false,
  private: false,
};

describe('featuredRepoToApp', () => {
  it('maps a repo without homepage to a native RepoInfoApp', () => {
    const app = featuredRepoToApp(base);
    expect(app.type).toBe('native');
    expect(app.url).toBeUndefined();
    expect(typeof app.component).toBe('function');
    expect(app.componentProps).toEqual({ repo: base });
  });

  it('maps a repo with a homepage to an iframe app pointing at that homepage', () => {
    const app = featuredRepoToApp({ ...base, homepage: 'https://feedsearch.dev' });
    expect(app.type).toBe('iframe');
    expect(app.url).toBe('https://feedsearch.dev');
    expect(app.component).toBeUndefined();
  });

  it('uses the repo short name as the app name', () => {
    const app = featuredRepoToApp({ ...base, name: 'FeedBat' });
    expect(app.name).toBe('FeedBat');
  });

  it('derives a stable, gh-prefixed id from the fullName', () => {
    expect(featuredRepoToApp(base).id).toBe('gh:schmug/scubascore');
  });

  it('defaults the icon to a package emoji when the config omits one', () => {
    const { icon, ...rest } = base;
    void icon;
    const app = featuredRepoToApp(rest as FeaturedRepo);
    expect(app.icon).toBe('📦');
  });

  it('tags every featured app as a singleton (allowMultiple: false)', () => {
    expect(featuredRepoToApp(base).allowMultiple).toBe(false);
  });

  it('carries through the githubRepo field so context menus can link to GitHub', () => {
    expect(featuredRepoToApp(base).githubRepo).toBe('schmug/scubascore');
  });
});
