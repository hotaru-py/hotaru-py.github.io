// the desktop wallpaper and the site's colours, chosen separately, shared by the
// desktop, the Wallpaper window and phone settings. the colours recolour the whole site,
// login screen and Simple Mode included.
// slideshow: every 5 minutes one of the two changes, taking turns. a visitor's own pick
// sticks (remembered) and takes that one out of the slideshow

const WALLPAPER_KEY = "wallpaper-pick";
const COLOURS_KEY = "colours-pick";
// choices saved before the slideshow; cleared so everyone starts on it
const OLD_KEYS = ["wallpaper", "colours"];
const SLIDE_MS = 5 * 60 * 1000;

export const WALLPAPERS = [
  { id: "rain", name: "p5.rain" },
  { id: "blob", name: "Motion Blob" },
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
const pickedColours = byId(COLOURS, read(COLOURS_KEY))?.id;

// `pinned`: picked by the visitor, so the slideshow leaves it alone. `rainReady`: the
// p5.rain wallpaper has loaded and faded in; until then the Motion blob stays up and
// the pickers show p5.rain as loading
export const wallpaper = $state({
  current: pickedWallpaper ?? "rain",
  colours: pickedColours ?? "bloom",
  pinned: { wallpaper: !!pickedWallpaper, colours: !!pickedColours },
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
}
applyColours();

function showWallpaper(id) {
  if (wallpaper.current === id) return;
  wallpaper.current = id;
  if (id !== "rain") wallpaper.rainReady = false;
}

function showColours(id) {
  if (wallpaper.colours === id) return;
  wallpaper.colours = id;
  applyColours();
}

/** the visitor's pick: shown, remembered, and kept out of the slideshow */
export function setWallpaper(id) {
  showWallpaper(id);
  wallpaper.pinned.wallpaper = true;
  write(WALLPAPER_KEY, id);
}

/** the visitor's pick: shown, remembered, and kept out of the slideshow */
export function setColours(id) {
  showColours(id);
  wallpaper.pinned.colours = true;
  write(COLOURS_KEY, id);
}

const next = (list, id) => list[(list.findIndex((x) => x.id === id) + 1) % list.length].id;

// colours first, then the wallpaper, and so on; skips whichever the visitor picked
let turn = 0;
setInterval(() => {
  const { pinned } = wallpaper;
  if (pinned.wallpaper && pinned.colours) return;
  const coloursTurn = pinned.wallpaper || (!pinned.colours && turn % 2 === 0);
  if (coloursTurn) showColours(next(COLOURS, wallpaper.colours));
  else showWallpaper(next(WALLPAPERS, wallpaper.current));
  turn++;
}, SLIDE_MS);
