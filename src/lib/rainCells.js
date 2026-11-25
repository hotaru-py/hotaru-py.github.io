// draws a p5.rain field as one pixel per cell, scaled up by CSS: far cheaper than its
// per-drop fillRect in Firefox. only what the wallpaper uses ("flow", snapped, stain, lens)

const LEVELS = 64;

/** "rgb(r,g,b)" (p5.rain's colour strings) → [r, g, b] */
function rgbOf(css) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(css);
  return m ? [+m[1], +m[2], +m[3]] : [0, 0, 0];
}

// p5.rain's palette tables are cached objects, so each is parsed once
const parsed = new WeakMap();
function coloursOf(T) {
  let P = parsed.get(T);
  if (P) return P;
  const table = (list) => {
    const out = new Uint8Array(LEVELS * 3);
    list.forEach((css, i) => out.set(rgbOf(css), i * 3));
    return out;
  };
  P = { rain: table(T.rainRaw), snow: table(T.snowRaw), stain: rgbOf(T.stainRaw) };
  parsed.set(T, P);
  return P;
}

// any CSS colour → [r, g, b], as the browser paints it
export function cssToRGB(colour) {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

// draws a field into a one-pixel-per-cell <canvas>; `rain` is the p5.rain module, `paper`
// the [r, g, b] under it
export function cellView(canvas, rain, paper) {
  const { COLS, paletteLUT } = rain;
  const ctx = canvas.getContext("2d");
  let layout = null;
  let image = null;
  let base = null;
  let baseKey = "";
  let basePalette = null;

  function place(g) {
    layout = g;
    canvas.width = COLS;
    canvas.height = g.rows;
    Object.assign(canvas.style, {
      left: `${g.ox}px`,
      top: `${g.oy}px`,
      width: `${COLS * g.cell}px`,
      height: `${g.rows * g.cell}px`,
    });
    image = ctx.createImageData(COLS, g.rows);
    base = new Uint8ClampedArray(image.data.length);
    baseKey = "";
  }

  // paper with the window-total stain over it: only changes with the data or colours.
  // same maths as p5.rain's stain (sqrt of the total, 32 steps, at `stain` strength).
  function paintBase(field, P) {
    const { data: d, o } = field;
    const g = layout;
    for (let yy = 0; yy < g.rows; yy++) {
      const row = (g.r0 + yy) * COLS;
      for (let x = 0; x < COLS; x++) {
        const tot = d.total[row + x];
        let a = 0;
        if (tot >= 2) {
          const lvl = Math.min(31, (Math.sqrt(tot / d.totalMax) * 31) | 0);
          a = (lvl / 31) * o.stain;
        }
        const i = (yy * COLS + x) * 4;
        base[i] = paper[0] + (P.stain[0] - paper[0]) * a;
        base[i + 1] = paper[1] + (P.stain[1] - paper[1]) * a;
        base[i + 2] = paper[2] + (P.stain[2] - paper[2]) * a;
        base[i + 3] = 255;
      }
    }
  }

  return {
    canvas,
    /** a new paper colour (the desktop's theme changed) */
    setPaper(rgb) {
      paper = rgb;
      baseKey = "";
    },
    /** draw the field as it is now (call after field.update()) */
    render(field) {
      const g = field._g;
      if (!g) return;
      if (g !== layout) place(g);
      const { st, o, data: d } = field;
      const T = paletteLUT(st.mode, st.palFrom, st.palTo, st.pm, o.stain, o.intensity);
      const P = coloursOf(T);
      const key = `${d.version}|${o.stain}`;
      if (key !== baseKey || P !== basePalette) {
        paintBase(field, P);
        baseKey = key;
        basePalette = P;
      }
      const px = image.data;
      px.set(base);

      // the drops, as p5.rain's flow style draws them on a snapped grid: alpha in 20
      // steps, colour from the level (brightened by the lens), snow from its own ramp
      const { px: X, py: Y, pa, plv, psn, boost, pn } = field;
      const scale = o.intensity;
      const N = boost.length;
      for (let k = 0; k < pn; k++) {
        const gx = Math.round(X[k]) % COLS;
        const gy = Math.round(Y[k]);
        const yy = gy - g.r0;
        if (yy < 0 || yy >= g.rows) continue;
        const a = Math.round(pa[k] * scale * 20);
        if (a <= 0) continue;
        const c = gy * COLS + gx;
        const b = c >= 0 && c < N ? boost[c] : 0;
        let lv = plv[k] + b * 0.4;
        lv = lv < 0 ? 0 : lv > 1 ? 1 : lv;
        const ci = ((lv * 63) | 0) * 3;
        const ramp = psn[k] ? P.snow : P.rain;
        const al = a / 20;
        const i = (yy * COLS + gx) * 4;
        px[i] += (ramp[ci] - px[i]) * al;
        px[i + 1] += (ramp[ci + 1] - px[i + 1]) * al;
        px[i + 2] += (ramp[ci + 2] - px[i + 2]) * al;
      }
      ctx.putImageData(image, 0, 0);
    },
  };
}

// paints the 1px gaps between squares (paper plus grid lines), once per layout
export function paintGaps(canvas, g, cols, paper, drawLines) {
  canvas.width = g.w;
  canvas.height = g.h;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, g.w, g.h);
  ctx.fillStyle = paper;
  const x1 = g.ox + cols * g.cell;
  const y1 = g.oy + g.rows * g.cell;
  for (let x = g.ox + g.cell - 1; x <= x1; x += g.cell) ctx.fillRect(x, g.oy, 1, y1 - g.oy);
  for (let y = g.oy + g.cell - 1; y <= y1; y += g.cell) ctx.fillRect(g.ox, y, x1 - g.ox, 1);
  drawLines(ctx, g);
}
