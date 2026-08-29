// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prettyBody, writePost, writePostAndSnapshot } from './write';
import type { Digest } from './types';
import type { Post } from './generate';

describe('mythos post writer', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mythos-write-'));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  const post: Post = {
    slug: '2026-05-24-wolfssl-cve-2026-0002',
    frontmatter: {
      title: 'wolfSSL CVE-2026-0002: use-after-free',
      description: 'desc',
      pubDate: '2026-05-24T19:00:00Z',
      triggers: ['revealed'],
      cve_ids: ['CVE-2026-0002'],
      projects: ['wolfSSL'],
      headline_snapshot: { disclosed: 1010, acknowledged: 910, fixed: 92, advisories: 82 },
    },
    body: 'CVE-2026-0002 is...',
  };

  const digest: Digest = {
    as_of: '2026-05-23T00:00:00Z',
    fetched_at: '2026-05-24T19:00:00Z',
    headline: {
      disclosed: 1010,
      acknowledged: 910,
      fixed: 92,
      advisories: 82,
      candidates: 0,
      reviewed: 0,
      verified: 0,
    },
    rates: { true_positive_pct: 95, median_days_to_ack: 7, median_days_to_patch: 21 },
    by_bug_class: {},
    by_ecosystem: {},
    project_names: ['wolfSSL', 'curl'],
    revealed_cve_ids: ['CVE-2026-0001', 'CVE-2026-0002'],
  };

  it('writes a valid frontmatter markdown post and the snapshot JSON', async () => {
    await writePostAndSnapshot({
      post,
      digest,
      postsDir: join(dir, 'src/content/mythos'),
      snapshotPath: join(dir, 'src/content/mythos/_data/snapshot.json'),
    });

    const md = readFileSync(
      join(dir, 'src/content/mythos/2026-05-24-wolfssl-cve-2026-0002.md'),
      'utf8',
    );
    expect(md).toMatch(/^---\n/);
    expect(md).toContain("title: 'wolfSSL CVE-2026-0002: use-after-free'");
    expect(md).toContain('CVE-2026-0002 is...');

    const snapPath = join(dir, 'src/content/mythos/_data/snapshot.json');
    expect(existsSync(snapPath)).toBe(true);
    const snap = JSON.parse(readFileSync(snapPath, 'utf8'));
    expect(snap.revealed_cve_ids).toEqual(['CVE-2026-0001', 'CVE-2026-0002']);
  });

  it('writePost() leaves the snapshot alone', async () => {
    // The backfill backdates ten posts against a snapshot that must stay put:
    // it is the forward-only live path's record of "latest state seen", and
    // moving it would make the next scheduled run regenerate or skip.
    await writePost({ post, postsDir: join(dir, 'src/content/mythos') });

    expect(existsSync(join(dir, 'src/content/mythos/2026-05-24-wolfssl-cve-2026-0002.md'))).toBe(
      true,
    );
    expect(existsSync(join(dir, 'src/content/mythos/_data/snapshot.json'))).toBe(false);
  });

  it('writePost() marks a backfilled post in its frontmatter', async () => {
    await writePost({
      post: { ...post, frontmatter: { ...post.frontmatter, backfilled: true } },
      postsDir: join(dir, 'src/content/mythos'),
    });
    const md = readFileSync(
      join(dir, 'src/content/mythos/2026-05-24-wolfssl-cve-2026-0002.md'),
      'utf8',
    );
    expect(md).toContain('backfilled: true');
  });

  it('omits the backfilled key on live posts', async () => {
    await writePost({ post, postsDir: join(dir, 'src/content/mythos') });
    const md = readFileSync(
      join(dir, 'src/content/mythos/2026-05-24-wolfssl-cve-2026-0002.md'),
      'utf8',
    );
    expect(md).not.toContain('backfilled');
  });

  it('emits markdown that is already prettier-clean, even with many ids', async () => {
    // A real catch-up post carries ~94 identifiers and ~112 projects. Inline
    // flow arrays blow past printWidth, so prettier rewrites the file and
    // format:check fails CI on every generated post.
    const many: Post = {
      ...post,
      frontmatter: {
        ...post.frontmatter,
        cve_ids: Array.from({ length: 94 }, (_, i) => `CVE-2026-${10000 + i}`),
        projects: Array.from({ length: 112 }, (_, i) => `org-${i}/project-${i}`),
      },
    };
    await writePostAndSnapshot({
      post: many,
      digest,
      postsDir: join(dir, 'src/content/mythos'),
      snapshotPath: join(dir, 'src/content/mythos/_data/snapshot.json'),
    });
    const written = readFileSync(join(dir, `src/content/mythos/${many.slug}.md`), 'utf8');

    const prettier = await import('prettier');
    const config = await prettier.resolveConfig('post.md');
    const formatted = await prettier.format(written, { ...config, parser: 'markdown' });
    expect(formatted).toBe(written);
  });

  it('normalizes emphasis the model varies on, so the live post survives format:check', async () => {
    // run.ts writes whatever the model returned. Some runs it closes on
    // `*Source: ...*`, which prettier rewrites to `_`, failing format:check and
    // blocking the tracker's own auto-merge PR for a reason unrelated to the
    // content. Normalize deterministically on the way to disk instead.
    await writePost({
      post: { ...post, body: 'Ten identifiers landed.\n\n*Source: Mythos CVD dashboard.*' },
      postsDir: join(dir, 'src/content/mythos'),
    });
    const md = readFileSync(join(dir, `src/content/mythos/${post.slug}.md`), 'utf8');
    expect(md).toContain('_Source: Mythos CVD dashboard._');
    expect(md).not.toContain('*Source:');

    const prettier = await import('prettier');
    const config = await prettier.resolveConfig('post.md');
    expect(await prettier.format(md, { ...config, parser: 'markdown' })).toBe(md);
  });

  it('writes an already-clean body byte-identical', async () => {
    const clean = 'Ten identifiers landed.\n\n_Source: Mythos CVD dashboard._';
    await writePost({ post: { ...post, body: clean }, postsDir: join(dir, 'src/content/mythos') });
    const md = readFileSync(join(dir, `src/content/mythos/${post.slug}.md`), 'utf8');
    const sep = '\n---\n\n';
    expect(md.slice(md.indexOf(sep) + sep.length)).toBe(`${clean}\n`);
  });

  describe('prettyBody()', () => {
    it('rewrites emphasis the model varies on', async () => {
      expect(await prettyBody('*Source: dashboard*')).toBe('_Source: dashboard_');
    });

    it('leaves an already-clean body alone', async () => {
      const clean = 'Ten identifiers landed.\n\n_Backfilled: reconstructed from the payload._';
      expect(await prettyBody(clean)).toBe(clean);
    });
  });
});
