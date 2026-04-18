import { test, expect } from '@playwright/test';

// Notes on what's *not* asserted here:
//   - /sitemap-index.xml and /sitemap-0.xml are emitted by the
//     @astrojs/sitemap integration at build time. They don't exist
//     under `astro dev`, so the contract is verified by the
//     `[@astrojs/sitemap] \`sitemap-index.xml\` created at \`dist\``
//     line in `npm run build` output rather than here.
//   - `public/_headers` (Link rels on /, Content-Type override on
//     /.well-known/api-catalog) is applied by Cloudflare Pages at the
//     edge, not by the Astro dev server.

test.describe('agent readiness', () => {
  test('/robots.txt is served plain-text with AI rules, Content-Signal, and sitemap', async ({
    request,
  }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/text\/plain/);

    const body = await res.text();
    expect(body).toMatch(/Content-Signal:\s*ai-train=no,\s*search=yes,\s*ai-input=yes/);
    expect(body).toContain('User-agent: GPTBot');
    expect(body).toContain('User-agent: ClaudeBot');
    expect(body).toMatch(/Sitemap:\s*https:\/\/cortech\.online\/sitemap-index\.xml/);
  });

  test('/.well-known/api-catalog is a valid RFC 9727 linkset', async ({ request }) => {
    const res = await request.get('/.well-known/api-catalog');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.linkset)).toBe(true);
    expect(data.linkset.length).toBeGreaterThan(0);
    const anchors = data.linkset.map((e: { anchor: string }) => e.anchor);
    expect(anchors).toContain('https://cortech.online/api/blog.json');
    expect(anchors).toContain('https://cortech.online/api/projects.json');
    expect(anchors).toContain('https://cortech.online/rss.xml');
  });
});
