// Touch screens have no hover, so a card's first tap "arms" it (highlighted, standing in
// for the hover preview) and a second tap opens its link. Mouse and keyboard are untouched.

const TOUCH_ONLY = "(hover: none) and (pointer: coarse)";
const ARMED_CLASS = "tap-armed";

/** @type {HTMLElement | null} */
let armed = null;

function arm(node) {
  disarm();
  armed = node;
  node.classList.add(ARMED_CLASS);
  document.addEventListener("touchstart", disarmOnOutsideTouch, true);
}

function disarm() {
  armed?.classList.remove(ARMED_CLASS);
  armed = null;
  document.removeEventListener("touchstart", disarmOnOutsideTouch, true);
}

function disarmOnOutsideTouch(e) {
  if (armed && !(e.target instanceof Node && armed.contains(e.target))) {
    disarm();
  }
}

/**
 * Svelte action for a link card: on touch screens, tap once to highlight, tap again to open.
 * Style the highlight with `:global(.tap-armed)`.
 * @param {HTMLElement} node
 * @param {string} url
 */
export function tapToOpen(node, url) {
  function handleClick(e) {
    if (!window.matchMedia(TOUCH_ONLY).matches) return;

    // Also stops a link inside the card from opening on the first tap
    e.preventDefault();
    if (armed !== node) {
      arm(node);
      return;
    }
    disarm();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  node.addEventListener("click", handleClick);

  return {
    update(nextUrl) {
      url = nextUrl;
    },
    destroy() {
      node.removeEventListener("click", handleClick);
      if (armed === node) disarm();
    },
  };
}
