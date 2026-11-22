# TIDEBREAK — Duel of the Deep

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/sandytaztaz-hue/tidebreak-card-game/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/sandytaztaz-hue/tidebreak-card-game/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

An original 1v1 card battler set in a bright underwater kingdom. You are the
Tidekeeper, duelling **Queen Morvain of the Abyssal Court** across three lanes —
Shallows, Reef and Abyss — while the tide itself rises in a different lane every
turn. Built for the make.fun bounty **"Make the best card game"**
(`best-card-game-20261122-1826`).

## How to play

1. **Bubbles are mana.** You gain +1 max bubble each turn (up to 10) and draw a card.
2. **Summon:** click a card in your hand, then click a lane to play it there.
   A lane holds up to 4 creatures.
3. **Attack:** click one of your glowing creatures, then click an enemy creature
   to duel it (both strike back) or click Queen Morvain herself to hit her directly.
4. **High tide:** one lane each turn gives its creatures **+2 attack**. Fight
   where the tide is high, and keep your weak creatures out of it.
5. **Swift** creatures can attack the turn they are played. **Bulwark** shields
   block the first damage a creature takes. Other creatures carry on-play
   effects: draw a card, heal, weaken a foe, splash the enemy hero, gain a bubble.
6. **Win** by bringing Queen Morvain from 30 life to 0. Lose your 30 life and
   the deep keeps you.

The duel lasts about 6–10 turns. Morvain plays a visible turn of her own —
she summons, trades and goes for lethal when she sees it — with every move
written into the combat log so you can read her and answer her.

## The deck

24 original creatures, costs 1–7: Bubble Sprite, Glow Eel, Pearl Oyster,
Lanternfish, Kelp Warden, Hermit Guard, Ink Squid, Seahorse Herald, Coral
Knight, Tidecaller, Eel Corsair, Nautilus Sage, Pufferfish, Anglerfiend,
Reef Shark, Manta Ray, Bubble Jelly, Coral Golem, Kraken Hatchling,
Tide Serpent, Siren of the Deep, Abyssal Horror, Leviathan Calf and the
Ancient Kraken. Every card's name, art, sound and effect was written for
this game — nothing is copied from any commercial game.

## Controls

- **Mouse:** click a hand card, then a lane; click a ready creature, then a target.
- **Keyboard:** Tab to a card or button, Enter/Space to use it.
- **End Turn** hands the table to Morvain. **Sound** toggles the synth effects.
- **Play Again** restarts a fresh shuffled duel from either end screen.

## Screenshots

The game ships with four real renders of its own code under `screenshots/`:

1. `1-title.png` — the title screen with the deck preview and how-to-play panel.
2. `2-table.png` — a mid-game table: both hands, three lanes, life, bubbles, tide.
3. `3-win.png` — the win screen, "The tide is yours!".
4. `4-loss.png` — the loss screen, "Swallowed by the deep...".

Each one is staged by the game's own screenshot scenes: open
`game/index.html?shot=title|table|win|loss` in a desktop browser to see them live.

## Tech notes

- **Static only:** `game/` is plain HTML, CSS and ES modules. Open
  `game/index.html` in desktop Chrome (or serve `game/` with any static server)
  and it plays with **no network request** — all art is inline SVG, all sounds
  are WebAudio synth, all fonts are system fonts.
- **Structure:** `game/src/cards.js` (the 24-card catalogue), `engine.js`
  (rules: mana, tide, summoning, combat, win/loss), `ai.js` (Queen Morvain's
  turn), `art.js` (inline SVG creature portraits), `sound.js` (WebAudio synth),
  `render.js` (the table, cards and end screens), `shots.js` (deterministic
  screenshot scenes), `main.js` (input, game loop, self-test).
- **Hand-in:** `main.ts` (Node 22, standard library only) copies `game/` and
  `screenshots/` to `/output` and writes `dossier.json` with
  `vendor/makefun-game.ts` from the kit, unchanged. Run it with
  `MAKEFUN_OUTPUT_DIR=out node main.ts`.
- **Self-test:** open `game/index.html?selftest=1` — it drives the real engine
  and the real DOM (deal, summon, attack, win, loss, a full AI turn, a Play
  click) and reports in `window.__selftest` and the page title.

## License

MIT — see [LICENSE](LICENSE).
