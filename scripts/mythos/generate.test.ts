import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderPost, GenerationError, deriveSlug, buildUserPrompt } from './generate';
import type { Digest, Trigger } from './types';
import type { LedgerAggregates } from './ledger';

const oldDigest: Digest = {
  as_of: '2026-05-22T00:00:00Z',
  fetched_at: '2026-05-23T19:00:00Z',
  headline: {
    disclosed: 1000,
    acknowledged: 900,
    fixed: 90,
    advisories: 80,
    candidates: 20000,
    reviewed: 1500,
    verified: 1300,
  },
  rates: { true_positive_pct: 90, median_days_to_ack: 7, median_days_to_patch: 21 },
  by_bug_class: { 'heap-buffer-overflow': 100 },
  by_ecosystem: {},
  project_names: ['wolfSSL'],
  revealed_cve_ids: ['CVE-2026-0001'],
};

const newDigest: Digest = {
  ...oldDigest,
  as_of: '2026-05-23T00:00:00Z',
  headline: { ...oldDigest.headline, disclosed: 1010, advisories: 82 },
  revealed_cve_ids: ['CVE-2026-0001', 'CVE-2026-0002'],
};

const triggers: Trigger[] = [
  {
    kind: 'revealed',
    cve_id: 'CVE-2026-0002',
    project: 'wolfSSL',
    bug_class: 'use-after-free',
    ecosystem: 'Other',
  },
];

const allKnownCves = ['CVE-2026-0001', 'CVE-2026-0002'];

// Mirrors the live payload's aggregates so the tests read as the real thing.
const ledger: LedgerAggregates = {
  total: 2736,
  withdrawals: {
    total: 243,
    by_reason: {
      duplicate: 81,
      false_positive: 11,
      mistake: 137,
      out_of_scope: 9,
      rejected_not_sec: 5,
    },
  },
  funnel: { acknowledged_by_maintainer: 1603, discovered: 434, revealed: 214, sent: 485 },
  severity_agreement: {
    rated_pairs: 117,
    agree: 52,
    disagree: 65,
    claude_higher: 55,
    maintainer_higher: 10,
    disagree_pct: 55.6,
  },
  latency: {
    discovery_to_reveal: { median_days: 130, sample: 213, excluded_negative: 0 },
    discovery_to_patch: { median_days: 50, sample: 193, excluded_negative: 18 },
  },
};

const ledgerDigest: Digest = { ...newDigest, ledger };
const padding = 'detail '.repeat(120);

describe('renderPost()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('passes when guardrails are satisfied', async () => {
    const callLlm = vi
      .fn()
      .mockResolvedValue(
        `wolfSSL CVE-2026-0002 is a newly revealed use-after-free vulnerability discovered by ` +
          `Mythos Preview. It joins the project's growing list. ${'detail '.repeat(120)}.`,
      );
    const post = await renderPost({ oldDigest, newDigest, triggers, allKnownCves, callLlm });
    expect(post.body).toContain('CVE-2026-0002');
    expect(post.frontmatter.cve_ids).toContain('CVE-2026-0002');
    expect(post.frontmatter.triggers).toContain('revealed');
  });

  it('rejects output missing a required CVE', async () => {
    const callLlm = vi
      .fn()
      .mockResolvedValueOnce(`A vague summary with no CVE id. ${'detail '.repeat(120)}.`)
      .mockResolvedValueOnce(`Still no CVE id. ${'detail '.repeat(120)}.`);
    const [result] = await Promise.allSettled([
      renderPost({ oldDigest, newDigest, triggers, allKnownCves, callLlm }),
      vi.runAllTimersAsync(),
    ]);
    expect(result.status).toBe('rejected');
    expect((result as PromiseRejectedResult).reason).toBeInstanceOf(GenerationError);
    expect(callLlm).toHaveBeenCalledTimes(2);
  });

  it('rejects hallucinated CVE ids', async () => {
    const callLlm = vi
      .fn()
      .mockResolvedValueOnce(`CVE-2026-0002 and also CVE-2026-9999. ${'detail '.repeat(120)}.`)
      .mockResolvedValueOnce(`CVE-2026-0002 and also CVE-2026-9999. ${'detail '.repeat(120)}.`);
    const [result] = await Promise.allSettled([
      renderPost({ oldDigest, newDigest, triggers, allKnownCves, callLlm }),
      vi.runAllTimersAsync(),
    ]);
    expect(result.status).toBe('rejected');
    expect((result as PromiseRejectedResult).reason).toBeInstanceOf(GenerationError);
  });

  it('rejects output outside the word-count band', async () => {
    const callLlm = vi
      .fn()
      .mockResolvedValueOnce('CVE-2026-0002 short.')
      .mockResolvedValueOnce('CVE-2026-0002 still short.');
    const [result] = await Promise.allSettled([
      renderPost({ oldDigest, newDigest, triggers, allKnownCves, callLlm }),
      vi.runAllTimersAsync(),
    ]);
    expect(result.status).toBe('rejected');
    expect((result as PromiseRejectedResult).reason).toBeInstanceOf(GenerationError);
  });

  it('throws when called with no triggers', async () => {
    const callLlm = vi.fn();
    // No retry on empty-triggers path, no timer needed.
    await expect(
      renderPost({ oldDigest, newDigest, triggers: [], allKnownCves, callLlm }),
    ).rejects.toThrow(GenerationError);
    expect(callLlm).not.toHaveBeenCalled();
  });

  it('retries once then throws GenerationError when callLlm rejects', async () => {
    const callLlm = vi.fn().mockRejectedValue(new Error('API down'));
    const [result] = await Promise.allSettled([
      renderPost({ oldDigest, newDigest, triggers, allKnownCves, callLlm }),
      vi.runAllTimersAsync(),
    ]);
    expect(result.status).toBe('rejected');
    expect((result as PromiseRejectedResult).reason).toBeInstanceOf(GenerationError);
    expect(callLlm).toHaveBeenCalledTimes(2);
  });
});

