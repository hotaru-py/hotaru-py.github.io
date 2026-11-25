<script>
  import {
    WALLPAPERS,
    COLOURS,
    wallpaper,
    setWallpaper,
    setColours,
  } from "../lib/wallpaper.svelte.js";
  import { playSound } from "../lib/sounds.js";
  import { tactile } from "../lib/tactile.js";

  // p5.rain is picked but its data hasn't arrived yet (the Motion Blob is still up)
  const loading = $derived(wallpaper.current === "rain" && !wallpaper.rainReady);

  // picking the one already showing still counts: it stops changing on its own
  function chooseWallpaper(id) {
    if (wallpaper.current !== id) playSound("tactile", 0.1);
    setWallpaper(id);
  }

  function chooseColours(id) {
    if (wallpaper.colours !== id) playSound("tactile", 0.1);
    setColours(id);
  }

  const sliding = $derived(!wallpaper.pinned.wallpaper || !wallpaper.pinned.colours);

  // each colour set as literals, so it shows whatever the site is in now: three
  // swatches for its button, and rain shades (light to heavy) for the p5.rain preview
  const LOOKS = {
    bloom: {
      swatches: ["#fa8b99", "#a3cbef", "#2a2748"],
      shades: ["#a3cbef", "#78b5ea", "#fa8b99", "#d84863"],
    },
    komorebi: {
      swatches: ["#c9d69a", "#89b04f", "#213a18"],
      shades: ["#c9d69a", "#89b04f", "#4b732b", "#213a18"],
    },
  };

  // a small, fixed field of rain cells for the previews: two storm bands across a faint
  // stain, cells bigger where the rain is heavier
  const COLS = 18;
  const ROWS = 11;
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
        level,
      });
    }
  }
</script>

{#snippet rainField(look)}
  <svg viewBox="0 0 180 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {#each cells as cell}
      <rect
        x={cell.x - cell.size / 2}
        y={cell.y - cell.size / 2}
        width={cell.size}
        height={cell.size}
        style:fill={look.shades[cell.level]}
      />
    {/each}
  </svg>
{/snippet}

<div class="picker">
  {#if sliding}
    <p class="note">
      These take turns changing every 5 minutes, until you pick one yourself.
    </p>
  {/if}
  <section class="group">
    <h3 id="colours-heading">Colours</h3>
    <div class="options" role="radiogroup" aria-labelledby="colours-heading">
      {#each COLOURS as option (option.id)}
        <button
          type="button"
          class="option colour"
          role="radio"
          aria-checked={wallpaper.colours === option.id}
          onclick={() => chooseColours(option.id)}
          use:tactile
        >
          <span class="label">
            <span class="check" aria-hidden="true"></span>
            {option.name}
          </span>
          <span class="swatches" aria-hidden="true">
            {#each LOOKS[option.id].swatches as colour}
              <span style:background={colour}></span>
            {/each}
          </span>
        </button>
      {/each}
    </div>
  </section>

  <section class="group">
    <h3 id="wallpaper-heading">Wallpaper</h3>
    <div class="options" role="radiogroup" aria-labelledby="wallpaper-heading">
      {#each WALLPAPERS as option (option.id)}
        <button
          type="button"
          class="option"
          role="radio"
          aria-checked={wallpaper.current === option.id}
          onclick={() => chooseWallpaper(option.id)}
          use:tactile
        >
          <span class="preview">
            {#if option.id === "blob"}
              <span class="blob" aria-hidden="true"></span>
            {:else}
              {@render rainField(LOOKS[wallpaper.colours])}
              {#if loading}
                <!-- three rain cells lighting up in turn while the data loads -->
                <span class="loading" role="status">
                  <span class="cells" aria-hidden="true"
                    ><span></span><span></span><span></span></span
                  >
                  Loading…
                </span>
              {/if}
            {/if}
          </span>
          <span class="label">
            <span class="check" aria-hidden="true"></span>
            {option.name}
          </span>
        </button>
      {/each}
    </div>
  </section>
</div>

<style>
  .picker {
    display: flex;
    flex-direction: column;
    gap: 14px;
    color: var(--color-ink);
  }

  .note {
    margin: 0;
    font-size: 13px;
    color: var(--color-ink-soft);
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-ink-muted);
  }

  .options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  /* colour options: name on the left, the set's three colours on the right */
  .option.colour {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .swatches {
    display: flex;
  }

  .swatches span {
    width: 22px;
    height: 22px;
    border: var(--ink-border);
    border-radius: 50%;
  }

  .swatches span + span {
    margin-left: -6px;
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

  /* the Motion Blob, at rest: soft rings fading into the paper, in the site's colours */
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

  .loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: color-mix(in srgb, var(--color-moss-50) 78%, transparent);
    font-size: 13px;
    font-weight: 700;
    color: var(--color-ink);
  }

  .cells {
    display: flex;
    gap: 5px;
  }

  .cells span {
    width: 10px;
    height: 10px;
    background: var(--color-moss-700);
    animation: cell 0.9s ease-in-out infinite;
  }

  .cells span:nth-child(2) {
    animation-delay: 0.15s;
  }

  .cells span:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes cell {
    0%,
    100% {
      transform: scale(0.45);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cells span {
      animation: none;
    }
  }

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
  }

  /* radio dot: outlined, filled with the accent when chosen */
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
