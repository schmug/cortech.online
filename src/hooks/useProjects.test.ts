import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { relativeTime } from './useProjects';

describe('relativeTime', () => {
  const NOW = new Date('2026-04-14T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "today" for timestamps less than ~12h old', () => {
    // 6h earlier → 0.25d → Math.round → 0 → "today"
    expect(relativeTime('2026-04-14T06:00:00Z')).toBe('today');
  });

  it('returns "Nd ago" for days under 30', () => {
    const t = new Date(NOW);
    t.setDate(t.getDate() - 5);
    expect(relativeTime(t.toISOString())).toBe('5d ago');
  });

  it('returns "Nmo ago" for days 30..364', () => {
    const t = new Date(NOW);
    t.setDate(t.getDate() - 90);
    expect(relativeTime(t.toISOString())).toBe('3mo ago');
  });

  it('returns "Ny ago" for 365+ days', () => {
    const t = new Date(NOW);
    t.setFullYear(t.getFullYear() - 2);
    expect(relativeTime(t.toISOString())).toBe('2y ago');
  });

  it('30-day boundary: 29 days → "29d ago", 30 days → "1mo ago"', () => {
    const t29 = new Date(NOW);
    t29.setDate(t29.getDate() - 29);
    expect(relativeTime(t29.toISOString())).toBe('29d ago');

    const t30 = new Date(NOW);
    t30.setDate(t30.getDate() - 30);
    expect(relativeTime(t30.toISOString())).toBe('1mo ago');
  });

  it('365-day boundary: ~11mo → "Nmo ago", 365 days → "1y ago"', () => {
    const t364 = new Date(NOW);
    t364.setDate(t364.getDate() - 364);
    // 364/30 ≈ 12.13 → rounds to 12
    expect(relativeTime(t364.toISOString())).toBe('12mo ago');

    const t365 = new Date(NOW);
    t365.setDate(t365.getDate() - 365);
    expect(relativeTime(t365.toISOString())).toBe('1y ago');
  });
});
