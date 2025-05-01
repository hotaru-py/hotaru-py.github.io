<script>
  import { onMount } from "svelte";
  import Taskbar from "./Taskbar.svelte";
  import DesktopIcon from "./DesktopIcon.svelte";
  import Window from "./Window.svelte";
  import About from "../about.svelte";
  import Skills from "../skills.svelte";
  import Projects from "../projects.svelte";
  import Reach from "../reach.svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let windows = [];
  let activeWindowId = null;
  let closingWindowId = null;
  let desktopWidth = 0;
  let desktopHeight = 0;

  const desktopIcons = [
    { id: "about", title: "About Me", icon: "📄", component: About },
    { id: "skills", title: "Skills", icon: "🛠️", component: Skills },
    { id: "projects", title: "Projects", icon: "📁", component: Projects },
    { id: "contact", title: "Contact", icon: "📞", component: Reach },
  ];

  let currentTime = new Date();
  let startupComplete = false;

  onMount(() => {
    const timer = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    setTimeout(() => {
      startupComplete = true;
    }, 1000);

    updateDesktopDimensions();
    window.addEventListener("resize", updateDesktopDimensions);

    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", updateDesktopDimensions);
    };
  });

  function updateDesktopDimensions() {
    desktopWidth = window.innerWidth;
    desktopHeight = window.innerHeight;
  }

  function handleIconClick(iconData) {
    openWindow(iconData);
  }

  function openWindow(iconData) {
    const existingWindow = windows.find((w) => w.id === iconData.id);

    if (existingWindow) {
      activeWindowId = iconData.id;
    } else {
      const newWindow = {
        id: iconData.id,
        title: iconData.title,
        component: iconData.component,
        position: { x: 150 + windows.length * 30, y: 50 + windows.length * 20 },
        size: { width: 700, height: 500 },
      };
      windows = [...windows, newWindow];
      activeWindowId = newWindow.id;
    }
  }

  function closeWindow(id) {
    closingWindowId = id;

    setTimeout(() => {
      windows = windows.filter((w) => w.id !== id);
      if (windows.length > 0 && activeWindowId === id) {
        activeWindowId = windows[windows.length - 1].id;
      } else if (windows.length === 0) {
        activeWindowId = null;
      }
      closingWindowId = null;
    }, 300);
  }

  function activateWindow(id) {
    activeWindowId = id;
  }

  function updateWindowPosition(event) {
    const { id, x, y } = event.detail;
    windows = windows.map((w) =>
      w.id === id ? { ...w, position: { x, y } } : w,
    );
  }

  function updateWindowSize(event) {
    const { id, width, height } = event.detail;
    windows = windows.map((w) =>
      w.id === id ? { ...w, size: { width, height } } : w,
    );
  }
</script>

<div class="desktop-container">
  {#if !startupComplete}
    <div class="startup-screen" out:fade={{ duration: 300 }}>
      <div class="startup-logo">hotaru</div>
      <div class="startup-loading">
        <div class="loading-bar"></div>
      </div>
    </div>
  {/if}

  <div
    class="desktop-background"
    bind:clientWidth={desktopWidth}
    bind:clientHeight={desktopHeight}
  >
    <div class="desktop-icons">
      {#each desktopIcons as icon, i (icon.id)}
        <div in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}>
          <DesktopIcon {icon} on:click={() => handleIconClick(icon)} />
        </div>
      {/each}
    </div>

    {#each windows as window, i (window.id)}
      <div
        class="window-wrapper"
        class:active={activeWindowId === window.id}
        class:closing={closingWindowId === window.id}
      >
        <Window
          {window}
          isActive={activeWindowId === window.id}
          on:close={() => closeWindow(window.id)}
          on:activate={() => activateWindow(window.id)}
          on:move={updateWindowPosition}
          on:resize={updateWindowSize}
        />
      </div>
    {/each}
  </div>

  <Taskbar
    {windows}
    {activeWindowId}
    {desktopIcons}
    {currentTime}
    on:activateWindow={(e) => activateWindow(e.detail)}
    on:openWindow={(e) => openWindow(e.detail)}
  />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: "Inter", "Segoe UI", sans-serif;
  }

  .desktop-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient(135deg, #c2efd3, #a3d8e9);
  }

  .desktop-background {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .desktop-icons {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 16px;
    padding: 24px;
    height: calc(100% - 30px);
    overflow: auto;
  }

  .desktop-icons > div {
    width: 120px;
  }

  @media (max-height: 600px) {
    .desktop-icons {
      flex-direction: row;
      height: auto;
      width: calc(100% - 48px);
    }
  }

  @media (max-width: 768px) {
    .desktop-icons {
      gap: 12px;
      padding: 16px;
    }

    .desktop-icons > div {
      width: 100px;
    }
  }

  @media (max-width: 480px) {
    .desktop-icons {
      gap: 8px;
      padding: 12px;
    }

    .desktop-icons > div {
      width: 80px;
    }
  }

  .window-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transform: scale(0.85);
    animation: window-open 200ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
    z-index: 10;
  }

  .window-wrapper.active {
    z-index: 100;
  }

  .window-wrapper.closing {
    animation: window-close 200ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
  }

  .window-wrapper :global(.window-container) {
    pointer-events: all;
  }

  @keyframes window-open {
    0% {
      opacity: 0;
      transform: scale(0.85);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes window-close {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.85);
    }
  }

  .startup-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #c2efd3, #a3d8e9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .startup-logo {
    font-size: 48px;
    font-weight: 300;
    color: #2c3e50;
    margin-bottom: 40px;
    letter-spacing: 2px;
  }

  .startup-loading {
    width: 200px;
    height: 6px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }

  .loading-bar {
    width: 60px;
    height: 100%;
    background: linear-gradient(to right, #a3d8e9, #8bc6f4);
    border-radius: 3px;
    position: absolute;
    animation: loading 1s ease-in-out forwards;
  }

  @keyframes loading {
    0% {
      left: -60px;
    }
    100% {
      left: 200px;
    }
  }
</style>
