import { test, expect } from '@playwright/test';

// Rendered from e2e/fixtures/frontier-manifest.json, which playwright.config.ts
// feeds to the web server as FRONTIER_MANIFEST_URL. Without it the episode
// route is not generated at all, so these tests fail rather than pass empty.
const EPISODE_URL = '/frontier-commits/e2e-frontier-fixture/';

test.describe('frontier commits show page', () => {
  test('lists episodes from the manifest and links each one', async ({ page }) => {
    await page.goto('/frontier-commits');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Frontier Commits');
    await expect(page.getByRole('img', { name: /cover art/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /E2E Fixture Week/ })).toHaveAttribute(
      'href',
      EPISODE_URL,
    );
    // The empty state must not render while the manifest has episodes.
    await expect(page.getByText('No episodes yet')).toHaveCount(0);
  });

  test('cross-links the daily show, and the daily show links back', async ({ page }) => {
    await page.goto('/frontier-commits');
    await expect(page.getByRole('link', { name: 'Cortech Daily' })).toHaveAttribute(
      'href',
      '/podcast',
    );

    await page.goto('/podcast');
    await expect(page.getByRole('link', { name: 'Frontier Commits' })).toHaveAttribute(
      'href',
      '/frontier-commits',
    );
  });

  test('renders the episode page with audio and chapter jumps', async ({ page }) => {
    await page.goto(EPISODE_URL);

    await expect(page.locator('audio#episode-audio')).toHaveAttribute(
      'src',
      'https://example.com/e2e-frontier-fixture.mp3',
    );
    await expect(page.locator('.chapter-jump')).toHaveCount(3);
  });

  test('serves an itunes feed carrying the episode enclosure', async ({ request }) => {
    const res = await request.get('/frontier-commits/rss.xml');
    expect(res.status()).toBe(200);

    const xml = await res.text();
    expect(xml).toContain('<title>Frontier Commits</title>');
    expect(xml).toContain('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"');
    expect(xml).toContain('<itunes:email>clodcast@cortech.online</itunes:email>');
    expect(xml).toContain('https://cortech.online/frontier-commits-cover.jpg');
    expect(xml).toContain('url="https://example.com/e2e-frontier-fixture.mp3"');
    expect(xml).toContain('length="5242880"');
    expect(xml).toContain('type="audio/mpeg"');
  });

  test('serves the show cover as a real image asset', async ({ request }) => {
    const res = await request.get('/frontier-commits-cover.jpg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/jpeg');
  });
});
