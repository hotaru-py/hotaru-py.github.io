<script module>
  import { GLYPH_LEVELS, GLYPHS } from "../lib/profileGlyph.js";

  // a halftone in ink on the paper: the background is a faint grid of small dots that
  // makes the circle; the person is inked over it, darker and larger where the photo is
  // darker. on show the dots pop in from the middle outward, then the ink comes up in a
  // sweep from the top left
  const BACKGROUND = { r: 0.26, ink: 0.16 };
  const inkOf = (level) => 0.35 + 0.65 * (level / GLYPH_LEVELS);
  const radiusOf = (level) => 0.3 + 0.16 * (level / GLYPH_LEVELS);

  // timings (ms): each dot pops over POP, starting up to POP_SPREAD after the first;
  // the ink sweep starts at INK_FROM and crosses in INK_SPREAD, each dot taking INK
  const POP = 180;
  const POP_SPREAD = 240;
  const INK_FROM = 150;
  const INK_SPREAD = 300;
  const INK = 200;
  const TOTAL = INK_FROM + INK_SPREAD + INK;

  function build(rows) {
    const n = rows.length;
    const c = (n - 1) / 2;
    const dots = [];
    rows.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === ".") return;
        const level = +cell;
        dots.push({
          x: x + 0.5,
          y: y + 0.5,
          r: level ? radiusOf(level) : BACKGROUND.r,
          ink: level ? inkOf(level) : BACKGROUND.ink,
          pop: (Math.hypot(x - c, y - c) / (n / 2)) * POP_SPREAD,
          inkIn: level ? INK_FROM + ((x + y) / (2 * (n - 1))) * INK_SPREAD : -1,
        });
      }),
    );
    return { n, dots };
  }

  const BUILT = Object.fromEntries(
    Object.entries(GLYPHS).map(([size, rows]) => [size, build(rows)]),
  );
  const LARGEST = Math.max(...Object.keys(GLYPHS).map(Number));

  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  // a little overshoot, so the dots land with a bounce
  const backOut = (t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;
</script>

<script>
  import { onMount } from "svelte";

  // the side-profile dot matrix, in the site's ink on its paper. `grid`: 33 for larger
  // avatars (the default), 17 for small icons. one canvas, drawn by one animation loop
  // (hundreds of separately animated SVG dots were heavy on phones)
  let { label = "hotaru", grid = LARGEST } = $props();

  /** @type {HTMLCanvasElement} */
  let canvas;

  onMount(() => {
    const glyph = BUILT[grid] ?? BUILT[LARGEST];
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ink = "";
    let raf = 0;
    let start = 0;

    const readInk = () => {
      ink = getComputedStyle(canvas).getPropertyValue("--color-ink").trim() || "#161614";
    };

    // sized to the element at the screen's pixel density
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.max(1, Math.round(canvas.clientWidth * dpr));
      if (canvas.width !== size) canvas.width = canvas.height = size;
      ctx.setTransform(size / glyph.n, 0, 0, size / glyph.n, 0, 0);
    };

    // t: ms since the animation started (Infinity: the finished picture)
    function draw(t) {
      ctx.clearRect(0, 0, glyph.n, glyph.n);
      ctx.fillStyle = ink;
      for (const dot of glyph.dots) {
        const p = clamp01((t - dot.pop) / POP);
        if (p <= 0) continue;
        let alpha = dot.ink;
        if (dot.inkIn >= 0) {
          const k = clamp01((t - dot.inkIn) / INK);
          alpha = BACKGROUND.ink + (dot.ink - BACKGROUND.ink) * (1 - (1 - k) ** 2);
        }
        ctx.globalAlpha = alpha * Math.min(1, p * 2);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r * Math.max(0, backOut(p)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const frame = (now) => {
      if (!start) start = now;
      const t = now - start;
      draw(t);
      if (t < TOTAL) raf = requestAnimationFrame(frame);
    };

    readInk();
    fit();
    if (reduced) draw(Infinity);
    else raf = requestAnimationFrame(frame);

    // keeps up with resizes and the site's colours changing (Bloom / Komorebi)
    const redraw = () => {
      if (raf && performance.now() - start < TOTAL) return; // still animating
      draw(Infinity);
    };
    const resize = new ResizeObserver(() => {
      fit();
      redraw();
    });
    resize.observe(canvas);
    const theme = new MutationObserver(() => {
      readInk();
      redraw();
    });
    theme.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      theme.disconnect();
    };
  });
</script>

<canvas
  bind:this={canvas}
  class="profile-glyph"
  role={label ? "img" : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : "true"}
></canvas>

<style>
  .profile-glyph {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
