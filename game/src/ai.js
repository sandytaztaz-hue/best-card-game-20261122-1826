// Queen Morvain's brain: a readable, counterable opponent.
// She plays in three visible steps — summon, then attack, then pass — with a short
// pause between each move so you can watch her thinking and answer it.
// Her rules, in order:
//   1. If her ready creatures can kill you outright, she strikes your hero and wins.
//   2. She summons her most expensive affordable card into the lane where it matters
//      most (the high-tide lane first, then the lane where you are weakest).
//   3. Each ready creature takes the best trade it can win (kill a foe and survive),
//      otherwise it strikes your hero. Bulwark shields make her think twice: she will
//      not throw a creature at a shielded wall unless the trade still wins.
import { LANES, cardById } from './cards.js';
import { effectiveAttack, playCard, attackWith, readyPower, endTurn } from './engine.js';

const PAUSE_MS = 650;

/** Wait a beat so the move lands on screen before the next one. */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pick the lane Morvain should summon into: high tide first, else your thinnest lane. */
function bestLane(state) {
  let best = state.tideLane;
  let bestScore = -1;
  for (let lane = 0; lane < 3; lane += 1) {
    if (state.ai.lanes[lane].length >= 4) continue;
    const score = (lane === state.tideLane ? 3 : 0)
      + (4 - state.player.lanes[lane].length)
      + (state.player.lanes[lane].length === 0 ? 1 : 0);
    if (score > bestScore) { bestScore = score; best = lane; }
  }
  return best;
}

/** Her summon step: play the priciest card she can afford, again and again while she can. */
function summonStep(state) {
  const moves = [];
  let guard = 0;
  while (guard < 8) {
    guard += 1;
    let pick = -1;
    let pickCost = -1;
    state.ai.hand.forEach((cardId, index) => {
      const def = cardById(cardId);
      if (def.cost <= state.ai.bubbles && def.cost > pickCost) { pick = index; pickCost = def.cost; }
    });
    if (pick < 0) break;
    const lane = bestLane(state);
    const def = cardById(state.ai.hand[pick]);
    const creature = playCard(state, state.ai, state.player, pick, lane);
    if (!creature) break;
    moves.push(`${def.name} → ${LANES[lane]}`);
    if (state.over) break;
  }
  return moves;
}

/** Her attack step: one ready creature at a time, best trade first, else your hero. */
function attackStep(state) {
  const moves = [];
  for (let lane = 0; lane < 3 && !state.over; lane += 1) {
    for (let i = 0; i < state.ai.lanes[lane].length && !state.over; i += 1) {
      const attacker = state.ai.lanes[lane][i];
      if (!attacker || !attacker.canAttack) continue;
      const power = effectiveAttack(state, lane, attacker);
      // Lethal first: if everything ready can end you, she goes for the hero.
      if (readyPower(state, state.ai) >= state.player.life) {
        attackWith(state, state.ai, state.player, lane, i, { kind: 'hero' });
        moves.push(`${attacker.name} strikes you for ${power} — lethal!`);
        continue;
      }
      // Best winning trade: kill a foe and live through the retaliation.
      let target = null;
      let targetScore = -1;
      for (let foeLane = 0; foeLane < 3; foeLane += 1) {
        state.player.lanes[foeLane].forEach((foe, foeIndex) => {
          const foePower = effectiveAttack(state, foeLane, foe);
          const kills = foe.shield ? false : power >= foe.hp;
          const survives = foe.shield ? true : attacker.hp > foePower;
          const score = (kills ? 10 : 0) + (survives ? 5 : 0) + foe.cost;
          if (kills && score > targetScore) { targetScore = score; target = { kind: 'creature', lane: foeLane, index: foeIndex }; }
        });
      }
      if (target) {
        attackWith(state, state.ai, state.player, lane, i, target);
        moves.push(`${attacker.name} duels in the ${LANES[target.lane]}`);
      } else {
        attackWith(state, state.ai, state.player, lane, i, { kind: 'hero' });
        moves.push(`${attacker.name} strikes you for ${power}`);
      }
    }
  }
  return moves;
}

/**
 * Run Morvain's whole turn, pausing between moves, calling onRender after each one
 * so the table updates live. onSound plays the splash for every attack she makes.
 */
export async function takeAiTurn(state, onRender, onSound) {
  if (state.over || state.phase !== 'ai') return;
  await wait(PAUSE_MS);
  const summoned = summonStep(state);
  for (const move of summoned) { onRender(); onSound('summon'); await wait(PAUSE_MS); if (state.over) break; }
  if (!state.over) {
    const attacks = attackStep(state);
    for (const move of attacks) { onRender(); onSound('attack'); await wait(PAUSE_MS); if (state.over) break; }
  }
  if (state.over) { onRender(); return; }
  // Her turn is done: hand the table back and start your next turn.
  endTurn(state);
  onRender();
}
