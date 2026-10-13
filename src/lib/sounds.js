// UI sounds through the Web Audio API. Every file is fetched and decoded once at page
// load, so playback is instant; an <audio> element has to load and decode again on its
// first play, which made the first hover of each xylophone note lag.

const FILES = {
  open: "/click1.mp3",
  close: "/click2.mp3",
  "xylo:A4": "/xylo/xylo_A4.mp3",
  "xylo:A#4": "/xylo/xylo_Asharp4.mp3",
  "xylo:C5": "/xylo/xylo_C5.mp3",
  "xylo:D4": "/xylo/xylo_D4.mp3",
  "xylo:D#4": "/xylo/xylo_Dsharp4.mp3",
  "xylo:F4": "/xylo/xylo_F4.mp3",
  "xylo:F5": "/xylo/xylo_F5.mp3",
};

// The tune the xylophone pills play, one note per hover or tap
const XYLO_MELODY = [
  "A#4",
  "F5",
  "A#4",
  "A4",
  "A#4",
  "F4",
  "A#4",
  "F5",
  "A#4",
  "A4",
  "A#4",
  "F4",
  "A#4",
  "F5",
  "A#4",
  "A4",
  "A#4",
  "F4",
  "D#4",
  "D4",
  "D#4",
  "F4",
  "C5",
  "A#4",
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

function play(name, volume) {
  const buffer = buffers.get(name);
  if (muted || !context || !buffer) return null;

  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.start();
  return source;
}

/**
 * Plays a UI sound; overlapping plays are fine.
 * @param {"open" | "close"} name
 */
export function playSound(name, volume = 0.8) {
  play(name, volume);
}

let melodyStep = 0;
/** @type {AudioBufferSourceNode | null} */
let lastTouchNote = null;

/**
 * Plays the next note of the xylophone tune. Notes from hovering may overlap; a touch
 * cuts off the previous touched note so quick taps stay crisp.
 */
export function playXylophone({ touch = false } = {}) {
  const note = XYLO_MELODY[melodyStep];
  melodyStep = (melodyStep + 1) % XYLO_MELODY.length;

  if (touch) lastTouchNote?.stop();
  const source = play(`xylo:${note}`, 0.8);
  if (touch) lastTouchNote = source;
}
