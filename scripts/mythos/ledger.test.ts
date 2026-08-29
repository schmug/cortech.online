// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { aggregateLedger } from './ledger';
import type { LedgerEntry } from './ledger';

function entry(over: Partial<LedgerEntry> = {}): LedgerEntry {
  return {
    claude_severity: null,
    maintainer_severity: null,
    discovered_on: null,
    revealed_at: null,
    patched_at: null,
    reveal_tier: 'discovered',
    withdrawn: false,
    withdrawn_reason: null,
    ...over,
  };
}

describe('aggregateLedger()', () => {
  it('counts withdrawals by reason, ignoring reasons on non-withdrawn entries', () => {
    const agg = aggregateLedger([
      entry({ withdrawn: true, withdrawn_reason: 'mistake' }),
      entry({ withdrawn: true, withdrawn_reason: 'mistake' }),
      entry({ withdrawn: true, withdrawn_reason: 'duplicate' }),
      entry({ withdrawn: true, withdrawn_reason: null }),
      // The live payload carries 4 entries with a reason but withdrawn=false;
      // those are not withdrawals and must not inflate the counts.
      entry({ withdrawn: false, withdrawn_reason: 'duplicate' }),
    ]);
    expect(agg.total).toBe(5);
    expect(agg.withdrawals.total).toBe(4);
    expect(agg.withdrawals.by_reason).toEqual({ duplicate: 1, mistake: 2, unspecified: 1 });
  });

  it('partitions every entry across the reveal_tier funnel', () => {
    const agg = aggregateLedger([
      entry({ reveal_tier: 'sent' }),
      entry({ reveal_tier: 'sent' }),
      entry({ reveal_tier: 'revealed' }),
      entry({ reveal_tier: null }),
    ]);
    expect(agg.funnel).toEqual({ revealed: 1, sent: 2, unknown: 1 });
    expect(Object.values(agg.funnel).reduce((a, b) => a + b, 0)).toBe(agg.total);
  });

  it('counts severity agreement only over pairs rated by both, with a denominator', () => {
    const agg = aggregateLedger([
      entry({ claude_severity: 'high', maintainer_severity: 'high' }),
      entry({ claude_severity: 'high', maintainer_severity: 'medium' }),
      entry({ claude_severity: 'critical', maintainer_severity: 'low' }),
      entry({ claude_severity: 'medium', maintainer_severity: 'critical' }),
      // Unrated by the maintainer — excluded from the denominator entirely.
      entry({ claude_severity: 'critical', maintainer_severity: null }),
      entry({ claude_severity: null, maintainer_severity: 'high' }),
    ]);
    expect(agg.severity_agreement).toEqual({
      rated_pairs: 4,
      agree: 1,
      disagree: 3,
      claude_higher: 2,
      maintainer_higher: 1,
      disagree_pct: 75,
    });
  });

  it('reports zeroed severity agreement rather than dividing by zero', () => {
    const agg = aggregateLedger([entry({ claude_severity: 'high' })]);
    expect(agg.severity_agreement.rated_pairs).toBe(0);
    expect(agg.severity_agreement.disagree_pct).toBe(0);
  });

  it('excludes negative discovery-to-patch durations from the median and counts them', () => {
    const agg = aggregateLedger([
      entry({ discovered_on: '2026-03-01', patched_at: '2026-03-11T00:00:00Z' }), // +10
      entry({ discovered_on: '2026-03-01', patched_at: '2026-03-21T00:00:00Z' }), // +20
      entry({ discovered_on: '2026-03-01', patched_at: '2026-03-31T00:00:00Z' }), // +30
      // Patch dated before discovery: the payload has 18 of these (min -38 days).
      // Excluded so it can neither be published nor drag the median down.
      entry({ discovered_on: '2026-03-01', patched_at: '2026-01-21T00:00:00Z' }), // -39
    ]);
    expect(agg.latency.discovery_to_patch).toEqual({
      median_days: 20,
      sample: 3,
      excluded_negative: 1,
    });
  });

  it('averages the two middle values for an even-sized latency sample', () => {
    const agg = aggregateLedger([
      entry({ discovered_on: '2026-03-01', revealed_at: '2026-03-11T00:00:00Z' }), // +10
      entry({ discovered_on: '2026-03-01', revealed_at: '2026-03-16T00:00:00Z' }), // +15
    ]);
    expect(agg.latency.discovery_to_reveal.median_days).toBe(12.5);
    expect(agg.latency.discovery_to_reveal.sample).toBe(2);
  });

  it('returns a null median when no entry carries both dates', () => {
    const agg = aggregateLedger([entry({ discovered_on: '2026-03-01' })]);
    expect(agg.latency.discovery_to_patch).toEqual({
      median_days: null,
      sample: 0,
      excluded_negative: 0,
    });
  });
});
