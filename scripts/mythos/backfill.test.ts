// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  backfillNote,
  digestAsOf,
  eventGuidance,
  enrichmentView,
  headlineAsOf,
  lastHeadlineDay,
  partitionByRevealDate,
  previousDay,
  type BackfillPayload,
} from './backfill';
import { triggersFor } from './triggers';

function series(...days: Array<[string, number]>) {
  return { days: days.map(([date, n]) => ({ date, cells: { 'high|high|medium': n } })) };
}

const raw: BackfillPayload = {
  as_of: '2026-08-26T18:55:53.809770Z',
  first_disclosure_at: '2026-02-15T00:00:00Z',
  headline: {
    disclosed: 30,
    acknowledged: 12,
    fixed_in_response: 6,
    advisories: 9,
    analyzed: 300,
    triaged: 60,
    verified: 50,
    tpr_pct: 91.4,
    severity_cube: {
      disclosed: series(['2026-05-19', 10], ['2026-05-20', 15], ['2026-06-02', 5]),
      acknowledged: series(['2026-05-19', 4], ['2026-05-20', 8]),
      fixed_in_response: series(['2026-05-19', 6]),
      advisories: series(['2026-05-20', 9]),
      analyzed: series(['2026-05-20', 300]),
      triaged: series(['2026-05-20', 60]),
      verified: series(['2026-05-20', 50]),
    },
  },
  median_days_to_ack: 0,
  median_days_to_patch: 13.7,
  by_bug_class: { 'heap-buffer-overflow': 243, 'use-after-free': 89 },
  by_ecosystem: { Cryptography: { critical: 1, high: 2, medium: 3, low: 4, unknown: 0 } },
  by_project: [
    { project: 'wolfssl/wolfssl', ecosystem: 'Cryptography', cve_ids: ['CVE-2026-0001'] },
    { project: 'randombit/botan', ecosystem: 'Cryptography', cve_ids: ['CVE-2026-0003'] },
  ],
  cve_records: [
    {
      identifier: 'CVE-2026-0001',
      revealed_at: '2026-05-20T09:00:00.000000Z',
      discovered_on: '2026-03-24',
      findings: [
        { project: 'wolfssl/wolfssl', bug_class: 'heap-buffer-overflow', ecosystem: 'unset' },
      ],
    },
    {
      identifier: 'CVE-2026-0003',
      revealed_at: '2026-06-02T11:00:00.000000Z',
      discovered_on: '2026-04-02',
      findings: [
        { project: 'randombit/botan', bug_class: 'improper-cert-validation', ecosystem: 'unset' },
      ],
    },
  ],
  ghsa_records: [
    {
      identifier: 'GHSA-aaaa-bbbb-cccc',
      revealed_at: '2026-05-20T17:47:54.766361Z',
      discovered_on: '2026-03-20',
      findings: [{ project: 'wolfssl/wolfssl', bug_class: 'use-after-free', ecosystem: 'unset' }],
    },
  ],
};

describe('partitionByRevealDate()', () => {
  it('buckets CVE and GHSA records together by UTC reveal date, oldest first', () => {
    const events = partitionByRevealDate(raw);
    expect(events.map((e) => e.date)).toEqual(['2026-05-20', '2026-06-02']);
    expect(events[0].records.map((r) => r.identifier)).toEqual([
      'CVE-2026-0001',
      'GHSA-aaaa-bbbb-cccc',
    ]);
  });

  it('dates each event by the last reveal that landed on it', () => {
    expect(partitionByRevealDate(raw)[0].pubDate).toBe('2026-05-20T17:47:54.766361Z');
  });

  it('assigns every identifier to exactly one event', () => {
    const events = partitionByRevealDate(raw);
    const ids = events.flatMap((e) => e.records.map((r) => r.identifier));
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
  });
});

describe('previousDay()', () => {
  it('steps back across a month boundary', () => {
    expect(previousDay('2026-06-01')).toBe('2026-05-31');
    expect(previousDay('2026-05-20')).toBe('2026-05-19');
  });
});

describe('headlineAsOf()', () => {
  it('accumulates cube days through the given date and no further', () => {
    expect(headlineAsOf(raw.headline.severity_cube, '2026-05-19')).toEqual({
      disclosed: 10,
      acknowledged: 4,
      fixed: 6,
      advisories: 0,
      candidates: 0,
      reviewed: 0,
      verified: 0,
    });
    expect(headlineAsOf(raw.headline.severity_cube, '2026-05-20').disclosed).toBe(25);
  });

  it('returns the full total once every series is exhausted', () => {
    expect(headlineAsOf(raw.headline.severity_cube, '2026-08-17')).toEqual({
      disclosed: 30,
      acknowledged: 12,
      fixed: 6,
      advisories: 9,
      candidates: 300,
      reviewed: 60,
      verified: 50,
    });
  });
});

