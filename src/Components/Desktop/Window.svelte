<script>
  import { onMount, untrack } from "svelte";
  import { scale, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { playSound } from "../../lib/sounds.js";
  import { CRASH_EVENT } from "../../lib/xylophone.js";
  import { tactile } from "../../lib/tactile.js";

  /**
   * @typedef {Object} Props
   * @property {any} window
   * @property {boolean} [isActive]
   * @property {boolean} [isMobileView]
   * @property {boolean} [minimized]
   * @property {(options?: { quiet?: boolean }) => void} [onClose]
   * @property {() => void} [onMinimize]
   * @property {() => void} [onActivate]
   * @property {(pos: { id: any, x: number, y: number }) => void} [onMove]
   * @property {(size: { id: any, width: number, height: number }) => void} [onResize]
   */

  /** @type {Props} */
  let {
    window,
    isActive = false,
    isMobileView = false,
    minimized = false,
    onClose,
    onMinimize,
    onActivate,
    onMove,
    onResize,
  } = $props();

  // The window owns its position/size after mount; props only seed them
  const { position, size } = untrack(() => window);

  // Variables to track dragging and resizing
  let isDragging = false;
  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let offsetX = position.x;
  let offsetY = position.y;
  let currentX = $state(position.x);
  let currentY = $state(position.y);
  let startWidth = size.width;
  let startHeight = size.height;
  let currentWidth = $state(size.width);
  let currentHeight = $state(size.height);
  let windowElement = $state();

  // Maximized windows fill the desktop; `animatingFrame` eases the jump between sizes
  let maximized = $state(false);
  let animatingFrame = $state(false);
  let frameTimer;

  const frameStyle = $derived(
    isMobileView || maximized
      ? ""
      : `left: ${currentX}px; top: ${currentY}px; width: ${currentWidth}px; height: ${currentHeight}px;`,
  );

  function close() {
    onClose?.();
  }

  // --- Crashing ----------------------------------------------------------------
  // Mash the musical pills for too long (see xylophone.js) and the window gives up:
  // the piano slams, the content is replaced by a dead face, and it closes a beat later.
  const CRASH_CLOSE_MS = 3000;
  let crashed = $state(false);

  function handleCrash() {
    if (crashed) return;
    crashed = true;
    activate();
    playSound("slam");
    setTimeout(() => onClose?.({ quiet: true }), CRASH_CLOSE_MS);
  }

  function activate() {
    onActivate?.();
  }

  function minimize() {
    onMinimize?.();
  }

  function toggleMaximize() {
    clearTimeout(frameTimer);
    animatingFrame = true;
    maximized = !maximized;
    playSound(maximized ? "open" : "close");
    frameTimer = setTimeout(() => (animatingFrame = false), 300);
  }

  function handleTitleDoubleClick(e) {
    if (e.target.closest(".window-controls")) return;
    toggleMaximize();
  }

  onMount(() => {
    currentX = window.position.x;
    currentY = window.position.y;
    currentWidth = window.size.width || 800;
    currentHeight = window.size.height || 600;

    windowElement.addEventListener(CRASH_EVENT, handleCrash);
    return () => windowElement.removeEventListener(CRASH_EVENT, handleCrash);
  });

  function handleMouseDown(e) {
    if (isMobileView) return;

    activate();

    // Drag from the title bar, but not from its buttons or while maximized
    if (
      e.target.closest(".title-bar") &&
      !e.target.closest(".window-controls") &&
      !maximized
    ) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      offsetX = currentX;
      offsetY = currentY;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      e.preventDefault();
    }
  }

  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 300;

  // Which way the grabbed corner grows the window: +1 right/down, -1 left/up
  let resizeDirX = 1;
  let resizeDirY = 1;

  const corners = [
    { name: "nw", dirX: -1, dirY: -1 },
    { name: "ne", dirX: 1, dirY: -1 },
    { name: "sw", dirX: -1, dirY: 1 },
    { name: "se", dirX: 1, dirY: 1 },
  ];

  function handleResizeMouseDown(e, dirX, dirY) {
    if (isMobileView) return;

    activate();
    isResizing = true;
    resizeDirX = dirX;
    resizeDirY = dirY;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = currentWidth;
    startHeight = currentHeight;
    offsetX = currentX;
    offsetY = currentY;

    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
    e.preventDefault();
    e.stopPropagation();
  }

  function handleResizeMouseMove(e) {
    if (isResizing) {
      const newWidth = Math.max(
        MIN_WIDTH,
        startWidth + resizeDirX * (e.clientX - startX),
      );
      const newHeight = Math.max(
        MIN_HEIGHT,
        startHeight + resizeDirY * (e.clientY - startY),
      );

      currentWidth = newWidth;
      currentHeight = newHeight;

      // Left/top corners move the window's origin so the opposite edge stays put
      if (resizeDirX < 0) currentX = offsetX + (startWidth - newWidth);
      if (resizeDirY < 0) currentY = offsetY + (startHeight - newHeight);
    }
  }

  function handleResizeMouseUp() {
    if (isResizing) {
      isResizing = false;
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleResizeMouseUp);

      onResize?.({
        id: window.id,
        width: currentWidth,
        height: currentHeight,
      });
      if (resizeDirX < 0 || resizeDirY < 0) {
        onMove?.({ id: window.id, x: currentX, y: currentY });
      }
    }
  }

  // Dragged windows may hang off the sides or slip under the taskbar, but the title
  // bar always stays where it can be grabbed again
  const TITLE_BAR_H = 40;
  const MIN_VISIBLE_X = 80;

  function handleMouseMove(e) {
    if (isDragging) {
      const desktop = windowElement.offsetParent;
      const taskbarSpace =
        parseFloat(getComputedStyle(desktop).getPropertyValue("--taskbar-space")) ||
        0;
      const maxY = desktop.clientHeight - taskbarSpace - TITLE_BAR_H;
      const minX = MIN_VISIBLE_X - currentWidth;
      const maxX = desktop.clientWidth - MIN_VISIBLE_X;
      currentX = Math.min(maxX, Math.max(minX, offsetX + (e.clientX - startX)));
      currentY = Math.min(maxY, Math.max(0, offsetY + (e.clientY - startY)));
    }
  }

  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      onMove?.({ id: window.id, x: currentX, y: currentY });
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="window-container"
  class:active={isActive}
  class:maximized
  class:minimized
  class:animating-frame={animatingFrame}
  class:crashed
  class:mobile-window-container={isMobileView}
  style={frameStyle}
  onmousedown={handleMouseDown}
  bind:this={windowElement}
