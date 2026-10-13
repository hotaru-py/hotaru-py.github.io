<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { playSound } from "../../lib/sounds.js";
  import avatar from "../../assets/firefly-avatar.webp";

  /**
   * @typedef {Object} Props
   * @property {boolean} isMobile Phones get a banner from the top; desktops an XP-style tray balloon
   */

  /** @type {Props} */
  let { isMobile } = $props();

  // Shown once per visitor; only marked as seen once it has actually been closed
  const SEEN_KEY = "welcome-seen";
  const APPEAR_DELAY_MS = 900;
  const DESKTOP_TIMEOUT_MS = 20000;
  const MOBILE_TIMEOUT_MS = 10000;
  // How far a swipe has to travel (px) before letting go dismisses the banner
  const SWIPE_UP = 40;
  const SWIPE_SIDE = 90;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let visible = $state(false);

  // The countdown pauses while the notice is hovered or touched
  let remaining = 0;
  let startedAt = 0;
  let timer;

  function startTimer() {
    clearTimeout(timer);
    startedAt = Date.now();
    timer = setTimeout(close, remaining);
  }

  function pauseTimer() {
    clearTimeout(timer);
    remaining = Math.max(1000, remaining - (Date.now() - startedAt));
  }

  onMount(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      // Storage unavailable: show it, it just can't be remembered
    }
    const appear = setTimeout(() => {
      visible = true;
      remaining = isMobile ? MOBILE_TIMEOUT_MS : DESKTOP_TIMEOUT_MS;
      startTimer();
    }, APPEAR_DELAY_MS);
    return () => {
      clearTimeout(appear);
      clearTimeout(timer);
    };
  });

  function close() {
    if (!visible) return;
    clearTimeout(timer);
    visible = false;
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage unavailable; it may show again next visit
    }
  }

  function closeWithClick() {
    playSound("close");
    close();
  }

  // --- Mobile swipe to dismiss ---------------------------------------------------
  let drag = $state({ x: 0, y: 0, active: false });
  /** @type {null | "up" | "left" | "right"} */
  let flungTo = $state(null);
  let pointerId = null;
  let startX = 0;
  let startY = 0;

  function handlePointerDown(e) {
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    drag = { x: 0, y: 0, active: true };
    e.currentTarget.setPointerCapture(e.pointerId);
    pauseTimer();
  }

  function handlePointerMove(e) {
    if (!drag.active || e.pointerId !== pointerId) return;
    // Free sideways; upwards only (dragging down just resists)
    const dy = e.clientY - startY;
    drag = {
      x: e.clientX - startX,
      y: dy < 0 ? dy : dy * 0.2,
      active: true,
    };
  }

  function handlePointerUp(e) {
    if (!drag.active || e.pointerId !== pointerId) return;
    const { x, y } = drag;
    if (y < -SWIPE_UP && Math.abs(y) >= Math.abs(x)) {
      fling("up");
    } else if (Math.abs(x) > SWIPE_SIDE) {
      fling(x < 0 ? "left" : "right");
    } else {
      // Not far enough: spring back and carry on counting down
      drag = { x: 0, y: 0, active: false };
      startTimer();
    }
  }

  // Let it slide off-screen in the swipe's direction first, then remove it
  function fling(direction) {
    clearTimeout(timer);
    flungTo = direction;
    drag = { ...drag, active: false };
    setTimeout(close, 260);
  }

  const bannerTransform = $derived.by(() => {
    if (flungTo === "up") return "translate(0, -160%)";
    if (flungTo === "left") return "translate(-120vw, 0)";
    if (flungTo === "right") return "translate(120vw, 0)";
    return `translate(${drag.x}px, ${drag.y}px)`;
  });
  const bannerOpacity = $derived(
    flungTo ? 0 : Math.max(0.35, 1 - Math.abs(drag.x) / 320),
  );

  const message = $derived(
    `Looks like you're new here. This website navigates like a ${isMobile ? "phone" : "desktop"}, so try using it similarly.`,
  );
</script>

