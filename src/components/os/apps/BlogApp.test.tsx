import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// UTC midnight is what z.coerce.date() produces from a bare YYYY-MM-DD
// frontmatter date — the one value that lands on the previous day in every
// western zone, and on the same day everywhere east of Greenwich.
const PUB_DATE = '2026-04-16T00:00:00.000Z';

const PAYLOAD = {
  posts: [
    {
      slug: 'boundary-post',
      title: 'Boundary post',
      description: 'Published at UTC midnight.',
      pubDate: PUB_DATE,
      updatedDate: null,
      tags: [],
    },
  ],
  fetchedAt: PUB_DATE,
};

const ORIGINAL_TZ = process.env.TZ;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  process.env.TZ = ORIGINAL_TZ;
});

/**
 * The formatter is module-level, so the zone is bound at import time —
 * resetModules() is what makes each zone a genuinely fresh construction.
 */
async function renderInZone(tz: string) {
  process.env.TZ = tz;
  vi.resetModules();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => structuredClone(PAYLOAD) }),
  );
  const { default: BlogApp } = await import('./BlogApp');
  render(<BlogApp />);
  return screen.findByText(/2026$/);
}

describe('BlogApp post dates', () => {
  // This renders in the viewer's browser, so an unpinned formatter shows a
  // reader in Los Angeles a different day than one in Berlin for the same post.
  it.each(['America/Los_Angeles', 'UTC', 'Asia/Tokyo'])(
    'renders the post date as its UTC calendar date in %s',
    async (tz) => {
      const date = await renderInZone(tz);
      expect(date.textContent).toBe('Apr 16, 2026');
    },
  );
});
