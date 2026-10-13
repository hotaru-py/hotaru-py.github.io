<script>
  /**
   * @typedef {Object} Props
   * @property {any} icon
   * @property {boolean} [isMobile]
   * @property {() => void} [onclick]
   */

  /** @type {Props} */
  let { icon, isMobile = false, onclick } = $props();

  function handleClick() {
    onclick?.();
  }
</script>

<div
  class="desktop-icon"
  class:mobile-icon={isMobile}
  onclick={handleClick}
  role="button"
  tabindex="0"
  aria-label={`Open ${icon.title}`}
  onkeydown={(e) => e.key === "Enter" && handleClick()}
>
  <div class="icon-container" class:mobile-icon-container={isMobile}>
    <div class="icon">
      {@html icon.icon}
    </div>
  </div>
  {#if !isMobile || !icon.title.includes(" ")}
    <div class="icon-title" class:mobile-icon-title={isMobile}>
      {icon.title}
    </div>
  {:else}
    <div class="icon-title" class:mobile-icon-title={isMobile}>
      {icon.title.split(" ")[0]}
    </div>
  {/if}
</div>

<style>
  .desktop-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
    cursor: pointer;
    color: var(--color-ink);
    padding: 8px;
    border-radius: 8px;
  }

  .mobile-icon {
    width: auto;
    min-width: 60px;
    max-width: 70px;
    padding: 6px 2px;
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
    margin-bottom: 8px;
    background-color: var(--color-paper);
    border: var(--ink-border);
    border-radius: 12px;
    box-shadow: 3px 3px 0 var(--color-ink);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .mobile-icon-container {
    width: 42px;
    height: 42px;
    margin-bottom: 4px;
    border-radius: 10px;
  }

  .desktop-icon:hover .icon-container {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 var(--color-ink);
  }

  .desktop-icon:active .icon-container {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--color-ink);
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

  .mobile-icon-container .icon {
    width: 24px;
    height: 24px;
  }

  .mobile-icon-container .icon :global(svg) {
    width: 24px;
    height: 24px;
  }

  .icon-title {
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    word-break: break-word;
    max-width: 100px;
    background-color: var(--color-paper);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .mobile-icon-title {
    font-size: 10px;
    font-weight: 600;
    max-width: 60px;
    background-color: transparent;
    padding: 0;
    color: var(--color-ink);
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

    .icon-title:not(.mobile-icon-title) {
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

    .icon-title:not(.mobile-icon-title) {
      font-size: 11px;
      max-width: 70px;
    }
  }
</style>
