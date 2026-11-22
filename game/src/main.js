// TIDEBREAK bootstrap: wires the engine, the renderer, the AI and the sounds together.
// One delegated click handler on the stage reads data-action attributes, so every
// button the renderer paints already works: hand cards summon into lanes, glowing
// creatures attack foes or the enemy hero, End Turn hands the table to Queen Morvain
// and her turn plays out move by move. ?shot=title|table|win|loss stages a screenshot
// scene instead of a fresh duel; ?selftest=1 runs a scripted end-to-end check in the
// page and reports it in window.__selftest and the document title for headless runs.
import { newGame, playCard, attackWith, endTurn, startTurn } from './engine.js';
import { takeAiTurn } from './ai.js';
import { renderTable, showScreen } from './render.js';
import { playSound, ensureAudio, toggleMute } from './sound.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || 7);

let state = shot ? stageShot(shot, seed) : newGame(seed);
let aiRunning = false;

function render() {
  showScreen(state);
  if (state.screen === 'play' || state.screen === 'win' || state.screen === 'loss') renderTable(state);
}

function maybeAiTurn() {
  if (state.phase === 'ai' && !state.over && !aiRunning) {
    aiRunning = true;
    takeAiTurn(state, render, (name) => playSound(name)).finally(() => {
      aiRunning = false;
      if (state.over) playEndSound();
      render();
    });
  }
}

function playEndSound() {
  playSound(state.winner === 'player' ? 'win' : 'loss');
}

/** One click, by what was clicked: hand card, lane, creature, hero, or a button. */
function onStageClick(event) {
  ensureAudio();
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (state.over && action !== 'again' && action !== 'title') return;

  if (action === 'play') {
    state = newGame(seed);
    state.screen = 'play';
    startTurn(state, state.player);
    playSound('turn');
    render();
    return;
  }
  if (action === 'again') {
    state = newGame(seed);
    state.screen = 'play';
    startTurn(state, state.player);
    playSound('turn');
    render();
    return;
  }
  if (action === 'title') {
    state = newGame(seed);
    state.screen = 'title';
    render();
    return;
  }
  if (action === 'mute') {
    const muted = toggleMute();
    target.textContent = muted ? 'SOUND: OFF' : 'SOUND: ON';
    return;
  }
  if (action === 'how') {
    document.getElementById('how-panel').hidden = !document.getElementById('how-panel').hidden;
    return;
  }
  if (state.screen !== 'play' || state.phase !== 'player') return;

  if (action === 'hand') {
    const index = Number(target.dataset.index);
    state.selectedHand = state.selectedHand === index ? null : index;
    state.selectedAttacker = null;
    playSound('click');
    render();
    return;
  }
  if (action === 'lane') {
    if (state.selectedHand === null) return;
    const lane = Number(target.dataset.lane);
    const played = playCard(state, state.player, state.ai, state.selectedHand, lane);
    state.selectedHand = null;
    if (played) playSound('summon');
    else playSound('hurt');
    if (state.over) playEndSound();
    render();
    return;
  }
  if (action === 'minion') {
    const side = target.dataset.side;
    const lane = Number(target.dataset.lane);
    const index = Number(target.dataset.index);
    if (side === 'player') {
      const creature = state.player.lanes[lane][index];
      if (creature && creature.canAttack) {
        state.selectedAttacker = { lane, index };
        state.selectedHand = null;
        playSound('click');
      }
      render();
      return;
    }
    // An enemy creature: attack it with the selected attacker, if there is one.
    if (state.selectedAttacker) {
      const from = state.selectedAttacker;
      const ok = attackWith(state, state.player, state.ai, from.lane, from.index, { kind: 'creature', lane, index });
      state.selectedAttacker = null;
      if (ok) playSound('attack');
      if (state.over) playEndSound();
      render();
    }
    return;
  }
  if (action === 'foe-hero') {
    if (state.selectedAttacker) {
      const from = state.selectedAttacker;
      const ok = attackWith(state, state.player, state.ai, from.lane, from.index, { kind: 'hero' });
      state.selectedAttacker = null;
      if (ok) playSound('attack');
      if (state.over) playEndSound();
      render();
    }
    return;
  }
  if (action === 'end-turn') {
    state.selectedHand = null;
    state.selectedAttacker = null;
    endTurn(state);
    playSound('turn');
    render();
    maybeAiTurn();
  }
}

document.getElementById('stage').addEventListener('click', onStageClick);
document.getElementById('stage').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    const target = event.target.closest('[data-action]');
    if (target) { event.preventDefault(); target.click(); }
  }
});
render();

/** Headless end-to-end check behind ?selftest=1: drives the real engine and the real
 * DOM (Play click included), then reports in window.__selftest and the page title. */
async function runSelfTest() {
  const checks = [];
  const check = (name, ok) => checks.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  try {
    const { newGame: ng, playCard: pc, attackWith: aw, checkEnd: ce, endTurn: et } = await import('./engine.js');
    const s = ng(7);
    check('deal 3 cards each', s.player.hand.length === 3 && s.ai.hand.length === 3);
    check('both heroes at 30 life', s.player.life === 30 && s.ai.life === 30);
    s.player.bubbles = 10;
    const before = s.player.hand.length;
    const creature = pc(s, s.player, s.ai, 0, 0);
    check('summon spends a card and fills a lane', !!creature && s.player.lanes[0].length === 1 && s.player.hand.length === before - 1);
    creature.canAttack = true;
    const aiLife = s.ai.life;
    aw(s, s.player, s.ai, 0, 0, { kind: 'hero' });
    check('attack lowers enemy life', s.ai.life < aiLife);
    s.ai.life = 1;
    const killer = s.player.lanes[0][0];
    if (killer) killer.canAttack = true;
    aw(s, s.player, s.ai, 0, 0, { kind: 'hero' });
    check('win screen triggers at 0 life', s.over && s.screen === 'win');
    const s2 = ng(7);
    s2.player.life = 0;
    ce(s2);
    check('loss screen triggers at 0 life', s2.over && s2.screen === 'loss');
    const s3 = ng(7);
    s3.phase = 'ai';
    const { takeAiTurn: ait } = await import('./ai.js');
    await ait(s3, () => {}, () => {});
    check('AI turn returns the table to you', s3.phase === 'player' && s3.turn === 2);
    // Real DOM: click Play, then confirm the table and a hand render.
    document.querySelector('[data-action="play"]').click();
    check('Play click shows the table', !document.getElementById('table').hidden);
    check('hand renders cards', document.querySelectorAll('#my-hand .card').length > 0);
    check('opponent hand renders face-down', document.querySelectorAll('#foe-hand .card.back').length === 3);
    check('tide banner shows a lane', document.getElementById('tide-banner').textContent.includes('HIGH TIDE'));
  } catch (err) {
    checks.push(`FAIL exception: ${err.message}`);
  }
  const failed = checks.filter((c) => c.startsWith('FAIL'));
  window.__selftest = { pass: failed.length === 0, checks };
  document.title = failed.length === 0 ? 'SELFTEST PASS' : `SELFTEST FAIL ${failed.length}`;
}

if (params.get('selftest') === '1') {
  setTimeout(runSelfTest, 300);
}

/** Fit the fixed 1280×720 stage into any desktop window, keeping its aspect. */
function fitStage() {
  const stage = document.getElementById('stage');
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  stage.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitStage);
fitStage();
