<script>
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  import { LOGO_PATH, LOGO_VIEWBOX, LOGO_ASPECT } from "../lib/logo.js";
  import fillImage from "../assets/logo-fill.webp";

  // Timings in seconds; they mirror the keyframes in the style block
  const FILL_DELAY = 0.5;
  const FILL_DURATION = 1.05;
  const HOLD = 0.3;

  let visible = $state(true);

  onMount(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = setTimeout(
      () => (visible = false),
      reduceMotion ? 150 : (FILL_DELAY + FILL_DURATION + HOLD) * 1000,
    );
    return () => clearTimeout(timer);
  });
</script>

{#if visible}
  <div
    class="loader"
    role="status"
    aria-live="polite"
    out:scale={{ start: 1.05, opacity: 0, duration: 550, easing: expoOut }}
  >
    <div class="mark" style:aspect-ratio={LOGO_ASPECT}>
      <!-- Outline fades in, then wipes away from the bottom as the fill rises -->
      <svg class="layer outline" viewBox={LOGO_VIEWBOX} fill="none">
        <path
          d={LOGO_PATH}
          stroke="var(--color-moss-600)"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <!-- Noisy gradient, clipped to the logo shape -->
      <svg class="layer fill" viewBox={LOGO_VIEWBOX}>
        <defs>
          <clipPath id="loader-logo-clip">
            <path d={LOGO_PATH} />
          </clipPath>
        </defs>
        <image
          href={fillImage}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          clip-path="url(#loader-logo-clip)"
        />
      </svg>
    </div>

    <span class="sr-only">Loading</span>
  </div>
{/if}

<style>
  .loader {
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-paper);
  }

  .mark {
    position: relative;
    height: 96px;
  }

  @media (min-width: 640px) {
    .mark {
      height: 112px;
    }
  }

  @media (max-width: 639px) {
    .outline {
      display: none;
    }
  }

  .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .outline {
    animation:
      outline-in 0.45s var(--ease) both,
      outline-wipe 1.05s var(--ease) 0.5s both;
  }

  .fill {
    animation: fill-rise 1.05s var(--ease) 0.5s both;
  }

  @keyframes outline-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes outline-wipe {
    from {
      clip-path: inset(0 0 0 0);
    }
    to {
      clip-path: inset(0 0 100% 0);
    }
  }

  @keyframes fill-rise {
    from {
      clip-path: inset(100% 0 0 0);
    }
    to {
      clip-path: inset(0 0 0 0);
    }
  }

  /* Skip straight to the filled logo */
  @media (prefers-reduced-motion: reduce) {
    .outline {
      display: none;
    }

    .fill {
      animation: none;
    }
  }
</style>
