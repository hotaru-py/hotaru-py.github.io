<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { loadP5Rain } from "../../lib/p5rain.js";

  /**
   * The p5.rain wallpaper: NASA's last week of rain as a full-screen pixel field. It
   * stays invisible until the data is in, then fades in over whatever is underneath.
   * @typedef {Object} Props
   * @property {() => void} [onReady] Called once it has fully faded in
   */

  /** @type {Props} */
  let { onReady } = $props();

  const FADE_MS = 600;

  // p5.rain redraws every cell each frame, so the wallpaper runs at a calm 30 fps (the
  // motion is slow enough not to show it), drops to 15 while the p5.rain window is
  // showing so the demo gets the frames, and stops while something covers the screen
  const FPS = 30;
  const FPS_WITH_DEMO = 15;
  const COVERED =
    ".window-container.maximized:not(.minimized), .mobile-window-container:not(.minimized)";
  const DEMO = ".window-container:not(.minimized) [data-p5rain-demo]";

  // Where the week loops, the end crossfades into the start over this many data-hours: a
  // second field plays the start of the week from the moment the first has this long
  // left, fading in over it, and then carries on as the main one. (Two fields, each
  // drawn into its own buffer, then composited.)
  const CROSSFADE_HOURS = 4;

  // Faint grid lines in the 1px gaps between the squares, only on this wallpaper
  const GRID_LINE = "rgba(70, 92, 36, 0.05)";
  const GRID_LINE_TENTH = "rgba(70, 92, 36, 0.1)";
  function drawGridLines(ctx, g) {
    const { cell, ox, oy, rows } = g;
    const x1 = ox + 240 * cell;
    const y1 = oy + rows * cell;
    for (let i = 1, x = ox + cell - 1; x <= x1; i++, x += cell) {
      // Every 10th line, across and down, is stronger
      ctx.fillStyle = i % 10 === 0 ? GRID_LINE_TENTH : GRID_LINE;
      ctx.fillRect(x, oy, 1, y1 - oy);
    }
    for (let i = 1, y = oy + cell - 1; y <= y1; i++, y += cell) {
      ctx.fillStyle = i % 10 === 0 ? GRID_LINE_TENTH : GRID_LINE;
      ctx.fillRect(ox, y, x1 - ox, 1);
    }
  }

  /** @type {HTMLDivElement} */
  let layer;
  let ready = $state(false);

  onMount(() => {
    let cancelled = false;
    let sketch = null;
    /** @type {any[]} The two buffers the two fields draw into */
    let surfaces = [];
    let observer;
    let readyTimer;

    // The wallpaper sits under the icons and windows, so the lens follows the pointer
    // over the whole page
    let pointer = null;
    const handleMove = (e) => (pointer = { x: e.clientX, y: e.clientY });
    const handleLeave = () => (pointer = null);
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);

    // Paints the desktop's own paper colour behind the rain, so it matches the taskbar
    const paper = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-moss-50")
      .trim();

    loadP5Rain()
      .then((P5) => {
        if (cancelled) return;
        const size = () => [
          Math.max(1, layer.clientWidth),
          Math.max(1, layer.clientHeight),
        ];
        sketch = new P5((p) => {
          let fields = [];
          let cur = 0; // the field being shown; the other one only runs while crossfading
          let crossfading = false;
          let fps = FPS;
          const look = {
            source: "weekly",
            theme: "light",
            palette: "moss",
            style: "flow",
            grid: "snap",
            background: false,
            start: 96,
          };
          p.setup = () => {
            p.pixelDensity(1);
            p.frameRate(fps);
            p.createCanvas(...size());
            surfaces = [0, 1].map(() => {
              const g = p.createGraphics(...size());
              g.pixelDensity(1);
              return g;
            });
            const first = P5.prototype.createRain.call(surfaces[0], look);
            // The second shares the first's data, so nothing is downloaded twice
            const second = P5.prototype.createRain.call(surfaces[1], {
              ...look,
              data: first.data,
              start: 0,
            });
            fields = [first, second];
          };

          // One field onto its own buffer: the desktop's paper, the faint grid, the rain
          const paint = (field, g) => {
            g.background(paper || "#f8f7ed");
            if (field._g) drawGridLines(g.drawingContext, field._g);
            field.draw();
          };

          p.draw = () => {
            // Hidden behind a maximized (or phone) window: skip the work. Readiness
            // still counts, so the fade-in isn't held up.
            if (ready && document.querySelector(COVERED)) return;
            const want = document.querySelector(DEMO) ? FPS_WITH_DEMO : FPS;
            if (want !== fps) p.frameRate((fps = want));

            const r = layer.getBoundingClientRect();
            const px = pointer ? pointer.x - r.left : null;
            const py = pointer ? pointer.y - r.top : null;
            const dt = (p.deltaTime || 16.7) / 1e3;

            let main = fields[cur];
            if (!main.ready) {
              p.background(paper || "#f8f7ed");
              return;
            }
            const other = fields[1 - cur];
            const span = main.data.frames.length - 1.001;
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
              // The main field has wrapped to the start of the week: the other one,
              // already there and fully faded in, takes over
              if (main.st.f < before) {
                cur = 1 - cur;
                crossfading = false;
              }
            }
            main = fields[cur];

            paint(main, surfaces[cur]);
            const ctx = p.drawingContext;
            ctx.drawImage(surfaces[cur].elt, 0, 0, p.width, p.height);
            if (crossfading) {
              const t = (main.st.f - (span - CROSSFADE_HOURS)) / CROSSFADE_HOURS;
              paint(other, surfaces[1 - cur]);
              ctx.globalAlpha = Math.max(0, Math.min(1, t));
              ctx.drawImage(surfaces[1 - cur].elt, 0, 0, p.width, p.height);
              ctx.globalAlpha = 1;
            }
            if (!ready) {
              ready = true;
              readyTimer = setTimeout(() => onReady?.(), FADE_MS);
            }
          };
        }, layer);
        observer = new ResizeObserver(() => {
          if (layer.clientWidth && layer.clientHeight) {
            sketch.resizeCanvas(...size());
            for (const g of surfaces) g.resizeCanvas(...size());
          }
        });
        observer.observe(layer);
      })
      .catch(() => {
        // p5 couldn't load: never becomes ready, so the Motion Blob stays up
      });

    return () => {
      cancelled = true;
      clearTimeout(readyTimer);
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      observer?.disconnect();
      for (const g of surfaces) g.remove();
      sketch?.remove();
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
></div>

<style>
  .rain-wallpaper {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    opacity: 0;
    transition: opacity var(--fade) ease;
  }

  .rain-wallpaper.ready {
    opacity: 1;
  }

  /* Phones: a touch see-through, so the home screen's icons and widgets stand out */
  @media (max-width: 768px) {
    .rain-wallpaper.ready {
      opacity: 0.9;
    }
  }

  .rain-wallpaper :global(canvas) {
    display: block;
    image-rendering: pixelated;
  }
</style>
