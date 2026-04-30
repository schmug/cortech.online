// Run `npm install` only when node_modules is out of date relative to
// package-lock.json. Wired as `predev`/`prebuild` so a fresh clone or worktree
// switch can't ship a half-stale tree (see issue #23).
//
// Skipped in CI (CI runs `npm ci` explicitly before build), and skipped when
// `SKIP_DEP_CHECK=1` so escape hatches stay easy.

import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.CI || process.env.SKIP_DEP_CHECK) process.exit(0);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lockfile = resolve(root, 'package-lock.json');
const installedLockfile = resolve(root, 'node_modules', '.package-lock.json');

const mtime = (p) => {
  try {
    return statSync(p).mtimeMs;
  } catch {
    return null;
  }
};

const lockMtime = mtime(lockfile);
if (lockMtime === null) process.exit(0); // no lockfile, nothing to compare against

const installedMtime = mtime(installedLockfile);
const stale = installedMtime === null || lockMtime > installedMtime;

if (!stale) process.exit(0);

const reason = installedMtime === null ? 'node_modules missing' : 'package-lock.json is newer';
console.log(`[check-deps] ${reason} — running \`npm install\`…`);
const result = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
