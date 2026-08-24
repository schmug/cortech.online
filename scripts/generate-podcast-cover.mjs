#!/usr/bin/env node
// scripts/generate-podcast-cover.mjs
// Regenerates public/podcast-cover.png at 3000×3000 from vector.
//
// Spotify/Apple accept 1400–3000px square; 3000 is the recommendation and the
// size marketing surfaces upscale from, so we render at the ceiling.
//
// Design constraints come from Spotify's Optimization Playbook: the cover is
// usually a small thumbnail on a crowded screen, so it has to pass the "squint
// test" — bold type, high contrast, no crammed detail. The show title "Cortech
// Daily" does not itself convey the subject, and the playbook is explicit that
// in that case the art must, hence the topic strip along the bottom.
//
// The 2026-08 art (clodcast#163) replaces the CortechOS window frame with a
// horizon: a hard-edged amber rule running between CORTECH and DAILY, under an
// ASCII sun. The window chrome said "this is a Cortech thing" but nothing about
// the show; the horizon is the one idea specific to a DAILY one, and the ASCII
// sun keeps the terminal register the brand already has.
//
// THE SUN GRID IS SHARED ART. It is the same 19×16 table as ASCII_SUN in
// clodcast's skills/daily-podcast/render.py, which draws the episode covers —
// that is what makes the show cover and every episode cover the same picture.
// Change it in one place and change it in the other, or the set drifts apart.
//
// Every glyph carries its own x, so the disc's geometry comes from the table and
// never from the font's advance width. That is what lets this render identically
// wherever it runs — librsvg resolving Menlo, DejaVu Sans Mono or anything else
// still puts each character on the same cell. Do not "simplify" this to a single
// letter-spacing attribute; that reintroduces the font dependency.
//
// Run: node scripts/generate-podcast-cover.mjs

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '..', 'public', 'podcast-cover.png');

const SIZE = 3000;
const GROUND = '#10141d';
const AMBER = '#f6c34a';
const PAPER = '#f2efe6';
const MUTED = '#7b7e8a';
const FOOTER_INK = '#4c5261';

// Inter is not installed on the machines that run this script; Helvetica's Bold
// face is, and librsvg resolves it from the stack below. Keep the fallbacks —
// they are what makes this reproducible off a Mac.
const DISPLAY = "Inter, 'Helvetica Neue', Helvetica, 'Arial Black', Arial, sans-serif";
const MONO = "'JetBrains Mono', Menlo, 'DejaVu Sans Mono', 'Liberation Mono', monospace";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${GROUND}"/>

  <!-- ASCII sun: one text element per grid row, one x per glyph -->
  <g font-family="${MONO}" font-size="94" fill="${AMBER}" fill-opacity="0.92" xml:space="preserve">
    <text x="1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5" y="247.5">-------</text>
    <text x="1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5" y="317.8">--=======--</text>
    <text x="1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5" y="388.1">-==+++++++==-</text>
    <text x="1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5" y="458.4">-==++*****++==-</text>
    <text x="1672.5 1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5 2632.5" y="528.7">-==+***###***+==-</text>
    <text x="1672.5 1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5 2632.5" y="599.0">-=+**#######**+=-</text>
    <text x="1612.5 1672.5 1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5 2632.5 2692.5" y="669.3">-==+*##@@@@@##*+==-</text>
    <text x="1612.5 1672.5 1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5 2632.5 2692.5" y="739.6">-=++*##@@@@@##*++=-</text>
    <text x="1612.5 1672.5 1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5 2632.5 2692.5" y="809.9">-=++*##@@@@@##*++=-</text>
    <text x="1612.5 1672.5 1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5 2632.5 2692.5" y="880.2">-==+*##@@@@@##*+==-</text>
    <text x="1672.5 1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5 2632.5" y="950.5">-=+**#######**+=-</text>
    <text x="1672.5 1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5 2632.5" y="1020.8">-==+***###***+==-</text>
    <text x="1732.5 1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5 2572.5" y="1091.1">-==++*****++==-</text>
    <text x="1792.5 1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5 2512.5" y="1161.4">-==+++++++==-</text>
    <text x="1852.5 1912.5 1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5 2392.5 2452.5" y="1231.7">--=======--</text>
    <text x="1972.5 2032.5 2092.5 2152.5 2212.5 2272.5 2332.5" y="1302.0">-------</text>
  </g>

  <!-- The horizon runs edge to edge, between the two halves of the name. Inset
       it and the whole composition turns back into a box. -->
  <rect x="0" y="1856" width="${SIZE}" height="23" fill="${AMBER}"/>

  <g font-family="${DISPLAY}" font-weight="900" letter-spacing="2">
    <text x="262" y="1760" font-size="394" fill="${PAPER}">CORTECH</text>
    <text x="262" y="2294" font-size="394" fill="${AMBER}">DAILY</text>
  </g>

  <!-- Subject strip: the title alone does not say what the show is about -->
  <text x="262" y="2540" font-family="${DISPLAY}" font-weight="700" font-size="84"
        fill="${MUTED}" letter-spacing="19">AI · SECURITY · CLOUDFLARE</text>

  <text x="262" y="2800" font-family="${DISPLAY}" font-weight="500" font-size="75"
        fill="${FOOTER_INK}" letter-spacing="3">cortech.online</text>
</svg>`;

await sharp(Buffer.from(svg), { density: 300 })
  .resize(SIZE, SIZE)
  // Flatten to the brand ground so no transparent pixels reach Spotify, and drop
  // the alpha channel: the feed contract requires opaque RGB, not RGBA/CMYK.
  .flatten({ background: GROUND })
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(`✓ podcast-cover.png regenerated at ${SIZE}×${SIZE}`);
