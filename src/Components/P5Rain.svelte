<script>
  import { onMount } from "svelte";
  import { playSound } from "../lib/sounds.js";
  import { loadP5Rain } from "../lib/p5rain.js";

  /**
   * The p5.rain hero from github.com/hotaru-py/p5-rain, sized to whatever box it's in:
   * a live NASA precipitation field with its palette, motion, grid and theme switches.
   * p5.js and the plugin load only once this mounts, so nobody else pays for them.
   * @typedef {Object} Props
   * @property {boolean} [isMobile]
   */

  /** @type {Props} */
  let { isMobile = false } = $props();

  const PALETTES = [
    { id: "ocean", label: "Ocean" },
    { id: "moss", label: "Moss" },
    { id: "ember", label: "Ember" },
  ];
  const STYLES = [
    { id: "breathe", label: "Breathe" },
    { id: "flow", label: "Flow" },
  ];
  const GRIDS = [
    { id: "snap", label: "Snap" },
    { id: "free", label: "Free" },
  ];

  // Choices are remembered per visitor, like on the p5.rain site
  const store = {
    get(key, allowed, fallback) {
      try {
        const v = localStorage.getItem("p5rain-" + key);
        return allowed.includes(v) ? v : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem("p5rain-" + key, value);
      } catch {
        // Storage unavailable; the choice lasts until the window closes
      }
    },
  };
  const ids = (list) => list.map((o) => o.id);

  let look = $state({
    palette: store.get("palette", ids(PALETTES), "ocean"),
    style: store.get("style", ids(STYLES), "breathe"),
    grid: store.get("grid", ids(GRIDS), "free"),
  });
  // Light by default, to sit with the paper desktop
  let theme = $state(store.get("theme", ["light", "dark"], "light"));
  let status = $state("loading p5.js…");
  let shortStatus = $state("loading…");

  /** @type {HTMLDivElement} */
  let root;
  /** @type {HTMLDivElement} */
  let layer;
  let field = null;

  function choose(key, value) {
    if (look[key] === value) return;
    look[key] = value;
    store.set(key, value);
    field?.set({ [key]: value });
    playSound("tactile", 0.1);
  }

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    store.set("theme", theme);
    field?.set({ theme });
    playSound("tactile", 0.1);
  }

  // The controls and heading sit over the canvas, so the lens follows the pointer on
  // the whole demo rather than the canvas alone
  let pointer = null;
  function handlePointerMove(e) {
    const r = layer.getBoundingClientRect();
    pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  const fmt = (d) =>
    `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} UTC`;

  function tickStatus() {
    if (!field) return;
    if (field.error) {
      status = shortStatus = "NASA GIBS unavailable: " + field.error.message;
    } else if (!field.ready) {
      const pct = Math.round(field.progress * 100);
      status = `loading NASA IMERG · ${pct}%`;
      shortStatus = `loading · ${pct}%`;
    } else {
      const latest = field.data.latest;
      const source =
        field.data.mode === "snapshot"
          ? `weekly data to ${fmt(latest)}`
          : `live from NASA GIBS, latest ${fmt(latest)}`;
      status = `IMERG precipitation · ${fmt(field.time())} · 7-day loop · ${source}`;
      shortStatus = fmt(field.time());
    }
  }

  onMount(() => {
    let cancelled = false;
    let sketch = null;
    let observer;
    const timer = setInterval(tickStatus, 250);

    loadP5Rain()
      .then((P5) => {
        if (cancelled) return;
        status = shortStatus = "connecting to NASA…";
        const size = () => [
          Math.max(1, layer.clientWidth),
          Math.max(1, layer.clientHeight),
        ];
        sketch = new P5((p) => {
          p.setup = () => {
            p.pixelDensity(1);
            p.createCanvas(...size());
            // The published week (one download), or live NASA until that exists
            field = p.createRain({
              source: "weekly",
              theme,
              ...look,
              start: 96,
            });
          };
          p.draw = () => {
            // Minimized windows stay mounted; skip the work while hidden
            if (root.closest(".minimized")) return;
            field.pointer(pointer?.x ?? null, pointer?.y ?? null);
            field.update();
            field.draw();
          };
        }, layer);
        observer = new ResizeObserver(() => {
          if (layer.clientWidth && layer.clientHeight) sketch.resizeCanvas(...size());
        });
        observer.observe(layer);
      })
      .catch((e) => {
        status = shortStatus = "couldn't load p5.js: " + e.message;
      });

    return () => {
      cancelled = true;
      clearInterval(timer);
      observer?.disconnect();
      sketch?.remove();
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="rain"
  class:mobile={isMobile}
  data-theme={theme}
  data-palette={look.palette}
  bind:this={root}
  onpointermove={handlePointerMove}
  onpointerleave={() => (pointer = null)}
>
  <div class="layer" bind:this={layer} aria-hidden="true"></div>
  <div class="scrim" aria-hidden="true"></div>

  <h2 class="heading">P5.RAIN</h2>

  <button
    type="button"
    class="theme-toggle"
    onclick={toggleTheme}
    aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
    title={theme === "dark" ? "Switch to light" : "Switch to dark"}
  >
    <span class={theme === "dark" ? "icon-moon" : "icon-sun"} aria-hidden="true"
    ></span>
  </button>

  <div class="bottom">
    <div class="controls">
      {@render seg("Palette", "palette", PALETTES)}
      {@render seg("Motion", "style", STYLES)}
      {@render seg("Grid", "grid", GRIDS)}
    </div>
    <p class="meta">
      <span class="live-dot" aria-hidden="true"></span>
      <span class="long">{status}</span>
      <span class="short">{shortStatus}</span>
    </p>
  </div>
</div>

{#snippet seg(label, key, options)}
  <div class="seg" role="group" aria-label={label}>
    {#each options as option (option.id)}
      <button
        type="button"
        aria-pressed={look[key] === option.id}
        onclick={() => choose(key, option.id)}
      >
        {#if key === "palette"}
          <span class="sw sw-{option.id}" aria-hidden="true"></span>
        {/if}
        {option.label}
      </button>
    {/each}
  </div>
{/snippet}

<style>
  @font-face {
    font-family: "Obel Mono";
    /* Latin-only cut of Obel Mono (SIL OFL, see assets/fonts/ObelMono-OFL.txt) */
    src: url("../assets/fonts/obel-mono.woff2") format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  /* --- Colours, as on the p5.rain site --- */
  .rain {
    --bg: #07090e;
    --surface: #0d1119;
    --text: #e3e9f3;
    --muted: #8592aa;
    --line: #1d2534;
    --accent: #7fe3f0;
    --scrim: 7, 9, 14;
    color-scheme: dark;
  }

  .rain[data-theme="light"] {
    --bg: #f4f0e7;
    --surface: #ece6d9;
    --text: #1b1f2a;
    --muted: #6f6a5d;
    --line: #d9d1c0;
    --accent: #2462b2;
    --scrim: 244, 240, 231;
    color-scheme: light;
  }

  /* The accent follows the rain palette */
  .rain[data-palette="moss"] {
    --accent: #c4e35a;
  }
  .rain[data-palette="ember"] {
    --accent: #ff7a52;
  }
  .rain[data-palette="moss"][data-theme="light"] {
    --accent: #4d7a1c;
  }
  .rain[data-palette="ember"][data-theme="light"] {
    --accent: #b3262a;
  }

  /* --- Layout: fills its box, and responds to the box's size, not the screen's --- */
  .rain {
    position: relative;
    container-type: size;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--bg);
    color: var(--text);
    font-family:
      "Obel Mono",
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Consolas,
      monospace;
    transition:
      background-color 0.4s,
      color 0.4s;
  }

  .layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .layer :global(canvas) {
    display: block;
    image-rendering: pixelated;
  }

  /* Keeps the heading and controls readable over the rain */
  .scrim {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(
        90deg,
        rgba(var(--scrim), 0.85) 0%,
        rgba(var(--scrim), 0.55) 30%,
        rgba(var(--scrim), 0) 60%
      ),
      linear-gradient(
        0deg,
        rgba(var(--scrim), 0.95) 0%,
        rgba(var(--scrim), 0) 30%
      );
  }

  .heading {
    position: absolute;
    left: clamp(16px, 6cqi, 64px);
    top: 50%;
    transform: translateY(-60%);
    margin: 0;
    font-size: clamp(36px, 11cqi, 104px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    pointer-events: none;
  }

  .theme-toggle {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 34px;
    height: 34px;
    padding: 0;
    display: grid;
    place-items: center;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
  }

  .theme-toggle span {
    width: 14px;
    height: 14px;
    background: currentColor;
  }

  .icon-moon {
    clip-path: polygon(
      30% 0,
      100% 0,
      60% 20%,
      50% 50%,
      60% 80%,
      100% 100%,
      30% 100%,
      0 70%,
      0 30%
    );
  }

  .icon-sun {
    clip-path: polygon(
      40% 0,
      60% 0,
      60% 25%,
      75% 25%,
      75% 40%,
      100% 40%,
      100% 60%,
      75% 60%,
      75% 75%,
      60% 75%,
      60% 100%,
      40% 100%,
      40% 75%,
      25% 75%,
      25% 60%,
      0 60%,
      0 40%,
      25% 40%,
      25% 25%,
      40% 25%
    );
  }

  /* Status on the left, switches on the right; stacked when the box is narrow */
  .bottom {
    position: absolute;
    left: clamp(16px, 6cqi, 64px);
    right: 14px;
    bottom: 14px;
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;
  }

  .seg {
    display: flex;
    border: 1px solid var(--line);
    background: rgba(var(--scrim), 0.72);
    backdrop-filter: blur(6px);
  }

  .seg button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 10px;
    border: 0;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 12px;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .seg button + button {
    border-left: 1px solid var(--line);
  }

  .seg button:hover {
    color: var(--text);
  }

  .seg button[aria-pressed="true"] {
    color: var(--text);
    background: var(--surface);
    box-shadow: inset 0 -2px 0 var(--accent);
  }

  .seg button:focus-visible,
  .theme-toggle:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .sw {
    display: inline-block;
    width: 16px;
    height: 7px;
  }
  .sw-ocean {
    background: linear-gradient(90deg, #2a7fd4 0 33%, #35b6e8 33% 66%, #ff5fa2 66%);
  }
  .sw-moss {
    background: linear-gradient(90deg, #3e782a 0 33%, #b0d43a 33% 66%, #ff963c 66%);
  }
  .sw-ember {
    background: linear-gradient(90deg, #941e22 0 33%, #f06234 33% 66%, #ffe8c8 66%);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    margin: 0 0 6px;
    color: var(--muted);
    font-size: 11px;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .meta span:not(.live-dot) {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta .short {
    display: none;
  }

  .live-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    background: var(--accent);
    animation: blink 1.6s steps(2, start) infinite;
  }

  @keyframes blink {
    to {
      visibility: hidden;
    }
  }

  /* Medium boxes: the status line shortens to just the time shown */
  @container (max-width: 820px) {
    .meta {
      flex-shrink: 0;
    }
    .meta .long {
      display: none;
    }
    .meta .short {
      display: inline;
    }
  }

  /* Narrow boxes (small windows, phones): switches stack under the status, heading
     moves up, and the scrim darkens from the bottom instead of the left */
  @container (max-width: 560px) {
    .bottom {
      left: 12px;
      right: 12px;
      bottom: 12px;
      flex-direction: column;
      align-items: stretch;
    }
    .controls {
      justify-content: flex-start;
    }
    .meta {
      order: -1;
      margin: 0;
    }
    .seg button {
      padding: 7px 8px;
    }
    .heading {
      top: 18px;
      left: 14px;
      transform: none;
    }
    .scrim {
      background: linear-gradient(
        180deg,
        rgba(var(--scrim), 0.6) 0%,
        rgba(var(--scrim), 0) 30%,
        rgba(var(--scrim), 0) 50%,
        rgba(var(--scrim), 0.95) 100%
      );
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .live-dot {
      animation: none;
    }
  }
</style>
