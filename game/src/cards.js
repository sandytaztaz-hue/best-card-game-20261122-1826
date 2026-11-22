// TIDEBREAK card catalogue: every creature in the 24-card Tide Deck.
// A card is an original deep-sea creature with a bubble cost, an attack, a health total
// and at most one keyword or on-play effect. Costs run 1-7 so a game lasts 6-10 turns:
// cheap swifts and blockers early, krakens and leviathans late. No card copies any
// commercial game; names, art and effects are all written for this game.
//
// Keywords:
//   swift   — the creature can attack the turn it is summoned.
//   bulwark — the creature carries a coral shield that blocks the first damage it takes.
// On-play effects (fire once, when the creature enters its lane):
//   draw    — draw a card.   heal n — restore n life to your hero.
//   weaken n — an enemy creature in the same lane loses n attack (min 0).
//   splash n — deal n damage to the enemy hero.   bubble — gain 1 bubble this turn.
export const LANES = ['Shallows', 'Reef', 'Abyss'];
export const TIDE_BONUS = 2;
export const START_LIFE = 30;
export const MAX_BUBBLES = 10;
export const DECK_SIZE = 24;

export const CARDS = [
  { id: 'sprite',   name: 'Bubble Sprite',   cost: 1, atk: 1, hp: 1, ability: 'swift',   art: 'sprite',   tint: '#7fe7ff', glow: '#bff4ff', text: 'Swift — attacks the turn it is played.' },
  { id: 'glow-eel', name: 'Glow Eel',        cost: 1, atk: 1, hp: 2, ability: null,      art: 'eel',      tint: '#9dffb0', glow: '#d8ffe0', text: 'A shy spark that slips between the rocks.' },
  { id: 'oyster',   name: 'Pearl Oyster',    cost: 1, atk: 0, hp: 3, ability: 'heal3',   art: 'oyster',   tint: '#ffd9f2', glow: '#fff0fa', text: 'On play: heal your hero for 3.' },
  { id: 'lantern',  name: 'Lanternfish',     cost: 2, atk: 2, hp: 2, ability: 'swift',   art: 'fish',     tint: '#ffe27a', glow: '#fff6c9', text: 'Swift — attacks the turn it is played.' },
  { id: 'kelp',     name: 'Kelp Warden',     cost: 2, atk: 1, hp: 4, ability: 'bulwark', art: 'kelp',     tint: '#5fe08a', glow: '#c9f7d8', text: 'Bulwark — blocks the first damage it takes.' },
  { id: 'hermit',   name: 'Hermit Guard',    cost: 2, atk: 0, hp: 5, ability: 'bulwark', art: 'shell',    tint: '#ffb38a', glow: '#ffe3d1', text: 'Bulwark — blocks the first damage it takes.' },
  { id: 'squid',    name: 'Ink Squid',       cost: 2, atk: 2, hp: 2, ability: 'weaken2', art: 'squid',    tint: '#c9a7ff', glow: '#e9dcff', text: 'On play: a foe in this lane loses 2 attack.' },
  { id: 'herald',   name: 'Seahorse Herald', cost: 2, atk: 2, hp: 1, ability: 'bubble',  art: 'seahorse', tint: '#ff9ecf', glow: '#ffd6ec', text: 'On play: gain 1 bubble this turn.' },
  { id: 'knight',   name: 'Coral Knight',    cost: 3, atk: 3, hp: 3, ability: 'bulwark', art: 'knight',   tint: '#ff8a7a', glow: '#ffd2cc', text: 'Bulwark — blocks the first damage it takes.' },
  { id: 'caller',   name: 'Tidecaller',      cost: 3, atk: 2, hp: 3, ability: 'draw',    art: 'caller',   tint: '#6fd3ff', glow: '#cdeeff', text: 'On play: draw a card.' },
  { id: 'corsair',  name: 'Eel Corsair',     cost: 3, atk: 3, hp: 2, ability: 'swift',   art: 'eel',      tint: '#8affd8', glow: '#d2fff0', text: 'Swift — attacks the turn it is played.' },
  { id: 'sage',     name: 'Nautilus Sage',   cost: 3, atk: 1, hp: 3, ability: 'draw',    art: 'shell',    tint: '#d8b4ff', glow: '#efe2ff', text: 'On play: draw a card.' },
  { id: 'puffer',   name: 'Pufferfish',      cost: 3, atk: 2, hp: 4, ability: 'splash2', art: 'puffer',   tint: '#ffd166', glow: '#ffedbb', text: 'On play: splash 2 damage at the enemy hero.' },
  { id: 'angler',   name: 'Anglerfiend',     cost: 4, atk: 4, hp: 3, ability: null,      art: 'angler',   tint: '#ff7ad9', glow: '#ffc9ef', text: 'Its lure glows. Its teeth do the rest.' },
  { id: 'shark',    name: 'Reef Shark',      cost: 4, atk: 4, hp: 4, ability: null,      art: 'shark',    tint: '#7ab8ff', glow: '#cbE4ff', text: 'Patrols the Reef and answers to no one.' },
  { id: 'manta',    name: 'Manta Ray',       cost: 4, atk: 3, hp: 5, ability: 'swift',   art: 'manta',    tint: '#9aa8ff', glow: '#dde1ff', text: 'Swift — attacks the turn it is played.' },
  { id: 'jelly',    name: 'Bubble Jelly',    cost: 4, atk: 2, hp: 5, ability: 'heal5',   art: 'jelly',    tint: '#ff9ff3', glow: '#ffd6f9', text: 'On play: heal your hero for 5.' },
  { id: 'golem',    name: 'Coral Golem',     cost: 5, atk: 4, hp: 7, ability: 'bulwark', art: 'golem',    tint: '#ff9a5c', glow: '#ffd9bd', text: 'Bulwark — blocks the first damage it takes.' },
  { id: 'hatch',    name: 'Kraken Hatchling', cost: 5, atk: 5, hp: 5, ability: null,     art: 'kraken',   tint: '#c77dff', glow: '#e6ccff', text: 'Small now. Give it a turn and regret it.' },
  { id: 'serpent',  name: 'Tide Serpent',    cost: 5, atk: 5, hp: 4, ability: 'swift',   art: 'serpent',  tint: '#5ce1e6', glow: '#c2f7f9', text: 'Swift — attacks the turn it is played.' },
  { id: 'siren',    name: 'Siren of the Deep', cost: 5, atk: 3, hp: 6, ability: 'weaken3', art: 'siren',  tint: '#ff6b9d', glow: '#ffc2d6', text: 'On play: a foe in this lane loses 3 attack.' },
  { id: 'horror',   name: 'Abyssal Horror',  cost: 6, atk: 6, hp: 6, ability: null,      art: 'horror',   tint: '#8d6bff', glow: '#d3c4ff', text: 'It has seen the bottom. The bottom blinked.' },
  { id: 'leviathan', name: 'Leviathan Calf', cost: 6, atk: 7, hp: 5, ability: null,      art: 'leviathan', tint: '#4dd0e1', glow: '#b2ebf2', text: 'A calf. Imagine its mother.' },
  { id: 'kraken',   name: 'Ancient Kraken',  cost: 7, atk: 8, hp: 8, ability: null,      art: 'kraken',   tint: '#e040fb', glow: '#f3c4ff', text: 'The tide itself, wearing tentacles.' },
];

/** Look a card definition up by id. */
export function cardById(id) {
  return CARDS.find((card) => card.id === id);
}

/** A fresh shuffled 24-card deck (one of every creature), using the given rng. */
export function buildDeck(rng) {
  const deck = CARDS.map((card) => card.id);
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Short human label for an ability, shown as a coloured keyword chip on the card. */
export function abilityLabel(ability) {
  switch (ability) {
    case 'swift': return 'SWIFT';
    case 'bulwark': return 'BULWARK';
    case 'draw': return 'DRAW';
    case 'heal3': return 'HEAL 3';
    case 'heal5': return 'HEAL 5';
    case 'weaken2': return 'INK −2';
    case 'weaken3': return 'SONG −3';
    case 'splash2': return 'SPLASH 2';
    case 'bubble': return '+1 BUBBLE';
    default: return '';
  }
}
