import { playSound } from "./sounds.js";

// sweeping the pointer across a row of icons shouldn't stack clicks on top of each other
const MIN_GAP_MS = 40;
let lastPlayedAt = 0;

// svelte action: a soft tick when the mouse moves onto the element (mouse only)
export function tactile(node) {
  function handleEnter(e) {
    if (e.pointerType !== "mouse") return;
    const now = Date.now();
    if (now - lastPlayedAt < MIN_GAP_MS) return;
    lastPlayedAt = now;
    playSound("tactile", 0.1);
  }

  node.addEventListener("pointerenter", handleEnter);
  return {
    destroy() {
      node.removeEventListener("pointerenter", handleEnter);
    },
  };
}
