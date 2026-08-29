// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  appendHistory,
  cumulative,
  historyDates,
  historyFromCube,
  historyRowForRun,
  mergeRebuild,
  parseHistory,
  serializeHistory,
  severityThrough,
  upsertRow,
  type HistoryRow,
} from './history';
import type { CubeSeries, Digest, SeverityCube } from './types';

function series(...days: Array<[string, Record<string, number>]>): CubeSeries {
  return { days: days.map(([date, cells]) => ({ date, cells })) };
}

const empty: CubeSeries = { days: [] };

/**
 * A miniature cube with the shape the real payload has: cell keys are
 * `claude|maintainer|vendor` triples and each series' days sum to its headline.
 */
const cube: SeverityCube = {
  disclosed: series(
    ['2026-01-01', { 'high|not_assessed|not_assessed': 2, 'critical|critical|not_assessed': 1 }],
    ['2026-01-03', { 'not_assessed|not_assessed|not_assessed': 1, 'low|not_assessed|low': 3 }],
  ),
  acknowledged: series(['2026-01-02', { 'high|not_assessed|not_assessed': 2 }]),
  fixed_in_response: series(['2026-01-03', { 'critical|critical|not_assessed': 1 }]),
  advisories: series(['2026-01-01', { 'high|not_assessed|not_assessed': 1 }]),
  analyzed: empty,
  triaged: empty,
  verified: empty,
};

const digest: Digest = {
  as_of: '2026-01-04T18:55:53.809770Z',
  fetched_at: '2026-01-05T01:10:13.620Z',
  headline: {
    disclosed: 7,
    acknowledged: 2,
    fixed: 1,
    advisories: 1,
    candidates: 900,
    reviewed: 100,
    verified: 90,
  },
  rates: { true_positive_pct: 91.4, median_days_to_ack: 0, median_days_to_patch: 13.7 },
  by_bug_class: {},
  by_ecosystem: {},
  project_names: [],
  revealed_cve_ids: [],
};

describe('cumulative', () => {
  it('sums every cell on or before the date', () => {
    expect(cumulative(cube.disclosed, '2026-01-01')).toBe(3);
    expect(cumulative(cube.disclosed, '2026-01-02')).toBe(3);
    expect(cumulative(cube.disclosed, '2026-01-03')).toBe(7);
  });

  it('carries a series that stops early at its full total', () => {
    expect(cumulative(cube.acknowledged, '2026-06-01')).toBe(2);
  });
});

describe('severityThrough', () => {
  it('bands on the claude basis and folds not_assessed into unknown', () => {
    expect(severityThrough(cube.disclosed, '2026-01-03')).toEqual({
      critical: 1,
      high: 2,
      medium: 0,
      low: 3,
      unknown: 1,
    });
  });

  it('never lets a band come from the maintainer or vendor component', () => {
    // 'high|critical|critical' is a high on the claude basis, whatever the
    // other two reviewers said.
    const s = series(['2026-01-01', { 'high|critical|critical': 4 }]);
    expect(severityThrough(s, '2026-01-01')).toEqual({
      critical: 0,
      high: 4,
      medium: 0,
      low: 0,
      unknown: 0,
    });
  });

  it('buckets an unrecognised basis as unknown rather than dropping it', () => {
    const s = series(['2026-01-01', { 'moderate|not_assessed|not_assessed': 2 }]);
    expect(severityThrough(s, '2026-01-01')).toEqual({
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      unknown: 2,
    });
  });
});

