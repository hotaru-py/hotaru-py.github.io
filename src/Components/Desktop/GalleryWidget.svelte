<script>
  import { onMount } from "svelte";
  import { galleryFiles } from "../../lib/workFiles.js";

  /**
   * Home-screen widget: a square that cycles through every picture in the Gallery.
   * Tapping it opens the picture showing.
   * @typedef {Object} Props
   * @property {(file: import("../../lib/workFiles.js").WorkFile) => void} onOpenFile
   */

  /** @type {Props} */
  let { onOpenFile } = $props();

  const INTERVAL_MS = 4000;

  let index = $state(0);
  const current = $derived(galleryFiles[index]);

  onMount(() => {
    if (galleryFiles.length < 2) return;
    const timer = setInterval(() => {
      // Hold still while the page isn't being looked at
      if (document.hidden) return;
      index = (index + 1) % galleryFiles.length;
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  });
</script>

{#if current}
  <button
    type="button"
    class="widget"
    onclick={() => onOpenFile(current)}
    aria-label="Gallery: {current.name}"
  >
    <!-- Every picture stays stacked; only the current one is opaque, so they crossfade -->
    {#each galleryFiles as file, i (file.key)}
      <img src={file.image} alt="" class:shown={i === index} />
    {/each}
    <span class="label">
      <span class="app">Gallery</span>
      <span class="name">{current.name}</span>
    </span>
  </button>
{/if}

<style>
  .widget {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 1;
    padding: 0;
    border: var(--ink-border);
    border-radius: 20px;
    background: var(--color-moss-100);
    box-shadow: var(--ink-shadow);
    overflow: hidden;
    cursor: pointer;
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.8s ease;
  }

  img.shown {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
  }

  .label {
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 8px;
    display: flex;
    flex-direction: column;
    padding: 5px 9px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-paper) 88%, transparent);
    color: var(--color-ink);
    text-align: left;
  }

  .app {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-ink-muted);
  }

  .name {
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
