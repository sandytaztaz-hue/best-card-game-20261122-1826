// TIDEBREAK creature art: one inline SVG portrait per creature family.
// No image files and no network — every portrait is drawn here from shapes in the
// card's own tint, over a soft radial glow. Each family has its own silhouette, so a
// card is told apart by shape and colour, never by text alone: fish and eels swim,
// jellies drift, krakens reach, knights stand guard.
const SHAPES = {
  sprite: '<circle cx="50" cy="42" r="20"/><circle cx="34" cy="62" r="10"/><circle cx="66" cy="64" r="8"/><circle cx="50" cy="42" r="7" fill="#fff" opacity="0.7"/>',
  eel: '<path d="M18 62 Q32 30 50 52 Q66 72 82 40" fill="none" stroke-width="9" stroke-linecap="round"/><circle cx="82" cy="40" r="6"/><circle cx="84" cy="38" r="2" fill="#06222e"/>',
  oyster: '<path d="M20 58 Q50 18 80 58 Q50 78 20 58Z"/><circle cx="50" cy="54" r="9" fill="#fff"/><path d="M28 62 Q50 74 72 62" fill="none" stroke-width="4" stroke-linecap="round"/>',
  fish: '<path d="M22 50 Q48 26 72 50 Q48 74 22 50Z"/><path d="M70 50 L88 34 L88 66 Z"/><circle cx="36" cy="46" r="4" fill="#06222e"/><path d="M48 40 Q54 50 48 60" fill="none" stroke-width="3" stroke-linecap="round"/>',
  kelp: '<path d="M34 82 Q26 52 38 26" fill="none" stroke-width="7" stroke-linecap="round"/><path d="M50 82 Q50 48 58 22" fill="none" stroke-width="7" stroke-linecap="round"/><path d="M66 82 Q74 54 62 30" fill="none" stroke-width="7" stroke-linecap="round"/>',
  shell: '<path d="M20 62 A30 30 0 0 1 80 62 Z"/><path d="M50 34 L50 62 M38 40 L44 62 M62 40 L56 62" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="66" r="4" fill="#fff" opacity="0.8"/>',
  squid: '<path d="M28 52 A22 22 0 0 1 72 52 L72 58 L28 58Z"/><path d="M34 58 Q32 78 38 82 M44 58 Q44 80 50 84 M56 58 Q58 80 62 82 M66 58 Q68 76 62 82" fill="none" stroke-width="4" stroke-linecap="round"/><circle cx="42" cy="46" r="3" fill="#06222e"/><circle cx="58" cy="46" r="3" fill="#06222e"/>',
  seahorse: '<path d="M58 22 Q40 28 44 46 Q48 60 38 70 Q30 78 40 84" fill="none" stroke-width="8" stroke-linecap="round"/><circle cx="56" cy="28" r="7"/><path d="M62 22 L72 18 M60 16 L66 10" stroke-width="4" stroke-linecap="round"/>',
  knight: '<path d="M50 20 L62 34 L58 62 L42 62 L38 34Z"/><path d="M30 30 L44 40 M70 30 L56 40 M50 18 L50 8" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="72" r="8"/>',
  caller: '<path d="M16 66 Q30 52 50 64 Q70 76 84 60" fill="none" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="38" r="14"/><circle cx="50" cy="38" r="6" fill="#fff" opacity="0.75"/>',
  puffer: '<circle cx="50" cy="50" r="22"/><path d="M50 20 L50 10 M50 80 L50 90 M20 50 L10 50 M80 50 L90 50 M29 29 L22 22 M71 29 L78 22 M29 71 L22 78 M71 71 L78 78" stroke-width="5" stroke-linecap="round"/><circle cx="42" cy="46" r="3" fill="#06222e"/><circle cx="58" cy="46" r="3" fill="#06222e"/>',
  angler: '<path d="M20 52 Q46 28 70 50 Q46 72 20 52Z"/><path d="M68 50 L86 36 L86 64Z"/><path d="M44 36 Q44 20 60 18" fill="none" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="18" r="5" fill="#fff"/><circle cx="34" cy="48" r="3" fill="#06222e"/>',
  shark: '<path d="M14 56 Q40 34 76 52 L88 48 L80 58 Q50 72 14 56Z"/><path d="M46 42 L56 26 L60 42Z"/><circle cx="30" cy="52" r="3" fill="#06222e"/>',
  manta: '<path d="M50 52 Q22 30 12 44 Q30 52 44 58 Q50 62 56 58 Q70 52 88 44 Q78 30 50 52Z"/><circle cx="50" cy="56" r="4"/><path d="M50 58 L50 74" stroke-width="4" stroke-linecap="round"/>',
  jelly: '<path d="M26 52 A24 24 0 0 1 74 52 L74 56 L26 56Z"/><path d="M34 56 Q32 74 38 80 M50 56 Q50 76 50 82 M66 56 Q68 74 62 80" fill="none" stroke-width="4" stroke-linecap="round"/><circle cx="42" cy="44" r="3" fill="#fff" opacity="0.8"/><circle cx="58" cy="44" r="3" fill="#fff" opacity="0.8"/>',
  golem: '<rect x="34" y="30" width="32" height="26" rx="6"/><rect x="28" y="56" width="44" height="22" rx="6"/><circle cx="44" cy="42" r="3" fill="#06222e"/><circle cx="56" cy="42" r="3" fill="#06222e"/><path d="M44 48 L56 48" stroke-width="3" stroke-linecap="round"/>',
  kraken: '<path d="M30 50 A20 20 0 0 1 70 50 L70 54 L30 54Z"/><path d="M34 54 Q28 74 36 80 M44 54 Q42 76 48 82 M56 54 Q58 76 52 82 M66 54 Q72 74 64 80" fill="none" stroke-width="5" stroke-linecap="round"/><circle cx="43" cy="44" r="3" fill="#06222e"/><circle cx="57" cy="44" r="3" fill="#06222e"/>',
  serpent: '<path d="M26 74 Q44 58 38 44 Q32 30 52 26 Q72 22 74 38" fill="none" stroke-width="9" stroke-linecap="round"/><circle cx="74" cy="38" r="6"/><circle cx="76" cy="36" r="2" fill="#06222e"/>',
  siren: '<circle cx="50" cy="30" r="11"/><path d="M50 44 Q36 58 40 76 Q50 68 60 76 Q64 58 50 44Z"/><path d="M28 62 Q40 56 50 62 Q60 56 72 62" fill="none" stroke-width="4" stroke-linecap="round"/>',
  horror: '<circle cx="50" cy="50" r="24"/><circle cx="40" cy="44" r="5" fill="#fff"/><circle cx="60" cy="44" r="5" fill="#fff"/><circle cx="50" cy="60" r="5" fill="#fff"/><circle cx="40" cy="44" r="2" fill="#06222e"/><circle cx="60" cy="44" r="2" fill="#06222e"/><circle cx="50" cy="60" r="2" fill="#06222e"/>',
  leviathan: '<path d="M14 54 Q34 30 62 40 Q84 48 86 58 Q60 70 34 66 Q16 62 14 54Z"/><path d="M78 44 L88 34 M80 48 L90 46" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="50" r="3" fill="#06222e"/>',
};

/** Portrait SVG for a creature family, tinted and glowing in the card's colours. */
export function creatureArt(art, tint, glow) {
  const shape = SHAPES[art] || SHAPES.fish;
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="g-${art}" cx="50%" cy="42%" r="65%"><stop offset="0%" stop-color="${glow}"/><stop offset="100%" stop-color="${tint}" stop-opacity="0.25"/></radialGradient></defs><circle cx="50" cy="50" r="46" fill="url(#g-${art})"/><g fill="${tint}" stroke="${tint}">${shape}</g></svg>`;
}
