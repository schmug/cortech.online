import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// Mirror the schema from src/content.config.ts so we can validate frontmatter
// fixtures without booting Astro.
const mythosFrontmatter = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  triggers: z.array(z.enum(['revealed', 'new_project', 'bug_class_shift', 'funnel_shift'])),
  cve_ids: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  headline_snapshot: z.object({
    disclosed: z.number(),
    acknowledged: z.number(),
    fixed: z.number(),
    advisories: z.number(),
  }),
});

describe('mythos frontmatter schema', () => {
  it('accepts a minimal valid post', () => {
    const result = mythosFrontmatter.parse({
      title: 'Test',
      description: 'desc',
      pubDate: '2026-05-24',
      triggers: ['revealed'],
      headline_snapshot: { disclosed: 1, acknowledged: 1, fixed: 1, advisories: 1 },
    });
    expect(result.cve_ids).toEqual([]);
    expect(result.projects).toEqual([]);
  });

  it('rejects unknown trigger kinds', () => {
    expect(() =>
      mythosFrontmatter.parse({
        title: 't',
        description: 'd',
        pubDate: '2026-05-24',
        triggers: ['nonsense'],
        headline_snapshot: { disclosed: 0, acknowledged: 0, fixed: 0, advisories: 0 },
      }),
    ).toThrow();
  });
});
