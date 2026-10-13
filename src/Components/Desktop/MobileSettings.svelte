<script>
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { isMuted, setMuted, playSound } from "../../lib/sounds.js";

  /**
   * @typedef {Object} Props
   * @property {boolean} [showLabels] Dock labels on/off (on by default); restored from and saved to storage here
   */

  /** @type {Props} */
  let { showLabels = $bindable(true) } = $props();

  const LABELS_KEY = "dock-labels";

  let open = $state(false);
  let muted = $state(isMuted());
  let container = $state();

  onMount(() => {
    try {
      // On unless the visitor turned them off
      showLabels = localStorage.getItem(LABELS_KEY) !== "0";
    } catch {
      // Storage unavailable: labels stay on
    }

    function closeOnOutside(e) {
      if (open && !container?.contains(e.target)) setOpen(false);
    }
    function closeOnEscape(e) {
      if (open && e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  });

  function setOpen(value) {
    open = value;
    playSound(open ? "open" : "close");
  }

  // Turning sound off clicks just before going quiet; turning it on clicks just after
  function toggleSound() {
    muted = !muted;
    if (muted) playSound("close");
    setMuted(muted);
    if (!muted) playSound("open");
  }

  function toggleLabels() {
    showLabels = !showLabels;
    playSound(showLabels ? "open" : "close");
    try {
      localStorage.setItem(LABELS_KEY, showLabels ? "1" : "0");
    } catch {
      // Storage unavailable; the choice just lasts for this visit
    }
  }
</script>

<div class="mobile-settings" bind:this={container}>
  <button
    type="button"
    class="cog"
    class:open
    onclick={() => setOpen(!open)}
    aria-label="Settings"
    aria-expanded={open}
    aria-controls="mobile-settings-menu"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        fill="url(#halftone)"
      />
      <circle cx="12" cy="12" r="3" style="fill: var(--color-paper)" />
    </svg>
  </button>

  {#if open}
    <div
      id="mobile-settings-menu"
      class="menu"
      transition:scale={{ start: 0.92, duration: 160, easing: cubicOut }}
    >
      <button
        type="button"
        class="row"
        role="switch"
        aria-checked={!muted}
        onclick={toggleSound}
      >
        <span>Sound effects</span>
        <span class="switch" class:on={!muted}><span class="knob"></span></span>
      </button>
      <button
        type="button"
        class="row"
        role="switch"
        aria-checked={showLabels}
        onclick={toggleLabels}
      >
        <span>Dock labels</span>
        <span class="switch" class:on={showLabels}
          ><span class="knob"></span></span
        >
      </button>
    </div>
  {/if}
</div>

<style>
  .mobile-settings {
    position: fixed;
    top: calc(16px + env(safe-area-inset-top, 0px));
    right: 16px;
    z-index: 1000;
  }

  /* Just the gear on the wallpaper; the 44px box keeps it easy to tap */
  .cog {
    width: 44px;
    height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--color-ink);
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .cog:active {
    transform: scale(0.9);
  }

  .cog svg {
    width: 26px;
    height: 26px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.3s ease;
  }

  .cog.open svg {
    transform: rotate(60deg);
  }

  .menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 220px;
    padding: 6px;
    background: var(--color-paper);
    border: var(--ink-border);
    border-radius: 14px;
    box-shadow: 4px 4px 0 var(--color-ink);
    transform-origin: top right;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 44px;
    padding: 0 10px;
    border: none;
    border-radius: 10px;
    background: none;
    font: inherit;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-ink);
    text-align: left;
    cursor: pointer;
  }

  .row:active {
    background: var(--color-moss-100);
  }

  /* Ink-outlined switch; the accent green marks "on" */
  .switch {
    position: relative;
    flex-shrink: 0;
    width: 38px;
    height: 22px;
    border: var(--ink-border);
    border-radius: 999px;
    background: var(--color-paper);
    transition: background-color 0.15s ease;
  }

  .switch.on {
    background: var(--color-accent);
  }

  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-ink);
    transition: transform 0.15s ease;
  }

  .switch.on .knob {
    transform: translateX(16px);
  }
</style>
