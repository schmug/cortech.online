import { test, expect } from '@playwright/test';
import { SHOWS, listenLinks } from '../src/lib/shows';

// Each show is listed on Spotify, Apple Podcasts, and YouTube, which is where
// listeners actually are. The links are the whole point of the surface, so
// assert the exact href rather than just "a link exists" — a `?si=` share token
// or a stale show id would still render a perfectly clickable, wrong link. A
// show listed nowhere (RSS-first) renders no listen links and leads with its
// feed; shows.test.ts covers that path, since no current show takes it.

test.describe('show pages link every platform', () => {
  for (const show of SHOWS) {
    test(`${show.pagePath} links ${show.name} on each platform, feed intact`, async ({ page }) => {
      await page.goto(show.pagePath);

      for (const { label, url } of listenLinks(show)) {
        const link = page.locator(`main a[href="${url}"]`);
        await expect(link, `${show.name} ${label} link`).toBeVisible();
        await expect(link).toHaveText(new RegExp(label));
      }

      // The platforms lead, but the feed is what any other client subscribes to.
      await expect(page.locator(`main a[href="${show.feedPath}"]`).first()).toBeVisible();
    });
  }
});

test.describe('/podcasts index', () => {
  // The nav item has always been labelled "Podcasts" while landing on Cortech
  // Daily's own show page. This page is what the plural promises: every show in
  // one place, rendered from SHOWS so a third one needs no edit here.

  test('renders a complete card for every show', async ({ page }) => {
    await page.goto('/podcasts');

    for (const show of SHOWS) {
      const card = page.locator('main li', { hasText: show.name }).first();

      await expect(card.getByRole('link', { name: show.name })).toHaveAttribute(
        'href',
        show.pagePath,
      );
      for (const { label, url } of listenLinks(show)) {
        await expect(card.locator(`a[href="${url}"]`), `${show.name} ${label} link`).toBeVisible();
      }
      await expect(
        card.locator(`a[href="${show.feedPath}"]`),
        `${show.name} feed link`,
      ).toBeVisible();
      await expect(card.getByRole('img', { name: `${show.name} cover art` })).toBeVisible();
    }
  });

  test('is where the primary nav sends Podcasts', async ({ page }) => {
    await page.goto('/about');
    await expect(
      page.locator('header nav[aria-label="Primary"]').getByRole('link', { name: 'Podcasts' }),
    ).toHaveAttribute('href', '/podcasts');
  });

  // /podcast and /podcasts are one character apart and both land in the
  // sitemap. Distinct canonicals are what keeps them from reading as a
  // duplicate of each other.
  test('declares its own canonical', async ({ page }) => {
    await page.goto('/podcasts');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://cortech.online/podcasts',
    );
  });
});

test.describe('homepage static layer', () => {
  // The static layer is hidden the moment JS runs, so it can only be asserted
  // with JS off — which is also exactly how crawlers and no-JS visitors see it.
  test.use({ javaScriptEnabled: false });

  test('lists every show with its listen links or, failing that, its feed', async ({ page }) => {
    await page.goto('/');

    const podcasts = page.locator('#static-layer section', { hasText: 'Podcasts' }).first();
    await expect(podcasts).toBeVisible();

    for (const show of SHOWS) {
      await expect(podcasts.getByRole('link', { name: show.name })).toHaveAttribute(
        'href',
        show.pagePath,
      );
      const links = listenLinks(show);
      const hrefs = links.length > 0 ? links.map((l) => l.url) : [show.feedPath];
      for (const href of hrefs) {
        await expect(podcasts.locator(`a[href="${href}"]`), `${show.name} ${href}`).toBeVisible();
      }
      await expect(podcasts.getByRole('img', { name: `${show.name} cover art` })).toBeVisible();
    }
  });

  test('offers Podcasts in the header nav', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('#static-layer header').getByRole('link', { name: 'Podcasts' }),
    ).toHaveAttribute('href', '/podcasts');
  });
});

test.describe('CortechOS Podcasts app', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // Fonts are blocked because page.goto otherwise hangs on document.fonts.ready.
  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
      route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
    );
  });

  test('opens from its desktop icon and links every show to its page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const splash = page.locator('[aria-label="CortechOS booting"]');
    await splash.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await page.keyboard.press('Space');
    await splash.waitFor({ state: 'hidden', timeout: 10_000 });
    await expect(page.locator('#ct-desktop')).toBeVisible({ timeout: 15_000 });

    await page.locator('button[aria-label="Open Podcasts"]').click();
    const win = page.locator('section[aria-label="Podcasts window"]');
    await expect(win).toBeVisible();

    for (const show of SHOWS) {
      await expect(win.getByRole('heading', { name: show.name })).toBeVisible();
      for (const { url } of listenLinks(show)) {
        await expect(win.locator(`a[href="${url}"]`)).toHaveCount(1);
      }
      await expect(win.locator(`a[href="${show.pagePath}"]`)).toHaveCount(1);
    }
  });
});
