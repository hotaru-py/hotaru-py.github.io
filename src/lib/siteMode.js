// Which experience the visitor picked: the full desktop, or Simple Mode.
// Remembered per browser; ?mode=simple or ?mode=full in the URL also picks one
// (handy for sharing a link straight into a mode).
//
// Visitors coming back after a few days away see the login screen again, as a
// reminder that the other mode exists. Reloads and new tabs during a visit don't.

const KEY = "site-mode";
const LAST_SEEN_KEY = "site-last-seen";
const SESSION_KEY = "site-session";
const MODES = ["full", "simple"];

// How long away counts as "coming back"
const RETURN_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

function read(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage unavailable: worst case the picker shows again
  }
}

/** True when this is a new visit after a long enough break since the last one */
function isReturnVisit() {
  // Same tab as earlier in this visit (e.g. a reload): never a return
  if (read(sessionStorage, SESSION_KEY)) return false;
  write(sessionStorage, SESSION_KEY, "1");

  const lastSeen = Number(read(localStorage, LAST_SEEN_KEY));
  return lastSeen > 0 && Date.now() - lastSeen > RETURN_AFTER_MS;
}

// Keep "last seen" fresh while the site is open, so the break is measured from when
// they left rather than when they arrived
function trackLastSeen() {
  const stamp = () => write(localStorage, LAST_SEEN_KEY, String(Date.now()));
  stamp();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stamp();
  });
  window.addEventListener("pagehide", stamp);
}

/** @returns {"full" | "simple" | null} null when the login screen should show */
export function loadMode() {
  const returning = isReturnVisit();
  trackLastSeen();

  const fromUrl = new URLSearchParams(window.location.search).get("mode");
  if (MODES.includes(fromUrl)) {
    saveMode(fromUrl);
    return fromUrl;
  }
  if (returning) return null;

  const saved = read(localStorage, KEY);
  return MODES.includes(saved) ? saved : null;
}

/** @param {"full" | "simple"} mode */
export function saveMode(mode) {
  write(localStorage, KEY, mode);
}
