<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  /**
   * @typedef {Object} Props
   * @property {HTMLElement | undefined} anchor The dock icon the tail points at
   * @property {() => void} onDismiss
   */

  /** @type {Props} */
  let { anchor, onDismiss } = $props();

  // Waits for the dock icons to finish flying in before measuring where they landed
  const APPEAR_DELAY_MS = 1100;
  const WIDTH = 220;
  const GUTTER = 12;
  const TAIL = 14;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let place = $state(null);

  function measure() {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(GUTTER, center - 36),
      window.innerWidth - GUTTER - WIDTH,
    );
    place = {
      left,
      bottom: window.innerHeight - rect.top + TAIL + 4,
      tail: center - left,
    };
  }

  onMount(() => {
    const appear = setTimeout(measure, reduceMotion ? 0 : APPEAR_DELAY_MS);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(appear);
      window.removeEventListener("resize", measure);
    };
  });
</script>

{#if place}
  <button
    type="button"
    class="tip"
    class:still={reduceMotion}
    style:left="{place.left}px"
    style:bottom="{place.bottom}px"
    style:width="{WIDTH}px"
    style:--tail-left="{place.tail}px"
    style:--tail="{TAIL}px"
    onclick={onDismiss}
    in:fly={{ y: reduceMotion ? 0 : 10, duration: 280, easing: cubicOut }}
    out:fade={{ duration: 160 }}
  >
    <span class="title">Start here!</span>
    <span class="text">Tap <b>About Me</b> to see who's behind all this.</span>
  </button>
{/if}

<style>
  /* Speech bubble above the dock, its tail pointing down at the About icon */
  .tip {
    position: fixed;
    z-index: 1500;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 14px;
    border: var(--ink-border);
    border-radius: 14px;
    background: var(--color-paper);
    box-shadow: 4px 4px 0 var(--color-ink);
    color: var(--color-ink);
    font: inherit;
    text-align: left;
    cursor: pointer;
    animation: bob 2.4s ease-in-out 0.4s infinite;
  }

  .tip.still {
    animation: none;
  }

  /* Tail: an ink triangle with a smaller paper one on top, so it reads as outlined */
  .tip::before,
  .tip::after {
    content: "";
    position: absolute;
    border-style: solid;
    border-color: transparent;
  }

  .tip::before {
    top: 100%;
    left: calc(var(--tail-left) - var(--tail) / 2 - 2px);
    border-width: var(--tail) calc(var(--tail) / 2) 0;
    border-top-color: var(--color-ink);
  }

  .tip::after {
    top: calc(100% - 3px);
    left: calc(var(--tail-left) - var(--tail) / 2 + 0.5px);
    border-width: calc(var(--tail) - 3.5px) calc(var(--tail) / 2 - 2.5px) 0;
    border-top-color: var(--color-paper);
  }

  .title {
    font-size: 15px;
    font-weight: 700;
  }

  .text {
    font-size: 13px;
    line-height: 1.4;
    color: var(--color-ink-soft);
  }

  .text b {
    color: var(--color-ink);
  }

  @keyframes bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
</style>
