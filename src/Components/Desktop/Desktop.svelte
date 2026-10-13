<script>
  import { onMount } from "svelte";
  import Taskbar from "./Taskbar.svelte";
  import DesktopIcon from "./DesktopIcon.svelte";
  import IconGrid from "./IconGrid.svelte";
  import Window from "./Window.svelte";
  import Wallpaper from "./Wallpaper.svelte";
  import Loader from "../Loader.svelte";
  import MobileClock from "./MobileClock.svelte";
  import MobileSettings from "./MobileSettings.svelte";
  import WelcomeNotice from "./WelcomeNotice.svelte";
  import { sparkleDots } from "../../lib/halftone.js";
  import { playSound } from "../../lib/sounds.js";
  import About from "../about.svelte";
  import Skills from "../skills.svelte";
  import Projects from "../projects.svelte";
  import Reach from "../reach.svelte";
  import Credits from "../credits.svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let windows = $state([]);
  /** @type {IconGrid | undefined} */
  let iconGrid = $state();
  let layoutCustomized = $state(false);
  // Flips once the loader starts fading, so the icons animate in where they can be seen
  let booted = $state(false);
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
    about: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4.5 21v-1.5a4.5 4.5 0 0 1 4.5-4.5h6a4.5 4.5 0 0 1 4.5 4.5V21z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7.5" r="4" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    skills: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5.5 7.5 1 12l4.5 4.5M18.5 7.5 23 12l-4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(25 12 12)"><g style="fill: var(--color-paper); stroke: var(--color-paper)" stroke-width="3" stroke-linejoin="round"><rect x="10.2" y="4" width="3.6" height="2.3" rx="1" /><rect x="10.2" y="6.3" width="3.6" height="10.2" /><path d="M10.2 16.5h3.6L12 20z" /></g><rect x="10.2" y="4" width="3.6" height="2.3" rx="1" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="10.2" y="6.3" width="3.6" height="10.2" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.2 16.5h3.6L12 20z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.4 18.8 12 20l.6-1.2z" fill="currentColor"/></g></svg>`,
    work: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    browser: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" style="fill: var(--color-paper)"/><path d="M12 2a10 10 0 0 0 0 20a4 10 0 0 1 0-20z" fill="url(#halftone)"/><path d="M12 2a10 10 0 0 1 0 20a4 10 0 0 0 0-20z" fill="url(#halftone)"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" stroke-width="1.5"/><path d="M2 12h20" stroke="currentColor" stroke-width="1.5"/></svg>`,
    credits: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11v6" style="stroke: var(--color-paper)" stroke-width="5" stroke-linecap="round"/><circle cx="12" cy="7.5" r="2.4" style="fill: var(--color-paper)"/><path d="M12 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7.5" r="1.25" fill="currentColor"/></svg>`,
  };

  const desktopIcons = [
    { id: "about", title: "About Me", icon: ICONS.about, component: About },
    { id: "skills", title: "Skills", icon: ICONS.skills, component: Skills },
    {
      id: "projects",
      title: "Work",
      icon: ICONS.work,
      component: Projects,
    },
    { id: "browser", title: "Browser", icon: ICONS.browser, component: Reach },
    {
      id: "credits",
      title: "Credits",
      icon: ICONS.credits,
      component: Credits,
      corner: "bottom-right", // default desktop spot; the mobile dock ignores it
    },
  ];

  // One 24-unit tile covers a whole icon, so every dot twinkles independently
  const iconSparkle = sparkleDots({
    cols: 12,
    rows: 12,
    pitch: 2,
    radius: 0.6,
    fill: "var(--color-ink)",
  });

  // Mobile dock labels, toggled from the settings menu
  let showDockLabels = $state(true);

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
        minimized: false,
      };
      windows = [...windows, newWindow];
      activateWindow(newWindow.id);
      playSound("open");
    }
  }

  function closeWindow(id) {
    // Already on its way out (e.g. a double-click on close)
    if (closingWindowId === id) return;
    closingWindowId = id;
    playSound("close");

    setTimeout(() => {
      windows = windows.filter((w) => w.id !== id);
      stackOrder = stackOrder.filter((wid) => wid !== id);
      // Focus falls to the next window down the stack, like on Windows
      if (activeWindowId === id) {
        activeWindowId = topVisibleWindow();
      }
      closingWindowId = null;
    }, 300);
  }

  // Bring a window to the front without disturbing the order of the others,
  // restoring it first if it was minimized
  function activateWindow(id) {
    if (windows.some((w) => w.id === id && w.minimized)) {
      windows = windows.map((w) =>
        w.id === id ? { ...w, minimized: false } : w,
      );
      playSound("open");
    }
    activeWindowId = id;
    if (stackOrder.at(-1) !== id) {
      stackOrder = [...stackOrder.filter((wid) => wid !== id), id];
    }
  }

  function minimizeWindow(id) {
    windows = windows.map((w) => (w.id === id ? { ...w, minimized: true } : w));
    playSound("close");
    if (activeWindowId === id) {
      activeWindowId = topVisibleWindow();
    }
  }

  // Topmost window that isn't minimized, if any
  function topVisibleWindow() {
    const visible = new Set(
      windows.filter((w) => !w.minimized).map((w) => w.id),
    );
    return stackOrder.findLast((id) => visible.has(id)) ?? null;
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

  <Loader onExit={() => (booted = true)} />

  {#if booted}
    <WelcomeNotice isMobile={isMobileView} />
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
        style:z-index={(isMobileView ? 1001 : 10) +
          stackOrder.indexOf(window.id)}
      >
        <Window
          {window}
          {isMobileView}
          isActive={activeWindowId === window.id}
          minimized={window.minimized}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onActivate={() => activateWindow(window.id)}
          onMove={updateWindowPosition}
          onResize={updateWindowSize}
        />
      </div>
    {/each}

    {#if !isMobileView && booted}
      <IconGrid
        bind:this={iconGrid}
        bind:customized={layoutCustomized}
        icons={desktopIcons}
        onOpen={handleIconClick}
      />
    {/if}

    {#if isMobileView}
      <MobileClock {currentTime} />
    {/if}

    {#if isMobileView && booted}
      <MobileSettings bind:showLabels={showDockLabels} />
    {/if}

    {#if isMobileView && booted}
      <div
        class="mobile-icons-additional"
        class:mobile-icons-hidden={activeWindowId}
        in:fade={{ duration: 300, delay: 100 }}
      >
        {#each desktopIcons as icon, i (icon.id)}
          <div
            in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}
            class="mobile-icon-wrapper"
          >
            <DesktopIcon
              {icon}
              onclick={() => handleIconClick(icon)}
              isMobile={true}
              showLabel={showDockLabels}
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
      onMinimizeWindow={minimizeWindow}
      onOpenWindow={openWindow}
      showReset={layoutCustomized}
      onResetLayout={() => iconGrid?.reset()}
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
    /* 16px between icons, narrowing on small phones so five icons always fit */
    gap: clamp(2px, calc((100vw - 308px) / 4), 16px);
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
