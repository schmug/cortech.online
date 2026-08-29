import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Digest } from './types';
import type { Post } from './generate';

export type WriteOpts = {
  post: Post;
  digest: Digest;
  postsDir: string;
  snapshotPath: string;
};

export type WritePostOpts = {
  post: Post;
  postsDir: string;
};

/**
 * Post only, deliberately no snapshot. snapshot.json is the forward-only live
 * path's record of "latest state seen"; the backfill writes ten backdated
 * posts, and advancing (or rewinding) the snapshot for any of them would make
 * the next scheduled run regenerate or skip — a break that would not surface
 * until the next real trigger day.
 */
export function writePost({ post, postsDir }: WritePostOpts): void {
  mkdirSync(postsDir, { recursive: true });
  writeFileSync(join(postsDir, `${post.slug}.md`), renderMarkdown(post), 'utf8');
}

export function writePostAndSnapshot({ post, digest, postsDir, snapshotPath }: WriteOpts): void {
  writePost({ post, postsDir });
  mkdirSync(dirname(snapshotPath), { recursive: true });
  writeFileSync(snapshotPath, JSON.stringify(digest, null, 2) + '\n', 'utf8');
}

function renderMarkdown(post: Post): string {
  const fm = post.frontmatter;
  const yaml = [
    `title: ${yamlString(fm.title)}`,
    `description: ${yamlString(fm.description)}`,
    `pubDate: ${fm.pubDate}`,
    ...(fm.backfilled ? ['backfilled: true'] : []),
    yamlList('triggers', fm.triggers),
    yamlList('cve_ids', fm.cve_ids),
    yamlList('projects', fm.projects),
    `headline_snapshot:`,
    `  disclosed: ${fm.headline_snapshot.disclosed}`,
    `  acknowledged: ${fm.headline_snapshot.acknowledged}`,
    `  fixed: ${fm.headline_snapshot.fixed}`,
    `  advisories: ${fm.headline_snapshot.advisories}`,
  ].join('\n');
  return `---\n${yaml}\n---\n\n${post.body}\n`;
}

/**
 * Block-style sequence, one item per line. A catch-up post carries ~94
 * identifiers and ~112 projects; as an inline flow array that overruns
 * prettier's printWidth, so prettier rewrites the file and every generated
 * post fails format:check in CI. Block style is stable at any length.
 */
function yamlList(key: string, items: string[]): string {
  if (items.length === 0) return `${key}: []`;
  return [`${key}:`, ...items.map((i) => `  - ${yamlString(i)}`)].join('\n');
}

function yamlString(s: string): string {
  // Single-quoted YAML string; escape internal single quotes per YAML spec.
  return `'${s.replace(/'/g, "''")}'`;
}