describe('historyFromCube', () => {
  it('emits one row per date any charted series carries', () => {
    expect(historyDates(cube)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
    expect(historyFromCube(cube).map((r) => r.date)).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });

  it('reproduces the running totals of every charted series', () => {
    expect(historyFromCube(cube)).toEqual([
      {
        date: '2026-01-01',
        disclosed: 3,
        acknowledged: 0,
        fixed: 0,
        advisories: 1,
        severity: { critical: 1, high: 2, medium: 0, low: 0, unknown: 0 },
      },
      {
        date: '2026-01-02',
        disclosed: 3,
        acknowledged: 2,
        fixed: 0,
        advisories: 1,
        severity: { critical: 1, high: 2, medium: 0, low: 0, unknown: 0 },
      },
      {
        date: '2026-01-03',
        disclosed: 7,
        acknowledged: 2,
        fixed: 1,
        advisories: 1,
        severity: { critical: 1, high: 2, medium: 0, low: 3, unknown: 1 },
      },
    ]);
  });

  it('omits the medians the payload has no per-day history for', () => {
    for (const row of historyFromCube(cube)) {
      expect(row).not.toHaveProperty('median_days_to_ack');
      expect(row).not.toHaveProperty('median_days_to_patch');
    }
  });

  it('keeps the severity bands summing to disclosed on every row', () => {
    for (const row of historyFromCube(cube)) {
      const sum = Object.values(row.severity).reduce((a, b) => a + b, 0);
      expect(sum).toBe(row.disclosed);
    }
  });
});

describe('historyRowForRun', () => {
  it('dates the row by the digest as_of, not the fetch time', () => {
    expect(historyRowForRun(digest, cube).date).toBe('2026-01-04');
  });

  it('takes the headline from the digest so the chart agrees with the stat cards', () => {
    const row = historyRowForRun(digest, cube);
    expect(row).toMatchObject({ disclosed: 7, acknowledged: 2, fixed: 1, advisories: 1 });
  });

  it('carries the real medians a live run does have', () => {
    expect(historyRowForRun(digest, cube)).toMatchObject({
      median_days_to_ack: 0,
      median_days_to_patch: 13.7,
    });
  });

  it('bands from the cube, which sums to the same headline the digest quotes', () => {
    const row = historyRowForRun(digest, cube);
    expect(Object.values(row.severity).reduce((a, b) => a + b, 0)).toBe(row.disclosed);
  });
});

describe('serializeHistory', () => {
  it('writes a backfilled row without median keys at all', () => {
    const [row] = historyFromCube(cube);
    const line = serializeHistory([row]).trim();
    expect(line).not.toContain('median');
    expect(JSON.parse(line)).toEqual(row);
  });

  it('round-trips through parseHistory', () => {
    const rows = [...historyFromCube(cube), historyRowForRun(digest, cube)];
    expect(parseHistory(serializeHistory(rows))).toEqual(rows);
  });

  it('is byte-stable, so an unchanged re-run leaves an empty diff', () => {
    const rows = historyFromCube(cube);
    expect(serializeHistory(rows)).toBe(serializeHistory(parseHistory(serializeHistory(rows))));
  });
});

describe('upsertRow', () => {
  const rows = historyFromCube(cube);

  it('replaces a row carrying the same date rather than duplicating it', () => {
    const revised: HistoryRow = { ...rows[1], disclosed: 99 };
    const out = upsertRow(rows, revised);
    expect(out).toHaveLength(rows.length);
    expect(out.filter((r) => r.date === revised.date)).toEqual([revised]);
  });

  it('keeps the file in date order when a row lands out of sequence', () => {
    const out = upsertRow(rows, { ...rows[0], date: '2025-12-25' });
    expect(out.map((r) => r.date)).toEqual([
      '2025-12-25',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
  });
});

describe('appendHistory', () => {
  let dir: string;
  let historyPath: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mythos-history-'));
    historyPath = join(dir, '_data/history.jsonl');
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('creates the file on the first ever append', () => {
    expect(existsSync(historyPath)).toBe(false);
    appendHistory({ historyPath, row: historyRowForRun(digest, cube) });
    expect(parseHistory(readFileSync(historyPath, 'utf8'))).toEqual([
      historyRowForRun(digest, cube),
    ]);
  });

  it('appends to an existing backfilled file without touching its rows', () => {
    appendHistory({ historyPath, row: historyFromCube(cube)[0] });
    appendHistory({ historyPath, row: historyFromCube(cube)[1] });
    appendHistory({ historyPath, row: historyRowForRun(digest, cube) });

    const rows = parseHistory(readFileSync(historyPath, 'utf8'));
    expect(rows.map((r) => r.date)).toEqual(['2026-01-01', '2026-01-02', '2026-01-04']);
    expect(rows[0]).not.toHaveProperty('median_days_to_patch');
    expect(rows[2]).toHaveProperty('median_days_to_patch', 13.7);
  });

  it('leaves one updated row when the cron fires twice for the same as_of', () => {
    appendHistory({ historyPath, row: historyRowForRun(digest, cube) });
    const first = readFileSync(historyPath, 'utf8');

    appendHistory({ historyPath, row: historyRowForRun(digest, cube) });
    expect(readFileSync(historyPath, 'utf8')).toBe(first);

    const later: Digest = { ...digest, headline: { ...digest.headline, disclosed: 8 } };
    appendHistory({ historyPath, row: historyRowForRun(later, cube) });

    const rows = parseHistory(readFileSync(historyPath, 'utf8'));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ date: '2026-01-04', disclosed: 8 });
  });
});

describe('mergeRebuild', () => {
  const rebuilt = historyFromCube(cube);

  it('drops rows the cube does not date inside its own range', () => {
    // Exactly the seeded rows #223 was filed over: dated inside the cube's
    // window, on days the cube itself never carried.
    const synthetic: HistoryRow[] = [
      { ...rebuilt[0], date: '2026-01-02', disclosed: 980 },
      { ...rebuilt[0], date: '2026-01-03', disclosed: 988 },
    ];
    expect(mergeRebuild(rebuilt, synthetic)).toEqual(rebuilt);
  });

  it('keeps live rows appended after the cube ends', () => {
    const live = historyRowForRun(digest, cube);
    const merged = mergeRebuild(rebuilt, [...rebuilt, live]);
    expect(merged.map((r) => r.date)).toEqual([...rebuilt.map((r) => r.date), live.date]);
    expect(merged.at(-1)).toEqual(live);
  });

  it('is idempotent — rebuilding twice changes nothing', () => {
    const once = mergeRebuild(rebuilt, [...rebuilt, historyRowForRun(digest, cube)]);
    expect(mergeRebuild(rebuilt, once)).toEqual(once);
  });
});
