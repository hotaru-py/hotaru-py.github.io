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
   * Switches modes with a crossfade (View Transitions API) where the browser supports
   * it; elsewhere, or with reduced motion, it just swaps.
   * @param {"full" | "simple"} next
   */
  async function choose(next) {
    // The new screen has to render synchronously inside the transition, so make sure
    // the desktop's code is already here
    if (next === "full") await ensureDesktop();

    const apply = () => {
      mode = next;
      saveMode(next);
      flushSync();
      window.scrollTo(0, 0);
    };

    if (!document.startViewTransition || reduceMotion) apply();
    else document.startViewTransition(apply);
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
      <Desktop {booted} onSwitchMode={() => choose("simple")} />
    </main>
  {/if}
{:else if mode === "simple"}
  <SimpleMode onSwitchMode={() => choose("full")} />
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
