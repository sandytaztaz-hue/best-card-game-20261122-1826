// TIDEBREAK engine: the rules of the duel, with no DOM in it at all.
// Two heroes (you, the Tidekeeper, and Queen Morvain of the Abyssal Court) each hold
// 30 life. Three lanes — Shallows, Reef, Abyss — hold creatures. Every turn the tide
// rises in one lane and creatures there fight with +2 attack. Bubbles are mana: your
// maximum grows by 1 each turn to 10 and refills at the start of your turn, and you
// draw a card each turn. Summon a creature into a lane, then attack with it: it fights
// an enemy creature (both strike back) or strikes the enemy hero directly. A creature
// cannot attack the turn it is summoned unless it is Swift. Bulwark shields block the
// first damage a creature takes. The duel ends the moment a hero reaches 0 life.
import { CARDS, LANES, START_LIFE, TIDE_BONUS, MAX_BUBBLES, cardById, buildDeck } from './cards.js';

/** Deterministic rng (mulberry32) so screenshot scenes always stage the same way. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function newHero(name, title, rng) {
  return {
    name, title,
    life: START_LIFE, maxLife: START_LIFE,
    bubbles: 1, maxBubbles: 1,
    deck: buildDeck(rng),
    hand: [],
    lanes: [[], [], []],
  };
}

/** A fresh duel, both hands dealt (3 cards each), tide on the Shallows. */
export function newGame(seed = 7) {
  const rng = mulberry32(seed);
  const state = {
    seed,
    screen: 'title',
    turn: 1,
    phase: 'player',
    tideLane: 0,
    player: newHero('Tidekeeper', 'Warden of the Shallows', rng),
    ai: newHero('Queen Morvain', 'of the Abyssal Court', rng),
    log: [],
    selectedHand: null,
    selectedAttacker: null,
    stats: { cardsPlayed: 0, damageDealt: 0, turnsTaken: 0 },
    over: false,
    winner: null,
  };
  drawCards(state.player, 3);
  drawCards(state.ai, 3);
  // Opening hands always hold a 1-bubble creature: with only three of them in the
  // deck, an unguarded shuffle too often opens with an empty first turn.
  ensureOpeningPlay(state.player, rng);
  ensureOpeningPlay(state.ai, rng);
  logLine(state, 'The tide rolls in. Queen Morvain awaits your first move.');
  return state;
}

/** Append a line to the combat log (newest first, capped at 40). */
export function logLine(state, text) {
  state.log.unshift(text);
  if (state.log.length > 40) state.log.length = 40;
}

/** Swap a 1-cost card from the deck into the opening hand when it holds none. */
function ensureOpeningPlay(hero, rng) {
  if (hero.hand.some((id) => cardById(id).cost === 1)) return;
  const deckIndex = hero.deck.findIndex((id) => cardById(id).cost === 1);
  if (deckIndex < 0) return;
  const swapOut = Math.floor(rng() * hero.hand.length);
  const oneCost = hero.deck.splice(deckIndex, 1)[0];
  hero.deck.push(hero.hand[swapOut]);
  hero.hand[swapOut] = oneCost;
}

/** Draw up to n cards; an empty deck simply draws nothing (no fatigue, keep it friendly). */
export function drawCards(hero, n) {
  for (let i = 0; i < n; i += 1) {
    const id = hero.deck.shift();
    if (id) hero.hand.push(id);
  }
}

/** Attack a creature shows in its lane, with the +2 tide bonus when the tide is high there. */
export function effectiveAttack(state, laneIndex, creature) {
  return creature.atk + (laneIndex === state.tideLane ? TIDE_BONUS : 0);
}

/** Build a live creature from a card definition and drop it in a lane. */
export function summonCreature(state, hero, cardId, laneIndex) {
  const def = cardById(cardId);
  const creature = {
    id: def.id, name: def.name, cost: def.cost,
    atk: def.atk, hp: def.hp, maxHp: def.hp,
    ability: def.ability, art: def.art, tint: def.tint, glow: def.glow, text: def.text,
    shield: def.ability === 'bulwark',
    canAttack: def.ability === 'swift',
    justSummoned: true,
  };
  hero.lanes[laneIndex].push(creature);
  return creature;
}

/** Apply one instance of damage to a creature; a Bulwark shield eats it whole first. */
export function damageCreature(state, hero, laneIndex, creatureIndex, amount, sourceName) {
  const creature = hero.lanes[laneIndex][creatureIndex];
  if (!creature) return false;
  if (creature.shield && amount > 0) {
    creature.shield = false;
    logLine(state, `${creature.name}'s coral shield shatters — no damage taken.`);
    return false;
  }
  creature.hp -= amount;
  if (creature.hp <= 0) {
    hero.lanes[laneIndex].splice(creatureIndex, 1);
    logLine(state, `${creature.name} sinks into the deep.`);
    return true;
  }
  return false;
}

