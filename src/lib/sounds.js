// UI sounds via Web Audio, decoded once at load so playback is instant (<audio> lagged
// on each note's first hover)

const FILES = {
  open: "/click2.mp3",
  close: "/click1.mp3",
  slam: "/slam.mp3",
  tactile: "/tactile.mp3",
  // resampled from one recorded B5 (public/b5.mp3)
  "piano:D5": "/piano/piano_D5.mp3",
  "piano:D#5": "/piano/piano_Dsharp5.mp3",
  "piano:F5": "/piano/piano_F5.mp3",
  "piano:A5": "/piano/piano_A5.mp3",
  "piano:A#5": "/piano/piano_Asharp5.mp3",
  "piano:C6": "/piano/piano_C6.mp3",
  "piano:F6": "/piano/piano_F6.mp3",
};

// the tune the musical pills play, one note per hover or tap (an octave up from the
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

// decoding needs no permission, so it happens up front on an offline context; the
// buffers can then be played by the real context once the browser allows audio
const decoder = new OfflineAudioContext(1, 1, 44100);
for (const [name, url] of Object.entries(FILES)) {
  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((data) => decoder.decodeAudioData(data))
    .then((buffer) => buffers.set(name, buffer))
    .catch(() => {
      // missing or undecodable: that sound just stays silent
    });
}

// browsers only allow audio after the visitor interacts, so the context is created on
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

// sound effects are on by default; the visitor's mute choice is remembered
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
    // storage unavailable; the choice just lasts for this visit
  }
}

// silence at the start of a file, skipped so the sound lands right on the hover
const LEAD_IN = { tactile: 0.03 };

// per-file loudness trims, applied wherever the sound is played from
const LEVEL = { close: 0.35, slam: 0.5 };

/** @returns {AudioBufferSourceNode | null} */
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

// name is "open", "close", "slam" or "tactile"; overlapping plays are fine
export function playSound(name, volume = 0.8) {
  play(name, volume);
}

let melodyStep = 0;
/** @type {AudioBufferSourceNode | null} */
let lastTouchNote = null;

// next note of the tune; a touch cuts off the previous touched note so taps stay crisp
export function playXylophone({ touch = false } = {}) {
  const note = MELODY[melodyStep];
  melodyStep = (melodyStep + 1) % MELODY.length;

  if (touch) lastTouchNote?.stop();
  const source = play(`piano:${note}`, 0.1);
  if (touch) lastTouchNote = source;
}
