// UI sounds through the Web Audio API. Every file is fetched and decoded once at page
// load, so playback is instant; an <audio> element has to load and decode again on its
// first play, which made the first hover of each piano note lag.

const FILES = {
  open: "/click2.mp3",
  close: "/click1.mp3",
  slam: "/slam.mp3",
  tactile: "/tactile.mp3",
  // Resampled from one recorded B5 (public/b5.mp3)
  "piano:D5": "/piano/piano_D5.mp3",
  "piano:D#5": "/piano/piano_Dsharp5.mp3",
  "piano:F5": "/piano/piano_F5.mp3",
  "piano:A5": "/piano/piano_A5.mp3",
  "piano:A#5": "/piano/piano_Asharp5.mp3",
  "piano:C6": "/piano/piano_C6.mp3",
  "piano:F6": "/piano/piano_F6.mp3",
};

// The tune the musical pills play, one note per hover or tap (an octave up from the
// original, around the B5 recording)
const MELODY = [
  "A#5",
  "F6",
  "A#5",
  "A5",
  "A#5",
  "F5",
  "A#5",
  "F6",
  "A#5",
  "A5",
  "A#5",
  "F5",
  "A#5",
  "F6",
  "A#5",
  "A5",
  "A#5",
  "F5",
  "D#5",
  "D5",
  "D#5",
  "F5",
  "C6",
  "A#5",
];

/** @type {Map<string, AudioBuffer>} */
const buffers = new Map();

// Decoding needs no permission, so it happens up front on an offline context; the
// buffers can then be played by the real context once the browser allows audio
const decoder = new OfflineAudioContext(1, 1, 44100);
for (const [name, url] of Object.entries(FILES)) {
  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((data) => decoder.decodeAudioData(data))
    .then((buffer) => buffers.set(name, buffer))
    .catch(() => {
      // Missing or undecodable: that sound just stays silent
    });
}

// Browsers only allow audio after the visitor interacts, so the context is created on
// the first gesture (creating it earlier just logs a warning and stays suspended)
/** @type {AudioContext | null} */
let context = null;
const GESTURES = ["pointerdown", "keydown", "touchstart"];

function unlock() {
  context ??= new AudioContext();
  context.resume().then(() => {
    if (context?.state !== "running") return;
    for (const type of GESTURES) window.removeEventListener(type, unlock, true);
  });
}
for (const type of GESTURES) window.addEventListener(type, unlock, true);

/**
 * @param {string} name
 * @param {number} volume
 * @returns {AudioBufferSourceNode | null}
 */
// Sound effects are on by default; the visitor's mute choice is remembered
const MUTE_KEY = "sfx-muted";
let muted = readMuted();

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function isMuted() {
  return muted;
}

/** @param {boolean} value */
export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // Storage unavailable; the choice just lasts for this visit
  }
}

// Silence at the start of a file, skipped so the sound lands right on the hover
const LEAD_IN = { tactile: 0.03 };

// Per-file loudness trims, applied wherever the sound is played from
const LEVEL = { close: 0.35, slam: 0.5 };

function play(name, volume) {
  const buffer = buffers.get(name);
  if (muted || !context || !buffer) return null;

  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  gain.gain.value = volume * (LEVEL[name] ?? 1);
  source.connect(gain).connect(context.destination);
  source.start(0, LEAD_IN[name] ?? 0);
  return source;
}

/**
 * Plays a UI sound; overlapping plays are fine.
 * @param {"open" | "close" | "slam" | "tactile"} name
 */
export function playSound(name, volume = 0.8) {
  play(name, volume);
}

let melodyStep = 0;
/** @type {AudioBufferSourceNode | null} */
let lastTouchNote = null;

/**
 * Plays the next note of the tune. Notes from hovering may overlap; a touch cuts off
 * the previous touched note so quick taps stay crisp.
 */
export function playXylophone({ touch = false } = {}) {
  const note = MELODY[melodyStep];
  melodyStep = (melodyStep + 1) % MELODY.length;

  if (touch) lastTouchNote?.stop();
  const source = play(`piano:${note}`, 0.1);
  if (touch) lastTouchNote = source;
}
