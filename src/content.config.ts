import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const mythos = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/mythos' }),
  schema: z.object({
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
  }),
});

export const collections = { blog, mythos };
