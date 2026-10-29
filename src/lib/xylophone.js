import { playXylophone } from "./sounds.js";

// Touches are followed by emulated mouse/focus events; ignore those for this long
const TOUCH_ECHO_MS = 500;

// Mashing the keys: notes no more than GAP_MS apart, kept up for MASH_MS, "crash" the
// window they're in (Window.svelte listens for CRASH_EVENT)
export const CRASH_EVENT = "keys-mashed";
const GAP_MS = 200;
const MASH_MS = 3000;
let mashStart = 0;
let lastNoteAt = 0;

/**
 * Plays a note, unless this one is the last straw.
 * @param {HTMLElement} node
 * @param {{ touch?: boolean }} [options]
 */
function playNote(node, options) {
  const now = Date.now();
  if (now - lastNoteAt > GAP_MS) mashStart = now;
  lastNoteAt = now;

  if (now - mashStart >= MASH_MS) {
    mashStart = now;
    node.dispatchEvent(new CustomEvent(CRASH_EVENT, { bubbles: true }));
    return;
  }
  playXylophone(options);
}

/**
 * Svelte action: plays the next note of the tune when the element is hovered, touched or
 * focused from the keyboard.
 * Pass `{ keys: true }` to also play on Enter/Space (for elements that aren't links).
 * @param {HTMLElement} node
 * @param {{ keys?: boolean }} [options]
 */
export function xylophone(node, { keys = false } = {}) {
  let lastTouchAt = 0;

  function handleEnter() {
    if (Date.now() - lastTouchAt < TOUCH_ECHO_MS) return;
    playNote(node);
  }

  function handleFocus() {
    // Mouse clicks also focus; those already played on hover
    if (node.matches(":focus-visible")) handleEnter();
  }

  function handleTouch() {
    lastTouchAt = Date.now();
    playNote(node, { touch: true });
  }

  function handleKey(e) {
    if (keys && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      playNote(node);
    }
  }

  node.addEventListener("mouseenter", handleEnter);
  node.addEventListener("focus", handleFocus);
  node.addEventListener("touchstart", handleTouch, { passive: true });
  node.addEventListener("keydown", handleKey);

  return {
    destroy() {
      node.removeEventListener("mouseenter", handleEnter);
      node.removeEventListener("focus", handleFocus);
      node.removeEventListener("touchstart", handleTouch);
      node.removeEventListener("keydown", handleKey);
    },
  };
}
