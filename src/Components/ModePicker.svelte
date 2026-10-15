<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import Wallpaper from "./Desktop/Wallpaper.svelte";
  import Logo from "./Logo.svelte";

  /**
   * @typedef {Object} Props
   * @property {(mode: "full" | "simple") => void} onChoose
   */

  /** @type {Props} */
  let { onChoose } = $props();

  // Phones get the phone-style version of the "full" experience
  let isPhone = $state(false);
  onMount(() => {
    const query = window.matchMedia("(max-width: 768px)");
    isPhone = query.matches;
    const update = () => (isPhone = query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  });

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Picking a user plays the exit (content fades, bars slide away) before switching
  const EXIT_MS = 480;
  let leaving = $state(false);

  function select(mode) {
    if (leaving) return;
    leaving = true;
    setTimeout(() => onChoose(mode), reduceMotion ? 0 : EXIT_MS);
  }

  const users = $derived([
    {
      mode: "full",
      name: "Full Desktop Experience",
      detail: isPhone
        ? "Apps, a dock and a wallpaper that reacts to your touch."
        : "Windows, icons and a wallpaper that reacts to you.",
    },
    {
      mode: "simple",
      name: "Simple Mode",
      detail: "Just the text, top to bottom. Quick and light.",
    },
  ]);
</script>

<!-- First visit: XP-style "pick a user" screen. The mode switch itself crossfades
     (App.svelte), so this only animates its own way in and out. -->
<div class="picker" in:fade={{ duration: 250 }}>
  <Wallpaper />

  <!-- XP's welcome-screen bands: they slide in once the loader is done, and back out
       when a user is picked -->
  <div
    class="bar top"
    class:leaving
    in:fly={{
      y: reduceMotion ? 0 : -110,
      opacity: 1,
      duration: 500,
      delay: 120,
      easing: cubicOut,
    }}
  ></div>
  <div
    class="bar bottom"
    class:leaving
    in:fly={{
      y: reduceMotion ? 0 : 110,
      opacity: 1,
      duration: 500,
      delay: 120,
      easing: cubicOut,
    }}
  ></div>

  <svg class="svg-defs" aria-hidden="true">
    <defs>
      <pattern
        id="picker-halftone"
        width="2"
        height="2"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <circle cx="1" cy="1" r="0.6" style="fill: var(--color-ink)" />
      </pattern>
    </defs>
  </svg>

  <div class="layout" class:leaving>
    <section
      class="intro"
      in:fly={{ y: 12, duration: 300, delay: 320, easing: cubicOut }}
    >
      <div class="brand">
        <span class="logo"><Logo /></span>
        <span class="brand-name">hotaru's PC</span>
      </div>
      <h1 class="prompt">To begin, click your user name</h1>
    </section>

    <div class="divider" aria-hidden="true"></div>

    <ul class="users">
      {#each users as user, i (user.mode)}
        <li
          in:fly={{
            x: isPhone ? 0 : 16,
            y: isPhone ? 12 : 0,
            duration: 300,
            delay: 400 + i * 80,
            easing: cubicOut,
          }}
        >
          <button
            type="button"
            class="user"
            disabled={leaving}
            onclick={() => select(user.mode)}
          >
            <span class="avatar">
              {#if user.mode === "full"}
                <!-- Monitor with a halftone-shaded screen -->
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="2.5"
                    y="3.5"
                    width="19"
                    height="13"
                    rx="2"
                    fill="url(#picker-halftone)"
                  />
                  <path d="M8.5 20.5h7M12 16.5v4" />
                </svg>
              {:else}
                <!-- Page of plain text -->
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"
                    class="paper"
                  />
                  <path d="M14 2.5V8h5.5z" fill="url(#picker-halftone)" />
                  <path d="M8 11.5h8M8 15h5.5M8 18.5h7" />
                </svg>
              {/if}
            </span>
            <span class="label">
              <span class="name">{user.name}</span>
              <span class="detail">{user.detail}</span>
            </span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .picker {
    --bar-height: clamp(56px, 11vh, 96px);
    position: fixed;
    inset: 0;
    isolation: isolate;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Keep the content clear of the two bars */
    padding: calc(var(--bar-height) + 24px) 24px;
    box-sizing: border-box;
    color: var(--color-ink);
  }

  .svg-defs {
    position: absolute;
    width: 0;
    height: 0;
  }

  /* --- XP bars --- */
  .bar {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 1;
    height: var(--bar-height);
    overflow: hidden;
    background: var(--color-moss-600);
    pointer-events: none;
    /* Leaving: accelerate away, like the bars being pulled off-screen */
    transition: transform 0.45s cubic-bezier(0.7, 0, 0.84, 0);
  }

  /* Halftone texture, fading out toward one end */
  .bar::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--halftone);
    background-size: var(--halftone-size);
    mask-image: var(--halftone-fade);
    opacity: 0.35;
  }

  /* Ink edge plus XP's thin highlight line along the inside */
  .bar.top {
    top: 0;
    border-bottom: var(--ink-border);
    box-shadow: inset 0 -4px 0 var(--color-moss-300);
  }

  .bar.bottom {
    bottom: 0;
    border-top: var(--ink-border);
    box-shadow: inset 0 4px 0 var(--color-moss-300);
  }

  .bar.top.leaving {
    transform: translateY(calc(-100% - 8px));
  }

  .bar.bottom.leaving {
    transform: translateY(calc(100% + 8px));
  }

  .layout {
    display: grid;
    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
    grid-template-columns: minmax(0, 300px) auto minmax(0, 380px);
    align-items: center;
    gap: 40px;
  }

  .layout.leaving {
    opacity: 0;
    transform: scale(0.98);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .logo {
    display: flex;
    height: 34px;
    color: var(--color-ink);
  }

  .brand-name {
    font-size: 22px;
    font-weight: 700;
  }

  .prompt {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .divider {
    align-self: stretch;
    width: 2px;
    background: var(--color-ink);
    border-radius: 1px;
  }

  .users {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .user {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px 16px;
    border: var(--ink-border);
    border-radius: 14px;
    background: var(--color-paper);
    box-shadow: 4px 4px 0 var(--color-ink);
    color: var(--color-ink);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .user:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--color-ink);
  }

  .user:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--color-ink);
  }

  /* Same green, ink-ringed tile as the avatars elsewhere */
  .avatar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border: var(--ink-border);
    border-radius: 12px;
    background: var(--color-accent);
  }

  .avatar svg {
    width: 32px;
    height: 32px;
    fill: none;
    stroke: var(--color-ink);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .avatar .paper {
    fill: var(--color-paper);
  }

  .label {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .name {
    font-size: 17px;
    font-weight: 700;
  }

  .detail {
    font-size: 13px;
    color: var(--color-ink-soft);
  }

  @media (max-width: 768px) {
    .picker {
      --bar-height: 52px;
      align-items: flex-start;
      padding-top: calc(
        var(--bar-height) + 36px + env(safe-area-inset-top, 0px)
      );
    }

    .layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 24px;
      width: 100%;
      max-width: 420px;
    }

    .prompt {
      font-size: 19px;
    }

    .divider {
      width: auto;
      height: 2px;
    }
  }
</style>
