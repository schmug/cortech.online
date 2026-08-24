import { readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Episode routes only exist when a show's manifest resolves, so the suite
// serves its own fixture manifests inline as data: URLs — no network, no R2
// credentials, and production builds stay on the real manifests. Frontier
// Commits has a real default URL, so pinning it here also keeps the e2e build
// off the live R2 manifest (which 404s until its first episode ships).
const dataUrl = (path: string) =>
  `data:application/json;base64,${readFileSync(path).toString('base64')}`;

const EPISODES_MANIFEST_URL = dataUrl('e2e/fixtures/podcast-manifest.json');
const FRONTIER_MANIFEST_URL = dataUrl('e2e/fixtures/frontier-manifest.json');

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
    env: { EPISODES_MANIFEST_URL, FRONTIER_MANIFEST_URL },
    timeout: process.env.CI ? 120_000 : 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
