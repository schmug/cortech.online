#!/usr/bin/env node
/**
 * One-off backfill: rebuild /mythos as one post per reveal event.
 *
 * The tracker was dead from 2026-05-24 to 2026-08-29, so three months of
 * upstream reveals collapsed into a single 94-identifier catch-up post. Every
 * record in `cve_records[]` / `ghsa_records[]` carries `revealed_at`, so the
 * chronology is recoverable rather than invented: 118 identifiers land on ten
 * distinct days.
 *
 * Deliberately not wired into run.ts. Two invariants keep it from corrupting
 * the live pipeline:
 *
 *  1. It never writes snapshot.json — see writePost() in write.ts.
 *  2. It only emits triggers it can honestly reconstruct. `revealed` and
 *     `new_project` both follow from `revealed_at`. Corpus-wide bug-class
 *     counts and funnel rates are point-in-time-only values the payload keeps
 *     no history for, so digestAsOf() pins them identical on both sides of
 *     every diff, where triggersFor() cannot turn them into a bug_class_shift
 *     or funnel_shift that never happened. The ledger aggregates added in #218
 *     are left off both sides for the same reason — the ledger carries no
 *     per-reveal-date history, and triggersFor() requires both sides to have
 *     them, so no withdrawal_surge can be attributed to a day it cannot be
 *     dated to.
 *
 * Usage:
 *   npm run mythos:backfill -- --dry-run           # print, write nothing
 *   npm run mythos:backfill -- --only=2026-07-21   # a single reveal event
 *   npm run mythos:backfill -- --payload=<path>    # local payload, no refetch
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { fetchPayload } from './fetch';
import type { RawPayload, RevealRecord } from './digest';
import { triggersFor } from './triggers';
import { renderPost } from './generate';
import { claudeCliCallLlm, type CallLlm } from './llm';
import { prettyBody, writePost } from './write';
import type { Digest, Trigger } from './types';

const PAYLOAD_URL = 'https://red.anthropic.com/2026/cvd/data/payload.json';
const MODEL = 'claude-sonnet-4-6';
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const POSTS_DIR = join(REPO_ROOT, 'src/content/mythos');

/** One day of `headline.severity_cube`: items that landed that day, by severity cell. */
export type CubeDay = { date: string; cells: Record<string, number> };
export type CubeSeries = { days: CubeDay[] };

/** Only the series the backfill reads; the real cube carries more. */
export type SeverityCube = {
  disclosed: CubeSeries;
  acknowledged: CubeSeries;
  fixed_in_response: CubeSeries;
  advisories: CubeSeries;
  analyzed: CubeSeries;
  triaged: CubeSeries;
  verified: CubeSeries;
};

export type BackfillPayload = RawPayload & {
  first_disclosure_at: string;
  headline: RawPayload['headline'] & { severity_cube: SeverityCube };
};

export type RevealEvent = {
  /** UTC calendar date of the reveal, YYYY-MM-DD. */
  date: string;
  /** Latest revealed_at on that date — the moment the event finished landing. */
  pubDate: string;
  records: RevealRecord[];
};

function allRecords(raw: BackfillPayload): RevealRecord[] {
  return [...raw.cve_records, ...(raw.ghsa_records ?? [])];
}

/** Every identifier revealed on or before `date`, ascending. */
function revealedThrough(raw: BackfillPayload, date: string): RevealRecord[] {
  return allRecords(raw).filter((r) => r.revealed_at.slice(0, 10) <= date);
}

export function partitionByRevealDate(raw: BackfillPayload): RevealEvent[] {
  const byDate = new Map<string, RevealRecord[]>();
  for (const record of allRecords(raw)) {
    const date = record.revealed_at.slice(0, 10);
    const bucket = byDate.get(date);
    if (bucket) bucket.push(record);
    else byDate.set(date, [record]);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, records]) => ({
      date,
      pubDate: records.reduce((latest, r) => (r.revealed_at > latest ? r.revealed_at : latest), ''),
      records: [...records].sort((a, b) => a.identifier.localeCompare(b.identifier)),
    }));
}

