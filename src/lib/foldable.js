/**
 * Svelte action for a <details>: opens and closes with a height animation in every
 * browser (the CSS-only ::details-content route only works in recent Chromium). Skipped
 * for visitors who prefer reduced motion. While it closes, `data-expanded="false"` lets
 * the marker flip straight away, before the element's own `open` attribute is dropped.
 * @param {HTMLDetailsElement} details
 */
export function foldable(details) {
  const summary = details.querySelector("summary");
  if (!summary) return;
  const MS = 220;
  /** @type {Animation | null} */
  let animation = null;
  details.dataset.expanded = String(details.open);

  function finish(open) {
    details.open = open;
    details.dataset.expanded = String(open);
    details.style.overflow = "";
    animation = null;
  }

  function onClick(event) {
    event.preventDefault();
    const opening = details.dataset.expanded !== "true";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish(opening);
      return;
    }
    // Starts from wherever an interrupted animation had got to
    const from = details.offsetHeight;
    animation?.cancel();
    // Measured before clipping: overflow:hidden stops the content's margins collapsing
    // out of the box, which would make the end height differ from the settled one
    details.style.overflow = "";
    details.dataset.expanded = String(opening);
    let to;
    if (opening) {
      details.open = true;
      to = details.getBoundingClientRect().height;
    } else {
      to = summary.offsetHeight;
    }
    details.style.overflow = "hidden";
    animation = details.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: MS, easing: "ease" },
    );
    animation.onfinish = () => finish(opening);
  }

  summary.addEventListener("click", onClick);
  return { destroy: () => summary.removeEventListener("click", onClick) };
}
