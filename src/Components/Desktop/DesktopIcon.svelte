<script>
  import { createEventDispatcher } from "svelte";

  export let icon;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch("click");
  }
</script>

<div
  class="desktop-icon"
  on:click={handleClick}
  role="button"
  tabindex="0"
  aria-label={`Open ${icon.title}`}
  on:keydown={(e) => e.key === "Enter" && handleClick()}
>
  <div class="icon-container">
    <div class="icon">{icon.icon}</div>
  </div>
  <div class="icon-title">{icon.title}</div>
</div>

<style>
  .desktop-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
    cursor: pointer;
    color: #2c3e50;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .desktop-icon:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .desktop-icon:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(139, 198, 244, 0.5);
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
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
  }

  .desktop-icon:hover .icon-container {
    transform: scale(1.05);
  }

  .icon {
    font-size: 32px;
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
  }
</style>
