#!/usr/bin/env node
// scripts/generate-show-your-work-cover.mjs
// Regenerates public/show-your-work-cover.jpg at 3000×3000 from vector.
//
// A PLACEHOLDER. clodcast is producing the real show art (its show-your-work
// design spec, §9 phase 3); this exists so the feed can carry a conformant
// square cover before that lands. The cover is not a one-way door — replace
// the file, keep the path, and COVER_URL in src/pages/show-your-work/rss.xml.ts
// needs no edit.
//
// A sibling of generate-podcast-cover.mjs rather than a mode of it, so this can
// never re-cut the live Cortech Daily cover. It shares that script's palette,
// type stacks, grid and squint-test constraints: bold type, high contrast, and a
// subject strip, because "Show Your Work" does not itself say what the show is
// about. The motif is the therefore sign (∴), drawn as three circles so the
// render never depends on which font has the glyph.
//
// Run: node scripts/generate-show-your-work-cover.mjs

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '..', 'public', 'show-your-work-cover.jpg');

const SIZE = 3000;
const GROUND = '#10141d';
const AMBER = '#f6c34a';
const PAPER = '#f2efe6';
const MUTED = '#7b7e8a';
const FOOTER_INK = '#4c5261';

// Same stacks as generate-podcast-cover.mjs; the fallbacks are what make this
// reproducible off a Mac.
const DISPLAY = "Inter, 'Helvetica Neue', Helvetica, 'Arial Black', Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${GROUND}"/>

  <!-- Therefore sign: one dot over two -->
  <g fill="${AMBER}">
    <circle cx="2420" cy="520" r="120"/>
    <circle cx="2190" cy="920" r="120"/>
    <circle cx="2650" cy="920" r="120"/>
  </g>

  <g font-family="${DISPLAY}" font-weight="900" letter-spacing="2">
    <text x="262" y="1330" font-size="430" fill="${PAPER}">SHOW</text>
    <text x="262" y="1812" font-size="430" fill="${PAPER}">YOUR</text>
    <text x="262" y="2294" font-size="430" fill="${AMBER}">WORK</text>
  </g>

  <!-- Subject strip: the title alone does not say what the show is about -->
  <text x="262" y="2540" font-family="${DISPLAY}" font-weight="700" font-size="84"
        fill="${MUTED}" letter-spacing="19">AI ALIGNMENT · EXPLAINED</text>

  <text x="262" y="2800" font-family="${DISPLAY}" font-weight="500" font-size="75"
        fill="${FOOTER_INK}" letter-spacing="3">cortech.online</text>
</svg>`;

await sharp(Buffer.from(svg), { density: 300 })
  .resize(SIZE, SIZE)
  // Flatten to the brand ground and drop alpha: the feed contract requires
  // opaque RGB, and JPEG carries no alpha channel anyway.
  .flatten({ background: GROUND })
  .removeAlpha()
  .toColourspace('srgb')
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(out);

console.log(`✓ show-your-work-cover.jpg regenerated at ${SIZE}×${SIZE}`);
