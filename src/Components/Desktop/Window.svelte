<script>
  import { onMount, untrack } from "svelte";
  import { scale, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  /**
   * @typedef {Object} Props
   * @property {any} window
   * @property {boolean} [isActive]
   * @property {boolean} [isMobileView]
   * @property {() => void} [onClose]
   * @property {() => void} [onActivate]
   * @property {(pos: { id: any, x: number, y: number }) => void} [onMove]
   * @property {(size: { id: any, width: number, height: number }) => void} [onResize]
   */

  /** @type {Props} */
  let {
    window,
    isActive = false,
    isMobileView = false,
    onClose,
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

  function close() {
    onClose?.();
  }

  function activate() {
    onActivate?.();
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

    if (e.target.closest(".title-bar")) {
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

      if (windowElement) {
        windowElement.querySelector(".window").style.width =
          `${currentWidth}px`;
        windowElement.querySelector(".window").style.height =
          `${currentHeight}px`;
      }
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

      if (windowElement) {
        windowElement.style.left = `${currentX}px`;
        windowElement.style.top = `${currentY}px`;
      }
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
  class:mobile-window-container={isMobileView}
  style={isMobileView ? "" : `left: ${currentX}px; top: ${currentY}px;`}
  onmousedown={handleMouseDown}
  bind:this={windowElement}
>
  <div
    class="window"
    class:mobile-window-inner={isMobileView}
    style={isMobileView
      ? ""
      : `width: ${currentWidth}px; height: ${currentHeight}px;`}
  >
    {#if !isMobileView}
      <div class="title-bar" class:active={isActive}>
        <div class="title-text">{window.title}</div>
        <div class="window-controls">
          <button
            class="window-control close"
            onclick={close}
            aria-label="Close"
          >
            <span>×</span>
          </button>
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
            <div class="mobile-title">{window.title}</div>
          </div>
        </div>
      {/if}
      <window.component isMobile={isMobileView} />
    </div>

    {#if !isMobileView}
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
    position: absolute;
    box-shadow: 4px 4px 0 var(--color-ink);
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.15s ease;
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
    justify-content: space-between;
    padding: 0 10px 0 16px;
    font-weight: 600;
    user-select: none;
    border-bottom: var(--ink-border);
    cursor: move;
  }

  /* Halftone band that fades in toward the controls on the focused window */
  .title-bar::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--halftone);
    background-size: var(--halftone-size);
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
    height: 100%;
    align-items: center;
  }

  .window-control {
    width: 24px;
    height: 24px;
    margin-left: 8px;
    border: var(--ink-border);
    color: var(--color-ink);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    background: var(--color-paper);
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .window-control:hover {
    background-color: var(--color-ink);
    color: var(--color-paper);
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
