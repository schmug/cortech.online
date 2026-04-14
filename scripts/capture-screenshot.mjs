// Capture the README hero screenshot from a running dev server.
// Usage: `npm run dev` in one shell, then `node scripts/capture-screenshot.mjs`.
// Output: docs/screenshot-desktop.png

import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'docs', 'screenshot-desktop.png');
const URL = process.env.CAPTURE_URL ?? 'http://localhost:4321/';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

// Block external font CDN so we don't hang on document.fonts.ready.
await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
  route.fulfill({ status: 200, contentType: 'text/css', body: '' })
);

await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.removeItem('cortechos:layout'));
await page.reload({ waitUntil: 'domcontentloaded' });

// Skip boot splash; auto-opened About window confirms the desktop is live.
await page.locator('[aria-label="CortechOS booting"]').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
await page.keyboard.press('Space');
await page.locator('[aria-label="CortechOS booting"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
await page.locator('section[aria-label="About Cory window"]').waitFor({ state: 'visible', timeout: 10_000 });
await page.waitForTimeout(400);

await mkdir(dirname(OUT), { recursive: true });
await page.screenshot({ path: OUT });
console.log(`wrote ${OUT}`);

await browser.close();
