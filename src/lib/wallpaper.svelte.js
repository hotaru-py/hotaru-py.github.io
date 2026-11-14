// Which desktop wallpaper is showing (p5.rain unless the visitor picks otherwise).
// Shared between the desktop, the Wallpaper window and the phone settings menu, and
// remembered per visitor.

const KEY = "wallpaper";

export const WALLPAPERS = [
  { id: "blob", name: "Motion Blob" },
  { id: "rain", name: "p5.rain" },
];

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    return WALLPAPERS.some((w) => w.id === saved) ? saved : "rain";
  } catch {
    return "rain";
  }
}

// `rainReady`: the p5.rain wallpaper has loaded and faded in. Until then the Motion
// Blob stays up and the pickers show p5.rain as loading.
export const wallpaper = $state({ current: load(), rainReady: false });

/** @param {"blob" | "rain"} id */
export function setWallpaper(id) {
  if (wallpaper.current === id) return;
  wallpaper.current = id;
  if (id !== "rain") wallpaper.rainReady = false;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // Storage unavailable; the choice lasts for this visit
  }
}
