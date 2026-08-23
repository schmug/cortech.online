#!/usr/bin/env node
// scripts/generate-podcast-cover.mjs
// Regenerates public/podcast-cover.png at 3000×3000 from vector.
//
// Spotify/Apple accept 1400–3000px square; 3000 is the recommendation and the
// size marketing surfaces upscale from, so we render at the ceiling. The art is
// drawn as SVG and rasterized once rather than resized from the old 1400px PNG,
// which would only blur it — and the old art still read "Daily Digest", the
// pre-2026-08 show name.
//
// Design constraints come from Spotify's Optimization Playbook: the cover is
// usually a small thumbnail on a crowded screen, so it has to pass the "squint
// test" — bold type, high contrast, no crammed detail. The show title "Cortech
// Daily" does not itself convey the subject, and the playbook is explicit that
// in that case the art must, hence the topic strip along the bottom.
//
// Motif is the CortechOS window chrome from public/mark.svg (rounded frame,
// title bar, three dots) so the show reads as part of the same brand.
//
// Run: node scripts/generate-podcast-cover.mjs

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '..', 'public', 'podcast-cover.png');

const SIZE = 3000;
const VOID = '#0b0d12';
const AMBER = '#f6c34a';
const TEAL = '#5ee3d1';
const CORAL = '#ff6a5c';
const PAPER = '#f5f7fa';

// Inter is not installed on the machines that run this script; Helvetica's Bold
// face is, and librsvg resolves it from the stack below. Keep the fallbacks —
// they are what makes this reproducible off a Mac.
const DISPLAY = "Inter, 'Helvetica Neue', Helvetica, 'Arial Black', Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${VOID}"/>

  <!-- CortechOS window frame -->
  <rect x="200" y="200" width="2600" height="2600" rx="190"
        fill="none" stroke="${AMBER}" stroke-width="20"/>
  <path d="M200 640 H2800" stroke="${AMBER}" stroke-width="20"/>
  <circle cx="360" cy="420" r="44" fill="${AMBER}"/>
  <circle cx="520" cy="420" r="44" fill="${TEAL}"/>
  <circle cx="680" cy="420" r="44" fill="${CORAL}"/>

  <!-- Show name: two tones, equal weight, so it reads as one name -->
  <g font-family="${DISPLAY}" font-weight="900" text-anchor="middle">
    <text x="1500" y="1560" font-size="450" fill="${PAPER}" letter-spacing="6">CORTECH</text>
    <text x="1500" y="2070" font-size="450" fill="${AMBER}" letter-spacing="6">DAILY</text>
  </g>

  <!-- Subject strip: the title alone does not say what the show is about -->
  <text x="1500" y="2560" font-family="${DISPLAY}" font-weight="700" font-size="104"
        fill="${PAPER}" fill-opacity="0.72" letter-spacing="14" text-anchor="middle">AI · SECURITY · CLOUDFLARE</text>
</svg>`;

await sharp(Buffer.from(svg), { density: 300 })
  .resize(SIZE, SIZE)
  // Flatten to the brand void so no transparent pixels reach Spotify, and drop
  // the alpha channel: the feed contract requires opaque RGB, not RGBA/CMYK.
  .flatten({ background: VOID })
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(`✓ podcast-cover.png regenerated at ${SIZE}×${SIZE}`);
