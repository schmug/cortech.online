import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Astro's virtual `astro:content` module isn't resolvable by Vite
      // outside the Astro build. Tests that exercise routes which import it
      // alias to a stub and then use vi.mock() to inject behavior.
      'astro:content': fileURLToPath(new URL('./src/test/astro-content-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    exclude: ['node_modules/**', 'dist/**', 'e2e/**', '.worktrees/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/pages/**',
        'src/layouts/**',
        'src/env.d.ts',
        'src/test/**',
      ],
    },
  },
});
