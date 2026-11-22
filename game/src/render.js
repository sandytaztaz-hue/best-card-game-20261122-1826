// TIDEBREAK renderer: turns the engine state into the table you see.
// Pure DOM — no canvas, no images. Every card, creature, life total and tide marker
// is an element with a readable number, so the game stays legible even at thumbnail
// size. The renderer never changes the rules; it only paints state, and main.js
// owns every click. Screens: title, table (both hands, three lanes, life, bubbles,
// tide, log) and the win / loss end screens.
import { LANES, TIDE_BONUS, cardById, abilityLabel } from './cards.js';
import { effectiveAttack } from './engine.js';
import { creatureArt } from './art.js';

const HEART = '<svg viewBox="0 0 24 24" class="heart"><path d="M12 21 C7 16 3 13 3 8.5 C3 5.5 5.5 3.5 8 3.5 C10 3.5 11.5 4.8 12 6 C12.5 4.8 14 3.5 16 3.5 C18.5 3.5 21 5.5 21 8.5 C21 13 17 16 12 21Z"/></svg>';
const BUBBLE = '<svg viewBox="0 0 24 24" class="bubble-ic"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="3"/></svg>';

function lifeHtml(life, maxLife, side) {
  const pct = Math.max(0, Math.min(100, (life / maxLife) * 100));
  const low = life <= 10 ? ' low' : '';
  return `<div class="life ${side}${low}"><span class="life-heart">${HEART}</span><span class="life-num">${life}</span><span class="life-max">/ ${maxLife}</span><div class="life-bar"><i style="width:${pct}%"></i></div></div>`;
}

function bubblesHtml(bubbles, maxBubbles, label) {
  let dots = '';
  for (let i = 0; i < 10; i += 1) {
    const cls = i < bubbles ? 'on' : (i < maxBubbles ? 'empty' : 'locked');
    dots += `<span class="pip ${cls}">${BUBBLE}</span>`;
  }
  return `<div class="bubbles" title="${label}"><span class="bubbles-label">${label}</span><span class="bubbles-num">${bubbles}</span><span class="pips">${dots}</span></div>`;
}

/** A full hand card: cost bubble, portrait, name, keyword chip, text, attack/health. */
export function cardHtml(cardId, index, state) {
  const def = cardById(cardId);
  const afford = state.player.bubbles >= def.cost;
  const selected = state.selectedHand === index ? ' selected' : '';
  const label = abilityLabel(def.ability);
  return `<button class="card${afford ? '' : ' poor'}${selected}" data-action="hand" data-index="${index}" style="--tint:${def.tint};--glow:${def.glow}" aria-label="${def.name}, cost ${def.cost}, ${def.atk} attack, ${def.hp} health">
    <span class="cost">${def.cost}</span>
    <span class="portrait">${creatureArt(def.art, def.tint, def.glow)}</span>
    <span class="card-name">${def.name}</span>
    ${label ? `<span class="chip">${label}</span>` : ''}
    <span class="card-text">${def.text}</span>
    <span class="stat atk">${def.atk}</span>
    <span class="stat hp">${def.hp}</span>
  </button>`;
}

/** A face-down card back for the opponent's hand. */
function cardBackHtml() {
  return `<div class="card back"><span class="back-art">${creatureArt('kraken', '#7a5cff', '#c9b8ff')}</span><span class="back-name">ABYSSAL COURT</span></div>`;
}

/** A creature standing in a lane: portrait, effective attack (tide bonus shown), health, shield. */
export function creatureHtml(state, hero, laneIndex, creature, creatureIndex, side) {
  const power = effectiveAttack(state, laneIndex, creature);
  const tide = laneIndex === state.tideLane;
  const attackable = side === 'player' && creature.canAttack && state.phase === 'player' && !state.over;
  const selected = state.selectedAttacker && state.selectedAttacker.lane === laneIndex && state.selectedAttacker.index === creatureIndex && side === 'player';
  const classes = ['minion', side];
  if (tide) classes.push('tide');
  if (attackable) classes.push('ready');
  if (selected) classes.push('selected');
  if (!creature.canAttack && side === 'player') classes.push('sleeping');
  const label = abilityLabel(creature.ability);
  return `<button class="${classes.join(' ')}" data-action="minion" data-side="${side}" data-lane="${laneIndex}" data-index="${creatureIndex}" style="--tint:${creature.tint};--glow:${creature.glow}" aria-label="${creature.name}, ${power} attack, ${creature.hp} health">
    ${creature.shield ? '<span class="shield" title="Bulwark shield"><svg viewBox="0 0 24 24"><path d="M12 2 L20 5 V11 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 11 V5Z"/></svg></span>' : ''}
    <span class="portrait">${creatureArt(creature.art, creature.tint, creature.glow)}</span>
    <span class="minion-name">${creature.name}</span>
    ${tide ? `<span class="tide-chip">TIDE +${TIDE_BONUS}</span>` : ''}
    ${label ? `<span class="chip mini">${label}</span>` : ''}
    <span class="stat atk">${power}</span>
    <span class="stat hp">${creature.hp}</span>
  </button>`;
}