>
  <div class="window" class:mobile-window-inner={isMobileView}>
    {#if !isMobileView}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="title-bar"
        class:active={isActive}
        ondblclick={handleTitleDoubleClick}
      >
        <!-- Mac-style traffic lights; glyphs appear while the group is hovered -->
        <div class="window-controls">
          <button
            class="light close"
            onclick={close}
            aria-label="Close"
            use:tactile
          >
            <svg viewBox="0 0 8 8" aria-hidden="true">
              <path d="M2 2l4 4M6 2L2 6" />
            </svg>
          </button>
          <button
            class="light minimize"
            onclick={minimize}
            use:tactile
            aria-label="Minimize"
          >
            <svg viewBox="0 0 8 8" aria-hidden="true">
              <path d="M1.75 4h4.5" />
            </svg>
          </button>
          <button
            class="light maximize"
            onclick={toggleMaximize}
            use:tactile
            aria-label={maximized ? "Restore" : "Maximize"}
          >
            <svg viewBox="0 0 8 8" aria-hidden="true">
              <path
                class="glyph-fill"
                d="M1.5 1.5h3.5L1.5 5zM6.5 6.5H3L6.5 3z"
              />
            </svg>
          </button>
        </div>
        <div class="title-text">
          {window.title}{crashed ? " (Not Responding)" : ""}
        </div>
      </div>
    {/if}

    <div class="window-content" class:mobile-window-content={isMobileView}>
      {#if isMobileView}
        <div class="mobile-header">
          <div class="mobile-header-content">
            <button
              class="mobile-back-button"
              onclick={close}
              aria-label="Back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div class="mobile-title">
              {window.title}{crashed ? " (Not Responding)" : ""}
            </div>
          </div>
        </div>
      {/if}
      {#if crashed}
        <div class="crash-screen" class:mobile={isMobileView}>
          <!-- Dead face: X eyes over a frown, drawn straight on the dots -->
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path d="M12 14l12 12M24 14L12 26M40 14l12 12M52 14L40 26" />
            <path d="M18 52c8-11 20-11 28 0" />
          </svg>
        </div>
      {:else}
        <window.component isMobile={isMobileView} {...window.props ?? {}} />
      {/if}
    </div>

    {#if !isMobileView && !maximized}
      {#each corners as corner (corner.name)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="resize-handle {corner.name}"
          onmousedown={(e) =>
            handleResizeMouseDown(e, corner.dirX, corner.dirY)}
          aria-hidden="true"
        ></div>
      {/each}
    {/if}
  </div>
</div>

<style>
  /* Stacking between windows is set on the wrapper in Desktop.svelte */
  .window-container {
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
    position: absolute;
    box-shadow: 4px 4px 0 var(--color-ink);
    border-radius: 12px;
    overflow: hidden;
    transform-origin: bottom center;
    transition:
      box-shadow 0.15s ease,
      transform 0.25s var(--ease),
      opacity 0.2s ease,
      visibility 0s;
  }

  /* Fills the desktop, leaving room for the ink border and shadow */
  .window-container.maximized {
    left: 8px;
    top: 8px;
    width: calc(100% - 22px);
    height: calc(100% - 22px - var(--taskbar-space, 0px));
  }

  .window-container.animating-frame {
    transition:
      box-shadow 0.15s ease,
      left 0.3s var(--ease),
      top 0.3s var(--ease),
      width 0.3s var(--ease),
      height 0.3s var(--ease);
  }

  /* Drops toward the taskbar, then hides so it can't be clicked or focused */
  .window-container.minimized {
    transform: translateY(60px) scale(0.9);
    opacity: 0;
    visibility: hidden;
    transition:
      box-shadow 0.15s ease,
      transform 0.25s var(--ease),
      opacity 0.2s ease,
      visibility 0s linear 0.25s;
  }

  /* --- Crash: the content turns to halftone dots with a dead face on top --- */
  .window-container.crashed {
    pointer-events: none;
  }

  .crash-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Fills the window edge to edge, cancelling the content padding */
    height: calc(100% + 32px);
    margin: -16px;
    background-color: var(--color-paper);
    background-image: var(--halftone);
    background-size: var(--halftone-size);
    animation: crash-in 0.12s ease-out;
  }

  .crash-screen.mobile {
    height: auto;
    min-height: 70vh;
    margin: 0;
  }

  .crash-screen svg {
    width: 96px;
    height: 96px;
    fill: none;
    stroke: var(--color-ink);
    stroke-width: 5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @keyframes crash-in {
    from {
      opacity: 0;
    }
  }

  .mobile-window-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .window-container.active {
    box-shadow: 7px 7px 0 var(--color-ink);
  }

  .window {
    width: 100%;
    height: 100%;
    background-color: var(--color-paper);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 12px;
    border: var(--ink-border);
    position: relative;
    box-sizing: border-box;
  }

  .mobile-window-inner {
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
    border: none;
  }

  .title-bar {
    height: 40px;
    flex-shrink: 0;
    position: relative;
    background: var(--color-paper);
    color: var(--color-ink-muted);
    display: flex;
    align-items: center;
    padding: 0 16px 0 12px;
    font-weight: 600;
    user-select: none;
    border-bottom: var(--ink-border);
    cursor: move;
  }

  /* Halftone band that fades in toward the right on the focused window; the dots
     swell and vanish in a wave travelling left to right (static if not installed) */
  .title-bar::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--halftone-wave, var(--halftone));
    background-size: var(--halftone-wave-size, var(--halftone-size));
    mask-image: var(--halftone-fade);
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }

  .title-bar.active {
    color: var(--color-ink);
  }

  .title-bar.active::before {
    opacity: 0.55;
  }

  .title-text {
    position: relative;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    line-height: 40px;
  }

  .window-controls {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 14px;
  }

  .light {
    --light-color: var(--color-paper);
    width: 14px;
    height: 14px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--color-ink);
    border-radius: 50%;
    background: var(--color-paper);
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .light.close {
    --light-color: #ee6a5a;
  }

  .light.minimize {
    --light-color: #f4c04f;
  }

  .light.maximize {
    --light-color: var(--color-accent);
  }

  /* Coloured on the focused window or while pointed at; outlined otherwise */
  .title-bar.active .light,
  .window-controls:hover .light {
    background-color: var(--light-color);
  }

  .light svg {
    width: 8px;
    height: 8px;
    fill: none;
    stroke: var(--color-ink);
    stroke-width: 1.5;
    stroke-linecap: round;
    opacity: 0;
    transition: opacity 0.1s ease;
  }

  .light .glyph-fill {
    fill: var(--color-ink);
    stroke: none;
  }

  .window-controls:hover .light svg,
  .light:focus-visible svg {
    opacity: 1;
  }

  .window-content {
    flex-grow: 1;
    overflow: auto;
    background-color: var(--color-paper);
    padding: 16px;
  }

  .mobile-window-content {
    -webkit-overflow-scrolling: touch;
    padding: 0;
  }

  /* On phones the content area is the window's only scroller. A section that scrolls on
     its own inside it would stop a swipe dead at its end, before the page has. clip
     (unlike hidden) trims sideways overflow without making another scroller. */
  .mobile-window-content :global(> *:not(.mobile-header)) {
    padding: 16px;
    width: auto;
    height: auto;
    box-sizing: border-box;
    overflow: visible;
    overflow-x: clip;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: var(--ink-border);
    position: sticky;
    top: 0;
    background-color: var(--color-paper);
    z-index: 10;
  }

  .mobile-header-content {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .mobile-back-button {
    background: var(--color-paper);
    border: none;
    font-size: 20px;
    color: var(--color-ink);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    padding: 0;
    margin-right: 12px;
  }

  .mobile-back-button:focus-visible {
    outline: none;
  }

  .mobile-back-button:active {
    background-color: var(--color-ink);
    color: var(--color-paper);
  }

  .mobile-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-ink);
  }

  /* Corner grips; only the bottom-right one is drawn. The top ones stay small enough
     to clear the traffic lights. */
  .resize-handle {
    position: absolute;
    width: 12px;
    height: 12px;
    z-index: 10;
  }

  .resize-handle.nw {
    top: 0;
    left: 0;
    cursor: nwse-resize;
  }

  .resize-handle.ne {
    top: 0;
    right: 0;
    cursor: nesw-resize;
  }

  .resize-handle.sw {
    bottom: 0;
    left: 0;
    cursor: nesw-resize;
  }

  .resize-handle.se {
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
  }

  .resize-handle.se::after {
    content: "";
    position: absolute;
    right: 4px;
    bottom: 4px;
    width: 8px;
    height: 8px;
    border-right: var(--ink-border);
    border-bottom: var(--ink-border);
    border-bottom-right-radius: 2px;
  }
</style>
