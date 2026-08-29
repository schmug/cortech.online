/**
 * The /mythos trend series — `src/content/mythos/_data/history.jsonl`, one row
 * per day of real dashboard state.
 *
 * Two writers feed the same file and must produce identical row shapes, because
 * a reader must not be able to tell where one ends and the other begins:
 *
 *  - `historyFromCube()` rebuilds the recoverable past. `headline.severity_cube`
 *    enumerates every item by the day it landed, and its days sum to the
 *    headline totals, so a running total is the exact historical value —
 *    nothing here is interpolated.
 *  - `historyRowForRun()` records one live tracker run, dated by the digest's
 *    `as_of` rather than its `fetched_at`: the date belongs to the data, not to
 *    the machine that fetched it.
 *
 * The medians are the one field the cube cannot reproduce. The payload carries
 * `median_days_to_ack` / `median_days_to_patch` only as current scalars, with no
 * per-day history, so backfilled rows omit them entirely rather than carry
 * today's value backwards. Absent is correct where history does not exist.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { CubeSeries, Digest, SeverityBucket, SeverityCube } from './types';

/**
 * A row of the trend series. Mirrors `HistoryRow` in
 * src/components/mythos/Timeline.tsx — the component reads this file verbatim.
 */
export type HistoryRow = {
  date: string;
  disclosed: number;
  acknowledged: number;
  fixed: number;
  advisories: number;
  /** Absent on backfilled rows: the payload keeps no per-day history for these. */
  median_days_to_ack?: number;
  median_days_to_patch?: number;
  severity: SeverityBucket;
};

/** The four series a history row quotes. `analyzed`/`triaged`/`verified` are not charted. */
const CHARTED_SERIES = ['disclosed', 'acknowledged', 'fixed_in_response', 'advisories'] as const;

const BANDS = ['critical', 'high', 'medium', 'low', 'unknown'] as const;

function emptyBands(): SeverityBucket {
  return { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 };
}

/**
 * Running total of a cube series through `date`. A series that stops before
 * `date` contributes its full total, which is what makes a row dated after the
 * cube's last day carry the dashboard's current numbers rather than a gap.
 */
export function cumulative(series: CubeSeries, date: string): number {
  let total = 0;
  for (const day of series.days) {
    if (day.date > date) continue;
    for (const count of Object.values(day.cells)) total += count;
  }
  return total;
}

/**
 * Severity split of a cube series through `date`, on the **claude** basis — the
 * first component of each `claude|maintainer|vendor` cell key, since it is the
 * only one assigned to every finding. `not_assessed` (and any band the payload
 * adds later) folds into `unknown`, so the bands always sum to the series total.
 */
export function severityThrough(series: CubeSeries, date: string): SeverityBucket {
  const bands = emptyBands();
  for (const day of series.days) {
    if (day.date > date) continue;
    for (const [cell, count] of Object.entries(day.cells)) {
      const basis = cell.split('|')[0];
      const band = (BANDS as readonly string[]).includes(basis)
        ? (basis as keyof SeverityBucket)
        : 'unknown';
      bands[band] += count;
    }
  }
  return bands;
}

/** Every date any charted series carries, ascending. */
export function historyDates(cube: SeverityCube): string[] {
  const dates = new Set<string>();
  for (const key of CHARTED_SERIES) for (const day of cube[key].days) dates.add(day.date);
  return Array.from(dates).sort();
}

/** The full recoverable series: one row per day the cube carries, medians omitted. */
export function historyFromCube(cube: SeverityCube): HistoryRow[] {
  return historyDates(cube).map((date) => ({
    date,
    disclosed: cumulative(cube.disclosed, date),
    acknowledged: cumulative(cube.acknowledged, date),
    fixed: cumulative(cube.fixed_in_response, date),
    advisories: cumulative(cube.advisories, date),
    severity: severityThrough(cube.disclosed, date),
  }));
}

/**
 * One live tracker run as a history row.
 *
 * Headline counts come from the digest, so the chart's right edge always agrees
 * with the stat cards rendered above it from the same snapshot. The severity
 * split has no scalar equivalent in the payload and comes from the cube, which
 * sums to the same headline totals.
 */
export function historyRowForRun(digest: Digest, cube: SeverityCube): HistoryRow {
  const date = digest.as_of.slice(0, 10);
  return {
    date,
    disclosed: digest.headline.disclosed,
    acknowledged: digest.headline.acknowledged,
    fixed: digest.headline.fixed,
    advisories: digest.headline.advisories,
    median_days_to_ack: digest.rates.median_days_to_ack,
    median_days_to_patch: digest.rates.median_days_to_patch,
    severity: severityThrough(cube.disclosed, date),
  };
}

export function parseHistory(text: string): HistoryRow[] {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as HistoryRow);
}

/**
 * One row per line, keys in a fixed order so a re-run that changes nothing
 * produces a byte-identical file and an empty diff. An absent median is omitted
 * rather than written as null — the reader treats the key's absence as "not
 * recoverable", and a null would have to be special-cased everywhere instead.
 */
export function serializeHistory(rows: HistoryRow[]): string {
  return rows.map(rowToJson).join('\n') + '\n';
}

function rowToJson(row: HistoryRow): string {
  const out: Record<string, unknown> = {
    date: row.date,
    disclosed: row.disclosed,
    acknowledged: row.acknowledged,
    fixed: row.fixed,
    advisories: row.advisories,
  };
  if (row.median_days_to_ack !== undefined) out.median_days_to_ack = row.median_days_to_ack;
  if (row.median_days_to_patch !== undefined) out.median_days_to_patch = row.median_days_to_patch;
  out.severity = {
    critical: row.severity.critical,
    high: row.severity.high,
    medium: row.severity.medium,
    low: row.severity.low,
    unknown: row.severity.unknown,
  };
  return JSON.stringify(out);
}

/**
 * Insert `row`, replacing any row already carrying its date. The cron can fire
 * twice in a day and a re-run must leave one updated row, not two.
 */
export function upsertRow(rows: HistoryRow[], row: HistoryRow): HistoryRow[] {
  const kept = rows.filter((r) => r.date !== row.date);
  return [...kept, row].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Merge a freshly rebuilt cube series with whatever the file already held.
 *
 * Only rows dated strictly after the cube's last day survive. A live row is
 * dated by the payload's `as_of`, which cannot precede the cube drawn from that
 * same payload — so a row inside the cube's range that the cube does not carry
 * is not a live row. It is left-over synthetic seed data, and keeping it would
 * put fiction back on the chart, which is the exact trap #223 was filed over.
 */
export function mergeRebuild(rebuilt: HistoryRow[], existing: HistoryRow[]): HistoryRow[] {
  if (rebuilt.length === 0) return [...existing].sort((a, b) => a.date.localeCompare(b.date));
  const lastCubeDay = rebuilt[rebuilt.length - 1].date;
  return existing.filter((r) => r.date > lastCubeDay).reduce(upsertRow, rebuilt);
}

/** Upsert one row into the history file, creating it if this is the first ever run. */
export function appendHistory({
  historyPath,
  row,
}: {
  historyPath: string;
  row: HistoryRow;
}): void {
  const existing = existsSync(historyPath) ? parseHistory(readFileSync(historyPath, 'utf8')) : [];
  mkdirSync(dirname(historyPath), { recursive: true });
  writeFileSync(historyPath, serializeHistory(upsertRow(existing, row)), 'utf8');
}
