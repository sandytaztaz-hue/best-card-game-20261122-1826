// TIDEBREAK — Duel of the Deep: the hand-in program for the best-card-game bounty.
// Node 22, standard library only. It copies this repository's game/ and screenshots/
// beside this file into /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with the vendored make.fun library, exactly as the kit requires.
// The game itself is plain static files: game/index.html opens in desktop Chrome and
// plays with no network request, no build step and no external asset.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fresh output directory every run, so the two grader runs write identical bytes.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}
// The scorer's own caps (from the kit's gate): only text_max_bytes shapes the dossier's
// bytes; the others refuse an entry the scorer would refuse — more than 4 screenshots or
// one over 256 KiB; more than 993 files in game/ or 48 MiB of game files in all, or a path
// under game/ over 1000 bytes. game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json, so this entry stays far inside every limit: a handful of
// small source files, four screenshots, one dossier.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
