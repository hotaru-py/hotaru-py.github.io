// Sparkly halftone: a grid of dots where most blink off and on at their own random rhythm

/**
 * SVG markup for a grid of halftone dots, most of them twinkling.
 * @param {{ cols: number, rows: number, pitch: number, radius: number, fill: string }} opts
 */
export function sparkleDots({ cols, rows, pitch, radius, fill }) {
  let out = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = ((x + 0.5) * pitch).toFixed(2);
      const cy = ((y + 0.5) * pitch).toFixed(2);
      const dot = `<circle cx="${cx}" cy="${cy}" r="${radius}" style="fill: ${fill}"`;

      // Some dots hold steady so the shading still reads while the rest sparkle
      if (Math.random() < 0.35) {
        out += `${dot}/>`;
        continue;
      }

      // Each dot is on, blinks off for a moment, then comes back on
      const dur = 0.5 + Math.random() * 1.2;
      const off = 0.2 + Math.random() * 0.4;
      const on = Math.min(0.95, off + 0.15 + Math.random() * 0.25);
      const begin = (Math.random() * dur).toFixed(2);
      out +=
        `${dot}><animate attributeName="opacity" values="1;0;1" ` +
        `keyTimes="0;${off.toFixed(2)};${on.toFixed(2)}" calcMode="discrete" ` +
        `dur="${dur.toFixed(2)}s" begin="-${begin}s" repeatCount="indefinite"/></circle>`;
    }
  }
  return out;
}

// Tile for CSS backgrounds, matching the --halftone-shadow-size grid (3.5px pitch, 1px dots)
const CSS_PITCH = 3.5;
const CSS_TILE_DOTS = 12;

/**
 * Exposes the sparkly tile as --halftone-sparkle / --halftone-sparkle-size on :root.
 * Skipped for reduced motion, so hover rules fall back to the static halftone.
 */
export function installSparkleHalftone() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;
  const ink = getComputedStyle(root).getPropertyValue("--color-ink").trim();
  const size = CSS_PITCH * CSS_TILE_DOTS;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    sparkleDots({
      cols: CSS_TILE_DOTS,
      rows: CSS_TILE_DOTS,
      pitch: CSS_PITCH,
      radius: 1,
      fill: ink,
    }) +
    `</svg>`;

  root.style.setProperty(
    "--halftone-sparkle",
    `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
  );
  root.style.setProperty("--halftone-sparkle-size", `${size}px ${size}px`);
}

// Wave tile, matching the --halftone-size grid (5px pitch); one wavelength wide,
// one title bar tall, so it repeats seamlessly along the bar
const WAVE_PITCH = 5;
const WAVE_COLS = 24;
const WAVE_ROWS = 8;
const WAVE_SECONDS = 2.4;
const WAVE_MAX_R = 1.3;

/**
 * Halftone dots that swell and vanish in a wave travelling left to right, slanted
 * slightly downwards like a flag. Exposed as --halftone-wave / --halftone-wave-size.
 * Skipped for reduced motion, so the title bar falls back to the static halftone.
 */
export function installWaveHalftone() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;
  const ink = getComputedStyle(root).getPropertyValue("--color-ink").trim();

  // One full cycle of the dot radius, sampled from a cosine so it eases in and out
  const steps = 12;
  const radii = Array.from({ length: steps + 1 }, (_, i) =>
    ((WAVE_MAX_R * (1 + Math.cos((i / steps) * 2 * Math.PI))) / 2).toFixed(2),
  ).join(";");

  let dots = "";
  for (let row = 0; row < WAVE_ROWS; row++) {
    for (let col = 0; col < WAVE_COLS; col++) {
      // Later columns (and lower rows, a little) lag behind, so the crest moves right
      const phase = ((col + row * 0.5) / WAVE_COLS) % 1;
      const begin = (-(1 - phase) * WAVE_SECONDS).toFixed(3);
      dots +=
        `<circle cx="${(col + 0.5) * WAVE_PITCH}" cy="${(row + 0.5) * WAVE_PITCH}" r="${WAVE_MAX_R}" fill="${ink}">` +
        `<animate attributeName="r" values="${radii}" dur="${WAVE_SECONDS}s" begin="${begin}s" repeatCount="indefinite"/>` +
        `</circle>`;
    }
  }

  const width = WAVE_COLS * WAVE_PITCH;
  const height = WAVE_ROWS * WAVE_PITCH;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${dots}</svg>`;

  root.style.setProperty(
    "--halftone-wave",
    `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
  );
  root.style.setProperty("--halftone-wave-size", `${width}px ${height}px`);
}
