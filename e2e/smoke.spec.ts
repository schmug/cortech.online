import { test, expect, devices, type ConsoleMessage, type Page } from '@playwright/test';

const IFRAME_APPS = [
  { id: 'dmarc-mx', name: 'dmarc.mx', url: 'https://dmarc.mx' },
  { id: 'donthype-me', name: 'donthype.me', url: 'https://donthype.me' },
  { id: 'apartment-stager', name: 'apartment-stager', url: 'https://apartment-stager.pages.dev/' },
  { id: 'qr-me', name: 'q-r.contact', url: 'https://q-r.contact' },
] as const;

// Dev-mode noise we accept. Anything else fails the assertion.
const CONSOLE_NOISE = [
  /\[vite\]/i,
  /\[HMR\]/i,
  /Download the React DevTools/i,
  /favicon\.svg/i,
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
];

type CapturedMessage = { type: string; text: string };

function captureConsole(page: Page): CapturedMessage[] {
  const captured: CapturedMessage[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      captured.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', (err) => {
    captured.push({ type: 'pageerror', text: err.message });
  });
  return captured;
}

function filterNoise(messages: CapturedMessage[]): CapturedMessage[] {
  return messages.filter((m) => !CONSOLE_NOISE.some((re) => re.test(m.text)));
}

async function dismissBootSplash(page: Page) {
  const splash = page.locator('[aria-label="CortechOS booting"]');
  // Wait for splash to mount so the keydown listener is actually attached.
  await splash.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  await page.keyboard.press('Space');
  await splash.waitFor({ state: 'hidden', timeout: 10_000 });
}

// Block external font CDN — otherwise page.goto and page.screenshot hang on
// `document.fonts.ready`. Fulfill (vs abort) keeps the console clean.
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' })
  );
});

test.describe('desktop golden path', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('boots, opens windows via icon and launcher, ⌘K toggles, Esc closes', async ({ page }, testInfo) => {
    const messages = captureConsole(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissBootSplash(page);

    // Generous timeout for first-run Vite lazy-chunk compilation.
    await expect(page.locator('#ct-desktop')).toBeVisible({ timeout: 15_000 });
    await page.screenshot({ path: testInfo.outputPath('1-booted.png') });

    // About auto-opens on first boot; clicking the icon focuses the singleton.
    await page.locator('button[aria-label="Open About Cory"]').click();
    await expect(page.locator('section[aria-label="About Cory window"]')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('2-about-open.png') });

    // Brand-mark regression: AboutApp header renders the full mark as an <img>, not an emoji.
    const aboutAvatar = page.locator('section[aria-label="About Cory window"] img[src="/mark.svg"]');
    await expect(aboutAvatar).toBeVisible();

    await page.locator('button[aria-label="Open launcher"]').click();
    const launcher = page.locator('[role="dialog"][aria-label="App launcher"]');
    await expect(launcher).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('3-launcher-open.png') });

    await page.locator('input[aria-label="Search apps"]').fill('proj');
    await page.keyboard.press('Enter');
    await expect(page.locator('section[aria-label="Projects window"]')).toBeVisible();
    await expect(launcher).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath('4-projects-open.png') });

    // ⌘K toggles launcher (useKeyboard accepts metaKey || ctrlKey)
    await page.keyboard.press('Meta+K');
    await expect(launcher).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(launcher).toBeHidden();

    const realErrors = filterNoise(messages);
    expect(
      realErrors,
      `Unexpected console output:\n${realErrors.map((m) => `  [${m.type}] ${m.text}`).join('\n')}`
    ).toEqual([]);
  });
});

// Strip defaultBrowserType — can't change browser at describe scope, only viewport/UA matter.
const { defaultBrowserType: _ignoredBrowser, ...iPhone14 } = devices['iPhone 14'];

test.describe('mobile springboard', () => {
  test.use(iPhone14);

  test('home grid + dock render, tap opens app fullscreen, back returns home', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // MobileShell mounts immediately — no boot splash.
    const grid = page.locator('[data-testid="home-grid"]');
    await expect(grid).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#ct-desktop')).toHaveCount(0);

    // All 7 registry apps rendered as tiles.
    const tiles = grid.locator('button[aria-label^="Open "]');
    expect(await tiles.count()).toBe(7);

    // Dock shows 3 pinned apps (About, Support, Projects).
    const dockButtons = page.locator('nav[aria-label="Dock"] button');
    await expect(dockButtons).toHaveCount(3);
    await expect(page.locator('nav[aria-label="Dock"] button[aria-label="Open About Cory"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Dock"] button[aria-label="Open Support"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Dock"] button[aria-label="Open Projects"]')).toBeVisible();

    // Tap an iframe app (dmarc.mx) → fullscreen app view with iframe + back pill.
    await grid.locator('button[aria-label="Open dmarc.mx"]').tap();
    const appView = page.locator('div[role="dialog"][aria-label="dmarc.mx app"]');
    await expect(appView).toBeVisible();
    await expect(appView.locator('iframe[title="dmarc.mx"]')).toBeVisible();
    const backPill = page.locator('button[aria-label="Back to home"]');
    await expect(backPill).toBeVisible();

    // Tap back → app view gone, home grid visible again.
    await backPill.tap();
    await expect(appView).toHaveCount(0);
    await expect(grid).toBeVisible();
  });

  test('prefers-reduced-motion disables the slide-up transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const grid = page.locator('[data-testid="home-grid"]');
    await expect(grid).toBeVisible({ timeout: 15_000 });

    await grid.locator('button[aria-label="Open dmarc.mx"]').tap();
    const appView = page.locator('div[role="dialog"][aria-label="dmarc.mx app"]');
    await expect(appView).toBeVisible();

    // Under reduced motion, the slide-up transform is disabled —
    // transition-property should only cover opacity, not transform.
    const transitionProperty = await appView.evaluate(
      (el) => window.getComputedStyle(el).transitionProperty
    );
    expect(transitionProperty).toBe('opacity');
  });
});

test.describe('iframe embed', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('all iframe apps embed without CSP/XFO refusal', async ({ page }) => {
    const messages = captureConsole(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissBootSplash(page);
    await expect(page.locator('#ct-desktop')).toBeVisible({ timeout: 15_000 });

    for (const app of IFRAME_APPS) {
      await page.locator('button[aria-label="Open launcher"]').click();
      const launcher = page.locator('[role="dialog"][aria-label="App launcher"]');
      await expect(launcher).toBeVisible();
      await page.locator('input[aria-label="Search apps"]').fill(app.name);
      await page.keyboard.press('Enter');
      await expect(launcher).toBeHidden();

      const iframe = page.locator(`iframe[title="${app.name}"]`);
      await expect(iframe).toBeAttached({ timeout: 8_000 });
      await expect(iframe).toHaveAttribute('src', app.url);

      // Close the window before the next iteration so the iframe count stays stable.
      await page.locator(`button[aria-label="Close ${app.name}"]`).click();
      await expect(page.locator(`section[aria-label="${app.name} window"]`)).toHaveCount(0);
    }

    const xfoNoise = messages.filter((m) =>
      /Refused to display.*frame|X-Frame-Options|Content Security Policy/i.test(m.text)
    );
    expect(
      xfoNoise,
      `Iframe embedding blocked:\n${xfoNoise.map((m) => `  [${m.type}] ${m.text}`).join('\n')}`
    ).toEqual([]);
  });
});