/** Fire a creature's on-play effect the moment it enters its lane. */
export function applyOnPlay(state, hero, foe, creature, laneIndex) {
  const ability = creature.ability;
  if (ability === 'draw') {
    drawCards(hero, 1);
    logLine(state, `${creature.name} calls the current — ${hero === state.player ? 'you draw' : 'Morvain draws'} a card.`);
  } else if (ability === 'heal3' || ability === 'heal5') {
    const amount = ability === 'heal3' ? 3 : 5;
    hero.life = Math.min(hero.maxLife, hero.life + amount);
    logLine(state, `${creature.name} mends ${amount} life.`);
  } else if (ability === 'bubble') {
    hero.bubbles = Math.min(MAX_BUBBLES, hero.bubbles + 1);
    logLine(state, `${creature.name} blows an extra bubble (+1).`);
  } else if (ability === 'splash2') {
    foe.life -= 2;
    if (hero === state.player) state.stats.damageDealt += 2;
    logLine(state, `${creature.name} splashes 2 damage at ${foe === state.ai ? 'Queen Morvain' : 'you'}.`);
    checkEnd(state);
  } else if (ability === 'weaken2' || ability === 'weaken3') {
    const amount = ability === 'weaken2' ? 2 : 3;
    const foes = foe.lanes[laneIndex];
    if (foes.length > 0) {
      const target = foes[foes.length - 1];
      target.atk = Math.max(0, target.atk - amount);
      logLine(state, `${creature.name} ${ability === 'weaken2' ? 'inks' : 'sings'} ${target.name} down to ${target.atk} attack.`);
    }
  }
}

/** Play a card from a hero's hand into a lane. Returns the creature or null. */
export function playCard(state, hero, foe, handIndex, laneIndex) {
  const cardId = hero.hand[handIndex];
  if (!cardId) return null;
  const def = cardById(cardId);
  if (hero.bubbles < def.cost) return null;
  if (hero.lanes[laneIndex].length >= 4) return null;
  hero.bubbles -= def.cost;
  hero.hand.splice(handIndex, 1);
  const creature = summonCreature(state, hero, cardId, laneIndex);
  if (hero === state.player) state.stats.cardsPlayed += 1;
  logLine(state, `${hero === state.player ? 'You summon' : 'Morvain summons'} ${def.name} to the ${LANES[laneIndex]} (${def.cost} bubbles).`);
  applyOnPlay(state, hero, foe, creature, laneIndex);
  checkEnd(state);
  return creature;
}

/**
 * One creature attacks. Target { kind: 'hero' } strikes the enemy hero directly;
 * target { kind: 'creature', lane, index } fights that creature and takes its
 * retaliation. Returns true when an attack happened.
 */
export function attackWith(state, hero, foe, laneIndex, creatureIndex, target) {
  const attacker = hero.lanes[laneIndex][creatureIndex];
  if (!attacker || !attacker.canAttack || state.over) return false;
  const power = effectiveAttack(state, laneIndex, attacker);
  attacker.canAttack = false;
  if (target.kind === 'hero') {
    foe.life -= power;
    if (hero === state.player) state.stats.damageDealt += power;
    logLine(state, `${attacker.name} crashes into ${foe === state.ai ? 'Queen Morvain' : 'you'} for ${power}.`);
    checkEnd(state);
    return true;
  }
  const defender = foe.lanes[target.lane][target.index];
  if (!defender) return false;
  const back = effectiveAttack(state, target.lane, defender);
  logLine(state, `${attacker.name} (${power}) duels ${defender.name} (${back}) in the ${LANES[target.lane]}.`);
  damageCreature(state, foe, target.lane, target.index, power, attacker.name);
  // Retaliation only happens if the defender survived the blow.
  const alive = foe.lanes[target.lane].includes(defender);
  if (alive && back > 0) {
    const atkLane = hero.lanes[laneIndex];
    const atkIndex = atkLane.indexOf(attacker);
    if (atkIndex >= 0) damageCreature(state, hero, laneIndex, atkIndex, back, defender.name);
  }
  checkEnd(state);
  return true;
}

/** Begin a hero's turn: tide moves, bubbles grow and refill, a card is drawn, creatures wake. */
export function startTurn(state, hero) {
  state.tideLane = (state.turn - 1) % 3;
  hero.maxBubbles = Math.min(MAX_BUBBLES, state.turn);
  hero.bubbles = hero.maxBubbles;
  drawCards(hero, 1);
  for (const lane of hero.lanes) {
    for (const creature of lane) {
      creature.canAttack = true;
      creature.justSummoned = false;
    }
  }
}

/** End the current hero's turn and hand the table to the other side. */
export function endTurn(state) {
  state.selectedHand = null;
  state.selectedAttacker = null;
  if (state.phase === 'player') {
    state.phase = 'ai';
    state.stats.turnsTaken += 1;
    logLine(state, `— Turn ${state.turn} ends. Queen Morvain stirs... —`);
  } else {
    state.phase = 'player';
    state.turn += 1;
    startTurn(state, state.player);
    logLine(state, `— Turn ${state.turn}: the tide rises in the ${LANES[state.tideLane]} (+2 attack there) —`);
  }
}

/** Check for a hero at 0 life and set the end screen. */
export function checkEnd(state) {
  if (state.over) return;
  if (state.ai.life <= 0) {
    state.ai.life = 0;
    state.over = true;
    state.winner = 'player';
    state.screen = 'win';
    logLine(state, 'Queen Morvain yields! The tide is yours!');
  } else if (state.player.life <= 0) {
    state.player.life = 0;
    state.over = true;
    state.winner = 'ai';
    state.screen = 'loss';
    logLine(state, 'The deep swallows the Tidekeeper...');
  }
}

/** Total attack power a hero currently fields (for the AI's lethal check). */
export function readyPower(state, hero) {
  let total = 0;
  hero.lanes.forEach((lane, laneIndex) => {
    lane.forEach((creature) => {
      if (creature.canAttack) total += effectiveAttack(state, laneIndex, creature);
    });
  });
  return total;
}
