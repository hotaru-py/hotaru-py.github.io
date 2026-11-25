<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { cellView, cssToRGB, paintGaps } from "../../lib/rainCells.js";

  // NASA's last week of rain as a pixel field; fades in once the data is in, then onReady.
  // `palette` changes crossfade in place (p5.rain blends between palettes)
  let { palette = "moss", onReady } = $props();

  const FADE_MS = 600;

  // 30fps, 15 while the p5.rain window is open, paused while something covers the screen
  const FPS = 30;
  const FPS_WITH_DEMO = 15;
  const COVERED =
    ".window-container.maximized:not(.minimized), .mobile-window-container:not(.minimized)";
  const DEMO = ".window-container:not(.minimized) [data-p5rain-demo]";

  // data-hours over which a second field, playing the week's start, fades in over the end
  // and takes over
  const CROSSFADE_HOURS = 4;

  // Bloom: the "Bloom the smile, Bloom the dream!" cover's sky and rose. light rain is
  // sky blue, heavy rain rose, snow the lavender of the blue-haired girl
  const BLOOM = {
    stain: [251, 218, 214],
    rain: [[195, 219, 244], [163, 203, 239], [120, 181, 234], [250, 139, 153], [242, 100, 122], [216, 72, 99], [179, 54, 79]],
    snow: [[214, 206, 238], [168, 156, 222], [115, 107, 173]],
  };

  // faint grid lines in the 1px gaps between the squares, in each palette's deep shade
  const GRID_INK = { moss: "70, 92, 36", bloom: "47, 101, 162" };
  let gridInk = GRID_INK.moss;
  function drawGridLines(ctx, g) {
    const GRID_LINE = `rgba(${gridInk}, 0.05)`;
    const GRID_LINE_TENTH = `rgba(${gridInk}, 0.1)`;
    const { cell, ox, oy, rows } = g;
    const x1 = ox + 240 * cell;
    const y1 = oy + rows * cell;
    for (let i = 1, x = ox + cell - 1; x <= x1; i++, x += cell) {
      // every 10th line, across and down, is stronger
      ctx.fillStyle = i % 10 === 0 ? GRID_LINE_TENTH : GRID_LINE;
      ctx.fillRect(x, oy, 1, y1 - oy);
    }
    for (let i = 1, y = oy + cell - 1; y <= y1; i++, y += cell) {
      ctx.fillStyle = i % 10 === 0 ? GRID_LINE_TENTH : GRID_LINE;
      ctx.fillRect(ox, y, x1 - ox, 1);
    }
  }

  const look = {
    source: "weekly",
    theme: "light",
    palette,
    style: "flow",
    grid: "snap",
    background: false,
    start: 96,
  };

  /** @type {HTMLDivElement} */
  let layer;
  /** @type {HTMLCanvasElement} */
  let cellsA;
  /** @type {HTMLCanvasElement} */
  let cellsB;
  /** @type {HTMLCanvasElement} */
  let gaps;
  let ready = $state(false);
  // set once the fields exist, so palette changes can reach them
  let applyPalette = null;
  $effect(() => {
    const name = palette; // read first: `?.` would skip it while still loading
    applyPalette?.(name);
  });

  onMount(() => {
    let cancelled = false;
    let raf = 0;
    let observer;
    let readyTimer;
    let worker;

    // the wallpaper sits under the icons and windows, so the lens follows the pointer
    // over the whole page
    let pointer = null;
    const handleMove = (e) => (pointer = { x: e.clientX, y: e.clientY });
    const handleLeave = () => (pointer = null);
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);

    // the desktop's own paper colour sits behind the rain, so it matches the taskbar
    const readPaper = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-moss-50")
        .trim() || "#f8f7ed";
    let paper = readPaper();

    // only p5.rain itself is needed here, not p5.js: the fields are drawn by
    // rainCells.js, so the 1MB p5 download is left to the p5.rain window
    import("../../vendor/p5.rain.esm.js")
      .then((rain) => {
        if (cancelled) return;
        start(rain);
      })
      .catch(() => {
        // couldn't load: never becomes ready, so the Motion Blob stays up
      });

    function start(rain) {
      if (!rain.PALETTES.bloom) rain.addPalette("bloom", { light: BLOOM });
      look.palette = palette;
      gridInk = GRID_INK[palette] ?? GRID_INK.moss;
      // the layer's size and place, kept up to date by the observer below rather than
      // measured every frame (measuring can force the page to lay itself out mid-frame)
      const box = { w: 1, h: 1, left: 0, top: 0 };
      const measure = () => {
        const r = layer.getBoundingClientRect();
        box.w = Math.max(1, Math.round(r.width));
        box.h = Math.max(1, Math.round(r.height));
        box.left = r.left;
        box.top = r.top;
      };
      measure();

      // p5.rain fields expect a p5 sketch; all they use of it is a canvas, its size and
      // the frame time, so a stand-in will do
      const stand = document.createElement("canvas");
      const host = {
        canvas: stand,
        drawingContext: stand.getContext("2d"),
        get width() {
          return box.w;
        },
        get height() {
          return box.h;
        },
        deltaTime: 16.7,
      };
      const first = new rain.RainField(host, look);
      // the second shares the first's data, so nothing is downloaded twice
      const second = new rain.RainField(host, { ...look, data: first.data, start: 0 });
      const fields = [first, second];
      const rgb = cssToRGB(paper);
      const views = [cellView(cellsA, rain, rgb), cellView(cellsB, rain, rgb)];
      let cur = 0; // the field being shown; the other one only runs while crossfading
      let crossfading = false;
      let gapLayout = null;
      // the desktop's theme flips in the same update, so its paper is read a frame later
      let paperStale = false;

      applyPalette = (name) => {
        for (const f of fields) f.set({ palette: name });
        gridInk = GRID_INK[name] ?? GRID_INK.moss;
        paperStale = true;
      };

      const motion = motionAhead(first.data);

      observer = new ResizeObserver(() => {
        measure();
        // lay the fields out again for the new size on their next update
        for (const f of fields) f._g = null;
      });
      observer.observe(layer);

      let fps = FPS;
      let last = 0;
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        if (last && now - last < 1000 / fps - 3) return;
        const dt = last ? Math.min(now - last, 100) / 1e3 : 1 / 60;
        last = now;
        frame(dt);
      };
      raf = requestAnimationFrame(loop);

      function frame(dt) {
        // hidden behind a maximized (or phone) window: skip the work
        if (ready && document.querySelector(COVERED)) return;
        fps = document.querySelector(DEMO) ? FPS_WITH_DEMO : FPS;

        let main = fields[cur];
        if (!main.ready) return;
        const other = fields[1 - cur];
        const span = main.data.frames.length - 1.001;
        const px = pointer ? pointer.x - box.left : null;
        const py = pointer ? pointer.y - box.top : null;
        const before = main.st.f;
        main.pointer(px, py);
        main.update(dt);

        if (!crossfading && main.st.f >= span - CROSSFADE_HOURS) {
          crossfading = true;
          other.seek(main.st.f - (span - CROSSFADE_HOURS));
        }
        if (crossfading) {
          other.pointer(px, py);
          other.update(dt);
          // the main field has wrapped to the start of the week: the other one,
          // already there and fully faded in, takes over
          if (main.st.f < before) {
            cur = 1 - cur;
            crossfading = false;
          }
        }
        main = fields[cur];

        if (paperStale) {
          paperStale = false;
          paper = readPaper();
          for (const v of views) v.setPaper(cssToRGB(paper));
          gapLayout = null;
        }
        views[cur].render(main);
        if (main._g !== gapLayout) {
          gapLayout = main._g;
          paintGaps(gaps, gapLayout, rain.COLS, paper, drawGridLines);
        }

        // the crossfade is just the top canvas's opacity: the browser blends the two
        const top = views[1 - cur].canvas;
        views[cur].canvas.style.zIndex = "1";
        views[cur].canvas.style.opacity = "1";
        top.style.zIndex = "2";
        if (crossfading) {
          views[1 - cur].render(fields[1 - cur]);
          const t = (main.st.f - (span - CROSSFADE_HOURS)) / CROSSFADE_HOURS;
          top.style.opacity = String(Math.max(0, Math.min(1, t)));
        } else if (top.style.opacity !== "0") {
          top.style.opacity = "0";
        }

        // work out the motion for hours coming up before they're needed
        motion.prefetch(main.st.i);
        if (main.st.f >= span - CROSSFADE_HOURS - 1) motion.prefetch(-1);
        if (crossfading) motion.prefetch(fields[1 - cur].st.i);

        if (!ready) {
          ready = true;
          readyTimer = setTimeout(() => onReady?.(), FADE_MS);
        }
      }
    }

    // works out the next hours' motion in a worker and fills p5.rain's cache, so it doesn't
    // stall a frame every data-hour
    function motionAhead(data) {
      // p5.rain's motion for hour i compares it with the hour this many later (BASE)
      const BASE = 3;
      const pending = new Set();
      try {
        worker = new Worker(new URL("../../lib/rainMotion.worker.js", import.meta.url), {
          type: "module",
        });
      } catch {
        return { prefetch() {} };
      }
      worker.onmessage = ({ data: { key, vx, vy } }) => {
        pending.delete(key);
        const [version, i] = key.split(":").map(Number);
        if (version !== data.version || data._motion.has(i)) return;
        data._motion.set(i, { vx, vy });
        // same limit as p5.rain's cache
        if (data._motion.size > 16) data._motion.delete(data._motion.keys().next().value);
      };
      worker.onerror = () => {
        worker?.terminate();
        worker = null;
      };
      const ask = (i) => {
        const last = data.frames.length - 2;
        if (!worker || i < 0 || i > last || data._motion.has(i)) return;
        const key = `${data.version}:${i}`;
        if (pending.has(key)) return;
        pending.add(key);
        const j = Math.min(data.frames.length - 1, i + BASE);
        worker.postMessage({ key, a: data.frames[i], b: data.frames[j], span: Math.max(1, j - i) });
      };
      return {
        /** the hours after `i` (or the start of the week, for -1) */
        prefetch(i) {
          if (i < 0) [0, 1, 2].forEach(ask);
          else [i + 1, i + 2].forEach(ask);
        },
      };
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(readyTimer);
      worker?.terminate();
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      observer?.disconnect();
    };
  });
</script>

<div
  class="rain-wallpaper"
  class:ready
  style:--fade="{FADE_MS}ms"
  bind:this={layer}
  aria-hidden="true"
  out:fade={{ duration: 400 }}
>
  <canvas class="cells" bind:this={cellsA}></canvas>
  <canvas class="cells" bind:this={cellsB} style:opacity="0"></canvas>
  <canvas class="gaps" bind:this={gaps}></canvas>
</div>

<style>
  .rain-wallpaper {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    opacity: 0;
    background: var(--color-moss-50);
    transition: opacity var(--fade) ease;
  }

  .rain-wallpaper.ready {
    opacity: 1;
  }

  /* phones: a touch see-through, so the home screen's icons and widgets stand out */
  @media (max-width: 768px) {
    .rain-wallpaper.ready {
      opacity: 0.9;
    }
  }

  /* one pixel per cell, scaled up square-edged; positioned and sized from script */
  canvas {
    position: absolute;
    display: block;
    image-rendering: pixelated;
    pointer-events: none;
  }

  .gaps {
    left: 0;
    top: 0;
    z-index: 3;
  }
</style>
