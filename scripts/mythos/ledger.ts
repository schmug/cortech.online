/**
 * Aggregation over the payload's `ledger[]` array (2,736 entries in the live
 * payload). Field coverage is sparse and uneven — `reveal_tier` is present on
 * every entry while `maintainer_severity` is present on ~4% — so every
 * aggregate derived from a sparse field carries its own denominator. Callers
 * must render those denominators; `sparseFiguresFor()` in validate.ts turns
 * that requirement into a check.
 */

export type LedgerEntry = {
  claude_severity?: string | null;
  maintainer_severity?: string | null;
  discovered_on?: string | null;
  revealed_at?: string | null;
  patched_at?: string | null;
  reveal_tier?: string | null;
  withdrawn?: boolean | null;
  withdrawn_reason?: string | null;
};

export type LatencyStat = {
  /** Median over non-negative durations only; null when the sample is empty. */
  median_days: number | null;
  /** Entries counted in the median — the denominator for `median_days`. */
  sample: number;
  /** Entries dropped because the end date precedes the start date. */
  excluded_negative: number;
};

export type SeverityAgreement = {
  /** Entries rated by both Claude and a maintainer — the denominator. */
  rated_pairs: number;
  agree: number;
  disagree: number;
  claude_higher: number;
  maintainer_higher: number;
  /** disagree / rated_pairs as a percentage, to one decimal place. */
  disagree_pct: number;
};

export type LedgerAggregates = {
  total: number;
  withdrawals: { total: number; by_reason: Record<string, number> };
  /** reveal_tier -> count. Partitions all `total` entries. */
  funnel: Record<string, number>;
  severity_agreement: SeverityAgreement;
  latency: { discovery_to_reveal: LatencyStat; discovery_to_patch: LatencyStat };
};

const SEVERITY_RANK: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

export function aggregateLedger(entries: LedgerEntry[]): LedgerAggregates {
  return {
    total: entries.length,
    withdrawals: withdrawals(entries),
    funnel: funnel(entries),
    severity_agreement: severityAgreement(entries),
    latency: {
      discovery_to_reveal: latency(entries, 'revealed_at'),
      discovery_to_patch: latency(entries, 'patched_at'),
    },
  };
}

function withdrawals(entries: LedgerEntry[]): LedgerAggregates['withdrawals'] {
  // `withdrawn_reason` is populated on 4 live entries whose `withdrawn` is
  // false; keying off the boolean keeps the reason counts summing to `total`.
  const withdrawn = entries.filter((e) => e.withdrawn === true);
  const byReason: Record<string, number> = {};
  for (const e of withdrawn) {
    const reason = e.withdrawn_reason ?? 'unspecified';
    byReason[reason] = (byReason[reason] ?? 0) + 1;
  }
  return { total: withdrawn.length, by_reason: sortKeys(byReason) };
}

function funnel(entries: LedgerEntry[]): Record<string, number> {
  const tiers: Record<string, number> = {};
  for (const e of entries) {
    const tier = e.reveal_tier ?? 'unknown';
    tiers[tier] = (tiers[tier] ?? 0) + 1;
  }
  return sortKeys(tiers);
}

function severityAgreement(entries: LedgerEntry[]): SeverityAgreement {
  let agree = 0;
  let claudeHigher = 0;
  let maintainerHigher = 0;
  for (const e of entries) {
    const claude = SEVERITY_RANK[e.claude_severity ?? ''];
    const maintainer = SEVERITY_RANK[e.maintainer_severity ?? ''];
    if (claude === undefined || maintainer === undefined) continue;
    if (claude === maintainer) agree++;
    else if (claude > maintainer) claudeHigher++;
    else maintainerHigher++;
  }
  const disagree = claudeHigher + maintainerHigher;
  const ratedPairs = agree + disagree;
  return {
    rated_pairs: ratedPairs,
    agree,
    disagree,
    claude_higher: claudeHigher,
    maintainer_higher: maintainerHigher,
    disagree_pct: ratedPairs === 0 ? 0 : round1((disagree / ratedPairs) * 100),
  };
}

function latency(entries: LedgerEntry[], endField: 'revealed_at' | 'patched_at'): LatencyStat {
  const durations: number[] = [];
  let excludedNegative = 0;
  for (const e of entries) {
    const start = Date.parse(e.discovered_on ?? '');
    const end = Date.parse(e[endField] ?? '');
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    const days = Math.round((end - start) / 86_400_000);
    // The live payload's dates are not strictly ordered: 18 entries patch
    // before they are discovered (min -38 days). A negative duration is not
    // publishable and must not shift the median, so drop it and report how
    // many were dropped.
    if (days < 0) {
      excludedNegative++;
      continue;
    }
    durations.push(days);
  }
  durations.sort((a, b) => a - b);
  return {
    median_days: median(durations),
    sample: durations.length,
    excluded_negative: excludedNegative,
  };
}

function median(sorted: number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = sorted.length / 2;
  if (sorted.length % 2 === 1) return sorted[Math.floor(mid)];
  return round1((sorted[mid - 1] + sorted[mid]) / 2);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function sortKeys(counts: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}