export function previousDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Running total of a severity_cube series through `date`. The cube enumerates
 * every item by the day it landed and its days sum to the headline totals, so
 * the running total is the exact historical value — nothing is interpolated. A
 * series that stops before `date` contributes its full total, which is why the
 * three August events carry the dashboard's current numbers.
 */
function cumulative(series: CubeSeries, date: string): number {
  let total = 0;
  for (const day of series.days) {
    if (day.date > date) continue;
    for (const count of Object.values(day.cells)) total += count;
  }
  return total;
}

export function headlineAsOf(cube: SeverityCube, date: string): Digest['headline'] {
  return {
    disclosed: cumulative(cube.disclosed, date),
    acknowledged: cumulative(cube.acknowledged, date),
    fixed: cumulative(cube.fixed_in_response, date),
    advisories: cumulative(cube.advisories, date),
    candidates: cumulative(cube.analyzed, date),
    reviewed: cumulative(cube.triaged, date),
    verified: cumulative(cube.verified, date),
  };
}

/** Last day carried by any of the four series a post's headline_snapshot quotes. */
export function lastHeadlineDay(cube: SeverityCube): string {
  return [cube.disclosed, cube.acknowledged, cube.fixed_in_response, cube.advisories]
    .map((s) => s.days.at(-1)?.date ?? '')
    .reduce((a, b) => (b > a ? b : a), '');
}

/**
 * Dashboard state at the end of `date`.
 *
 * `headline`, `project_names` and `revealed_cve_ids` are genuine history, read
 * back out of the severity cube and the reveal timestamps. `by_bug_class`,
 * `by_ecosystem` and `rates` are corpus-wide, present-tense figures with no
 * per-day history in the payload — they are passed through unchanged so that
 * both sides of a diff hold identical values and triggersFor() cannot
 * manufacture a bug_class_shift or funnel_shift out of numbers we cannot date.
 * `ledger` is omitted entirely for the same reason: triggersFor() only raises a
 * withdrawal_surge when both sides carry aggregates, so leaving it unset keeps
 * undatable withdrawals out of a dated post.
 *
 * Note `project_names` is reveal-scoped here, where the live path takes it from
 * by_project (which includes projects with nothing revealed yet). Reveal-scoped
 * is the only version that can be dated, and it is what makes `new_project`
 * fire on a project's genuine first appearance.
 */
export function digestAsOf(raw: BackfillPayload, date: string): Digest {
  const revealed = revealedThrough(raw, date);
  return {
    as_of: revealed.reduce(
      (latest, r) => (r.revealed_at > latest ? r.revealed_at : latest),
      raw.first_disclosure_at,
    ),
    fetched_at: raw.as_of,
    headline: headlineAsOf(raw.headline.severity_cube, date),
    rates: {
      true_positive_pct: raw.headline.tpr_pct,
      median_days_to_ack: raw.median_days_to_ack,
      median_days_to_patch: raw.median_days_to_patch,
    },
    by_bug_class: { ...raw.by_bug_class },
    by_ecosystem: { ...raw.by_ecosystem },
    project_names: Array.from(
      new Set(revealed.flatMap((r) => r.findings.map((f) => f.project))),
    ).sort(),
    revealed_cve_ids: Array.from(new Set(revealed.map((r) => r.identifier))).sort(),
  };
}

/**
 * The raw-payload view triggersFor() enriches from, rewound to `date`.
 *
 * Two corrections over handing it the payload directly. `ecosystem` lives on
 * by_project rather than on each finding, so joining them replaces the
 * 'unknown' fallback with the real value. And by_project.cve_ids is the current
 * list, so it is filtered to what had actually been revealed by `date` —
 * otherwise a new_project trigger would hand this post identifiers belonging to
 * a later event, and they could surface in two posts at once.
 */
