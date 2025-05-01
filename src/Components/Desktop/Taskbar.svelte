<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  export let windows = [];
  export let activeWindowId = null;
  export let desktopIcons = [];
  export let currentTime = new Date();

  let isStartMenuOpen = false;
  let startMenuContainer;

  const dispatch = createEventDispatcher();

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
    dispatch("activateWindow", windowId);
  }

  function handleTaskbarButtonClick(windowId) {
    activateWindow(windowId);
  }

  function openWindow(iconData) {
    dispatch("openWindow", iconData);
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
        on:click={toggleStartMenu}
      >
        <img src="/firefly.webp" alt="hotaru logo" class="start-icon" />
        <span class="start-text">hotaru</span>
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
            <div class="user-info">
              <div class="user-avatar">👤</div>
              <div class="user-name">Prajesh</div>
            </div>
          </div>

          <div class="start-menu-items">
            {#each desktopIcons as icon, i}
              <div
                class="start-menu-item"
                on:click={() => openWindow(icon)}
                in:slide={{
                  delay: 100 + i * 50,
                  duration: 150,
                  easing: cubicOut,
                }}
              >
                <div class="start-menu-item-icon">{icon.icon}</div>
                <div class="start-menu-item-text">{icon.title}</div>
              </div>
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
          on:click={() => handleTaskbarButtonClick(window.id)}
          in:slide={{ duration: 200, easing: cubicOut }}
          out:slide={{ duration: 200, easing: cubicOut }}
        >
          <span class="window-icon"
            >{desktopIcons.find((i) => i.id === window.id)?.icon || "📄"}</span
          >
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
    padding: 12px 16px;
    position: relative;
    z-index: 1000;
    background-color: transparent;
  }

  .taskbar {
    height: 50px;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    display: flex;
    border-radius: 12px;
    box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.1);
    width: 100%;
    z-index: 1000;
    border: 1px solid rgba(255, 255, 255, 0.6);
  }

  .start-button-container {
    position: relative;
  }

  .start-button {
    display: flex;
    align-items: center;
    height: 38px;
    padding: 0 12px;
    margin: 6px;
    font-weight: 500;
    font-size: 14px;
    background: linear-gradient(to right, #a3d8e9, #8bc6f4);
    color: #2c3e50;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .start-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }

  .start-button.active {
    background: linear-gradient(to right, #8bc6f4, #7ab6e4);
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
    transform: translateY(1px);
  }

  .start-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border-radius: 4px;
  }

  .start-menu {
    position: absolute;
    bottom: 55px;
    left: 0;
    width: 280px;
    background-color: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-radius: 12px;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    z-index: 1001;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .start-menu-header {
    background: linear-gradient(to right, #a3d8e9, #8bc6f4);
    color: #2c3e50;
    padding: 16px;
    height: 70px;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .user-avatar {
    font-size: 30px;
    margin-right: 12px;
  }

  .user-name {
    font-weight: 500;
    font-size: 18px;
  }

  .start-menu-items {
    padding: 8px;
  }

  .start-menu-item {
    display: flex;
    padding: 10px;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .start-menu-item:hover {
    background-color: #e8f4fa;
  }

  .start-menu-item-icon {
    font-size: 20px;
    margin-right: 12px;
    width: 24px;
    text-align: center;
  }

  .window-buttons {
    display: flex;
    flex-grow: 1;
    align-items: center;
    padding: 0 8px;
    overflow-x: hidden;
  }

  .taskbar-window-button {
    display: flex;
    align-items: center;
    height: 36px;
    margin: 4px;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.5);
    color: #2c3e50;
    border: 1px solid rgba(163, 216, 233, 0.3);
    border-radius: 8px;
    min-width: 120px;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.15);
  }

  .taskbar-window-button:hover:not(.active) {
    background: rgba(163, 216, 233, 0.2);
  }

  .taskbar-window-button.active {
    background: rgba(163, 216, 233, 0.3);
    border-color: rgba(139, 198, 244, 0.5);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  .window-icon {
    margin-right: 8px;
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
    border-left: 1px solid rgba(0, 0, 0, 0.05);
  }

  .system-time {
    color: #2c3e50;
    font-size: 13px;
    text-align: center;
    padding: 0 8px;
  }

  .time {
    font-weight: 500;
  }

  .date {
    font-size: 10px;
    opacity: 0.8;
  }
</style>
