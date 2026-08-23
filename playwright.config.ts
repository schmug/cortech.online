import { readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// The podcast routes only exist when EPISODES_MANIFEST_URL resolves, so the
// suite serves its own fixture manifest inline as a data: URL — no network,
// no R2 credentials, and production builds stay on the real manifest.
const fixtureManifest = readFileSync('e2e/fixtures/podcast-manifest.json');
const EPISODES_MANIFEST_URL = `data:application/json;base64,${fixtureManifest.toString('base64')}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    // In CI, serve the built site via `astro preview` — no Vite dep optimizer,
    // so no "504 Outdated Optimize Dep" races on in-flight dynamic islands.
    // Locally, keep `astro dev` for fast iteration; `optimizeDeps.include` in
    // astro.config.mjs softens the same race for dev runs.
    command: process.env.CI ? 'npm run build && npm run preview' : 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    env: { EPISODES_MANIFEST_URL },
    timeout: process.env.CI ? 120_000 : 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