describe('digestAsOf()', () => {
  it('scopes revealed identifiers and project names to the date', () => {
    const d = digestAsOf(raw, '2026-05-20');
    expect(d.revealed_cve_ids).toEqual(['CVE-2026-0001', 'GHSA-aaaa-bbbb-cccc']);
    expect(d.project_names).toEqual(['wolfssl/wolfssl']);
    expect(d.as_of).toBe('2026-05-20T17:47:54.766361Z');
  });

  it('falls back to first_disclosure_at before anything was revealed', () => {
    const d = digestAsOf(raw, '2026-05-19');
    expect(d.revealed_cve_ids).toEqual([]);
    expect(d.as_of).toBe('2026-02-15T00:00:00Z');
  });

  it('omits ledger aggregates so no withdrawal_surge can be dated to an event', () => {
    expect(digestAsOf(raw, '2026-06-02').ledger).toBeUndefined();
  });

  it('passes undatable corpus figures through unchanged', () => {
    const before = digestAsOf(raw, '2026-05-19');
    const after = digestAsOf(raw, '2026-06-02');
    expect(after.by_bug_class).toEqual(raw.by_bug_class);
    expect(before.by_bug_class).toEqual(after.by_bug_class);
    expect(before.rates).toEqual(after.rates);
    expect(before.by_ecosystem).toEqual(after.by_ecosystem);
  });
});

describe('per-event triggers', () => {
  it('emits only revealed and new_project — never a shift the payload cannot date', () => {
    for (const event of partitionByRevealDate(raw)) {
      const triggers = triggersFor(
        digestAsOf(raw, previousDay(event.date)),
        digestAsOf(raw, event.date),
        enrichmentView(raw, event.date),
      );
      expect(new Set(triggers.map((t) => t.kind)).size).toBeGreaterThan(0);
      // Explicitly excludes bug_class_shift, funnel_shift and withdrawal_surge:
      // all three derive from figures the payload keeps no per-day history for.
      for (const t of triggers) expect(['revealed', 'new_project']).toContain(t.kind);
    }
  });

  it('raises one revealed trigger per identifier revealed that day', () => {
    const event = partitionByRevealDate(raw)[0];
    const triggers = triggersFor(
      digestAsOf(raw, previousDay(event.date)),
      digestAsOf(raw, event.date),
      enrichmentView(raw, event.date),
    );
    expect(triggers.filter((t) => t.kind === 'revealed').map((t) => t.cve_id)).toEqual([
      'CVE-2026-0001',
      'GHSA-aaaa-bbbb-cccc',
    ]);
  });

  it('marks a project new only on the event that first reveals it', () => {
    const botanEvent = '2026-06-02';
    const triggers = triggersFor(
      digestAsOf(raw, previousDay(botanEvent)),
      digestAsOf(raw, botanEvent),
      enrichmentView(raw, botanEvent),
    );
    const newProjects = triggers.filter((t) => t.kind === 'new_project').map((t) => t.project);
    expect(newProjects).toEqual(['randombit/botan']);
  });
});

describe('enrichmentView()', () => {
  it('joins the ecosystem the payload only records on by_project', () => {
    const view = enrichmentView(raw, '2026-06-02');
    expect(view.cve_records[0].findings[0].ecosystem).toBe('Cryptography');
  });

  it('hides identifiers a later event has not revealed yet', () => {
    const view = enrichmentView(raw, '2026-05-20');
    expect(view.by_project.find((p) => p.project === 'randombit/botan')?.cve_ids).toEqual([]);
    expect(view.by_project.find((p) => p.project === 'wolfssl/wolfssl')?.cve_ids).toEqual([
      'CVE-2026-0001',
    ]);
  });
});

describe('eventGuidance()', () => {
  const event = partitionByRevealDate(raw)[0];

  it('pins the post to the reveal date rather than the day it is generated', () => {
    const guidance = eventGuidance(event);
    expect(guidance).toContain('revealed on 2026-05-20');
    expect(guidance).toContain('Do not date the post to today');
  });

  it('asks for framing prose before the identifiers and a close after them', () => {
    const guidance = eventGuidance(event);
    expect(guidance).toMatch(/Open with two or three sentences/);
    expect(guidance).toMatch(/Close with two or three sentences/);
  });
});

describe('backfillNote()', () => {
  const events = partitionByRevealDate(raw);
  const lastDay = lastHeadlineDay(raw.headline.severity_cube);

  it('reports the last day the headline series covers', () => {
    expect(lastDay).toBe('2026-06-02');
  });

  it('says the post was reconstructed rather than published live', () => {
    const note = backfillNote(events[0], raw.as_of, lastDay);
    expect(note).toContain('not published live on 2026-05-20');
    expect(note).toContain(raw.as_of);
  });

  it('flags headline counts as current totals past the end of the series', () => {
    const past = { ...events[0], date: '2026-08-17' };
    expect(backfillNote(past, raw.as_of, lastDay)).toContain('daily series ends 2026-06-02');
    expect(backfillNote(events[0], raw.as_of, lastDay)).not.toContain('daily series ends');
  });
});