export function enrichmentView(raw: BackfillPayload, date: string) {
  const ecosystems = new Map(raw.by_project.map((p) => [p.project, p.ecosystem]));
  const revealedIds = new Set(revealedThrough(raw, date).map((r) => r.identifier));
  const rewind = (records: RevealRecord[]) =>
    records.map((r) => ({
      identifier: r.identifier,
      findings: r.findings.map((f) => ({
        project: f.project,
        bug_class: f.bug_class,
        ecosystem: ecosystems.get(f.project) ?? 'unknown',
      })),
    }));
  return {
    cve_records: rewind(raw.cve_records),
    ghsa_records: rewind(raw.ghsa_records ?? []),
    by_project: raw.by_project.map((p) => ({
      project: p.project,
      ecosystem: p.ecosystem,
      cve_ids: p.cve_ids.filter((id) => revealedIds.has(id)),
    })),
  };
}

/**
 * The disclosure line appended to every backfilled body. Backdating pubDate
 * without it would imply these posts went out live on the day they cover.
 */
export function backfillNote(
  event: RevealEvent,
  payloadAsOf: string,
  lastHeadlineDate: string,
): string {
  const parts = [
    `Backfilled: reconstructed from the \`revealed_at\` timestamps in Anthropic's CVD payload ` +
      `(as of ${payloadAsOf}), not published live on ${event.date}.`,
  ];
  if (event.date > lastHeadlineDate) {
    parts.push(
      `The dashboard's daily series ends ${lastHeadlineDate}, so the headline counts above are ` +
        `its current totals rather than same-day values.`,
    );
  }
  return `_${parts.join(' ')}_`;
}

export function eventGuidance(event: RevealEvent): string {
  const scope = [
    `This post covers one historical reveal event: the ${event.records.length} identifiers above`,
    `were revealed on ${event.date}. Write it as of that day. Do not date the post to today, and`,
    `do not mention any date later than ${event.date}. Do not assert patch status, a project's`,
    `past vulnerability history, or anything else the data above does not state.`,
  ].join(' ');
  // Left to itself the model opens on the first identifier and stops on a bare
  // statistics line. An archive post has to frame the day before listing it and
  // say what it amounted to afterwards.
  //
  // The framing is deliberately qualitative. Asking it to open with "how many
  // landed" made it count the triggers and state totals the brief never gave,
  // which renderPost's figure whitelist rejects — the 2026-08-19 event failed
  // both attempts on exactly that.
  const shape = [
    `Shape it in three parts. Open with two or three sentences of prose that frame the day before`,
    `naming a single identifier: which projects carry it, which bug classes dominate, and where`,
    `that leaves the running totals given above. Then the per-project detail, with every required`,
    `identifier named. Close with two or three sentences that step back and say what the day`,
    `amounts to, drawing only on the figures above — do not stop abruptly on the last identifier`,
    `or on a bare statistics line. The credit line to the dashboard comes last.`,
    ``,
    `Do not count the identifiers or bug classes yourself and state the tally: every numeral you`,
    `write must already appear in the brief above. Write any date in ISO form (${event.date}),`,
    `never as prose like "August 19".`,
  ].join(' ');
  return `${scope}\n\n${shape}`;
}

/** Any YYYY-MM-DD in the body that postdates the event it covers. */
export function futureDatesIn(body: string, eventDate: string): string[] {
  return Array.from(new Set(body.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? []))
    .filter((d) => d > eventDate)
    .sort();
}

/**
 * Scopes generation to one reveal event and rejects a draft that dates itself
 * after it — the first pass stamped the machine's current date into the
 * heading of a post backdated to July.
 *
 * The check lives in callLlm rather than after renderPost() because renderPost
 * treats a throw as a failed attempt and retries with the message appended: an
 * extra guardrail here asks for a rewrite instead of silently accepting one.
 */
export function eventScopedLlm(base: CallLlm, event: RevealEvent): CallLlm {
  return async (system, user) => {
    const body = await base(system, `${user}\n\n${eventGuidance(event)}`);
    const future = futureDatesIn(body, event.date);
    if (future.length > 0) {
      throw new Error(
        `body dates itself after the reveal event: ${future.join(', ')} is later than ${event.date}`,
      );
    }
    return body;
  };
}

