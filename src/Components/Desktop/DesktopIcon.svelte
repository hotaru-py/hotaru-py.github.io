<script>
  import { createEventDispatcher } from "svelte";

  export let icon;
  export let isMobile = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch("click");
  }
</script>

<div
  class="desktop-icon"
  class:mobile-icon={isMobile}
  on:click={handleClick}
  role="button"
  tabindex="0"
  aria-label={`Open ${icon.title}`}
  on:keydown={(e) => e.key === "Enter" && handleClick()}
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
    color: #2c3e50;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .mobile-icon {
    width: auto;
    min-width: 60px;
    max-width: 70px;
    padding: 6px 2px;
  }

  .desktop-icon:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .desktop-icon:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.4);
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    margin-bottom: 8px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    backdrop-filter: blur(4px);
    transition: transform 0.2s ease;
  }

  .mobile-icon-container {
    width: 42px;
    height: 42px;
    margin-bottom: 4px;
    border-radius: 10px;
  }

  .desktop-icon:hover .icon-container {
    transform: scale(1.05);
  }

  .icon-container.active .icon {
    box-shadow: 0 0 0 2px rgba(139, 198, 244, 0.5);
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
    font-weight: 500;
    word-break: break-word;
    max-width: 100px;
    background-color: rgba(255, 255, 255, 0.6);
    padding: 3px 6px;
    border-radius: 4px;
    backdrop-filter: blur(2px);
    text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.5);
  }

  .mobile-icon-title {
    font-size: 10px;
    font-weight: 600;
    max-width: 60px;
    background-color: transparent;
    padding: 0;
    color: #2c3e50;
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
