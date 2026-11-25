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
  import BlogWidget from "./BlogWidget.svelte";
  // import GalleryWidget from "./GalleryWidget.svelte"; // back once the gallery has work
  import SoonWidget from "./SoonWidget.svelte";
  import FeaturedWidget from "./FeaturedWidget.svelte";
  import { sparkleDots } from "../../lib/halftone.js";
  import { playSound } from "../../lib/sounds.js";
  import About from "../about.svelte";
  import Skills from "../skills.svelte";
  import Projects from "../projects.svelte";
  import Reach from "../reach.svelte";
  import Experience from "../Experience.svelte";
  import Blog from "../Blog.svelte";
  // import Gallery from "../Gallery.svelte"; // hidden while the gallery is empty
  import Credits from "../credits.svelte";
  import WallpaperPicker from "../WallpaperPicker.svelte";
  import { wallpaper, rainPalette } from "../../lib/wallpaper.svelte.js";
  import { credits } from "../../lib/siteContent.js";
  import { fileWindow } from "../../lib/workFiles.js";
  import { blogNav } from "../../lib/blogNav.svelte.js";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  // booted flips once the loader starts fading, so the icons animate in where they're seen
  let { booted = true, onSwitchUser } = $props();

  // first visit only: the taskbar, icons and widgets, then About Me arrive one by one over
  // ~2s. later visits get the quick version
  const INTRO_SEEN_KEY = "desktop-intro-seen";
  // picking the mode crossfades into the desktop for ~450ms; the sequence waits that
  // out (INTRO_LEAD), or the taskbar and first icons would already be in place
  const INTRO_LEAD = 500;
  const INTRO_WINDOW_DELAY = INTRO_LEAD + 1600;
  const firstVisit = (() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    try {
      if (localStorage.getItem(INTRO_SEEN_KEY)) return false;
      localStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // storage unavailable: show the quick version rather than replaying every time
      return false;
    }
    return true;
  })();
  let introTimer;

  let windows = $state([]);
  /** @type {IconGrid | undefined} */
  let iconGrid = $state();
  let layoutCustomized = $state(false);
  // window ids from back to front; `windows` itself stays in open order for the taskbar
  let stackOrder = $state([]);
  let activeWindowId = $state(null);
  let closingWindowId = $state(null);
  let desktopWidth = $state(0);
  let desktopHeight = $state(0);
  let isMobileView = $state(false);
  let currentTime = $state(new Date());

  // ink line icons; shaded areas use the shared #halftone pattern defined in the markup below
  const ICONS = {
    about: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4.5 21v-1.5a4.5 4.5 0 0 1 4.5-4.5h6a4.5 4.5 0 0 1 4.5 4.5V21z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7.5" r="4" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    skills: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5.5 7.5 1 12l4.5 4.5M18.5 7.5 23 12l-4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(25 12 12)"><g style="fill: var(--color-paper); stroke: var(--color-paper)" stroke-width="3" stroke-linejoin="round"><rect x="10.2" y="4" width="3.6" height="2.3" rx="1" /><rect x="10.2" y="6.3" width="3.6" height="10.2" /><path d="M10.2 16.5h3.6L12 20z" /></g><rect x="10.2" y="4" width="3.6" height="2.3" rx="1" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="10.2" y="6.3" width="3.6" height="10.2" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.2 16.5h3.6L12 20z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.4 18.8 12 20l.6-1.2z" fill="currentColor"/></g></svg>`,
    work: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    browser: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" style="fill: var(--color-paper)"/><path d="M12 2a10 10 0 0 0 0 20a4 10 0 0 1 0-20z" fill="url(#halftone)"/><path d="M12 2a10 10 0 0 1 0 20a4 10 0 0 0 0-20z" fill="url(#halftone)"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" stroke-width="1.5"/><path d="M2 12h20" stroke="currentColor" stroke-width="1.5"/></svg>`,
    credits: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11v6" style="stroke: var(--color-paper)" stroke-width="5" stroke-linecap="round"/><circle cx="12" cy="7.5" r="2.4" style="fill: var(--color-paper)"/><path d="M12 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7.5" r="1.25" fill="currentColor"/></svg>`,
    // briefcase with a halftone flap
    experience: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="2.5" y="7" width="19" height="13" rx="2" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2"/><path d="M2.5 12.5h19V9a2 2 0 0 0-2-2h-15a2 2 0 0 0-2 2z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="10" y="11" width="4" height="3" rx="1" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2"/></svg>`,
    // notebook with a halftone spine and ruled lines
    blog: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="2.5" width="15" height="19" rx="2" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2"/><path d="M4.5 4.5a2 2 0 0 1 2-2h2v19h-2a2 2 0 0 1-2-2z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M11.5 8h5M11.5 12h5M11.5 16h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    // two photos, one tilted behind the other
    gallery: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="6" y="2.5" width="15.5" height="12.5" rx="2" transform="rotate(8 13.75 8.75)" fill="url(#halftone)" stroke="currentColor" stroke-width="2"/><rect x="2.5" y="8" width="15.5" height="12.5" rx="2" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2"/><path d="M2.5 18l4.5-4.5 3.5 3.5 2.5-2.5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13.5" cy="12" r="1.4" fill="currentColor"/></svg>`,
    // framed picture on a stand: a halftone hill under a sun
    wallpaper: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="3.5" width="19" height="14" rx="2" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2"/><path d="M3.5 14.5c2.5-3 5-4 8-2s5.5 1 9-2.5v5.5a1.5 1.5 0 0 1-1.5 1.5h-14a1.5 1.5 0 0 1-1.5-1.5z" fill="url(#halftone)"/><path d="M2.5 14c3-3.5 6-4.5 9-2.5s6 1.5 10-2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8.5" r="1.75" fill="currentColor"/><path d="M12 17.5v3M8.5 21h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  };

  // `core` apps make up the Start menu and the phone dock; the rest sit on the desktop,
  // and on the phone in a row above the dock
  const desktopIcons = [
    {
      id: "about",
      title: "About Me",
      icon: ICONS.about,
      component: About,
      core: true,
    },
    {
      id: "projects",
      title: "Projects",
      icon: ICONS.work,
      component: Projects,
      core: true,
    },
    {
      id: "blog",
      title: "Blog",
      icon: ICONS.blog,
      component: Blog,
      size: { width: 720, height: 540 },
      core: true,
    },
    {
      id: "browser",
      title: "Browser",
      icon: ICONS.browser,
      component: Reach,
      core: true,
    },
    {
      id: "experience",
      title: "Experience",
      icon: ICONS.experience,
      component: Experience,
      size: { width: 640, height: 520 },
    },
    { id: "skills", title: "Skills", icon: ICONS.skills, component: Skills },
    // hidden while the gallery is empty (see `gallery` in siteContent.js)
    // {
    //   id: "gallery",
    //   title: "Gallery",
    //   icon: ICONS.gallery,
    //   component: Gallery,
    //   size: { width: 760, height: 520 },
    // },
    {
      id: "credits",
      title: "Credits",
      icon: ICONS.credits,
      component: Credits,
      corner: "bottom-right", // default desktop spot
      homeColumn: 4, // phones: the last column of the home row, a gap before it
    },
    // desktop only: phones switch wallpapers from the settings menu instead
    {
      id: "wallpaper",
      title: "Wallpaper",
      icon: ICONS.wallpaper,
      component: WallpaperPicker,
      size: { width: 520, height: 410 },
      corner: "bottom-right",
      cornerRowOffset: 1, // just above Credits
      desktopOnly: true,
    },
  ];
  const dockIcons = desktopIcons.filter((icon) => icon.core);
  // the desktop grid's own order (it fills columns top to bottom); the Start menu and
  // phone dock keep the list's order
  const GRID_ORDER = ["about", "browser", "projects", "experience", "skills", "blog"];
  const sortedIcons = [...desktopIcons].sort((a, b) => {
    const rank = (icon) => {
      const i = GRID_ORDER.indexOf(icon.id);
      return i === -1 ? GRID_ORDER.length : i;
    };
    return rank(a) - rank(b);
  });

  // widgets sit on the icon grid as blocks of cells, top-right: the blog 4×2, two 2×2
  // squares under it. hidden on narrow desktops
  const DESKTOP_WIDGETS = [
    {
      id: "widget-blog",
      widget: blogWidget,
      span: { cols: 4, rows: 2 },
      corner: "top-right",
    },
    {
      id: "widget-featured",
      widget: featuredWidget,
      span: { cols: 2, rows: 2 },
      corner: "top-right",
      cornerColOffset: 2,
      cornerRowOffset: 2,
    },
    {
      id: "widget-soon",
      widget: soonWidget,
      span: { cols: 2, rows: 2 },
      corner: "top-right",
      cornerRowOffset: 2,
    },
  ];
  const gridIcons = $derived(
    desktopWidth > 1000 ? [...sortedIcons, ...DESKTOP_WIDGETS] : sortedIcons,
  );
  const homeRowIcons = desktopIcons.filter(
    (icon) => !icon.core && !icon.desktopOnly,
  );
  const openApp = (id) => openWindow(desktopIcons.find((icon) => icon.id === id));

  // phone home screen: page 1 is the clock and the other apps, page 2 the widgets
  let homePages = $state();
  let homePage = $state(0);
  let dockHeight = $state(0);

  function handleHomeScroll() {
    homePage = Math.round(homePages.scrollLeft / homePages.clientWidth);
  }

  function goToHomePage(i) {
    homePages.scrollTo({ left: i * homePages.clientWidth, behavior: "smooth" });
  }

  function openPost(id) {
    blogNav.post = id;
    openApp("blog");
  }

  function openAllPosts() {
    blogNav.post = null;
    openApp("blog");
  }

  // one 24-unit tile covers a whole icon, so every dot twinkles independently
  const iconSparkle = sparkleDots({
    cols: 12,
    rows: 12,
    pitch: 2,
    radius: 0.6,
    fill: "var(--color-ink)",
  });

  // mobile dock labels, toggled from the settings menu
  let showDockLabels = $state(true);

  const showRainCredit = $derived(
    wallpaper.current === "rain" && wallpaper.rainReady,
  );

  // lets window contents open windows of their own (e.g. a file from the Work folder)
  setContext("desktop", { openWindow });

  // desktops open About Me right of the icon columns; phones point a bubble at its dock
  // icon instead, once per visit
  const INTRO_MARGIN = 24;
  // fallback if the icon grid can't say where its icons end: one column's worth
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
      // read straight from the viewport, so a remount (e.g. back from Switch User)
      // can't catch isMobileView before it's been set
      if (window.matchMedia("(max-width: 768px)").matches) {
        try {
          const show = !sessionStorage.getItem(TIP_SEEN_KEY);
          sessionStorage.setItem(TIP_SEEN_KEY, "1");
          // on a first visit the bubble waits until everything has arrived
          if (show && firstVisit) introTimer = setTimeout(() => (showAboutTip = true), INTRO_LEAD + 1900);
          else showAboutTip = show;
        } catch {
          showAboutTip = true;
        }
        return;
      }
      if (firstVisit) introTimer = setTimeout(openIntroWindow, INTRO_WINDOW_DELAY);
      else openIntroWindow();
    });
  });

  // waits (a few frames at most) for the icon grid to lay out, so About Me opens clear
  // of however many icon columns there are
  function openIntroWindow(framesLeft = 30) {
    const right = iconGrid?.leftIconsRight();
    if (right == null && framesLeft > 0) {
      requestAnimationFrame(() => openIntroWindow(framesLeft - 1));
      return;
    }
    const left = right == null ? INTRO_LEFT : right + INTRO_MARGIN;
    // room is left for the window's border and drop shadow
    const width = Math.min(700, desktopWidth - left - INTRO_MARGIN - 7);
    const height = Math.min(500, desktopHeight - INTRO_MARGIN * 2 - 78);
    const about = desktopIcons.find((icon) => icon.id === "about");
    openWindow(
      { ...about, position: { x: left, y: INTRO_MARGIN }, size: { width, height } },
      { quiet: true },
    );
  }

  function dismissAboutTip() {
    showAboutTip = false;
    try {
      sessionStorage.setItem(TIP_SEEN_KEY, "1");
    } catch {
      // storage unavailable; it may show again on reload
    }
  }

  onMount(() => {
    // a fresh desktop (e.g. back from Switch User) starts a fresh rain wallpaper
    wallpaper.rainReady = false;
    const timer = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    updateDesktopDimensions();
    window.addEventListener("resize", updateDesktopDimensions);

    return () => {
      clearInterval(timer);
      clearTimeout(introTimer);
      window.removeEventListener("resize", updateDesktopDimensions);
    };
  });

  function updateDesktopDimensions() {
    desktopWidth = window.innerWidth;
    desktopHeight = window.innerHeight;
    isMobileView = window.innerWidth <= 768;
  }

  // opens a window or brings it forward; `position`, `size`, `props` and `icon` are optional
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
    // already on its way out (e.g. a double-click on close)
    if (closingWindowId === id) return;
    closingWindowId = id;
    if (!quiet) playSound("close");

    setTimeout(() => {
      windows = windows.filter((w) => w.id !== id);
      stackOrder = stackOrder.filter((wid) => wid !== id);
      // focus falls to the next window down the stack, like on Windows
      if (activeWindowId === id) {
        activeWindowId = topVisibleWindow();
      }
      closingWindowId = null;
    }, 300);
  }

  // bring a window to the front without disturbing the order of the others,
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

  // topmost window that isn't minimized, if any
  function topVisibleWindow() {
    const visible = new Set(
      windows.filter((w) => !w.minimized).map((w) => w.id),
    );
    return stackOrder.findLast((id) => visible.has(id)) ?? null;
  }

  // clicking empty desktop (or an icon) takes focus away from the windows, like on
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
</script>

