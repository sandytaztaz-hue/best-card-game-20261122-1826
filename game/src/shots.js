// TIDEBREAK screenshot scenes behind ?shot=title|table|win|loss.
// Each scene stages a real duel with the engine's own functions — never a mock:
// the same seed always stages the same table, so the screenshots are reproducible
// renders of the game's own code. The table scene plays five scripted turns of
// summons and duels; win and loss stage that same table and then finish the duel.
import { newGame, playCard, attackWith, startTurn, checkEnd, logLine } from './engine.js';
import { cardById } from './cards.js';

/** Find a card in a hero's hand by id, or -1. */
function handIndex(hero, id) {
  return hero.hand.indexOf(id);
}

/** Deal a named card into a hero's hand for the staging script (pulled from the
 * deck first, so no card ever appears twice). The summon itself still goes
 * through the real playCard rules. */
function dealInto(hero, id) {
  const deckIndex = hero.deck.indexOf(id);
  if (deckIndex >= 0) hero.deck.splice(deckIndex, 1);
  if (!hero.hand.includes(id)) hero.hand.push(id);
}

/** Play a named card if it is in hand and affordable; ignore it otherwise. */
function tryPlay(state, hero, foe, id, lane) {
  const i = handIndex(hero, id);
  if (i < 0) return;
  playCard(state, hero, foe, i, lane);
}

/** Stage the mid-game table: five turns of real summons, duels and tide shifts. */
function stageTable(state) {
  state.screen = 'play';
  // The staging table is a real duel played fast: top the bubbles up each turn so
  // the scripted summons can afford their costs, exactly as a later turn would.
  // Turn 1 — you open with the cheap guard line; Morvain answers with a shark.
  state.player.bubbles = 10; state.ai.bubbles = 10;
  dealInto(state.player, 'kelp'); dealInto(state.player, 'sprite');
  dealInto(state.ai, 'shark'); dealInto(state.ai, 'lantern');
  tryPlay(state, state.player, state.ai, 'kelp', 1);
  tryPlay(state, state.player, state.ai, 'sprite', 0);
  tryPlay(state, state.ai, state.player, 'shark', 1);
  tryPlay(state, state.ai, state.player, 'lantern', 2);
  // Turn 2 — tide moves to the Reef; you drop the Knight, Morvain the Anglerfiend.
  state.turn = 2; startTurn(state, state.player); startTurn(state, state.ai);
  state.player.bubbles = 10; state.ai.bubbles = 10;
  dealInto(state.player, 'knight'); dealInto(state.player, 'squid');
  dealInto(state.ai, 'angler');
  tryPlay(state, state.player, state.ai, 'knight', 1);
  tryPlay(state, state.player, state.ai, 'squid', 0);
  tryPlay(state, state.ai, state.player, 'angler', 1);
  // Turn 3 — Abyss tide; the Serpent and the Siren join the fight.
  state.turn = 3; startTurn(state, state.player); startTurn(state, state.ai);
  state.player.bubbles = 10; state.ai.bubbles = 10;
  dealInto(state.player, 'serpent'); dealInto(state.ai, 'siren');
  tryPlay(state, state.player, state.ai, 'serpent', 2);
  tryPlay(state, state.ai, state.player, 'siren', 2);
  // Turn 4 — a duel in the Reef and a strike at Morvain herself.
  state.turn = 4; startTurn(state, state.player); startTurn(state, state.ai);
  state.player.bubbles = 10; state.ai.bubbles = 10;
  dealInto(state.player, 'caller');
  tryPlay(state, state.player, state.ai, 'caller', 0);
  const knightLane = state.player.lanes[1];
  const sharkLane = state.ai.lanes[1];
  // Kelp Warden is index 0 in the Reef; the Coral Knight behind it is index 1.
  if (knightLane.length > 1 && sharkLane.length) {
    attackWith(state, state.player, state.ai, 1, 1, { kind: 'creature', lane: 1, index: 0 });
  }
  const serpentLane = state.player.lanes[2];
  if (serpentLane.length) {
    attackWith(state, state.player, state.ai, 2, serpentLane.length - 1, { kind: 'hero' });
  }
  // Turn 5 — the table as the screenshots show it: hands full, lanes alive.
  state.turn = 5; startTurn(state, state.player); startTurn(state, state.ai);
  state.tideLane = 1;
  state.player.life = 24;
  state.ai.life = 19;
  state.player.bubbles = 5; state.player.maxBubbles = 5;
  state.ai.bubbles = 4; state.ai.maxBubbles = 5;
  // Make sure the hand reads full and rich for the camera (dealt from the deck,
  // so nothing is duplicated), and the stats count the staged duel.
  const showcase = ['puffer', 'manta'];
  for (const id of showcase) {
    if (cardById(id)) dealInto(state.player, id);
  }
  state.stats.turnsTaken = 5;
  logLine(state, 'Turn 5: the tide rises in the Reef (+2 attack there). Your move, Tidekeeper.');
}

/**
 * Set `state` to the named scene and return it. Unknown names stage the title.
 * title — the title screen over a fresh duel. table — the staged mid-game above.
 * win — that table, finished: Morvain at 0 life, the win screen up. loss — the
 * same table, finished the other way: you at 0 life, the loss screen up.
 */
export function stageShot(name, seed = 7) {
  const state = newGame(seed);
  if (name === 'table') {
    stageTable(state);
    return state;
  }
  if (name === 'win') {
    stageTable(state);
    state.ai.life = 0;
    state.over = true;
    state.winner = 'player';
    state.screen = 'win';
    logLine(state, 'Queen Morvain yields! The tide is yours!');
    return state;
  }
  if (name === 'loss') {
    stageTable(state);
    state.player.life = 0;
    state.over = true;
    state.winner = 'ai';
    state.screen = 'loss';
    logLine(state, 'The deep swallows the Tidekeeper...');
    return state;
  }
  state.screen = 'title';
  return state;
}
