#!/usr/bin/env node
/**
 * One-off backfill: rebuild the /mythos timeline from `headline.severity_cube`.
 *
 * The file this writes was, until now, 90 days of seeded `mulberry32` noise
 * produced by seed-history.ts for a visual mockup and never replaced (#223).
 * The cube makes the real series recoverable: it enumerates every disclosed,
 * acknowledged, fixed and advisory item by the day it landed, and each series'
 * days sum to the headline totals — so a running total is the exact historical
 * value on that date, not an interpolation between endpoints.
 *
 * The rows it writes carry no medians. `median_days_to_ack` /
 * `median_days_to_patch` exist in the payload only as current scalars with no
 * per-day history, so they are left absent; the Timeline hides the lag readout
 * for a row that has none rather than showing a substituted value.
 *
 * Rerunnable: output is a pure function of the payload, keyed by date, so a
 * re-run over the same payload produces a byte-identical file. Live rows added
 * by run.ts since the last rebuild are preserved — their dates postdate the
 * cube's last day, and only a date the cube itself carries is overwritten.
 *
 * Usage:
 *   npm run mythos:history -- --dry-run          # print checkpoints, write nothing
 *   npm run mythos:history -- --payload=<path>   # local payload, no refetch
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { fetchPayload } from './fetch';
import { historyFromCube, mergeRebuild, parseHistory, serializeHistory } from './history';
import type { HistoryRow } from './history';
import type { SeverityCube } from './types';

const PAYLOAD_URL = 'https://red.anthropic.com/2026/cvd/data/payload.json';
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const HISTORY_PATH = join(REPO_ROOT, 'src/content/mythos/_data/history.jsonl');

type CubePayload = { headline: { severity_cube: SeverityCube } };

function flag(args: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  return args.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

/** Reject a row set that cannot be true, rather than publishing it. */
function assertConsistent(rows: HistoryRow[]): void {
  if (rows.length === 0) bail('cube produced no rows', 1);
  let previous: HistoryRow | undefined;
  for (const row of rows) {
    const bands = Object.values(row.severity).reduce((a, b) => a + b, 0);
    if (bands !== row.disclosed) {
      bail(`${row.date}: severity bands sum to ${bands}, disclosed is ${row.disclosed}`, 1);
    }
    if (previous) {
      for (const key of ['disclosed', 'acknowledged', 'fixed', 'advisories'] as const) {
        if (row[key] < previous[key]) {
          bail(`${row.date}: ${key} fell from ${previous[key]} to ${row[key]}`, 1);
        }
      }
    }
    previous = row;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const payloadPath = flag(args, 'payload');

  const raw = (
    payloadPath
      ? (JSON.parse(readFileSync(payloadPath, 'utf8')) as unknown)
      : await fetchPayload(PAYLOAD_URL)
  ) as CubePayload;

  const cube = raw.headline?.severity_cube;
  if (!cube) bail('payload carries no headline.severity_cube', 1);

  const rebuilt = historyFromCube(cube);
  assertConsistent(rebuilt);

  const lastCubeDay = rebuilt[rebuilt.length - 1].date;
  const existing = existsSync(HISTORY_PATH) ? parseHistory(readFileSync(HISTORY_PATH, 'utf8')) : [];
  const rows = mergeRebuild(rebuilt, existing);
  const kept = rows.length - rebuilt.length;

  const last = rows[rows.length - 1];
  console.log(`[history] ${rows.length} rows  ${rows[0].date} -> ${last.date}`);
  console.log(
    `[history] final: disclosed=${last.disclosed} acknowledged=${last.acknowledged} ` +
      `fixed=${last.fixed} advisories=${last.advisories}`,
  );
  console.log(`[history] bands: ${JSON.stringify(last.severity)}`);
  console.log(
    `[history] kept ${kept} live rows after ${lastCubeDay}; ` +
      `replaced ${existing.length - kept} rows the cube now dates`,
  );

  if (dryRun) {
    console.log('[history] dry run; nothing written');
    return;
  }
  writeFileSync(HISTORY_PATH, serializeHistory(rows), 'utf8');
  console.log(`[history] wrote ${HISTORY_PATH}`);
}

function bail(msg: string, code: number): never {
  console.error(`[history] FATAL: ${msg}`);
  process.exit(code);
}

const invokedDirectly =
  process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  main().catch((err: unknown) => {
    console.error('[history] FATAL:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
