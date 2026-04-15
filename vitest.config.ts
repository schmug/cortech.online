import { defineConfig } from 'vitest/config';

export default defineConfig({
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
      ],
    },
  },
});
