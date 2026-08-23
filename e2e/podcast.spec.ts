import { test, expect } from '@playwright/test';

// Rendered from e2e/fixtures/podcast-manifest.json, which playwright.config.ts
// feeds to the web server as EPISODES_MANIFEST_URL. Without it the podcast
// routes are not generated at all, so these tests fail rather than pass empty.
const EPISODE_URL = '/podcast/e2e-fixture-episode/';

test.describe('podcast episode page', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('long chapter source URLs wrap instead of overflowing the viewport', async ({ page }) => {
    await page.goto(EPISODE_URL);

    // Guard against a vacuous pass: if the manifest never loaded there would be
    // no chapter links to overflow in the first place.
    await expect(page.locator('ol li a[href^="https://"]')).toHaveCount(2);

    const overflowing = await page.evaluate(() => {
      const limit = document.documentElement.clientWidth;
      return [...document.querySelectorAll('main *')]
        .filter((el) => el.getBoundingClientRect().right > limit + 1)
        .map((el) => `${el.tagName}: ${(el.textContent ?? '').trim().slice(0, 60)}`);
    });
    expect(overflowing).toEqual([]);

    const { clientWidth, scrollWidth } = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
