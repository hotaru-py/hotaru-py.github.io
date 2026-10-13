<script>
  import { onMount } from "svelte";
  import Taskbar from "./Taskbar.svelte";
  import DesktopIcon from "./DesktopIcon.svelte";
  import Window from "./Window.svelte";
  import Wallpaper from "./Wallpaper.svelte";
  import Loader from "../Loader.svelte";
  import MobileClock from "./MobileClock.svelte";
  import { sparkleDots } from "../../lib/halftone.js";
  import About from "../about.svelte";
  import Skills from "../skills.svelte";
  import Projects from "../projects.svelte";
  import Reach from "../reach.svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let windows = $state([]);
  // Window ids from back to front; `windows` itself stays in open order for the taskbar
  let stackOrder = $state([]);
  let activeWindowId = $state(null);
  let closingWindowId = $state(null);
  let desktopWidth = $state(0);
  let desktopHeight = $state(0);
  let isMobileView = $state(false);
  let currentTime = $state(new Date());

  // Ink line icons; shaded areas use the shared #halftone pattern defined in the markup below
  const ICONS = {
    about: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    work: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    projects: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    browser: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" style="fill: var(--color-paper)"/><path d="M12 2a10 10 0 0 1 0 20a4 10 0 0 0 0-20z" fill="url(#halftone)"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" stroke-width="1.5"/><path d="M2 12h20" stroke="currentColor" stroke-width="1.5"/></svg>`,
  };

  const desktopIcons = [
    { id: "about", title: "About Me", icon: ICONS.about, component: About },
    { id: "skills", title: "Work", icon: ICONS.work, component: Skills },
    {
      id: "projects",
      title: "Projects",
      icon: ICONS.projects,
      component: Projects,
    },
    { id: "browser", title: "Browser", icon: ICONS.browser, component: Reach },
  ];

  // One 24-unit tile covers a whole icon, so every dot twinkles independently
  const iconSparkle = sparkleDots({
    cols: 12,
    rows: 12,
    pitch: 2,
    radius: 0.6,
    fill: "var(--color-ink)",
  });

  // Mobile dock order puts Browser first
  const additionalIcons = [
    desktopIcons[3],
    desktopIcons[0],
    desktopIcons[1],
    desktopIcons[2],
  ];

  onMount(() => {
    const timer = setInterval(() => {
      currentTime = new Date();
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
      activateWindow(iconData.id);
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
      activateWindow(newWindow.id);
    }
  }

  function closeWindow(id) {
    closingWindowId = id;

    setTimeout(() => {
      windows = windows.filter((w) => w.id !== id);
      stackOrder = stackOrder.filter((wid) => wid !== id);
      // Focus falls to the next window down the stack, like on Windows
      if (activeWindowId === id) {
        activeWindowId = stackOrder.at(-1) ?? null;
      }
      closingWindowId = null;
    }, 300);
  }

  // Bring a window to the front without disturbing the order of the others
  function activateWindow(id) {
    activeWindowId = id;
    if (stackOrder.at(-1) !== id) {
      stackOrder = [...stackOrder.filter((wid) => wid !== id), id];
    }
  }

  function updateWindowPosition({ id, x, y }) {
    windows = windows.map((w) =>
      w.id === id ? { ...w, position: { x, y } } : w,
    );
  }

  function updateWindowSize({ id, width, height }) {
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
  <Wallpaper />

  <!-- Shared halftone fill for the icons -->
  <svg class="svg-defs" aria-hidden="true">
    <defs>
      <pattern
        id="halftone"
        width="2"
        height="2"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <circle cx="1" cy="1" r="0.6" style="fill: var(--color-ink)" />
      </pattern>
      <pattern
        id="halftone-sparkle"
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        {@html iconSparkle}
      </pattern>
    </defs>
  </svg>

  <Loader />

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
        style:z-index={(isMobileView ? 1001 : 10) +
          stackOrder.indexOf(window.id)}
      >
        <Window
          {window}
          {isMobileView}
          isActive={activeWindowId === window.id}
          onClose={() => closeWindow(window.id)}
          onActivate={() => activateWindow(window.id)}
          onMove={updateWindowPosition}
          onResize={updateWindowSize}
        />
      </div>
    {/each}

    {#if !isMobileView}
      <div class="desktop-icons" in:fade={{ duration: 300, delay: 100 }}>
        {#each desktopIcons as icon, i (icon.id)}
          <div in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}>
            <DesktopIcon
              {icon}
              onclick={() => handleIconClick(icon)}
              isMobile={false}
            />
          </div>
        {/each}
      </div>
    {/if}

    {#if isMobileView}
      <MobileClock {currentTime} />
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
              onclick={() => handleIconClick(icon)}
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
      onActivateWindow={activateWindow}
      onOpenWindow={openWindow}
    />
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .svg-defs {
    position: absolute;
    width: 0;
    height: 0;
  }

  .desktop-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    isolation: isolate;
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
    max-width: calc(100% - 24px);
    width: auto;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    background-color: var(--color-paper);
    padding: 10px;
    border-radius: 20px;
    z-index: 1000;
    overflow-x: auto;
    gap: 10px;
    border: var(--ink-border);
    box-shadow: var(--ink-shadow);
  }

  .mobile-icons-hidden {
    opacity: 0;
    pointer-events: none;
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
</style>
