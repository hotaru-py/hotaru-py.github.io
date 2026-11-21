// svelte action: animates a <details> open and shut (::details-content is Chromium-only).
// `data-expanded` flips the marker straight away, before `open` is dropped
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
    // starts from wherever an interrupted animation had got to
    const from = details.offsetHeight;
    animation?.cancel();
    // measured before clipping: overflow:hidden stops the content's margins collapsing
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