function laneHtml(state, laneIndex) {
  const tide = laneIndex === state.tideLane;
  const foeRow = state.ai.lanes[laneIndex].map((c, i) => creatureHtml(state, state.ai, laneIndex, c, i, 'foe')).join('');
  const myRow = state.player.lanes[laneIndex].map((c, i) => creatureHtml(state, state.player, laneIndex, c, i, 'player')).join('');
  const target = state.selectedHand !== null || state.selectedAttacker ? ' targetable' : '';
  return `<div class="lane${tide ? ' high-tide' : ''}${target}" data-action="lane" data-lane="${laneIndex}">
    <div class="lane-head"><span class="lane-name">${LANES[laneIndex]}</span>${tide ? '<span class="tide-badge">HIGH TIDE +2 ATK</span>' : '<span class="tide-badge dim">low tide</span>'}</div>
    <div class="lane-row foe-row">${foeRow || '<span class="lane-empty">— empty water —</span>'}</div>
    <div class="lane-mid"></div>
    <div class="lane-row my-row">${myRow || '<span class="lane-empty">— your creatures gather here —</span>'}</div>
  </div>`;
}

/** Paint every region of the table from state. */
export function renderTable(state) {
  const foeHand = state.ai.hand.map(() => cardBackHtml()).join('');
  const myHand = state.player.hand.map((id, i) => cardHtml(id, i, state)).join('');
  const hint = state.selectedHand !== null
    ? 'Click a lane to summon the glowing card — or click another card to change your mind.'
    : state.selectedAttacker
      ? 'Now click an enemy creature to duel it, or Queen Morvain herself to strike her directly.'
      : state.phase === 'player'
        ? 'Click a card, then a lane to summon it. Click a glowing creature, then a target, to attack.'
        : 'Queen Morvain is taking her turn...';
  document.getElementById('foe-name').textContent = `${state.ai.name} — ${state.ai.title}`;
  document.getElementById('foe-life').innerHTML = lifeHtml(state.ai.life, state.ai.maxLife, 'foe');
  document.getElementById('foe-hand').innerHTML = foeHand;
  document.getElementById('foe-count').textContent = `${state.ai.hand.length} cards in hand · ${state.ai.deck.length} left in deck`;
  document.getElementById('foe-bubbles').innerHTML = bubblesHtml(state.ai.bubbles, state.ai.maxBubbles, 'Morvain bubbles');
  document.getElementById('foe-portrait').innerHTML = creatureArt('kraken', '#b388ff', '#e6ccff');
  document.getElementById('tide-banner').innerHTML = `HIGH TIDE: <b>${LANES[state.tideLane]}</b> — creatures there fight with +${TIDE_BONUS} attack`;
  document.getElementById('lanes').innerHTML = [0, 1, 2].map((i) => laneHtml(state, i)).join('');
  document.getElementById('my-life').innerHTML = lifeHtml(state.player.life, state.player.maxLife, 'mine');
  document.getElementById('my-bubbles').innerHTML = bubblesHtml(state.player.bubbles, state.player.maxBubbles, 'Your bubbles');
  document.getElementById('my-hand').innerHTML = myHand || '<span class="lane-empty">Your hand is empty — draw next turn.</span>';
  document.getElementById('my-count').textContent = `${state.player.hand.length} cards in hand · ${state.player.deck.length} left in deck`;
  document.getElementById('turn-label').textContent = `TURN ${state.turn}`;
  document.getElementById('hint').textContent = hint;
  document.getElementById('log').innerHTML = state.log.map((line) => `<li>${line}</li>`).join('');
  const endBtn = document.getElementById('end-turn');
  endBtn.disabled = state.phase !== 'player' || state.over;
  endBtn.textContent = state.phase === 'player' ? 'END TURN ▸' : 'MORVAIN PLAYS…';
  document.getElementById('foe-bar').classList.toggle('active', state.phase === 'ai');
  document.getElementById('my-bar').classList.toggle('active', state.phase === 'player');
}

/** Paint the win or loss screen, with the duel's stats. */
export function renderEnd(state) {
  const el = document.getElementById('end-screen');
  const won = state.winner === 'player';
  const s = state.stats;
  el.className = won ? 'end win' : 'end loss';
  el.innerHTML = `<div class="end-card">
    <div class="end-art">${creatureArt(won ? 'kraken' : 'horror', won ? '#ffd166' : '#8d6bff', won ? '#fff3c9' : '#d3c4ff')}</div>
    <h2>${won ? 'THE TIDE IS YOURS!' : 'SWALLOWED BY THE DEEP...'}</h2>
    <p class="end-sub">${won
      ? 'Queen Morvain bows to the new Tidekeeper. The Abyssal Court is yours.'
      : 'Queen Morvain keeps her throne — this time. The tide will turn again.'}</p>
    <div class="end-stats">
      <div><b>${s.turnsTaken}</b><span>turns played</span></div>
      <div><b>${s.cardsPlayed}</b><span>creatures summoned</span></div>
      <div><b>${s.damageDealt}</b><span>damage dealt</span></div>
      <div><b>${state.player.life}</b><span>your life left</span></div>
    </div>
    <button class="big-btn" data-action="again">PLAY AGAIN</button>
    <button class="ghost-btn" data-action="title">BACK TO TITLE</button>
  </div>`;
}

/** Show exactly one screen: title, table, or the end screen over the table. */
export function showScreen(state) {
  document.getElementById('title-screen').hidden = state.screen !== 'title';
  document.getElementById('table').hidden = state.screen === 'title';
  const end = document.getElementById('end-screen');
  end.hidden = !(state.screen === 'win' || state.screen === 'loss');
  if (state.screen === 'win' || state.screen === 'loss') renderEnd(state);
  if (state.screen !== 'title') renderTable(state);
}
