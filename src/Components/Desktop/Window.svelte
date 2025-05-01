<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { scale, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  export let window;
  export let isActive = false;

  const dispatch = createEventDispatcher();

  // Variables to track dragging and resizing
  let isDragging = false;
  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let offsetX = window.position.x;
  let offsetY = window.position.y;
  let currentX = window.position.x;
  let currentY = window.position.y;
  let startWidth = window.size.width;
  let startHeight = window.size.height;
  let currentWidth = window.size.width;
  let currentHeight = window.size.height;
  let windowElement;

  function close() {
    dispatch("close");
  }

  function activate() {
    dispatch("activate");
  }

  onMount(() => {
    currentX = window.position.x;
    currentY = window.position.y;
    currentWidth = window.size.width || 800;
    currentHeight = window.size.height || 600;
  });

  function handleMouseDown(e) {
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

      dispatch("resize", {
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

      dispatch("move", { id: window.id, x: currentX, y: currentY });
    }
  }
</script>

<div
  class="window-container"
  class:active={isActive}
  style="left: {currentX}px; top: {currentY}px;"
  on:mousedown={handleMouseDown}
  bind:this={windowElement}
>
  <div
    class="window"
    style="width: {currentWidth}px; height: {currentHeight}px;"
  >
    <div class="title-bar" class:active={isActive}>
      <div class="title-text">{window.title}</div>
      <div class="window-controls">
        <button
          class="window-control close"
          on:click={close}
          aria-label="Close"
        >
          <span>×</span>
        </button>
      </div>
    </div>
    <div class="window-content">
      <svelte:component this={window.component} />
    </div>
    <div
      class="resize-handle"
      on:mousedown={handleResizeMouseDown}
      aria-label="Resize window"
    ></div>
  </div>
</div>

<style>
  .window-container {
    position: absolute;
    z-index: 10;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    overflow: hidden;
  }

  .window-container.active {
    z-index: 100;
  }

  .window {
    background-color: white;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .title-bar {
    height: 40px;
    background: linear-gradient(to right, #e6f7ff, #d1f0ff);
    color: #2c3e50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-weight: 500;
    user-select: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    cursor: move;
  }

  .title-bar.active {
    background: linear-gradient(to right, #a3d8e9, #8bc6f4);
  }

  .title-text {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    line-height: 40px;
  }

  .window-controls {
    display: flex;
    height: 100%;
    align-items: center;
  }

  .window-control {
    width: 24px;
    height: 24px;
    margin-left: 8px;
    border: none;
    color: #2c3e50;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    background: transparent;
    transition: all 0.2s ease;
  }

  .window-control:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .window-control.close:hover {
    background-color: #ffecec;
    color: #e53935;
  }

  .window-content {
    flex-grow: 1;
    overflow: auto;
    background-color: white;
    padding: 16px;
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
    border-right: 2px solid rgba(0, 0, 0, 0.3);
    border-bottom: 2px solid rgba(0, 0, 0, 0.3);
    border-bottom-right-radius: 2px;
  }

  :global(.minimizing) {
    display: none;
  }

  @keyframes minimize {
    display: none;
  }
</style>