describe('deriveSlug()', () => {
  it('uses project + cve when there is a single revealed trigger', () => {
    expect(
      deriveSlug(new Date('2026-05-24T19:00:00Z'), [
        {
          kind: 'revealed',
          cve_id: 'CVE-2026-0002',
          project: 'wolfSSL',
          bug_class: 'use-after-free',
          ecosystem: 'Other',
        },
      ]),
    ).toBe('2026-05-24-wolfssl-cve-2026-0002');
  });

  it('uses mythos-<weekday> for multi-trigger days', () => {
    const slug = deriveSlug(new Date('2026-05-24T19:00:00Z'), [
      { kind: 'new_project', project: 'curl', ecosystem: 'Other', first_cves: [] },
      {
        kind: 'revealed',
        cve_id: 'CVE-2026-0002',
        project: 'wolfSSL',
        bug_class: 'use-after-free',
        ecosystem: 'Other',
      },
    ]);
    expect(slug).toBe('2026-05-24-mythos-sunday');
  });
});

describe('ledger statistics in generated posts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function attempt(body: string) {
    const callLlm = vi.fn().mockResolvedValue(body);
    const [result] = await Promise.allSettled([
      renderPost({
        oldDigest,
        newDigest: ledgerDigest,
        triggers,
        allKnownCves,
        callLlm,
      }),
      vi.runAllTimersAsync(),
    ]);
    return result;
  }

  it('accepts a post that cites ledger figures with their denominators', async () => {
    const result = await attempt(
      `wolfSSL CVE-2026-0002 is newly revealed. Mythos has withdrawn 243 of 2736 findings, ` +
        `137 of 243 of them logged as mistakes. Of the 117 findings rated by both Claude and a ` +
        `maintainer, the two disagree on 65 of 117 (55.6%). ${padding}.`,
    );
    expect(result.status).toBe('fulfilled');
    const post = (result as PromiseFulfilledResult<{ body: string }>).value;
    expect(post.body).toContain('65 of 117');
    expect(post.body).toContain('137 of 243');
  });

  it('rejects a statistic the payload never produced', async () => {
    // The payload says 243 withdrawals, not 300.
    const result = await attempt(
      `wolfSSL CVE-2026-0002 is newly revealed. Mythos has withdrawn 300 of 2736 findings. ` +
        `${padding}.`,
    );
    expect(result.status).toBe('rejected');
    expect((result as PromiseRejectedResult).reason).toBeInstanceOf(GenerationError);
    expect((result as PromiseRejectedResult).reason.message).toContain('300');
  });

  it('rejects a sparse figure cited without its denominator', async () => {
    const result = await attempt(
      `wolfSSL CVE-2026-0002 is newly revealed. Claude and maintainers disagreed on severity ` +
        `for 65 findings. ${padding}.`,
    );
    expect(result.status).toBe('rejected');
    expect((result as PromiseRejectedResult).reason.message).toContain('denominator');
  });

  it('rejects a negative duration the aggregates deliberately excluded', async () => {
    // 18 findings record a patch up to 38 days before discovery; those are
    // dropped from the median and must not surface as a published figure.
    const result = await attempt(
      `wolfSSL CVE-2026-0002 is newly revealed. Some patches landed 38 days before the bug ` +
        `was discovered. ${padding}.`,
    );
    expect(result.status).toBe('rejected');
    expect((result as PromiseRejectedResult).reason.message).toContain('38');
  });

  it('names the withdrawal surge in the post description', async () => {
    const surge: Trigger[] = [
      ...triggers,
      {
        kind: 'withdrawal_surge',
        delta: 12,
        total: 243,
        of_total: 2736,
        top_reason: 'mistake',
        top_reason_count: 137,
      },
    ];
    const callLlm = vi
      .fn()
      .mockResolvedValue(
        `wolfSSL CVE-2026-0002 is newly revealed. Mythos withdrew 12 more findings, ` +
          `243 of 2736 in total. ${padding}.`,
      );
    const post = await renderPost({
      oldDigest,
      newDigest: ledgerDigest,
      triggers: surge,
      allKnownCves,
      callLlm,
    });
    expect(post.frontmatter.triggers).toContain('withdrawal_surge');
    expect(post.frontmatter.description).toContain('Findings withdrawn.');
  });

  it('leaves posts without ledger aggregates unconstrained by the new checks', async () => {
    const callLlm = vi.fn().mockResolvedValue(`wolfSSL CVE-2026-0002 revealed. ${padding}.`);
    const post = await renderPost({ oldDigest, newDigest, triggers, allKnownCves, callLlm });
    expect(post.body).toContain('CVE-2026-0002');
  });
});

describe('buildUserPrompt()', () => {
  it('surfaces every ledger aggregate with the denominator it must be cited with', () => {
    const brief = buildUserPrompt(oldDigest, ledgerDigest, triggers);
    expect(brief).toContain('243 of 2736 findings');
    expect(brief).toContain('mistake 137 of 243');
    expect(brief).toContain('disagree on 65 of 117');
    expect(brief).toContain('agree on 52 of 117');
    expect(brief).toContain('130 days over 213 findings');
    expect(brief).toContain('50 days over 193 findings');
    // The excluded negatives are disclosed, not silently dropped.
    expect(brief).toContain('18 further findings were excluded');
  });

  it('omits the ledger section entirely when the digest carries no aggregates', () => {
    expect(buildUserPrompt(oldDigest, newDigest, triggers)).not.toContain('Ledger context');
  });
});
