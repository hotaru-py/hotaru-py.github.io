<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import Wallpaper from "./Desktop/Wallpaper.svelte";
  import Logo from "./Logo.svelte";
  import { sparkleDots } from "../lib/halftone.js";

  /**
   * @typedef {Object} Props
   * @property {(mode: "full" | "simple") => void} onChoose
   */

  /** @type {Props} */
  let { onChoose } = $props();

  // Twinkling version of the icon halftone, swapped in on hover (same as the desktop icons)
  const iconSparkle = sparkleDots({
    cols: 12,
    rows: 12,
    pitch: 2,
    radius: 0.6,
    fill: "var(--color-ink)",
  });

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

  // Hovering (or focusing) Simple Mode previews it: the green glow fades and the text
  // turns monospace
  let previewSimple = $state(false);

  // Once a user is picked the preview is locked in, so the exit doesn't flick back to
  // the green look when the pointer or focus moves away
  function setPreview(on) {
    if (!leaving) previewSimple = on;
  }

  function select(mode) {
    if (leaving) return;
    previewSimple = mode === "simple";
    leaving = true;
    setTimeout(() => onChoose(mode), reduceMotion ? 0 : EXIT_MS);
  }

  const users = $derived([
    {
      mode: "full",
      name: isPhone ? "Phone Mode" : "PC Mode",
      detail: isPhone
        ? "works like a phone. you know what a phone is. i'll shut up now."
        : "works like a desktop. you know what a desktop is. i'll shut up now.",
    },
    {
      mode: "simple",
      name: "Simple Mode",
      detail:
        "if you're one of those minimalists. argh, learn to enjoy interactive stuff.",
    },
  ]);
</script>

<!-- First visit: XP-style "pick a user" screen. The mode switch itself crossfades
     (App.svelte), so this only animates its own way in and out. -->
<div
  class="picker"
  class:preview-simple={previewSimple}
  in:fade={{ duration: 250 }}
>
  <Wallpaper />
  <!-- Simple Mode's plain background, faded in over the wallpaper while previewing -->
  <div class="simple-wash" aria-hidden="true"></div>

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
      <pattern
        id="picker-halftone-sparkle"
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        {@html iconSparkle}
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
            onpointerenter={() => setPreview(user.mode === "simple")}
            onpointerleave={() => setPreview(false)}
            onfocus={() => setPreview(user.mode === "simple")}
            onblur={() => setPreview(false)}
          >
            <span class="avatar">
              {#if user.mode === "full"}
                <!-- Monitor: halftone dots over a paper-white screen -->
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="2.5"
                    y="3.5"
                    width="19"
                    height="13"
                    rx="2"
                    class="paper"
                  />
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

  /* --- Simple Mode preview --- */
  .simple-wash {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--color-moss-100);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .preview-simple .simple-wash {
    opacity: 1;
  }

  /* All the green drains out: bars go beige, icon tiles go paper-white */
  .preview-simple .bar {
    --bar-highlight: transparent;
    background-color: var(--color-moss-100);
  }

  .preview-simple .avatar {
    background-color: var(--color-paper);
  }

  .preview-simple {
    font-family:
      "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas,
      monospace;
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
    --bar-highlight: var(--color-moss-300);
    background-color: var(--color-moss-600);
    pointer-events: none;
    /* Leaving: accelerate away, like the bars being pulled off-screen */
    transition:
      transform 0.45s cubic-bezier(0.7, 0, 0.84, 0),
      background-color 0.4s ease,
      box-shadow 0.4s ease;
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
    box-shadow: inset 0 -4px 0 var(--bar-highlight);
  }

  .bar.bottom {
    bottom: 0;
    border-top: var(--ink-border);
    box-shadow: inset 0 4px 0 var(--bar-highlight);
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

  /* Icon halftone sparkles on hover, like the desktop icons */
  @media (prefers-reduced-motion: no-preference) {
    .user:hover .avatar :global([fill="url(#picker-halftone)"]) {
      fill: url(#picker-halftone-sparkle);
    }
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
    background-color: var(--color-accent);
    transition: background-color 0.4s ease;
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
