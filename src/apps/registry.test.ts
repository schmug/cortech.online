import { describe, it, expect } from 'vitest';
import { apps } from './registry';

describe('app registry invariants', () => {
  it('ids are unique', () => {
    const ids = apps.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every app has the required core fields', () => {
    for (const a of apps) {
      expect(a.id, 'id').toBeTruthy();
      expect(a.name, `${a.id} name`).toBeTruthy();
      expect(a.description, `${a.id} description`).toBeTruthy();
      expect(a.icon, `${a.id} icon`).toBeDefined();
      expect(['iframe', 'native'], `${a.id} type`).toContain(a.type);
      expect(a.defaultSize.w, `${a.id} defaultSize.w`).toBeGreaterThan(0);
      expect(a.defaultSize.h, `${a.id} defaultSize.h`).toBeGreaterThan(0);
    }
  });

  it('iframe apps have a https:// url and no component loader', () => {
    for (const a of apps.filter((a) => a.type === 'iframe')) {
      expect(a.url, `${a.id} url`).toBeTruthy();
      expect(a.url, `${a.id} url`).toMatch(/^https:\/\//);
      expect(a.component, `${a.id} should not have a component`).toBeUndefined();
    }
  });

  it('native apps have a component loader and no url', () => {
    for (const a of apps.filter((a) => a.type === 'native')) {
      expect(typeof a.component, `${a.id} component`).toBe('function');
      expect(a.url, `${a.id} should not have a url`).toBeUndefined();
    }
  });

  it('defaultSize dominates minSize when both present', () => {
    for (const a of apps) {
      if (!a.minSize) continue;
      expect(a.defaultSize.w, `${a.id} width`).toBeGreaterThanOrEqual(a.minSize.w);
      expect(a.defaultSize.h, `${a.id} height`).toBeGreaterThanOrEqual(a.minSize.h);
    }
  });

  it('githubRepo (when present) matches owner/repo format', () => {
    for (const a of apps) {
      if (a.githubRepo === undefined) continue;
      expect(a.githubRepo, `${a.id}`).toMatch(/^[\w.-]+\/[\w.-]+$/);
    }
  });

  it('allowMultiple native apps use app.id as their window id (singleton contract)', () => {
    // The store assigns instanceId = app.id when allowMultiple === false.
    // Having duplicate singleton ids across the registry would collide; verify.
    const singletonIds = apps
      .filter((a) => a.allowMultiple === false)
      .map((a) => a.id);
    expect(new Set(singletonIds).size).toBe(singletonIds.length);
  });
});
