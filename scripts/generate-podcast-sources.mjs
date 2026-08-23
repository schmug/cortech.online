#!/usr/bin/env node
// scripts/generate-podcast-sources.mjs
// Regenerates src/lib/podcast-sources.ts from an OPML export.
//
// The list is a point-in-time SNAPSHOT of the feeds the daily show reads. It is
// not wired to the runner's live `opml_files` config — that config lives on the
// production machine and is in no repo — so refreshing it is a deliberate act:
// export from Don't Hype Me, drop the file in, re-run this, commit the diff.
//
// Vendoring the result as TypeScript rather than parsing OPML at build time is
// deliberate: the site is a static Astro build, so a remote fetch would make it
// depend on a third-party repo staying reachable, and a runtime parse would
// trade type-checked data for regex-parsed XML.
//
// Usage: node scripts/generate-podcast-sources.mjs <path-to.opml>

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, '..', 'src', 'lib', 'podcast-sources.ts');

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/generate-podcast-sources.mjs <path-to.opml>');
  process.exit(1);
}

const xml = await readFile(resolve(process.cwd(), src), 'utf8');

const decode = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? decode(m[1]) : null;
};

// Group outlines are the ones with no xmlUrl; every feed outline that follows
// belongs to the most recent group.
const groups = [];
let current = null;
for (const tag of xml.match(/<outline\b[^>]*>/g) ?? []) {
  const text = attr(tag, 'text');
  if (!text) continue;
  if (!/xmlUrl=/.test(tag)) {
    current = { name: text, feeds: [] };
    groups.push(current);
    continue;
  }
  if (!current) {
    current = { name: 'Uncategorized', feeds: [] };
    groups.push(current);
  }
  const xmlUrl = attr(tag, 'xmlUrl');
  // Refuse to vendor a feed URL carrying a credential. These lists come out of
  // a personal reader, where an authenticated feed is a plausible mistake, and
  // this file is published.
  if (/[?&](token|key|auth|secret|api_?key|password)=/i.test(xmlUrl)) {
    console.error(`REFUSED (looks credentialed): ${xmlUrl}`);
    process.exit(1);
  }
  current.feeds.push({ title: text, xmlUrl, category: attr(tag, 'category') });
}

const feedCount = groups.reduce((n, g) => n + g.feeds.length, 0);
const lit = (s) => JSON.stringify(s);

const body = groups
  .map(
    (g) =>
      `  {\n    name: ${lit(g.name)},\n    feeds: [\n` +
      g.feeds
        .map(
          (f) =>
            `      { title: ${lit(f.title)}, xmlUrl: ${lit(f.xmlUrl)}` +
            (f.category ? `, category: ${lit(f.category)}` : '') +
            ` },`,
        )
        .join('\n') +
      `\n    ],\n  },`,
  )
  .join('\n');

const out = `// GENERATED FILE — do not edit by hand.
// Regenerate: node scripts/generate-podcast-sources.mjs <path-to.opml>
//
// A point-in-time snapshot of the feeds the Cortech Daily podcast reads,
// exported from Don't Hype Me (https://donthype.me). Served as an importable
// subscription list at /podcast/sources.opml.
//
// This is the show's INBOUND list — what it reads. Not to be confused with
// src/pages/feeds.opml.ts, the OUTBOUND list of feeds this site publishes.

export type SourceFeed = {
  title: string;
  xmlUrl: string;
  /** Don't Hype Me's own taxonomy tags, carried through as OPML \`category\`. */
  category?: string;
};

export type SourceGroup = {
  name: string;
  feeds: SourceFeed[];
};

/** ${feedCount} feeds across ${groups.length} groups. */
export const PODCAST_SOURCE_GROUPS: SourceGroup[] = [
${body}
];

export const PODCAST_SOURCE_COUNT = ${feedCount};
`;

await writeFile(outPath, out);
console.log(`✓ podcast-sources.ts: ${feedCount} feeds across ${groups.length} groups`);
