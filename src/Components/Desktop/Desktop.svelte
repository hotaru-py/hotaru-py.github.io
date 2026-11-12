<script>
  import { onMount, setContext, untrack } from "svelte";
  import Taskbar from "./Taskbar.svelte";
  import DesktopIcon from "./DesktopIcon.svelte";
  import IconGrid from "./IconGrid.svelte";
  import Window from "./Window.svelte";
  import Wallpaper from "./Wallpaper.svelte";
  import RainWallpaper from "./RainWallpaper.svelte";
  import MobileClock from "./MobileClock.svelte";
  import MobileSettings from "./MobileSettings.svelte";
  import WelcomeNotice from "./WelcomeNotice.svelte";
  import AboutTip from "./AboutTip.svelte";
  import { sparkleDots } from "../../lib/halftone.js";
  import { playSound } from "../../lib/sounds.js";
  import About from "../about.svelte";
  import Skills from "../skills.svelte";
  import Projects from "../projects.svelte";
  import Reach from "../reach.svelte";
  import { wallpaper } from "../../lib/wallpaper.svelte.js";
  import { credits } from "../../lib/siteContent.js";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  /**
   * @typedef {Object} Props
   * @property {boolean} [booted] Flips once the loader starts fading, so the icons animate in where they can be seen
   * @property {() => void} [onSwitchUser] Goes back to the login screen to pick a mode
   */

  /** @type {Props} */
  let { booted = true, onSwitchUser } = $props();

  let windows = $state([]);
  /** @type {IconGrid | undefined} */
  let iconGrid = $state();
  let layoutCustomized = $state(false);
  // Flips once the loader starts fading, so the icons animate in where they can be seen
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
    // Framed picture on a stand: a halftone hill under a sun
    wallpaper: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="3.5" width="19" height="14" rx="2" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2"/><path d="M3.5 14.5c2.5-3 5-4 8-2s5.5 1 9-2.5v5.5a1.5 1.5 0 0 1-1.5 1.5h-14a1.5 1.5 0 0 1-1.5-1.5z" fill="url(#halftone)"/><path d="M2.5 14c3-3.5 6-4.5 9-2.5s6 1.5 10-2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8.5" r="1.75" fill="currentColor"/><path d="M12 17.5v3M8.5 21h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
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
  ];
  const dockIcons = desktopIcons.filter(
    (icon) => !icon.homeScreen && !icon.desktopOnly,
  );
  const homeScreenIcons = desktopIcons.filter((icon) => icon.homeScreen);

  // Home-screen icons line up with the dock's right end, just above it
  let dockWidth = $state(0);
  let dockHeight = $state(0);

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

  // Set once the p5.rain wallpaper has faded in; reset when switching away from it
  let rainWallpaperReady = $state(false);
  $effect(() => {
    if (wallpaper.current !== "rain") rainWallpaperReady = false;
  });
  const showRainCredit = $derived(
    wallpaper.current === "rain" && rainWallpaperReady,
  );

  // Lets window contents open windows of their own (e.g. a file from the Work folder)
  setContext("desktop", { openWindow });

  // --- First thing on screen ---------------------------------------------------
  // Desktops open About Me just right of the first icon column, its top in line with
  // the first icon. Phones never open it: the first time the phone desktop is shown in a
  // visit, a bubble points at its dock icon instead (not again after Switch User).
  const INTRO_MARGIN = 24;
  // The icon grid's margin (24) + icon width (88) + a gap
  const INTRO_LEFT = 24 + 88 + 24;
  const TIP_SEEN_KEY = "about-tip-seen";
  let introDone = false;
  let showAboutTip = $state(false);
  /** @type {HTMLElement | undefined} */
  let dockElement = $state();

  $effect(() => {
    if (!booted || introDone || !desktopWidth || !desktopHeight) return;
    introDone = true;
    untrack(() => {
      // Read straight from the viewport, so a remount (e.g. back from Switch User)
      // can't catch isMobileView before it's been set
      if (window.matchMedia("(max-width: 768px)").matches) {
        try {
          showAboutTip = !sessionStorage.getItem(TIP_SEEN_KEY);
          sessionStorage.setItem(TIP_SEEN_KEY, "1");
        } catch {
          showAboutTip = true;
        }
        return;
      }
      // Room is left for the window's border and drop shadow
      const width = Math.min(700, desktopWidth - INTRO_LEFT - INTRO_MARGIN - 7);
      const height = Math.min(500, desktopHeight - INTRO_MARGIN * 2 - 78);
      const about = desktopIcons.find((icon) => icon.id === "about");
      openWindow(
        {
          ...about,
          position: {
            x: INTRO_LEFT,
            y: INTRO_MARGIN,
          },
          size: { width, height },
        },
        { quiet: true },
      );
    });
  });

  function dismissAboutTip() {
    showAboutTip = false;
    try {
      sessionStorage.setItem(TIP_SEEN_KEY, "1");
    } catch {
      // Storage unavailable; it may show again on reload
    }
  }

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

  /**
   * Opens a window, or brings it forward if it's already open. Beyond a desktop icon's
   * fields, `position`, `size`, `props` (passed to the component) and `icon` (for the
   * taskbar) are optional.
   */
  function openWindow(iconData, { quiet = false } = {}) {
    if (iconData.id === "about" && showAboutTip) dismissAboutTip();

    const existingWindow = windows.find((w) => w.id === iconData.id);

    if (existingWindow) {
      activateWindow(iconData.id);
    } else {
      const newWindow = {
        id: iconData.id,
        title: iconData.title,
        component: iconData.component,
        props: iconData.props,
        icon: iconData.icon,
        position: isMobileView
          ? { x: 0, y: 0 }
          : (iconData.position ?? {
              x: 150 + windows.length * 30,
              y: 50 + windows.length * 20,
            }),
        size: isMobileView
          ? { width: desktopWidth, height: desktopHeight - 60 }
          : (iconData.size ?? { width: 700, height: 500 }),
        minimized: false,
      };
      windows = [...windows, newWindow];
      activateWindow(newWindow.id);
      if (!quiet) playSound("open");
    }
  }

  function closeWindow(id, { quiet = false } = {}) {
    // Already on its way out (e.g. a double-click on close)
    if (closingWindowId === id) return;
    closingWindowId = id;
    if (!quiet) playSound("close");

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

  // Clicking empty desktop (or an icon) takes focus away from the windows, like on
  // Windows; the taskbar then shows none of them as active
  function handleDesktopPointerDown(e) {
    if (isMobileView || e.target.closest(".window-container")) return;
    activeWindowId = null;
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
  <!-- The Motion Blob stays up while the p5.rain wallpaper loads its data, so there's
       never a blank screen; the rain then fades in over it -->
  {#if wallpaper.current === "blob" || !rainWallpaperReady}
    <Wallpaper />
  {/if}
  {#if wallpaper.current === "rain"}
    <RainWallpaper onReady={() => (rainWallpaperReady = true)} />
  {/if}
  <!-- NASA asks for credit wherever its data is shown (full wording in Credits). It fades
       in once the rain wallpaper has, and out with it; phones show it under the clock. -->
  {#if showRainCredit && !isMobileView}
    <p class="rain-attribution" transition:fade={{ duration: 300 }}>
      {credits.rainData.short}
    </p>
  {/if}

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

  {#if booted}
    <WelcomeNotice isMobile={isMobileView} />
  {/if}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="desktop-background"
    class:mobile-view={isMobileView}
    bind:clientWidth={desktopWidth}
    bind:clientHeight={desktopHeight}
    onpointerdown={handleDesktopPointerDown}
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
          onClose={(options) => closeWindow(window.id, options)}
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
      <MobileClock
        {currentTime}
        note={showRainCredit ? credits.rainData.short : null}
      />
    {/if}

    {#if isMobileView && booted}
      <MobileSettings bind:showLabels={showDockLabels} {onSwitchUser} />
    {/if}

    {#if isMobileView && booted}
      <div
        class="mobile-icons-additional"
        class:mobile-icons-hidden={activeWindowId}
        bind:this={dockElement}
        bind:offsetWidth={dockWidth}
        bind:offsetHeight={dockHeight}
        in:fade={{ duration: 300, delay: 100 }}
      >
        {#each dockIcons as icon, i (icon.id)}
          <div
            in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}
            class="mobile-icon-wrapper"
            data-icon={icon.id}
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

      <div
        class="home-screen-icons"
        class:mobile-icons-hidden={activeWindowId}
        style:right="{Math.max(12, (desktopWidth - dockWidth) / 2 + 12)}px"
        style:bottom="{20 + dockHeight + 18}px"
      >
        {#each homeScreenIcons as icon, i (icon.id)}
          <div in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}>
            <DesktopIcon
              {icon}
              onclick={() => handleIconClick(icon)}
              isMobile={true}
              showLabel={true}
            />
          </div>
        {/each}
      </div>
    {/if}

    {#if isMobileView && showAboutTip && !activeWindowId}
      <AboutTip
        anchor={dockElement?.querySelector('[data-icon="about"]')}
        onDismiss={dismissAboutTip}
      />
    {/if}
  </div>

  {#if !isMobileView}
    <!-- Floats over the bottom of the desktop, so windows slide under it instead of
         being cut off at its edge -->
    <div class="taskbar-dock">
      <Taskbar
      {windows}
      {activeWindowId}
      {desktopIcons}
      {currentTime}
      onActivateWindow={activateWindow}
      onMinimizeWindow={minimizeWindow}
      onOpenWindow={openWindow}
      {onSwitchUser}
      showReset={layoutCustomized}
      onResetLayout={() => iconGrid?.reset()}
      />
    </div>
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

  /* Height the taskbar covers (12px gap + 50px bar + 16px below it). Icons and
     maximized windows keep clear of it; windows read it to keep their title bar out
     from under it. */
  .desktop-background:not(.mobile-view) {
    --taskbar-space: 78px;
  }

  /* Small print in the bottom-right corner, above the taskbar. Under the windows and
     icons, and never in the way of a click. */
  .rain-attribution {
    position: absolute;
    right: 24px;
    bottom: calc(var(--taskbar-space, 78px) + 4px);
    z-index: 1;
    margin: 0;
    padding: 1px 6px;
    border-radius: 4px;
    /* A soft paper backing keeps it readable over the rain cells */
    background: color-mix(in srgb, var(--color-moss-50) 85%, transparent);
    font-size: 11px;
    font-weight: 600;
    color: var(--color-ink-muted);
    pointer-events: none;
  }


  .taskbar-dock {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    /* Only the bar itself catches clicks; the gap around it lets them through */
    pointer-events: none;
  }

  .taskbar-dock :global(.taskbar) {
    pointer-events: auto;
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

  /* Home-screen icons: bare on the wallpaper, no dock panel behind them */
  .home-screen-icons {
    position: fixed;
    z-index: 1000;
    display: flex;
    gap: 16px;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .home-screen-icons.mobile-icons-hidden {
    transform: translateY(50px);
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