{#if visible && !isMobile}
  <!-- XP-style balloon with its tail pointing down at the tray -->
  <div
    class="balloon"
    role="status"
    onmouseenter={pauseTimer}
    onmouseleave={startTimer}
    in:fly={{ y: reduceMotion ? 0 : 12, duration: 250, easing: cubicOut }}
    out:fade={{ duration: 200 }}
  >
    {@render header()}
    <p class="text">{message}</p>
    <button
      type="button"
      class="close"
      onclick={closeWithClick}
      aria-label="Dismiss"
    >
      <svg viewBox="0 0 12 12" aria-hidden="true"
        ><path d="M3 3l6 6M9 3l-6 6" /></svg
      >
    </button>
  </div>
{/if}

{#if visible && isMobile}
  <!-- Banner that slides down from the top; swipe it up or sideways to dismiss -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="banner"
    class:dragging={drag.active}
    role="status"
    style:transform={bannerTransform}
    style:opacity={bannerOpacity}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
    in:fly={{
      y: reduceMotion ? 0 : -140,
      duration: reduceMotion ? 150 : 380,
      easing: cubicOut,
    }}
    out:fly={flungTo
      ? { duration: 0 }
      : { y: reduceMotion ? 0 : -140, duration: 300, easing: cubicOut }}
  >
    {@render header()}
    <p class="text">{message}</p>
  </div>
{/if}

{#snippet header()}
  <div class="header">
    <img class="avatar" src={avatar} alt="" />
    <h2 class="title">Hey there!</h2>
  </div>
{/snippet}

<style>
  /* --- Shared --- */
  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  /* Same green, ink-ringed circle as the start menu and About avatars */
  .avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    padding: 1px;
    border: var(--ink-border);
    border-radius: 50%;
    background-color: var(--color-accent);
    object-fit: contain;
  }

  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-ink);
  }

  .text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-ink-soft);
  }

  /* --- Desktop balloon --- */
  .balloon {
    --tail: 18px;
    /* Where the tail sits from the right edge: over the centre of the tray clock */
    --tail-right: 37px;
    position: fixed;
    right: 20px;
    /* Top of the taskbar (50px bar + 16px gap below it), plus the tail, so its tip
       lands just above the bar */
    bottom: calc(66px + var(--tail) + 2px);
    z-index: 2000;
    width: 300px;
    padding: 14px 40px 14px 14px;
    background: var(--color-paper);
    border: var(--ink-border);
    border-radius: 14px;
    box-shadow: 4px 4px 0 var(--color-ink);
  }

  /* Tail: an ink triangle with a smaller paper one on top, so it reads as outlined */
  .balloon::before,
  .balloon::after {
    content: "";
    position: absolute;
    right: var(--tail-right);
    border-style: solid;
    border-color: transparent;
  }

  .balloon::before {
    top: 100%;
    border-width: var(--tail) var(--tail) 0 0;
    border-top-color: var(--color-ink);
  }

  .balloon::after {
    top: calc(100% - 3px);
    right: calc(var(--tail-right) + 2.5px);
    border-width: calc(var(--tail) - 3.5px) calc(var(--tail) - 3.5px) 0 0;
    border-top-color: var(--color-paper);
  }

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
    border-radius: 6px;
    background: none;
    color: var(--color-ink);
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease;
  }

  .close:hover {
    border-color: var(--color-ink);
  }

  .close svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  /* --- Mobile banner --- */
  .banner {
    position: fixed;
    top: calc(12px + env(safe-area-inset-top, 0px));
    left: 12px;
    right: 12px;
    z-index: 2000;
    padding: 14px 16px;
    background: var(--color-paper);
    border: var(--ink-border);
    border-radius: 18px;
    box-shadow: 4px 4px 0 var(--color-ink);
    touch-action: none;
    user-select: none;
    cursor: grab;
    transition:
      transform 0.26s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.26s ease;
  }

  /* Follow the finger exactly while dragging */
  .banner.dragging {
    transition: none;
    cursor: grabbing;
  }
</style>