function summarize(event: RevealEvent): string {
  const projects = new Map<string, number>();
  const classes = new Map<string, number>();
  for (const record of event.records) {
    for (const finding of record.findings) {
      projects.set(finding.project, (projects.get(finding.project) ?? 0) + 1);
      classes.set(finding.bug_class, (classes.get(finding.bug_class) ?? 0) + 1);
    }
  }
  const top = (m: Map<string, number>, n: number) =>
    Array.from(m.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, n)
      .map(([k, v]) => `${k}(${v})`)
      .join(', ');
  return `${String(projects.size).padStart(2)} projects | ${top(classes, 2)} | ${top(projects, 3)}`;
}

function countKinds(triggers: Trigger[]): string {
  const counts = new Map<string, number>();
  for (const t of triggers) counts.set(t.kind, (counts.get(t.kind) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([k, v]) => `${k}×${v}`)
    .join(', ');
}

function flag(args: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  return args.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const only = flag(args, 'only');
  const payloadPath = flag(args, 'payload');

  const raw = (
    payloadPath
      ? (JSON.parse(readFileSync(payloadPath, 'utf8')) as unknown)
      : await fetchPayload(PAYLOAD_URL)
  ) as BackfillPayload;

  const events = partitionByRevealDate(raw);
  const total = events.reduce((n, e) => n + e.records.length, 0);
  console.log(`[backfill] ${total} identifiers across ${events.length} reveal events`);
  for (const event of events) {
    console.log(
      `[backfill]   ${event.date}  ${String(event.records.length).padStart(3)}  ${summarize(event)}`,
    );
  }

  const selected = only ? events.filter((e) => e.date === only) : events;
  if (selected.length === 0) bail(`--only=${only} matched no reveal event`, 1);

  const callLlm = claudeCliCallLlm({ model: MODEL });

  for (const event of selected) {
    const oldDigest = digestAsOf(raw, previousDay(event.date));
    const newDigest = digestAsOf(raw, event.date);
    const triggers = triggersFor(oldDigest, newDigest, enrichmentView(raw, event.date));
    console.log(`[backfill] ${event.date}: ${triggers.length} triggers — ${countKinds(triggers)}`);

    const post = await renderPost({
      oldDigest,
      newDigest,
      triggers,
      // Scoped to what had been revealed by this event, so the hallucination
      // check also rejects identifiers from a later event.
      allKnownCves: newDigest.revealed_cve_ids,
      callLlm: eventScopedLlm(callLlm, event),
      now: new Date(event.pubDate),
    });
    post.frontmatter.backfilled = true;
    post.body = await prettyBody(
      `${post.body}\n\n${backfillNote(event, raw.as_of, lastHeadlineDay(raw.headline.severity_cube))}`,
    );

    if (dryRun) {
      console.log(`--- ${post.slug}.md ---`);
      console.log(JSON.stringify(post.frontmatter, null, 2));
      console.log(post.body);
      continue;
    }
    await writePost({ post, postsDir: POSTS_DIR });
    console.log(
      `[backfill] wrote ${post.slug}.md (${post.frontmatter.cve_ids.length} identifiers)`,
    );
  }
  console.log('[backfill] snapshot.json left untouched by design');
}

function bail(msg: string, code: number): never {
  console.error(`[backfill] FATAL: ${msg}`);
  process.exit(code);
}

const invokedDirectly =
  process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (invokedDirectly) {
  main().catch((err: unknown) => {
    if (err instanceof Error) {
      console.error(`[backfill] FATAL: ${err.message}`);
      if ('cause' in err && err.cause) console.error('  cause:', err.cause);
      if ('draft' in err && err.draft) console.error('  draft:', err.draft);
      if (err.stack) console.error(err.stack);
    } else {
      console.error('[backfill] FATAL (non-Error):', err);
    }
    process.exit(1);
  });
}
