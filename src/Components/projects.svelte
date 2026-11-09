<script module>
  import { preloadImages } from "../lib/preload.js";
  import { workShots } from "../lib/workFiles.js";

  preloadImages(workShots);
</script>

<script>
  import { getContext } from "svelte";
  import { tactile } from "../lib/tactile.js";
  import { playSound } from "../lib/sounds.js";
  import { githubProfile } from "../lib/siteContent.js";
  import {
    liveFiles,
    projectFiles,
    fileWindow,
    FILE_ICONS,
  } from "../lib/workFiles.js";

  /**
   * @typedef {Object} Props
   * @property {boolean} [isMobile]
   */

  /** @type {Props} */
  let { isMobile = false } = $props();

  // Provided by Desktop.svelte, so a file can open in a window of its own
  const desktop = getContext("desktop");

  const folders = [
    { id: "live", name: "Live Work", files: liveFiles },
    { id: "projects", name: "Personal Projects", files: projectFiles },
  ];

  let current = $state("live");
  const folder = $derived(folders.find((f) => f.id === current));

  // Switching folders ticks, like the hover sound elsewhere (tabs have no hover sound)
  function switchTo(id) {
    if (id === current) return;
    current = id;
    playSound("tactile", 0.1);
  }

  function openFile(file) {
    desktop?.openWindow(fileWindow(file));
  }

  // Arrow keys move between the two tabs, like a native tab strip
  function handleTabKey(e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const i = folders.findIndex((f) => f.id === current);
    const next = folders[(i + (e.key === "ArrowRight" ? 1 : -1) + 2) % 2];
    switchTo(next.id);
    e.currentTarget.parentElement
      .querySelector(`[data-tab="${next.id}"]`)
      ?.focus();
  }
</script>

<div class="explorer" class:mobile={isMobile}>
  <div class="tabs" role="tablist" aria-label="Work folders">
    {#each folders as f (f.id)}
      <button
        type="button"
        class="tab"
        role="tab"
        id="work-tab-{f.id}"
        data-tab={f.id}
        aria-selected={current === f.id}
        aria-controls="work-panel"
        tabindex={current === f.id ? 0 : -1}
        onclick={() => switchTo(f.id)}
        onkeydown={handleTabKey}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
            fill={current === f.id ? "url(#halftone)" : "none"}
          />
          <path d="M2 10h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" class="paper" />
        </svg>
        {f.name}
      </button>
    {/each}
  </div>

  <div class="address-bar">
    <span class="path">
      Work <span class="sep" aria-hidden="true">›</span>
      {folder.name}
    </span>
    {#if current === "projects"}
      <a
        href={githubProfile}
        target="_blank"
        rel="noopener noreferrer"
        class="github-link"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
        All on GitHub
      </a>
    {/if}
  </div>

  <div
    class="files"
    id="work-panel"
    role="tabpanel"
    aria-labelledby="work-tab-{current}"
  >
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
  </div>

  <div class="status-bar">
    {folder.files.length} items · {isMobile ? "tap" : "click"} a file to open it
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

  /* --- Folder tabs --- */
  .tabs {
    display: flex;
    gap: 6px;
    padding: 10px 12px 0;
    border-bottom: var(--ink-border);
    background-color: var(--color-moss-100);
  }

  .mobile .tabs {
    padding: 0;
    background: none;
  }

  .tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: -2px;
    padding: 8px 14px;
    border: var(--ink-border);
    border-bottom: none;
    border-radius: 10px 10px 0 0;
    background-color: var(--color-moss-200);
    color: var(--color-ink-muted);
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .tab:hover {
    color: var(--color-ink);
  }

  /* The open tab joins the folder below it */
  .tab[aria-selected="true"] {
    background-color: var(--color-paper);
    color: var(--color-ink);
    padding-bottom: 10px;
  }

  .mobile .tab {
    flex: 1;
    justify-content: center;
    padding: 8px 6px;
    font-size: 13px;
  }

  .tab svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .tab .paper {
    fill: var(--color-paper);
  }

  /* --- Address bar --- */
  .address-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 32px;
    padding: 6px 16px;
    border-bottom: var(--ink-border);
    font-size: 13px;
    font-weight: 600;
  }

  .mobile .address-bar {
    padding: 8px 2px;
  }

  .path {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-ink-soft);
  }

  .sep {
    margin: 0 4px;
    color: var(--color-ink-muted);
  }

  .github-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    padding: 3px 10px;
    border: 1.5px solid var(--color-ink);
    border-radius: 999px;
    color: var(--color-ink);
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .github-link:hover {
    background-color: var(--color-moss-100);
  }

  .github-link svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
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
    gap: 8px;
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

  /* Screenshots get a little paper print look, offset on a halftone shadow */
  .thumb.image {
    position: relative;
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
