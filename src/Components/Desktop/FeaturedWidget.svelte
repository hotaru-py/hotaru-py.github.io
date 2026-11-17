<script>
  import { featured } from "../../lib/siteContent.js";
  import {
    liveFiles,
    projectFiles,
    galleryFiles,
    FILE_ICONS,
  } from "../../lib/workFiles.js";

  /**
   * Home-screen widget: one piece of work to show off (set in siteContent.js). It opens
   * the file it points at, or a link.
   * @typedef {Object} Props
   * @property {(file: import("../../lib/workFiles.js").WorkFile) => void} onOpenFile
   */

  /** @type {Props} */
  let { onOpenFile } = $props();

  const file = [...liveFiles, ...projectFiles, ...galleryFiles].find(
    (f) => f.key === featured.file,
  );
  const picture = featured.image ?? file?.image;
  const icon = file?.icon ?? (file ? FILE_ICONS[file.kind] : null);

  function open() {
    if (file) onOpenFile(file);
    else if (featured.url) window.open(featured.url, "_blank", "noopener");
  }
</script>

<button type="button" class="widget" onclick={open} aria-label="Featured: {featured.title}">
  <span class="art" aria-hidden="true">
    {#if picture}
      <img src={picture} alt="" />
    {:else if icon}
      <span class="icon">{@html icon}</span>
    {/if}
  </span>
  <span class="text">
    <span class="label">{featured.label}</span>
    <span class="title">{featured.title}</span>
    {#if featured.blurb}<span class="blurb">{featured.blurb}</span>{/if}
  </span>
</button>

<style>
  .widget {
    display: flex;
    flex-direction: column;
    width: 100%;
    aspect-ratio: 1;
    padding: 0;
    border: var(--ink-border);
    border-radius: 20px;
    background: var(--color-paper);
    box-shadow: var(--ink-shadow);
    overflow: hidden;
    color: var(--color-ink);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  /* Picture (or the file's icon on a halftone wash) above, words below */
  .art {
    position: relative;
    flex: 1;
    min-height: 0;
    display: grid;
    place-items: center;
    border-bottom: var(--ink-border);
    background-color: var(--color-moss-100);
    background-image: var(--halftone);
    background-size: var(--halftone-size);
    overflow: hidden;
  }

  .art img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* A square tile filling most of the picture area */
  .icon {
    display: flex;
    box-sizing: border-box;
    height: 80%;
    aspect-ratio: 1;
    padding: 5%;
    border: var(--ink-border);
    border-radius: 14px;
    background: var(--color-paper);
  }

  .icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 8px 10px 10px;
  }

  .label {
    align-self: flex-start;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--color-accent);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .title {
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .blurb {
    font-size: 11px;
    line-height: 1.3;
    color: var(--color-ink-soft);
    /* Up to two lines: a monospace font is too wide for most one-line blurbs */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
