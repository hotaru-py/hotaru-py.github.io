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
