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

  /** @type {HTMLDivElement} */
  let layer;
  let ready = $state(false);

  onMount(() => {
    let cancelled = false;
    let sketch = null;
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
          let field;
          let fps = FPS;
          p.setup = () => {
            p.pixelDensity(1);
            p.frameRate(fps);
            p.createCanvas(...size());
            field = p.createRain({
              source: "weekly",
              theme: "light",
              palette: "moss",
              style: "breathe",
              grid: "free",
              background: false,
              start: 96,
            });
          };
          p.draw = () => {
            // Hidden behind a maximized (or phone) window: skip the work. Readiness
            // still counts, so the fade-in isn't held up.
            if (ready && document.querySelector(COVERED)) return;
            const want = document.querySelector(DEMO) ? FPS_WITH_DEMO : FPS;
            if (want !== fps) p.frameRate((fps = want));

            const r = layer.getBoundingClientRect();
            field.pointer(
              pointer ? pointer.x - r.left : null,
              pointer ? pointer.y - r.top : null,
            );
            field.update();
            p.background(paper || "#f8f7ed");
            field.draw();
            if (!ready && field.ready) {
              ready = true;
              readyTimer = setTimeout(() => onReady?.(), FADE_MS);
            }
          };
        }, layer);
        observer = new ResizeObserver(() => {
          if (layer.clientWidth && layer.clientHeight) {
            sketch.resizeCanvas(...size());
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

  .rain-wallpaper :global(canvas) {
    display: block;
    image-rendering: pixelated;
  }
</style>
