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
  let isMobileView = false;
  let currentTime = new Date();
  let startupComplete = false;

  const desktopIcons = [
    {
      id: "about",
      title: "About Me",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f1f8e9" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 13H8" fill="none" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17H8" fill="none" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 9H8" fill="none" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      component: About,
    },
    {
      id: "skills",
      title: "Work",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="#e1f5fe" stroke="#039be5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      component: Skills,
    },
    {
      id: "projects",
      title: "Projects",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="#fff8e1" stroke="#ffb300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      component: Projects,
    },
    {
      id: "browser",
      title: "Browser",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#1976d2" stroke-width="1"/><line x1="2" y1="12" x2="22" y2="12" stroke="#1976d2" stroke-width="1"/><line x1="12" y1="2" x2="12" y2="22" stroke="#1976d2" stroke-width="1"/></svg>`,
      component: Reach,
    },
  ];

  const additionalIcons = [
    {
      id: "browser",
      title: "Browser",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e3f2fd" stroke="#1976d2" stroke-width="2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#1976d2" stroke-width="1"/><line x1="2" y1="12" x2="22" y2="12" stroke="#1976d2" stroke-width="1"/><line x1="12" y1="2" x2="12" y2="22" stroke="#1976d2" stroke-width="1"/></svg>`,
      component: Reach,
    },
    {
      id: "about",
      title: "About Me",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f1f8e9" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="14 2 14 8 20 8" fill="none" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 13H8" fill="none" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17H8" fill="none" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 9H8" fill="none" stroke="#7cb342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      component: About,
    },
    {
      id: "skills",
      title: "Work",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="#e1f5fe" stroke="#039be5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      component: Skills,
    },
    {
      id: "projects",
      title: "Projects",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="#fff8e1" stroke="#ffb300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      component: Projects,
    },
  ];

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
    isMobileView = window.innerWidth <= 768;
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
        position: isMobileView
          ? { x: 0, y: 0 }
          : { x: 150 + windows.length * 30, y: 50 + windows.length * 20 },
        size: isMobileView
          ? { width: desktopWidth, height: desktopHeight - 60 }
          : { width: 700, height: 500 },
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

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(date) {
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
</script>

<div class="desktop-container">
  {#if !startupComplete}
    <div class="startup-screen" out:fade={{ duration: 300 }}>
      <div class="startup-logo">hotaru's PC</div>
      <div class="startup-loading">
        <div class="loading-bar"></div>
      </div>
    </div>
  {/if}

  <div
    class="desktop-background"
    class:mobile-view={isMobileView}
    bind:clientWidth={desktopWidth}
    bind:clientHeight={desktopHeight}
  >
    {#each windows as window, i (window.id)}
      <div
        class="window-wrapper"
        class:mobile-window={isMobileView}
        class:active={activeWindowId === window.id}
        class:closing={closingWindowId === window.id}
      >
        <Window
          {window}
          {isMobileView}
          isActive={activeWindowId === window.id}
          on:close={() => closeWindow(window.id)}
          on:activate={() => activateWindow(window.id)}
          on:move={updateWindowPosition}
          on:resize={updateWindowSize}
        />
      </div>
    {/each}

    {#if !isMobileView}
      <div class="desktop-icons" in:fade={{ duration: 300, delay: 100 }}>
        {#each desktopIcons as icon, i (icon.id)}
          <div in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}>
            <DesktopIcon
              {icon}
              on:click={() => handleIconClick(icon)}
              isMobile={false}
            />
          </div>
        {/each}
      </div>
    {/if}

    {#if isMobileView}
      <div
        class="mobile-icons-additional"
        class:mobile-icons-hidden={activeWindowId}
        in:fade={{ duration: 300, delay: 100 }}
      >
        {#each additionalIcons as icon, i (icon.id)}
          <div
            in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}
            class="mobile-icon-wrapper"
          >
            <DesktopIcon
              {icon}
              on:click={() => handleIconClick(icon)}
              isMobile={true}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if !isMobileView}
    <Taskbar
      {windows}
      {activeWindowId}
      {desktopIcons}
      {currentTime}
      on:activateWindow={(e) => activateWindow(e.detail)}
      on:openWindow={(e) => openWindow(e.detail)}
    />
  {/if}
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

  .desktop-background.mobile-view {
    padding-top: 0;
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

  .mobile-icons-additional {
    position: fixed;
    bottom: 20px;
    max-width: 90%;
    width: auto;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 12px 20px;
    border-radius: 24px;
    z-index: 1000;
    overflow-x: auto;
    gap: 16px;
    border: 1.5px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .mobile-icons-hidden {
    opacity: 0;
    transform: translateX(-50%) translateY(50px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .mobile-icons-additional:not(.mobile-icons-hidden) {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .mobile-icon-wrapper {
    width: auto !important;
    flex: 0 0 auto;
  }

  .mobile-window {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 1000 !important;
  }

  @media (max-height: 600px) {
    .desktop-icons:not(.mobile-icons) {
      flex-direction: row;
      height: auto;
      width: calc(100% - 48px);
    }
  }

  @media (max-width: 768px) {
    .desktop-icons:not(.mobile-icons) {
      gap: 12px;
      padding: 16px;
    }

    .desktop-icons:not(.mobile-icons) > div {
      width: 100px;
    }
  }

  @media (max-width: 480px) {
    .desktop-icons:not(.mobile-icons) {
      gap: 8px;
      padding: 12px;
    }

    .desktop-icons:not(.mobile-icons) > div {
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
