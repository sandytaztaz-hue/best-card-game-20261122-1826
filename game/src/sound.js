// TIDEBREAK sounds: tiny WebAudio synth, no audio files and no network.
// Every effect is an oscillator (or a short arpeggio of them) through one master gain,
// so the game stays silent until you first click — browsers require that gesture —
// and the mute button silences it all. The palette is watery on purpose: high sine
// blips for bubbles, a low splash for attacks, a rising fanfare for a win and a
// slow low drone for a loss.
let ctx = null;
let muted = false;
let master = null;

/** Create the audio context on the first user gesture; safe to call any time. */
export function ensureAudio() {
  if (!ctx) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch (err) {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

/** Flip the mute; returns the new muted state for the button label. */
export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.35;
  return muted;
}

/** One soft tone: frequency, seconds, wave shape, and an optional start delay. */
function tone(freq, dur, type = 'sine', delay = 0, volume = 0.5) {
  if (!ctx || muted || !master) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Play a named effect. Unknown names are silent — a bad name never breaks a turn. */
export function playSound(name) {
  ensureAudio();
  if (!ctx || muted) return;
  switch (name) {
    case 'click':
      tone(740, 0.09, 'sine', 0, 0.4);
      break;
    case 'summon':
      tone(520, 0.16, 'sine', 0, 0.45);
      tone(780, 0.2, 'sine', 0.07, 0.4);
      tone(1040, 0.22, 'sine', 0.14, 0.3);
      break;
    case 'attack':
      tone(180, 0.28, 'sawtooth', 0, 0.35);
      tone(90, 0.3, 'triangle', 0.02, 0.5);
      tone(1200, 0.08, 'sine', 0, 0.2);
      break;
    case 'hurt':
      tone(220, 0.25, 'triangle', 0, 0.5);
      tone(160, 0.3, 'triangle', 0.08, 0.45);
      break;
    case 'heal':
      tone(660, 0.2, 'sine', 0, 0.35);
      tone(880, 0.25, 'sine', 0.09, 0.35);
      break;
    case 'turn':
      tone(440, 0.12, 'sine', 0, 0.4);
      tone(587, 0.14, 'sine', 0.08, 0.4);
      break;
    case 'win':
      [523, 659, 784, 1047, 1319].forEach((freq, i) => tone(freq, 0.5, 'sine', i * 0.12, 0.45));
      tone(262, 1.2, 'triangle', 0, 0.25);
      break;
    case 'loss':
      [392, 330, 262, 196].forEach((freq, i) => tone(freq, 0.7, 'triangle', i * 0.22, 0.4));
      break;
    default:
      break;
  }
}
