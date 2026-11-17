<script>
  import { slide } from "svelte/transition";
  import { tactile } from "../../lib/tactile.js";

  /**
   * @typedef {Object} Props
   * @property {any} icon
   * @property {boolean} [isMobile]
   * @property {boolean} [lifted] Picked up and being dragged
   * @property {boolean} [showLabel] Dock icons only: show the title under the icon
   * @property {() => void} [onclick]
   */

  /** @type {Props} */
  let {
    icon,
    isMobile = false,
    lifted = false,
    showLabel = false,
    onclick,
  } = $props();

  function handleClick() {
    onclick?.();
  }
</script>

<div
  class="desktop-icon"
  class:mobile-icon={isMobile}
  class:lifted
  onclick={handleClick}
  role="button"
  tabindex="0"
  aria-label={`Open ${icon.title}`}
  onkeydown={(e) => e.key === "Enter" && handleClick()}
  use:tactile
>
  <div class="icon-container" class:mobile-icon-container={isMobile}>
    <div class="icon">
      {@html icon.icon}
    </div>
  </div>
  {#if !isMobile}
    <div class="icon-title">{icon.title}</div>
  {:else if showLabel}
    <div class="mobile-icon-title" transition:slide={{ duration: 160 }}>
      {icon.title}
    </div>
  {/if}
</div>

<style>
  .desktop-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 88px;
    cursor: pointer;
    color: var(--color-ink);
    padding: 6px 4px;
    border-radius: 8px;
  }

  .mobile-icon {
    width: auto;
    padding: 0;
    border-radius: 14px;
  }

  .desktop-icon:focus {
    outline: none;
  }

  .desktop-icon:focus-visible .icon-container {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  /* Halftone shading sparkles on hover */
  @media (prefers-reduced-motion: no-preference) {
    .desktop-icon:hover .icon :global([fill="url(#halftone)"]) {
      fill: url(#halftone-sparkle);
    }
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    margin-bottom: 6px;
    background-color: var(--color-paper);
    border: var(--ink-border);
    border-radius: 12px;
    box-shadow: 3px 3px 0 var(--color-ink);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  /* On a paper-coloured pill, so it reads over the wallpaper (the dock's own paper
     panel hides the pill there) */
  .mobile-icon-title {
    margin-top: 6px;
    padding: 1px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-moss-50) 85%, transparent);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    color: var(--color-ink);
  }

  /* 64px, shrinking a little on narrow phones so four still fit side by side */
  .mobile-icon-container {
    width: clamp(52px, 16.5vw, 64px);
    height: clamp(52px, 16.5vw, 64px);
    margin-bottom: 0;
    border-radius: 16px;
  }

  .desktop-icon:hover .icon-container {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 var(--color-ink);
  }

  .desktop-icon:active .icon-container {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--color-ink);
  }

  /* Picked up: tilted and raised higher off the desktop */
  .desktop-icon.lifted .icon-container {
    transform: translate(-3px, -3px) rotate(-4deg);
    box-shadow: 7px 7px 0 var(--color-ink);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  }

  .icon :global(svg) {
    width: 32px;
    height: 32px;
  }

  .mobile-icon-container .icon,
  .mobile-icon-container .icon :global(svg) {
    width: 55%;
    height: 55%;
  }

  .mobile-icon-container .icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  /* In a monospace font every character is 0.6em wide, so "Experience" is 84px at 12px:
     wider than the icon's 80px, so the label may be as wide as its text (centred under
     the icon, into the gap beside it) up to 96px, and only wraps past that */
  .icon-title {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    word-break: break-word;
    width: max-content;
    max-width: 96px;
    background-color: var(--color-paper);
    padding: 2px 6px;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    .desktop-icon:not(.mobile-icon) {
      width: 80px;
      padding: 8px 4px;
    }

    .icon-container:not(.mobile-icon-container) {
      width: 50px;
      height: 50px;
    }

    .icon:not(.mobile-icon-container .icon) {
      font-size: 28px;
    }

    .icon-title {
      font-size: 12px;
      max-width: 80px;
      padding: 2px 4px;
    }
  }

  @media (max-width: 480px) {
    .desktop-icon:not(.mobile-icon) {
      width: 70px;
      padding: 6px 2px;
    }

    .icon-container:not(.mobile-icon-container) {
      width: 48px;
      height: 48px;
      margin-bottom: 6px;
    }

    .icon:not(.mobile-icon-container .icon) {
      font-size: 26px;
    }

    .icon-title {
      font-size: 11px;
      max-width: 70px;
    }
  }
</style>
