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

export function writePostAndSnapshot({ post, digest, postsDir, snapshotPath }: WriteOpts): void {
  mkdirSync(postsDir, { recursive: true });
  mkdirSync(dirname(snapshotPath), { recursive: true });

  const md = renderMarkdown(post);
  writeFileSync(join(postsDir, `${post.slug}.md`), md, 'utf8');
  writeFileSync(snapshotPath, JSON.stringify(digest, null, 2) + '\n', 'utf8');
}

function renderMarkdown(post: Post): string {
  const fm = post.frontmatter;
  const yaml = [
    `title: ${yamlString(fm.title)}`,
    `description: ${yamlString(fm.description)}`,
    `pubDate: ${fm.pubDate}`,
    `triggers: [${fm.triggers.map(yamlString).join(', ')}]`,
    `cve_ids: [${fm.cve_ids.map(yamlString).join(', ')}]`,
    `projects: [${fm.projects.map(yamlString).join(', ')}]`,
    `headline_snapshot:`,
    `  disclosed: ${fm.headline_snapshot.disclosed}`,
    `  acknowledged: ${fm.headline_snapshot.acknowledged}`,
    `  fixed: ${fm.headline_snapshot.fixed}`,
    `  advisories: ${fm.headline_snapshot.advisories}`,
  ].join('\n');
  return `---\n${yaml}\n---\n\n${post.body}\n`;
}

function yamlString(s: string): string {
  // Single-quoted YAML string; escape internal single quotes per YAML spec.
  return `'${s.replace(/'/g, "''")}'`;
}
