import { test, expect } from '@playwright/test';

// The smallest phones we care about (iPhone SE / small Android). Below ~375px the
// header nav wraps onto its own line; what's asserted here is only that nothing
// ever spills past the viewport, so the layout is free to reflow as it likes.
const NARROW = { width: 320, height: 640 };

// Content pages that render the shared header/footer from src/layouts/Base.astro.
// `/` is excluded — it hydrates the OS shell, which owns its own layout. Episode
// detail pages (`/podcast/<slug>`, `/frontier-commits/<slug>`) are excluded
// because their slugs come from a remote manifest at build time; both show
// indexes are deterministic (the fetch degrades to an empty list) so they are
// covered here.
const BASE_LAYOUT_PAGES = [
  '/about',
  '/projects',
  '/blog',
  '/mythos',
  '/feeds',
  '/podcasts',
  '/podcast',
  '/frontier-commits',
];

/** Elements whose right edge sticks out past the viewport, with a 1px slack for
 * subpixel rounding. Returns tag + class so a failure names the culprit. */
async function overflowingElements(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const offenders = Array.from(document.querySelectorAll('body *'))
      .filter((el) => el.getBoundingClientRect().right > clientWidth + 1)
      .map((el) => `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}">`);
    return {
      clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      offenders,
    };
  });
}

test.describe('320px viewport', () => {
  test.use({ viewport: NARROW });

  for (const path of BASE_LAYOUT_PAGES) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const { clientWidth, scrollWidth, offenders } = await overflowingElements(page);
      expect(offenders, `elements wider than the ${clientWidth}px viewport`).toEqual([]);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }

  test('header nav links stay inside the viewport', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    const nav = page.locator('header nav[aria-label="Primary"]');
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    for (const link of await nav.getByRole('link').all()) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(clientWidth + 1);
    }
  });
});
