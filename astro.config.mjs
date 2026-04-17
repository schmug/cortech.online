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
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.endsWith('/rss.xml'),
    }),
  ]
});