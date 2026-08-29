import type { LedgerAggregates } from './ledger';

/**
 * Numeric guardrails for generated posts.
 *
 * The pre-existing CVE checks work because identifiers are a closed set of
 * distinctive tokens. Statistics are not, so the same guarantee is rebuilt
 * here as a whitelist: every numeral a post states must already appear in the
 * brief it was given, and the brief is rendered from the digest, which is
 * computed from the payload. A number the payload never produced cannot reach
 * a published post.
 *
 * Digits that are not statistical claims — identifiers, URLs, ISO dates and
 * markdown list markers — are stripped before extraction so they neither
 * trigger a false rejection nor silently widen the whitelist.
 */

const IDENTIFIER = /\b(?:CVE-\d{4}-\d{4,7}|GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})\b/gi;
const URL = /https?:\/\/\S+/g;
const ISO_DATE = /\d{4}-\d{2}-\d{2}(?:[T ][\d:.]+Z?)?/g;
const ORDERED_LIST_MARKER = /^[ \t]{0,3}\d+[.)][ \t]/gm;
const NUMBER = /\d[\d,]*(?:\.\d+)?/g;

/** A statistic that is only defensible alongside the denominator it came from. */
export type SparseFigure = { label: string; value: number; denominator: number };

/** Every numeral `text` asserts, in order of appearance, deduplicated. */
export function figuresIn(text: string): number[] {
  const stripped = text
    .replace(IDENTIFIER, ' ')
    .replace(URL, ' ')
    .replace(ISO_DATE, ' ')
    .replace(ORDERED_LIST_MARKER, ' ');
  const seen = new Set<number>();
  const out: number[] = [];
  for (const match of stripped.match(NUMBER) ?? []) {
    const n = Number(match.replace(/,/g, ''));
    if (Number.isNaN(n) || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

/** Figures the post states that the brief never supplied. */
export function unsupportedFigures(body: string, brief: string): number[] {
  const allowed = new Set<number>();
  for (const n of figuresIn(brief)) {
    // A post may legitimately render "55.6%" as "56%" or "55%"; anything
    // further from the source figure is a claim the brief does not support.
    allowed.add(n);
    allowed.add(Math.round(n));
    allowed.add(Math.trunc(n));
  }
  return figuresIn(body).filter((n) => !allowed.has(n));
}

/** Sparse figures the post cites without also citing their denominator. */
export function missingDenominators(body: string, sparse: SparseFigure[]): SparseFigure[] {
  const stated = new Set(figuresIn(body));
  return sparse.filter((f) => stated.has(f.value) && !stated.has(f.denominator));
}

/**
 * Every ledger aggregate whose meaning depends on a denominator, paired with
 * it. `maintainer_severity` covers 117 of 2,736 live entries and the latency
 * fields barely more, so "65 disagreements" without "of 117 rated pairs"
 * reads as a claim about the whole corpus.
 */
export function sparseFiguresFor(agg: LedgerAggregates): SparseFigure[] {
  const figures: SparseFigure[] = [];
  const push = (label: string, value: number | null, denominator: number): void => {
    if (value === null || value === 0 || denominator === 0) return;
    figures.push({ label, value, denominator });
  };

  const sev = agg.severity_agreement;
  push('severity disagreements', sev.disagree, sev.rated_pairs);
  push('severity agreements', sev.agree, sev.rated_pairs);
  push('findings Claude rated higher', sev.claude_higher, sev.rated_pairs);
  push('findings the maintainer rated higher', sev.maintainer_higher, sev.rated_pairs);
  push('severity disagreement rate', sev.disagree_pct, sev.rated_pairs);

  for (const [reason, count] of Object.entries(agg.withdrawals.by_reason)) {
    push(`withdrawals for reason "${reason}"`, count, agg.withdrawals.total);
  }

  push(
    'median days from discovery to reveal',
    agg.latency.discovery_to_reveal.median_days,
    agg.latency.discovery_to_reveal.sample,
  );
  push(
    'median days from discovery to patch',
    agg.latency.discovery_to_patch.median_days,
    agg.latency.discovery_to_patch.sample,
  );

  return figures;
}
