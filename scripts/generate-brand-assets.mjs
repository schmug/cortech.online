#!/usr/bin/env node
// scripts/generate-brand-assets.mjs
// Regenerates public/favicon.{svg,ico}, public/mark-460.png,
// public/apple-touch-icon.png, and public/og-image.png
// from the authoritative public/mark{,-sm}.svg sources.

import { readFile, writeFile, copyFile, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pub = (p) => resolve(root, 'public', p);

async function main() {
  // 1. Keep favicon.svg lockstep with mark-sm.svg
  await copyFile(pub('mark-sm.svg'), pub('favicon.svg'));

  // 2. Full-variant derivatives — flatten to void so transparent pixels
  // don't render black on iOS or white in social previews.
  const fullSvg = await readFile(pub('mark.svg'));
  const bg = { background: '#0b0d12' };
  await sharp(fullSvg, { density: 600 }).resize(460, 460).flatten(bg).png().toFile(pub('mark-460.png'));
  await sharp(fullSvg, { density: 600 }).resize(180, 180).flatten(bg).png().toFile(pub('apple-touch-icon.png'));
  await sharp(fullSvg, { density: 600 })
    .resize(460, 460)
    .flatten(bg)
    .extend({ top: 85, bottom: 85, left: 370, right: 370, ...bg })
    .png()
    .toFile(pub('og-image.png'));

  // 3. Small-variant ICO — use png2icons -icop (PNG-compressed ICO entries).
  // Default BMP entries from png-to-ico produced a 285KB file with an auto
  // 256×256 slot; PNG-compressed at equivalent quality is ~15KB.
  const smSvg = await readFile(pub('mark-sm.svg'));
  const srcPng = pub('favicon-src.png');
  await sharp(smSvg, { density: 600 }).resize(256, 256).png().toFile(srcPng);
  const cmd = spawnSync('npx', ['--yes', 'png2icons', srcPng, pub('favicon'), '-icop', '-bc'], { encoding: 'buffer' });
  if (cmd.status !== 0) {
    throw new Error(`png2icons failed:\n${cmd.stderr.toString()}`);
  }
  await unlink(srcPng);

  console.log('✓ Brand assets regenerated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
