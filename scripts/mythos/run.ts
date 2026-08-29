#!/usr/bin/env node
import { existsSync, readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchPayload } from './fetch';
import { digest } from './digest';
import { triggersFor } from './triggers';
import { renderPost } from './generate';
import { claudeCliCallLlm } from './llm';
import type { Post } from './generate';
import { writePostAndSnapshot } from './write';
import { appendHistory, historyRowForRun } from './history';
import type { Digest } from './types';

const PAYLOAD_URL = 'https://red.anthropic.com/2026/cvd/data/payload.json';
const MODEL = 'claude-sonnet-4-6';
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const POSTS_DIR = join(REPO_ROOT, 'src/content/mythos');
const SNAPSHOT_PATH = join(POSTS_DIR, '_data/snapshot.json');
const HISTORY_PATH = join(POSTS_DIR, '_data/history.jsonl');
const DRY_RUN = process.argv.includes('--dry-run');

async function main(): Promise<void> {
  console.log(`[mythos] fetching ${PAYLOAD_URL}`);
  const raw = (await fetchPayload(PAYLOAD_URL)) as Parameters<typeof digest>[0];
  const fetchedAt = new Date().toISOString();
  const newDigest = digest(raw, fetchedAt);

  // Ahead of every gate below: the timeline records dashboard state, not post
  // activity, so a day that fires no trigger is still a real day worth charting.
  // The row is keyed on the payload's as_of, so a second run for an unchanged
  // as_of rewrites the same row byte for byte and leaves the file untouched.
  recordHistory(newDigest, raw);

  if (!existsSync(SNAPSHOT_PATH)) {
    bail('snapshot missing — please re-create from Task 2 bootstrap', 1);
  }
  const oldDigest = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as Digest;

  if (oldDigest.as_of === newDigest.as_of) {
    console.log(`[mythos] payload as_of=${newDigest.as_of} unchanged; exiting cleanly`);
    return;
  }

  // Bootstrap detection: very first real run has the epoch placeholder.
  const isBootstrap = oldDigest.as_of === '1970-01-01T00:00:00Z';
  if (isBootstrap) {
    console.log(`[mythos] bootstrap: writing placeholder post + snapshot`);
    if (!DRY_RUN) {
      await writePostAndSnapshot({
        post: bootstrapPost(),
        digest: newDigest,
        postsDir: POSTS_DIR,
        snapshotPath: SNAPSHOT_PATH,
      });
      setGitHubOutput('branch', `mythos/bootstrap-${fetchedAt.slice(0, 10)}`);
    }
    return;
  }

  const triggers = triggersFor(oldDigest, newDigest, raw);
  if (triggers.length === 0) {
    console.log(`[mythos] no triggers fired; exiting cleanly`);
    return;
  }
  console.log(
    `[mythos] ${triggers.length} triggers fired:`,
    triggers.map((t) => t.kind),
  );

  const callLlm = claudeCliCallLlm({ model: MODEL });

  const allKnownCves = newDigest.revealed_cve_ids;
  const post = await renderPost({
    oldDigest,
    newDigest,
    triggers,
    allKnownCves,
    callLlm,
  });

  if (DRY_RUN) {
    console.log('--- post ---');
    console.log(JSON.stringify(post.frontmatter, null, 2));
    console.log(post.body);
    return;
  }

  await writePostAndSnapshot({
    post,
    digest: newDigest,
    postsDir: POSTS_DIR,
    snapshotPath: SNAPSHOT_PATH,
  });
  const branch = `mythos/${post.slug}`;
  setGitHubOutput('branch', branch);
  setGitHubOutput('title', post.frontmatter.title);
  console.log(`[mythos] wrote post + snapshot; branch=${branch}`);
}

/**
 * Upsert one timeline row for this run's as_of date.
 *
 * Headline counts come from the digest so the chart's right edge always agrees
 * with the stat cards rendered from the same snapshot; the severity split has no
 * scalar equivalent in the payload and comes from the cube, whose series sum to
 * those same totals. A payload without a cube is skipped rather than banded from
 * something else — an absent row is correct where the data is not there.
 */
function recordHistory(newDigest: Digest, raw: Parameters<typeof digest>[0]): void {
  const cube = raw.headline.severity_cube;
  if (!cube) {
    console.log('[mythos] payload carries no severity_cube; skipping history row');
    return;
  }
  const row = historyRowForRun(newDigest, cube);
  const bandSum = Object.values(row.severity).reduce((a, b) => a + b, 0);
  if (bandSum !== row.disclosed) {
    console.warn(
      `[mythos] severity bands (${bandSum}) disagree with headline disclosed (${row.disclosed}) ` +
        `on ${row.date}; recording both as the payload reports them`,
    );
  }
  if (DRY_RUN) {
    console.log('[mythos] dry run; history row not written:', JSON.stringify(row));
    return;
  }
  appendHistory({ historyPath: HISTORY_PATH, row });
  console.log(`[mythos] history row upserted for ${row.date}`);
}

function bootstrapPost(): Post {
  return {
    slug: `bootstrap-${new Date().toISOString().slice(0, 10)}`,
    frontmatter: {
      title: 'Mythos tracker — bootstrap',
      description: 'First snapshot captured; future runs will be delta-driven.',
      pubDate: new Date().toISOString(),
      triggers: [],
      cve_ids: [],
      projects: [],
      headline_snapshot: { disclosed: 0, acknowledged: 0, fixed: 0, advisories: 0 },
    },
    body: 'Bootstrap snapshot only. Real posts begin with the next delta.',
  };
}

function setGitHubOutput(key: string, value: string): void {
  const out = process.env.GITHUB_OUTPUT;
  if (!out) return;
  appendFileSync(out, `${key}=${value}\n`);
}

function bail(msg: string, code: number): never {
  console.error(`[mythos] FATAL: ${msg}`);
  process.exit(code);
}

main().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error(`[mythos] FATAL: ${err.message}`);
    if ('cause' in err && err.cause) console.error('  cause:', err.cause);
    if ('draft' in err && err.draft) console.error('  draft:', err.draft);
    if (err.stack) console.error(err.stack);
  } else {
    console.error('[mythos] FATAL (non-Error):', err);
  }
  process.exit(1);
});
