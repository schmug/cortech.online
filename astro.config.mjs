// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://cortech.online',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle deps reached only through lazy-loaded islands (OSShell, MobileShell).
    // Without this, Vite discovers them on first page load and re-optimizes mid-flight,
    // returning 504 "Outdated Optimize Dep" on in-flight dynamic imports and flaking e2e.
    optimizeDeps: {
      include: ['zustand', 'zustand/middleware', 'react-rnd'],
    },
    // Warm up the lazy island entries so Vite's dep crawl completes before the
    // first browser request — complements optimizeDeps.include above.
    server: {
      warmup: {
        clientFiles: [
          './src/components/RootShell.tsx',
          './src/components/os/OSShell.tsx',
          './src/components/mobile/MobileShell.tsx',
        ],
      },
    },
  },

  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.endsWith('/rss.xml'),
    }),
  ],
});
