<script>
  import { flushSync } from "svelte";
  import Loader from "./Components/Loader.svelte";
  import ModePicker from "./Components/ModePicker.svelte";
  import SimpleMode from "./Components/SimpleMode.svelte";
  import { loadMode, saveMode } from "./lib/siteMode.js";

  const initialMode = loadMode();

  /** @type {"full" | "simple" | null} null until the visitor picks on the login screen */
  let mode = $state(initialMode);

  // Simple Mode skips the intro animation; everyone else sees it once per page load
  const showLoader = initialMode !== "simple";
  let booted = $state(!showLoader);

  // The desktop (wallpaper, sounds, window images) is only downloaded when it's used,
  // so Simple Mode stays light
  let Desktop = $state(null);
  async function ensureDesktop() {
    Desktop ??= (await import("./Components/Desktop/Desktop.svelte")).default;
  }
  // Start fetching it during the loader if it's likely to be needed
  if (initialMode !== "simple") ensureDesktop();

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /**
   * Swaps screens with a crossfade (View Transitions API) where the browser supports
   * it; elsewhere, or with reduced motion, it just swaps.
   * @param {() => void} update
   */
  function crossfade(update) {
    const apply = () => {
      update();
      flushSync();
      window.scrollTo(0, 0);
    };
    if (!document.startViewTransition || reduceMotion) apply();
    else document.startViewTransition(apply);
  }

  /** @param {"full" | "simple"} next */
  async function choose(next) {
    // The new screen has to render synchronously inside the transition, so make sure
    // the desktop's code is already here
    if (next === "full") await ensureDesktop();
    crossfade(() => {
      mode = next;
      saveMode(next);
    });
  }

  // "Switch User": back to the login screen to pick a mode again. The saved choice
  // stays until a new one is picked, so a reload returns to the current mode.
  function switchUser() {
    crossfade(() => {
      mode = null;
    });
  }

  // Lets the page scroll in Simple Mode; the desktop and login screen are fixed
  $effect(() => {
    document.documentElement.dataset.mode = mode ?? "picker";
  });
</script>

{#if showLoader}
  <Loader onExit={() => (booted = true)} />
{/if}

{#if mode === "full"}
  {#if Desktop}
    <main class="desktop-main">
      <Desktop {booted} onSwitchUser={switchUser} />
    </main>
  {/if}
{:else if mode === "simple"}
  <SimpleMode onSwitchUser={switchUser} />
{:else if booted}
  <ModePicker onChoose={choose} />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  :global(html[data-mode="simple"]),
  :global(html[data-mode="simple"] body) {
    height: auto;
    overflow: auto;
  }

  .desktop-main {
    width: 100vw;
    height: 100vh;
  }

  /* Mode switches: a slightly slower, eased crossfade than the browser default */
  :global(::view-transition-old(root)),
  :global(::view-transition-new(root)) {
    animation-duration: 0.45s;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>
