// Which experience the visitor picked: the full desktop, or Simple Mode.
// Remembered per browser; ?mode=simple or ?mode=full in the URL also picks one
// (handy for sharing a link straight into a mode).

const KEY = "site-mode";
const MODES = ["full", "simple"];

/** @returns {"full" | "simple" | null} null until the visitor has picked */
export function loadMode() {
  const fromUrl = new URLSearchParams(window.location.search).get("mode");
  if (MODES.includes(fromUrl)) {
    saveMode(fromUrl);
    return fromUrl;
  }
  try {
    const saved = localStorage.getItem(KEY);
    return MODES.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

/** @param {"full" | "simple"} mode */
export function saveMode(mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // Storage unavailable: the picker just shows again next visit
  }
}
