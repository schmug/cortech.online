import { test, expect } from '@playwright/test';

// Rendered from e2e/fixtures/show-your-work-manifest.json, which
// playwright.config.ts feeds to the web server as SHOW_YOUR_WORK_MANIFEST_URL.
// Without it the episode route is not generated at all, so these tests fail
// rather than pass empty.
const SLUG = 'syw-week-of-january-5-2026';
const EPISODE_URL = `/show-your-work/${SLUG}/`;

test.describe('show your work show page', () => {
  test('lists episodes from the manifest and links each one', async ({ page }) => {
    await page.goto('/show-your-work');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Show Your Work');
    await expect(page.getByRole('img', { name: /cover art/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /E2E Fixture Week/ })).toHaveAttribute(
      'href',
      EPISODE_URL,
    );
    // The empty state must not render while the manifest has episodes.
    await expect(page.getByText('No episodes yet')).toHaveCount(0);
  });

  test('carries the disclosure on the page, not only in the feed', async ({ page }) => {
    await page.goto('/show-your-work');
    await expect(page.locator('main')).toContainText(
      'written and voiced by Claude, an Anthropic model',
    );
    await expect(page.locator('main')).toContainText('Anthropic is one of the labs it covers');
  });

  test('cross-links the other shows, and they link back', async ({ page }) => {
    await page.goto('/show-your-work');
    await expect(page.getByRole('link', { name: 'Cortech Daily' })).toHaveAttribute(
      'href',
      '/podcast',
    );
    await expect(page.getByRole('link', { name: 'Frontier Commits' })).toHaveAttribute(
      'href',
      '/frontier-commits',
    );

    for (const path of ['/podcast', '/frontier-commits']) {
      await page.goto(path);
      await expect(page.getByRole('link', { name: 'Show Your Work' })).toHaveAttribute(
        'href',
        '/show-your-work',
      );
    }
  });

  test('renders the episode page with audio and chapter jumps', async ({ page }) => {
    await page.goto(EPISODE_URL);

    await expect(page.locator('audio#episode-audio')).toHaveAttribute(
      'src',
      `https://example.com/show-your-work/${SLUG}.mp3`,
    );
    await expect(page.locator('.chapter-jump')).toHaveCount(3);
  });

  test('serves an itunes feed whose guid is the episode page URL', async ({ request }) => {
    const res = await request.get('/show-your-work/rss.xml');
    expect(res.status()).toBe(200);

    const xml = await res.text();
    expect(xml).toContain('<title>Show Your Work</title>');
    expect(xml).toContain('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"');
    expect(xml).toContain('<itunes:email>clodcast@cortech.online</itunes:email>');
    expect(xml).toContain('https://cortech.online/show-your-work-cover.jpg');
    expect(xml).toContain(`url="https://example.com/show-your-work/${SLUG}.mp3"`);
    expect(xml).toContain('length="13631488"');
    expect(xml).toContain('type="audio/mpeg"');
    expect(xml).not.toContain('<itunes:episode>');

    const link = xml.match(/<item>[\s\S]*?<link>([^<]*)<\/link>/)?.[1];
    const guid = xml.match(/<item>[\s\S]*?<guid isPermaLink="true">([^<]*)<\/guid>/)?.[1];
    expect(link).toBe(`https://cortech.online${EPISODE_URL}`);
    expect(guid).toBe(link);
  });

  test('serves the show cover as a real image asset', async ({ request }) => {
    const res = await request.get('/show-your-work-cover.jpg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/jpeg');
  });
});
