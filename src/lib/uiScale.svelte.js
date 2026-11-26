// the desktop and login screen are drawn at one reference size and scaled to the screen,
// so everything keeps the same proportions on any display: a 1080p monitor, a laptop and
// a 4K screen all show what the reference shows, just bigger or smaller. the reference is
// a 2560×1440 monitor at 150% (1707×960 CSS px).
// phones keep their own layout, unscaled. components apply it with --ui-scale (a
// transform on the screen, see App.svelte) and divide pointer movement by `ui.scale`.

const REF_WIDTH = 1707;
const REF_HEIGHT = 960;
const MIN = 0.6;
const MAX = 2.5;
const PHONE_MAX_WIDTH = 768;

export const ui = $state({ scale: 1 });

function update() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const fit = Math.min(w / REF_WIDTH, h / REF_HEIGHT);
  // a hundredth is plenty, and keeps resizing from re-laying out for nothing
  const scale = w <= PHONE_MAX_WIDTH ? 1 : Math.round(Math.min(MAX, Math.max(MIN, fit)) * 100) / 100;
  if (scale === ui.scale) return;
  ui.scale = scale;
  document.documentElement.style.setProperty("--ui-scale", String(scale));
}

document.documentElement.style.setProperty("--ui-scale", "1");
update();
window.addEventListener("resize", update);
