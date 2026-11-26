import { updateFavicon } from "./favicon.js";

// the desktop wallpaper (a visitor's pick, remembered), shared by the desktop, the
// Wallpaper window and phone settings. the site's colours recolour everything, login
// screen and Simple Mode included; Bloom is the only set offered, Komorebi (the original
// green) stays defined for a future switch: change COLOURS_DEFAULT, or call setColours()

const WALLPAPER_KEY = "wallpaper-pick";
// keys from earlier versions (colour and slideshow picks); cleared
const OLD_KEYS = ["wallpaper", "colours", "colours-pick"];
const COLOURS_DEFAULT = "bloom";

export const WALLPAPERS = [
  { id: "blob", name: "Motion Blob" },
  { id: "rain", name: "p5.rain" },
];

// `theme`: the :root[data-theme] in app.css (none: the base moss tokens). `rain`: the
// p5.rain palette the rain wallpaper uses with them
export const COLOURS = [
  { id: "bloom", name: "Bloom", theme: "bloom", rain: "bloom" },
  { id: "komorebi", name: "Komorebi", rain: "moss" },
];

const byId = (list, id) => list.find((x) => x.id === id);

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable; the choice lasts for this visit
  }
}

try {
  for (const key of OLD_KEYS) localStorage.removeItem(key);
} catch {
  // storage unavailable; nothing to clear
}

const pickedWallpaper = byId(WALLPAPERS, read(WALLPAPER_KEY))?.id;

// `rainReady`: the p5.rain wallpaper has loaded and faded in; until then the Motion blob
// stays up and the pickers show p5.rain as loading
export const wallpaper = $state({
  current: pickedWallpaper ?? "blob",
  colours: COLOURS_DEFAULT,
  rainReady: false,
});

/** the p5.rain palette for the current colours */
export const rainPalette = () => byId(COLOURS, wallpaper.colours).rain;

// set synchronously (not in an effect), before anything new mounts and reads the tokens
function applyColours() {
  const theme = byId(COLOURS, wallpaper.colours).theme;
  const root = document.documentElement;
  if (theme) root.dataset.theme = theme;
  else delete root.dataset.theme;
  const paper = getComputedStyle(root).getPropertyValue("--color-moss-50").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", paper);
  updateFavicon();
}
applyColours();

/** the visitor's pick: shown and remembered */
export function setWallpaper(id) {
  if (wallpaper.current !== id) {
    wallpaper.current = id;
    if (id !== "rain") wallpaper.rainReady = false;
  }
  write(WALLPAPER_KEY, id);
}

/** switches the site's colours (not offered anywhere yet, and not remembered) */
export function setColours(id) {
  if (wallpaper.colours === id || !byId(COLOURS, id)) return;
  wallpaper.colours = id;
  applyColours();
}
