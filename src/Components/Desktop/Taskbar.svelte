<script>
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  /**
   * @typedef {Object} Props
   * @property {any} [windows]
   * @property {any} [activeWindowId]
   * @property {any} [desktopIcons]
   * @property {any} [currentTime]
   * @property {(windowId: any) => void} [onActivateWindow]
   * @property {(icon: any) => void} [onOpenWindow]
   */

  /** @type {Props} */
  let {
    windows = [],
    activeWindowId = null,
    desktopIcons = [],
    currentTime = new Date(),
    onActivateWindow,
    onOpenWindow,
  } = $props();

  let isStartMenuOpen = $state(false);
  let startMenuContainer = $state();

  onMount(() => {
    function handleClickOutside(event) {
      if (
        isStartMenuOpen &&
        startMenuContainer &&
        !startMenuContainer.contains(event.target)
      ) {
        if (!event.target.closest(".start-button")) {
          isStartMenuOpen = false;
        }
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  function toggleStartMenu() {
    isStartMenuOpen = !isStartMenuOpen;
  }

  function activateWindow(windowId) {
    onActivateWindow?.(windowId);
  }

  function handleTaskbarButtonClick(windowId) {
    activateWindow(windowId);
  }

  function openWindow(iconData) {
    onOpenWindow?.(iconData);
    isStartMenuOpen = false;
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(date) {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<div class="taskbar-container">
  <div class="taskbar">
    <div class="start-button-container">
      <button
        class="start-button"
        class:active={isStartMenuOpen}
        onclick={toggleStartMenu}
      >
        <img src="/firefly.webp" alt="hotaru logo" class="start-icon" />
        <span class="start-text">Start</span>
      </button>

      {#if isStartMenuOpen}
        <div
          class="start-menu"
          bind:this={startMenuContainer}
          transition:slide={{ duration: 200, easing: cubicOut }}
        >
          <div
            class="start-menu-header"
            in:fade={{ delay: 100, duration: 150 }}
          >
            <div class="menu-header-logo">
              <div class="menu-logo-container">
                <img src="/firefly.webp" alt="hotaru logo" class="menu-logo" />
              </div>
              <div class="menu-title">hotaru</div>
            </div>
          </div>

          <div class="start-menu-items">
            {#each desktopIcons as icon, i}
              <button
                type="button"
                class="start-menu-item"
                onclick={() => openWindow(icon)}
                in:slide={{
                  delay: 100 + i * 50,
                  duration: 150,
                  easing: cubicOut,
                }}
              >
                <div class="start-menu-item-icon">
                  {@html icon.icon}
                </div>
                <div class="start-menu-item-text">{icon.title}</div>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <div class="window-buttons">
      {#each windows as window (window.id)}
        <button
          class="taskbar-window-button"
          class:active={activeWindowId === window.id}
          onclick={() => handleTaskbarButtonClick(window.id)}
          in:slide={{ duration: 200, easing: cubicOut }}
          out:slide={{ duration: 200, easing: cubicOut }}
        >
          <span class="window-icon">
            {@html desktopIcons.find((i) => i.id === window.id)?.icon || "📄"}
          </span>
          <span class="window-title">{window.title}</span>
        </button>
      {/each}
    </div>

    <div class="system-tray">
      <div class="system-time">
        <div class="time">{formatTime(currentTime)}</div>
        <div class="date">{formatDate(currentTime)}</div>
      </div>
    </div>
  </div>
</div>

<style>
  .taskbar-container {
    padding: 12px 16px 16px;
    position: relative;
    z-index: 1000;
    background-color: transparent;
  }

  .taskbar {
    height: 50px;
    background: var(--color-paper);
    display: flex;
    border-radius: 12px;
    border: var(--ink-border);
    box-shadow: var(--ink-shadow);
    width: 100%;
    box-sizing: border-box;
    z-index: 1000;
  }

  .start-button-container {
    position: relative;
  }

  .start-button {
    display: flex;
    align-items: center;
    height: 34px;
    padding: 0 12px;
    margin: 6px;
    font-weight: 700;
    font-size: 14px;
    background: var(--color-ink);
    color: var(--color-paper);
    border: var(--ink-border);
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 2px 2px 0 var(--color-accent);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .start-button:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 var(--color-accent);
  }

  .start-button.active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }

  .start-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border-radius: 50%;
    background: var(--color-paper);
  }

  .start-menu {
    position: absolute;
    bottom: 58px;
    left: 0;
    width: 280px;
    background-color: var(--color-paper);
    border: var(--ink-border);
    border-radius: 12px;
    box-shadow: 6px 6px 0 var(--color-ink);
    display: flex;
    flex-direction: column;
    z-index: 1001;
    overflow: hidden;
  }

  .start-menu-header {
    position: relative;
    color: var(--color-ink);
    padding: 16px;
    border-bottom: var(--ink-border);
  }

  .start-menu-header::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--halftone);
    background-size: var(--halftone-size);
    mask-image: var(--halftone-fade);
    opacity: 0.55;
    pointer-events: none;
  }

  .menu-header-logo {
    position: relative;
    display: flex;
    align-items: center;
  }

  .menu-logo-container {
    width: 38px;
    height: 38px;
    background-color: var(--color-accent);
    border: var(--ink-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }

  .menu-logo {
    width: 26px;
    height: 26px;
  }

  .menu-title {
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 0.5px;
    color: var(--color-ink);
  }

  .start-menu-items {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .start-menu-item {
    display: flex;
    width: 100%;
    padding: 10px 12px;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;
    border: 2px solid transparent;
    background: none;
    font: inherit;
    color: var(--color-ink);
    text-align: left;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .start-menu-item:hover {
    border-color: var(--color-ink);
    box-shadow: 3px 3px 0 var(--color-ink);
  }

  /* Halftone shading sparkles on hover */
  @media (prefers-reduced-motion: no-preference) {
    .start-menu-item:hover .start-menu-item-icon,
    .taskbar-window-button:hover .window-icon :global([fill="url(#halftone)"]) {
      fill: url(#halftone-sparkle);
    }
  }

  .start-menu-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    width: 24px;
    height: 24px;
  }

  .start-menu-item-icon :global(svg) {
    width: 24px;
    height: 24px;
  }

  .start-menu-item-text {
    font-size: 14px;
    font-weight: 600;
  }

  .window-buttons {
    display: flex;
    flex-grow: 1;
    align-items: center;
    padding: 0 8px;
    gap: 8px;
    overflow-x: hidden;
  }

  .taskbar-window-button {
    position: relative;
    display: flex;
    align-items: center;
    height: 34px;
    padding: 0 12px;
    background: var(--color-paper);
    color: var(--color-ink-soft);
    border: var(--ink-border);
    border-radius: 8px;
    min-width: 120px;
    max-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
    font: inherit;
    transition:
      background-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .taskbar-window-button:hover:not(.active) {
    box-shadow: 2px 2px 0 var(--color-ink);
  }

  .taskbar-window-button.active {
    color: var(--color-ink);
    font-weight: 700;
    background: var(--color-moss-100);
  }

  .window-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .window-icon :global(svg) {
    width: 20px;
    height: 20px;
  }

  .window-title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
  }

  .system-tray {
    display: flex;
    align-items: center;
    margin-left: auto;
    padding: 0 12px;
    border-left: var(--ink-border);
  }

  .system-time {
    color: var(--color-ink);
    font-size: 13px;
    text-align: center;
    padding: 0 8px;
  }

  .time {
    font-weight: 700;
  }

  .date {
    font-size: 10px;
    color: var(--color-ink-muted);
  }
</style>
