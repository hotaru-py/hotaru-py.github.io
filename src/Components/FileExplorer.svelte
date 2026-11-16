<script>
  import { getContext } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { tactile } from "../lib/tactile.js";
  import { playSound } from "../lib/sounds.js";
  import { fileWindow, FILE_ICONS } from "../lib/workFiles.js";

  /**
   * A folder window: the root lists subfolders, each opens to its files, and a file
   * opens in a viewer window of its own. Projects and Gallery are both one of these.
   * @typedef {Object} Folder
   * @property {string} id
   * @property {string} name
   * @property {import("../lib/workFiles.js").WorkFile[]} files
   * @property {{ label: string, url: string }} [link] Shown in the toolbar inside it
   *
   * @typedef {Object} Props
   * @property {string} rootName The window's top folder, e.g. "Projects"
   * @property {Folder[]} folders
   * @property {boolean} [isMobile]
   */

  /** @type {Props} */
  let { rootName, folders, isMobile = false } = $props();

  // Provided by Desktop.svelte, so a file can open in a window of its own
  const desktop = getContext("desktop");

  /** @type {string | null} The open subfolder; null is the root */
  let path = $state(null);
  const folder = $derived(folders.find((f) => f.id === path) ?? null);
  const items = $derived(folder ? folder.files.length : folders.length);

  // Going into a folder slides its contents in from the right; going back, from the left
  let direction = $state(1);
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function openFolder(id) {
    direction = 1;
    path = id;
    playSound("tactile", 0.1);
  }

  function goUp() {
    if (!folder) return;
    direction = -1;
    path = null;
    playSound("tactile", 0.1);
  }

  function openFile(file) {
    desktop?.openWindow(fileWindow(file));
  }
</script>

<div class="explorer" class:mobile={isMobile}>
  <div class="toolbar">
    <button
      type="button"
      class="up"
      onclick={goUp}
      disabled={!folder}
      aria-label="Back to {rootName}"
      title="Back to {rootName}"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"
        ><path d="M19 12H5M11 18l-6-6 6-6" /></svg
      >
    </button>
    <nav class="path" aria-label="Location">
      {#if folder}
        <button type="button" class="crumb" onclick={goUp}>{rootName}</button>
        <span class="sep" aria-hidden="true">›</span>
        <span class="crumb current" aria-current="page">{folder.name}</span>
      {:else}
        <span class="crumb current" aria-current="page">{rootName}</span>
      {/if}
    </nav>
    {#if folder?.link}
      <a
        href={folder.link.url}
        target="_blank"
        rel="noopener noreferrer"
        class="toolbar-link"
      >
        {folder.link.label} →
      </a>
    {/if}
  </div>

  {#key path}
    <div
      class="files"
      in:fly={{
        x: reduceMotion ? 0 : 28 * direction,
        duration: reduceMotion ? 0 : 220,
        easing: cubicOut,
      }}
    >
      {#if !folder}
        {#each folders as f (f.id)}
          <button
            type="button"
            class="file"
            onclick={() => openFolder(f.id)}
            use:tactile
          >
            <span class="thumb">{@html FILE_ICONS.folder}</span>
            <span class="file-name">{f.name}</span>
            <span class="file-meta">{f.files.length} items</span>
          </button>
        {/each}
      {:else if folder.files.length === 0}
        <p class="empty">Nothing in here yet.</p>
      {:else}
        {#each folder.files as file (file.key)}
          <button
            type="button"
            class="file"
            onclick={() => openFile(file)}
            title={file.name}
            use:tactile
          >
            <span class="thumb" class:image={file.image}>
              {#if file.image}
                <img src={file.image} alt="" loading="lazy" />
              {:else}
                {@html file.icon ?? FILE_ICONS.project}
              {/if}
            </span>
            <span class="file-name">{file.name}</span>
          </button>
        {/each}
      {/if}
    </div>
  {/key}

  <div class="status-bar">
    {items} items · {isMobile ? "tap" : "click"}
    {folder ? "a file to open it" : "a folder to look inside"}
  </div>
</div>

<style>
  /* Fills the window edge to edge, cancelling the content padding */
  .explorer {
    display: flex;
    flex-direction: column;
    height: calc(100% + 32px);
    margin: -16px;
    color: var(--color-ink);
  }

  /* On phones the window is the scroller and keeps its own padding */
  .explorer.mobile {
    height: auto;
    margin: 0;
  }

  /* --- Toolbar: back button and the folder path --- */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 6px 12px;
    border-bottom: var(--ink-border);
    background-color: var(--color-moss-100);
    font-size: 14px;
    font-weight: 700;
  }

  .mobile .toolbar {
    padding: 0 0 10px;
    background: none;
  }

  .up {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    padding: 0;
    display: grid;
    place-items: center;
    border: var(--ink-border);
    border-radius: 8px;
    background: var(--color-paper);
    color: var(--color-ink);
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .up:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .up svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .path {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    overflow: hidden;
  }

  .crumb {
    padding: 2px 4px;
    border: none;
    border-radius: 6px;
    background: none;
    color: var(--color-ink-muted);
    font: inherit;
    cursor: pointer;
  }

  button.crumb:hover {
    color: var(--color-ink);
    background: var(--color-moss-200);
  }

  .crumb.current {
    color: var(--color-ink);
    cursor: default;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sep {
    color: var(--color-ink-muted);
  }

  .toolbar-link {
    flex-shrink: 0;
    padding: 3px 10px;
    border: 1.5px solid var(--color-ink);
    border-radius: 999px;
    color: var(--color-ink);
    font-size: 13px;
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .toolbar-link:hover {
    background-color: var(--color-paper);
  }

  /* --- Files: large-icon view --- */
  .files {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    align-content: start;
    gap: 8px;
    padding: 16px;
  }

  .mobile .files {
    overflow: visible;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    padding: 16px 0;
  }

  .file {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 6px;
    border: 2px solid transparent;
    border-radius: 10px;
    background: none;
    color: var(--color-ink);
    font: inherit;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;
  }

  .file:hover {
    background-color: var(--color-moss-100);
    border-color: var(--color-ink);
  }

  .file:active {
    background-color: var(--color-moss-200);
  }

  .thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 112px;
    aspect-ratio: 4 / 3;
  }

  .thumb :global(svg) {
    width: 60%;
    height: 80%;
  }

  /* Pictures get a little paper print look */
  .thumb.image {
    border: var(--ink-border);
    border-radius: 6px;
    background-color: var(--color-moss-100);
    box-shadow: 3px 3px 0 var(--color-ink);
    overflow: hidden;
  }

  .thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }

  .file-name {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    text-align: center;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
  }

  .file-meta {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-ink-muted);
  }

  .empty {
    grid-column: 1 / -1;
    margin: 24px 0;
    text-align: center;
    font-size: 14px;
    color: var(--color-ink-muted);
  }

  /* --- Status bar --- */
  .status-bar {
    padding: 6px 16px;
    border-top: var(--ink-border);
    background-color: var(--color-moss-100);
    font-size: 12px;
    font-weight: 600;
    color: var(--color-ink-muted);
  }

  .mobile .status-bar {
    border: none;
    background: none;
    padding: 0 2px;
  }
</style>
