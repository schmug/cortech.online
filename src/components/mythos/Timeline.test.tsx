import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Timeline, { type HistoryRow } from './Timeline';

/** A backfilled row: real counts from the severity cube, no measurable medians. */
function backfilled(date: string, disclosed: number): HistoryRow {
  return {
    date,
    disclosed,
    acknowledged: Math.floor(disclosed * 0.8),
    fixed: Math.floor(disclosed * 0.2),
    advisories: Math.floor(disclosed * 0.2),
    severity: { critical: 1, high: 1, medium: 1, low: 1, unknown: disclosed - 4 },
  };
}

/** A live row: same shape plus the medians a tracker run actually measured. */
function live(date: string, disclosed: number): HistoryRow {
  return { ...backfilled(date, disclosed), median_days_to_ack: 0, median_days_to_patch: 13.7 };
}

const BACKFILLED = [
  backfilled('2025-11-27', 10),
  backfilled('2026-03-29', 424),
  backfilled('2026-08-10', 2300),
];

afterEach(cleanup);

describe('Timeline with backfilled rows that have no medians', () => {
  it('renders the funnel view without a lag readout', () => {
    render(<Timeline history={BACKFILLED} />);
    expect(screen.getByText('Ack debt')).toBeTruthy();
    expect(screen.queryByText(/Median patch lag/)).toBeNull();
    expect(screen.queryByText('Median lag (days)')).toBeNull();
  });

  it('renders the severity view without error', async () => {
    render(<Timeline history={BACKFILLED} />);
    await userEvent.click(screen.getByRole('button', { name: /severity bands/i }));
    expect(screen.getByText('Critical')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
  });

  it('charts the last row, so the right edge matches the headline it came from', () => {
    render(<Timeline history={BACKFILLED} />);
    // The Disclosed legend chip reads the active (last) row.
    expect(screen.getByRole('button', { name: /disclosed 2300/i })).toBeTruthy();
  });
});

describe('Timeline with a mixed backfilled + live series', () => {
  const mixed = [...BACKFILLED, live('2026-08-26', 2300)];

  it('shows the lag bar once any row carries a measured median', () => {
    render(<Timeline history={mixed} />);
    expect(screen.getByText('Median lag (days)')).toBeTruthy();
    expect(screen.getByText(/Median patch lag/)).toBeTruthy();
    // Once in the funnel readout, once in the lag chip.
    expect(screen.getAllByText(/13\.7d/)).toHaveLength(2);
  });

  it('draws the lag sparkline only over the days that measured one', () => {
    const { container } = render(<Timeline history={mixed} />);
    const paths = Array.from(container.querySelectorAll('path'))
      .map((p) => p.getAttribute('d') ?? '')
      .filter((d) => d.startsWith('M') && !d.endsWith('Z'));
    // Three median-less rows then one live row: the lag path is a single
    // moveto, never a line bridging the gap from a value that was not recorded.
    const lagPaths = paths.filter((d) => (d.match(/[ML]/g) ?? []).length === 1);
    expect(lagPaths.length).toBeGreaterThan(0);
    for (const d of lagPaths) expect(d).not.toContain('L');
  });

  it('labels the lag chips n/a when the scrubbed day measured none', async () => {
    render(<Timeline history={mixed} />);
    const figure = screen.getByRole('figure');
    figure.focus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByText(/ack n\/a/)).toBeTruthy();
    expect(screen.getByText(/patch n\/a/)).toBeTruthy();
    expect(screen.queryByText(/Median patch lag/)).toBeNull();
  });
});
