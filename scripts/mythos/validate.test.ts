// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { figuresIn, missingDenominators, sparseFiguresFor, unsupportedFigures } from './validate';
import { aggregateLedger } from './ledger';

const brief = [
  'As of 2026-08-26T18:55:53.809770Z, the dashboard reports:',
  '- 2300 disclosed (was 2290)',
  '- Withdrawn: 243 of 2736 findings.',
  '- Of the 117 findings rated by both, they disagree on 65 (55.6%).',
].join('\n');

describe('figuresIn()', () => {
  it('ignores digits inside identifiers, URLs, ISO dates and list markers', () => {
    const body = [
      'CVE-2026-12340 and GHSA-abcd-1234-wxyz landed.',
      '1. First item',
      '2) Second item',
      'Source: https://red.anthropic.com/2026/cvd/',
      'Published 2026-08-26.',
    ].join('\n');
    expect(figuresIn(body)).toEqual([]);
  });

  it('normalises thousands separators and percent signs', () => {
    expect(figuresIn('2,736 findings, 55.6% of them')).toEqual([2736, 55.6]);
  });
});

describe('unsupportedFigures()', () => {
  it('accepts a post whose every figure appears in the brief', () => {
    const body = '243 of 2736 findings were withdrawn; 65 of 117 rated pairs disagree.';
    expect(unsupportedFigures(body, brief)).toEqual([]);
  });

  it('rejects a figure the brief never stated', () => {
    // 300 is a plausible-looking withdrawal count. The payload says 243.
    const body = '300 of 2736 findings were withdrawn.';
    expect(unsupportedFigures(body, brief)).toEqual([300]);
  });

  it('accepts the rounded and truncated forms of a decimal in the brief', () => {
    expect(unsupportedFigures('disagreement runs at 56%', brief)).toEqual([]);
    expect(unsupportedFigures('disagreement runs at 55%', brief)).toEqual([]);
    expect(unsupportedFigures('disagreement runs at 57%', brief)).toEqual([57]);
  });
});

describe('sparseFiguresFor()', () => {
  const agg = aggregateLedger([
    { claude_severity: 'high', maintainer_severity: 'medium', reveal_tier: 'revealed' },
    { claude_severity: 'high', maintainer_severity: 'high', reveal_tier: 'sent' },
    { withdrawn: true, withdrawn_reason: 'mistake', reveal_tier: 'sent' },
    { discovered_on: '2026-03-01', patched_at: '2026-03-11T00:00:00Z', reveal_tier: 'sent' },
  ]);

  it('pairs each sparse-field aggregate with the denominator it must be cited with', () => {
    const pairs = sparseFiguresFor(agg);
    expect(pairs).toContainEqual({ label: 'severity disagreements', value: 1, denominator: 2 });
    expect(pairs).toContainEqual({
      label: 'withdrawals for reason "mistake"',
      value: 1,
      denominator: 1,
    });
    expect(pairs).toContainEqual({
      label: 'median days from discovery to patch',
      value: 10,
      denominator: 1,
    });
    // A null median is not a figure a post can cite, so it is not listed.
    expect(pairs.some((p) => p.label.includes('reveal'))).toBe(false);
  });
});

describe('missingDenominators()', () => {
  const sparse = [{ label: 'severity disagreements', value: 65, denominator: 117 }];

  it('flags a sparse figure cited without its denominator', () => {
    expect(missingDenominators('Claude and maintainers disagreed on 65 findings.', sparse)).toEqual(
      sparse,
    );
  });

  it('passes when the denominator is present', () => {
    expect(missingDenominators('65 of the 117 rated pairs disagreed.', sparse)).toEqual([]);
  });

  it('ignores sparse figures the post never cites', () => {
    expect(missingDenominators('Nothing numeric to see here.', sparse)).toEqual([]);
  });
});
