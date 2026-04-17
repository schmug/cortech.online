import { describe, expect, it } from 'vitest';
import {
  appIdForFeaturedRepo,
  featuredRepos,
  repoNameFromFullName,
} from './featuredRepos';
import { apps } from './registry';

describe('featuredRepos config', () => {
  it('every entry has a valid owner/repo fullName', () => {
    for (const cfg of featuredRepos) {
      expect(cfg.fullName, `fullName`).toMatch(/^[\w.-]+\/[\w.-]+$/);
    }
  });

  it('fullNames are unique within the config', () => {
    const names = featuredRepos.map((r) => r.fullName.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('derived app ids do not collide with static registry ids', () => {
    const staticIds = new Set(apps.map((a) => a.id));
    for (const cfg of featuredRepos) {
      expect(staticIds.has(appIdForFeaturedRepo(cfg.fullName))).toBe(false);
    }
  });

  it('manual entries provide a description and htmlUrl', () => {
    for (const cfg of featuredRepos) {
      if (!cfg.manual) continue;
      expect(cfg.manual.description, `${cfg.fullName} description`).toBeTruthy();
      expect(cfg.manual.htmlUrl, `${cfg.fullName} htmlUrl`).toMatch(/^https:\/\//);
    }
  });
});

describe('repoNameFromFullName', () => {
  it('returns the segment after the last slash', () => {
    expect(repoNameFromFullName('schmug/scubascore')).toBe('scubascore');
  });

  it('returns the input unchanged when no slash is present', () => {
    expect(repoNameFromFullName('just-a-name')).toBe('just-a-name');
  });
});

describe('appIdForFeaturedRepo', () => {
  it('prefixes with gh: so it cannot collide with plain registry ids', () => {
    expect(appIdForFeaturedRepo('schmug/scubascore')).toBe('gh:schmug/scubascore');
  });
});
