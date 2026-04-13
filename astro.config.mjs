// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://cortech.online',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()]
});