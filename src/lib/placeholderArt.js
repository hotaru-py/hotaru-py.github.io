// Stand-in pictures for gallery items that don't have an image yet: a few moss shapes
// on paper with a halftone wash, drawn from the item's id so each one stays the same.

const SHADES = ["#c9d69a", "#aac374", "#89b04f", "#69913b", "#4b732b", "#335620"];

/**
 * @param {string} seed usually the item's id
 * @param {string} label shown small in the corner
 * @returns {string} an SVG data URL
 */
export function placeholderArt(seed, label) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const rand = () => (h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 2 ** 32;

  const shapes = [];
  for (let i = 0; i < 6; i++) {
    const fill = SHADES[Math.floor(rand() * SHADES.length)];
    const x = 80 + rand() * 640, y = 60 + rand() * 480, r = 50 + rand() * 150;
    shapes.push(
      rand() < 0.5
        ? `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" stroke="#161614" stroke-width="5"/>`
        : `<rect x="${(x - r).toFixed(0)}" y="${(y - r * 0.7).toFixed(0)}" width="${(r * 2).toFixed(0)}" height="${(r * 1.4).toFixed(0)}" rx="18" fill="${fill}" stroke="#161614" stroke-width="5"/>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><pattern id="d" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="5" cy="5" r="1.6" fill="#161614"/></pattern></defs><rect width="800" height="600" fill="#f8f7ed"/>${shapes.join("")}<rect width="800" height="600" fill="url(#d)" opacity="0.18"/><text x="28" y="570" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="26" font-weight="700" fill="#161614">${label}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
