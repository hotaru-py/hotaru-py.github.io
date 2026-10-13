<script>
  import { onMount, untrack } from "svelte";
  import { scale, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { playSound } from "../../lib/sounds.js";

  /**
   * @typedef {Object} Props
   * @property {any} window
   * @property {boolean} [isActive]
   * @property {boolean} [isMobileView]
   * @property {boolean} [minimized]
   * @property {() => void} [onClose]
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

  function handleResizeMouseDown(e) {
    if (isMobileView) return;

    activate();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = currentWidth;
    startHeight = currentHeight;

    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
    e.preventDefault();
    e.stopPropagation();
  }

  function handleResizeMouseMove(e) {
    if (isResizing) {
      const newWidth = Math.max(400, startWidth + (e.clientX - startX));
      const newHeight = Math.max(300, startHeight + (e.clientY - startY));

      currentWidth = newWidth;
      currentHeight = newHeight;
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
    }
  }

  function handleMouseMove(e) {
    if (isDragging) {
      currentX = offsetX + (e.clientX - startX);
      currentY = offsetY + (e.clientY - startY);
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

<div
  class="window-container"
  class:active={isActive}
  class:maximized
  class:minimized
  class:animating-frame={animatingFrame}
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
          <button class="light close" onclick={close} aria-label="Close">
            <svg viewBox="0 0 8 8" aria-hidden="true">
              <path d="M2 2l4 4M6 2L2 6" />
            </svg>
          </button>
          <button
            class="light minimize"
            onclick={minimize}
            aria-label="Minimize"
          >
            <svg viewBox="0 0 8 8" aria-hidden="true">
              <path d="M1.75 4h4.5" />
            </svg>
          </button>
          <button
            class="light maximize"
            onclick={toggleMaximize}
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
        <div class="title-text">{window.title}</div>
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
            <div class="mobile-title">{window.title}</div>
          </div>
        </div>
      {/if}
      <window.component isMobile={isMobileView} />
    </div>

    {#if !isMobileView && !maximized}
      <div
        class="resize-handle"
        onmousedown={handleResizeMouseDown}
        aria-label="Resize window"
      ></div>
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
    height: calc(100% - 22px);
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

  .mobile-window-content :global(> *:not(.mobile-header)) {
    padding: 16px;
    width: auto;
    box-sizing: border-box;
    overflow-x: hidden;
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

  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    z-index: 10;
  }

  .resize-handle::after {
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
