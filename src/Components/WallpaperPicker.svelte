<script>
  import { WALLPAPERS, wallpaper, setWallpaper } from "../lib/wallpaper.svelte.js";
  import { playSound } from "../lib/sounds.js";
  import { tactile } from "../lib/tactile.js";

  /**
   * @typedef {Object} Props
   * @property {boolean} [isMobile]
   */

  /** @type {Props} */
  let { isMobile = false } = $props();

  function choose(id) {
    if (wallpaper.current === id) return;
    playSound("tactile", 0.1);
    setWallpaper(id);
  }

  // A small, fixed field of rain cells for the p5.rain preview: two storm bands across
  // a faint stain, cells bigger where the rain is heavier
  const COLS = 18;
  const ROWS = 11;
  const SHADES = [
    "var(--color-moss-300)",
    "var(--color-moss-500)",
    "var(--color-moss-700)",
    "var(--color-moss-900)",
  ];
  const cells = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const band =
        Math.exp(-(((row - 3 - Math.sin(col * 0.45) * 1.6) / 1.3) ** 2)) +
        Math.exp(-(((row - 8 + Math.cos(col * 0.35) * 1.2) / 1.1) ** 2)) * 0.8;
      const jitter = (Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
      const rain = band * (0.55 + 0.45 * Math.abs(jitter));
      if (rain < 0.25) continue;
      const level = Math.min(3, Math.floor(rain * 3.2));
      cells.push({
        x: col * 10 + 5,
        y: row * 10 + 5,
        size: 3 + level * 1.6,
        fill: SHADES[level],
      });
    }
  }
</script>

<div class="picker" class:mobile={isMobile}>
  <p class="intro">Pick a wallpaper for the desktop.</p>
  <div class="options" role="radiogroup" aria-label="Wallpaper">
    {#each WALLPAPERS as option (option.id)}
      <button
        type="button"
        class="option"
        role="radio"
        aria-checked={wallpaper.current === option.id}
        onclick={() => choose(option.id)}
        use:tactile
      >
        <span class="preview">
          {#if option.id === "blob"}
            <span class="blob" aria-hidden="true"></span>
          {:else}
            <svg viewBox="0 0 180 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              {#each cells as cell}
                <rect
                  x={cell.x - cell.size / 2}
                  y={cell.y - cell.size / 2}
                  width={cell.size}
                  height={cell.size}
                  style:fill={cell.fill}
                />
              {/each}
            </svg>
          {/if}
        </span>
        <span class="label">
          <span class="check" aria-hidden="true"></span>
          {option.name}
        </span>
      </button>
    {/each}
  </div>
</div>

<style>
  .picker {
    display: flex;
    flex-direction: column;
    gap: 14px;
    color: var(--color-ink);
  }

  .intro {
    margin: 0;
    font-size: 14px;
    color: var(--color-ink-soft);
  }

  .options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .option {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    border: 2px solid transparent;
    border-radius: 12px;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;
  }

  .option:hover {
    background-color: var(--color-moss-100);
  }

  .option[aria-checked="true"] {
    border-color: var(--color-ink);
    background-color: var(--color-moss-100);
  }

  .preview {
    position: relative;
    display: block;
    aspect-ratio: 16 / 10;
    border: var(--ink-border);
    border-radius: 8px;
    box-shadow: 3px 3px 0 var(--color-ink);
    background-color: var(--color-moss-50);
    overflow: hidden;
  }

  .preview svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  /* The Motion Blob, at rest: soft moss rings fading into the paper */
  .blob {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 55% 55%,
      var(--color-moss-400) 0%,
      var(--color-moss-300) 16%,
      var(--color-moss-200) 30%,
      var(--color-moss-100) 46%,
      transparent 64%
    );
    filter: blur(2px);
  }

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
  }

  /* Radio dot: outlined, filled with the accent when chosen */
  .check {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    border: var(--ink-border);
    border-radius: 50%;
    background: var(--color-paper);
    transition: background-color 0.15s ease;
  }

  .option[aria-checked="true"] .check {
    background: var(--color-accent);
  }
</style>
