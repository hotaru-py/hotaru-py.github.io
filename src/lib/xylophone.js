import { playXylophone } from "./sounds.js";

// Touches are followed by emulated mouse/focus events; ignore those for this long
const TOUCH_ECHO_MS = 500;

/**
 * Svelte action: plays the next xylophone note when the element is hovered, touched or
 * focused from the keyboard.
 * Pass `{ keys: true }` to also play on Enter/Space (for elements that aren't links).
 * @param {HTMLElement} node
 * @param {{ keys?: boolean }} [options]
 */
export function xylophone(node, { keys = false } = {}) {
  let lastTouchAt = 0;

  function handleEnter() {
    if (Date.now() - lastTouchAt < TOUCH_ECHO_MS) return;
    playXylophone();
  }

  function handleFocus() {
    // Mouse clicks also focus; those already played on hover
    if (node.matches(":focus-visible")) handleEnter();
  }

  function handleTouch() {
    lastTouchAt = Date.now();
    playXylophone({ touch: true });
  }

  function handleKey(e) {
    if (keys && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      playXylophone();
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