{#snippet blogWidget()}
  <BlogWidget onOpenPost={openPost} onViewAll={openAllPosts} />
{/snippet}
{#snippet soonWidget()}
  <SoonWidget />
{/snippet}
{#snippet featuredWidget()}
  <FeaturedWidget onOpenFile={(file) => openWindow(fileWindow(file))} />
{/snippet}

<div class="desktop-container">
  <!-- the Motion Blob stays up while the p5.rain wallpaper loads its data, so there's
       never a blank screen; the rain then fades in over it -->
  <div class="wallpaper-layer">
    {#if wallpaper.current === "blob" || !wallpaper.rainReady}
      <Wallpaper />
    {/if}
    {#if wallpaper.current === "rain"}
      <RainWallpaper
        palette={rainPalette()}
        onReady={() => (wallpaper.rainReady = true)}
      />
    {/if}
  </div>
  <!-- NASA asks for credit wherever its data is shown (full wording in Credits). it fades
       in once the rain wallpaper has, and out with it; phones show it under the clock. -->
  {#if showRainCredit && !isMobileView}
    <p class="rain-attribution" transition:fade={{ duration: 300 }}>
      {credits.rainData.short}
    </p>
  {/if}

  <!-- shared halftone fill for the icons -->
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
    class:phone-intro={firstVisit && isMobileView}
    style:--intro-lead="{INTRO_LEAD}ms"
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
        icons={gridIcons}
        intro={firstVisit}
        onOpen={openWindow}
      />
    {/if}

    {#if isMobileView && booted}
      <MobileSettings bind:showLabels={showDockLabels} {onSwitchUser} />
    {/if}

    {#if isMobileView}
      <!-- swipe sideways between pages; the dock stays put -->
      <div
        class="home-pages"
        class:hidden-under-app={activeWindowId}
        style:--dock-space="{20 + dockHeight}px"
        bind:this={homePages}
        onscroll={handleHomeScroll}
      >
        <section class="home-page" aria-label="Home">
          <MobileClock
            {currentTime}
            note={showRainCredit ? credits.rainData.short : null}
          />
          {#if booted}
            <div class="home-row">
              {#each homeRowIcons as icon, i (icon.id)}
                <div
                  style:grid-column={icon.homeColumn}
                  class:intro-in={firstVisit}
                  style:--intro-delay="{INTRO_LEAD + 300 + i * 120}ms"
                  style:--intro-y="20px"
                  in:fly={firstVisit ? { duration: 0 } : { y: 20, duration: 200, delay: 300 + i * 50 }}
                >
                  <DesktopIcon
                    {icon}
                    onclick={() => openWindow(icon)}
                    isMobile={true}
                    showLabel={true}
                  />
                </div>
              {/each}
            </div>
          {/if}
        </section>
        <section class="home-page widgets" aria-label="Widgets">
          <div class="widget-blog">
            <BlogWidget onOpenPost={openPost} onViewAll={openAllPosts} />
          </div>
          <div class="widget-row">
            <FeaturedWidget onOpenFile={(file) => openWindow(fileWindow(file))} />
            <SoonWidget />
          </div>
        </section>
      </div>

      <!-- off the home page the big clock is out of view, so a small one sits top-left,
           level with the settings cog -->
      {#if homePage !== 0 && !activeWindowId}
        <time
          class="corner-clock"
          datetime={currentTime.toISOString()}
          transition:fade={{ duration: 200 }}
        >
          {currentTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </time>
      {/if}

      <div
        class="page-dots"
        class:intro-in={firstVisit}
        style:--intro-delay="{INTRO_LEAD + 1300}ms"
        class:hidden-under-app={activeWindowId}
        style:bottom="{20 + dockHeight + 10}px"
      >
        {#each [0, 1] as i}
          <button
            type="button"
            class="page-dot"
            class:current={homePage === i}
            aria-label="Page {i + 1}"
            aria-current={homePage === i ? "page" : undefined}
            onclick={() => goToHomePage(i)}
          ></button>
        {/each}
      </div>
    {/if}

    {#if isMobileView && booted}
      <div
        class="mobile-icons-additional"
        class:mobile-icons-hidden={activeWindowId}
        bind:this={dockElement}
        bind:offsetHeight={dockHeight}
        class:intro-in={firstVisit}
        style:--intro-delay="{INTRO_LEAD + 800}ms"
        style:--intro-y="40px"
        in:fade={firstVisit ? { duration: 0 } : { duration: 300, delay: 100 }}
      >
        {#each dockIcons as icon, i (icon.id)}
          <div
            in:fly={firstVisit ? { duration: 0 } : { y: 20, duration: 200, delay: 300 + i * 50 }}
            class:intro-in={firstVisit}
            style:--intro-delay="{INTRO_LEAD + 1000 + i * 120}ms"
            style:--intro-y="16px"
            data-icon={icon.id}
          >
            <DesktopIcon
              {icon}
              onclick={() => openWindow(icon)}
              isMobile={true}
              showLabel={showDockLabels}
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

  {#if !isMobileView && (booted || !firstVisit)}
    <!-- floats over the bottom of the desktop, so windows slide under it instead of
         being cut off at its edge -->
    <div
      class="taskbar-dock"
      class:intro-in={firstVisit}
      style:--intro-delay="{INTRO_LEAD}ms"
      style:--intro-y="60px"
    >
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
  /* first visit: parts fade and rise in after a delay set per element. `backwards` keeps
     them hidden until their turn without pinning a transform afterwards. */
  .intro-in {
    animation: intro-in 450ms cubic-bezier(0.22, 1, 0.36, 1) var(--intro-delay, 0ms)
      backwards;
  }

  @keyframes intro-in {
    from {
      opacity: 0;
      translate: 0 var(--intro-y, 0px);
    }
  }

  /* phone, first visit: the clock and settings cog come first, then the sequence above */
  .phone-intro :global(.mobile-clock),
  .phone-intro :global(.mobile-settings) {
    animation: intro-in 450ms cubic-bezier(0.22, 1, 0.36, 1) var(--intro-lead) backwards;
  }

  .wallpaper-layer {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
  }

  .svg-defs {
    position: absolute;
    width: 0;
    height: 0;
  }

  .desktop-container {
    width: 100vw;
    /* dvh is the visible height; on phones vh ignores the address bar and runs under the dock */
    height: 100vh;
    height: 100dvh;
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

  /* height the taskbar covers (12 + 50 + 16px); icons, maximized windows and title bars
     keep clear of it */
  .desktop-background:not(.mobile-view) {
    --taskbar-space: 78px;
  }

  /* small print in the bottom-right corner, above the taskbar. under the windows and
     icons, and never in the way of a click. */
  .rain-attribution {
    position: absolute;
    right: 24px;
    bottom: calc(var(--taskbar-space, 78px) + 4px);
    z-index: 1;
    margin: 0;
    padding: 1px 6px;
    border-radius: 4px;
    /* a soft paper backing keeps it readable over the rain cells */
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
    /* only the bar itself catches clicks; the gap around it lets them through */
    pointer-events: none;
  }

  .taskbar-dock :global(.taskbar) {
    pointer-events: auto;
  }

  /* as wide as the widgets (12px in from each side), four even columns */
  .mobile-icons-additional {
    position: fixed;
    bottom: 20px;
    left: 12px;
    right: 12px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    justify-items: center;
    align-items: center;
    background-color: var(--color-paper);
    padding: 12px 10px;
    border-radius: 22px;
    z-index: 1000;
    border: var(--ink-border);
    box-shadow: var(--ink-shadow);
    transform: translateY(0);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .mobile-icons-hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateY(50px);
  }

  /* --- Phone home pages --- */
  .home-pages {
    position: absolute;
    inset: 0;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    transition: opacity 0.3s ease;
  }

  .home-pages::-webkit-scrollbar {
    display: none;
  }

  .home-page {
    position: relative;
    flex: 0 0 100%;
    height: 100%;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  /* the remaining apps, in a row just above the page dots, lined up with the dock's
     columns */
  .home-row {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: calc(var(--dock-space) + 34px);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    justify-items: center;
    padding: 0 12px;
  }

  /* widgets: the blog one full width and half the screen tall; under it two squares
     side by side */
  .home-page.widgets {
    box-sizing: border-box;
    /* bottom: clears the page dots, plus the widgets' 4px drop shadow */
    padding: calc(72px + env(safe-area-inset-top, 0px)) 12px
      calc(var(--dock-space) + 42px);
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
  }

  /* half the screen tall, giving some up on shorter phones so the squares below still
     clear the page dots */
  .widget-blog {
    flex: 0 1 50vh;
    flex: 0 1 50svh;
    min-height: 180px;
  }

  .widget-row {
    flex-shrink: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* 36px tall, centred on the settings cog's row (16px down, 44px tall) */
  .corner-clock {
    position: fixed;
    top: calc(20px + env(safe-area-inset-top, 0px));
    left: 12px;
    z-index: 1000;
    height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-moss-50) 85%, transparent);
    display: flex;
    align-items: center;
    font-size: 17px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--color-ink);
    pointer-events: none;
  }

  .page-dots {
    position: fixed;
    left: 50%;
    z-index: 1000;
    display: flex;
    gap: 4px;
    padding: 0 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-moss-50) 85%, transparent);
    transform: translateX(-50%);
    transition: opacity 0.3s ease;
  }

  .page-dot {
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  /* the visible dot inside a 22px tap target */
  .page-dot::before {
    content: "";
    display: block;
    width: 8px;
    height: 8px;
    margin: auto;
    border: 2px solid var(--color-ink);
    border-radius: 50%;
    background: var(--color-paper);
    transition: background-color 0.2s ease;
  }

  .page-dot.current::before {
    background: var(--color-ink);
  }

  /* under an open app the home screen fades out of the way */
  .hidden-under-app {
    opacity: 0;
    pointer-events: none;
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
