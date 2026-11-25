<script>
  import { getContext, onMount, untrack } from "svelte";
  import { fetchStars } from "../lib/githubStars.js";
  import { starLabel } from "../lib/siteContent.js";
  import { FILE_ICONS } from "../lib/workFiles.js";
  import { formatPostDate } from "../lib/blogPosts.js";
  import P5Rain from "./P5Rain.svelte";

  let { file, isMobile = false } = $props();

  // a picture (gallery or experience) can link to related things elsewhere on the site
  const desktop = getContext("desktop");

  // shown until (or if) the live count can't be fetched
  let stars = $state(untrack(() => file.stars?.fallback ?? null));

  onMount(() => {
    if (!file.stars) return;
    fetchStars(file.stars.repo).then((count) => {
      if (count !== null) stars = count;
    });
  });
</script>

<!-- photos-app style: the picture on the left, its details in a side panel -->
<div class="shell" class:mobile={isMobile}>
  <div class="viewer" class:mobile={isMobile}>
    <div class="stage" class:demo={file.demo}>
      {#if file.demo === "p5rain"}
        <!-- projects with a demo run it live where the picture would be -->
        <div class="demo-frame">
          <P5Rain />
        </div>
      {:else if file.image}
        <img src={file.image} alt={file.alt ?? file.name} />
      {:else}
        <!-- repos have no screenshot: a big file icon on a halftone card instead -->
        <div class="placeholder">
          <span class="placeholder-icon">{@html FILE_ICONS.project}</span>
          <span class="placeholder-name">{file.fileName}</span>
        </div>
      {/if}
    </div>

    <aside class="details">
      <h2 class="details-heading">Details</h2>
      <h3 class="name">{file.name}</h3>
      {#if file.description}
        <p class="description">{file.description}</p>
      {/if}

      <dl class="facts">
        <div>
          <dt>Type</dt>
          <dd>{file.typeLabel}</dd>
        </div>
        {#if file.date}
          <div>
            <dt>Date</dt>
            <dd>{formatPostDate(file.date)}</dd>
          </div>
        {/if}
        <div>
          <dt>File</dt>
          <dd>{file.fileName}</dd>
        </div>
        {#if stars !== null}
          <div>
            <dt>Stars</dt>
            <dd class="stars">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"
                />
              </svg>
              {starLabel(stars)}
            </dd>
          </div>
        {/if}
        {#if file.linkLabel}
          <div>
            <dt>Location</dt>
            <dd class="location">{file.linkLabel}</dd>
          </div>
        {/if}
      </dl>

      {#if file.url}
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          class="open-link"
        >
          {file.linkText} →
        </a>
      {/if}
      {#if file.open}
        <button
          type="button"
          class="open-link"
          onclick={() => desktop?.openTarget(file.open)}
        >
          {file.openLabel ?? "See related"} →
        </button>
      {/if}
    </aside>
  </div>
</div>

<style>
  /* fills the window edge to edge, cancelling the content padding. also the size
     container the layout responds to, since a desktop window can be any width. */
  .shell {
    container-type: inline-size;
    height: calc(100% + 32px);
    margin: -16px;
  }

  .shell.mobile {
    height: auto;
    margin: 0;
  }

  .viewer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;
    height: 100%;
  }

  .viewer.mobile {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  /* --- Picture --- */
  .stage {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    padding: 24px;
    background-color: var(--color-moss-100);
    overflow: hidden;
  }

  .mobile .stage {
    padding: 0;
    background: none;
  }

  /* a live demo fills the stage, framed like the screenshots */
  .stage.demo {
    align-items: stretch;
    justify-content: stretch;
    padding: 16px;
  }

  .demo-frame {
    flex: 1;
    min-width: 0;
    border: var(--ink-border);
    border-radius: 8px;
    box-shadow: 4px 4px 0 var(--color-ink);
    overflow: hidden;
  }

  /* on phones the window scrolls, so the demo gets a height of its own */
  .mobile .stage.demo {
    padding: 0 4px 4px 0;
    height: min(68vh, 560px);
    min-height: 360px;
  }

  .stage img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border: var(--ink-border);
    border-radius: 8px;
    box-shadow: 4px 4px 0 var(--color-ink);
    background-color: var(--color-paper);
  }

  .placeholder {
    position: relative;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    width: min(100%, 420px);
    aspect-ratio: 4 / 3;
    border: var(--ink-border);
    border-radius: 8px;
    box-shadow: 4px 4px 0 var(--color-ink);
    background-color: var(--color-paper);
    overflow: hidden;
  }

  /* halftone wash fading in from one corner */
  .placeholder::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image: var(--halftone);
    background-size: var(--halftone-size);
    mask-image: linear-gradient(to top left, black, transparent 70%);
    opacity: 0.4;
  }

  .placeholder-icon {
    display: flex;
    width: 96px;
    height: 96px;
    color: var(--color-ink);
  }

  .placeholder-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .placeholder-name {
    padding: 0 16px;
    font-family: var(--font-terminal);
    font-size: 13px;
    color: var(--color-ink-soft);
    text-align: center;
    overflow-wrap: anywhere;
  }

  /* --- Details panel --- */
  .details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    padding: 20px;
    border-left: var(--ink-border);
    background-color: var(--color-paper);
    overflow-y: auto;
  }

  .mobile .details {
    padding: 0;
    border: none;
    overflow: visible;
  }

  .details-heading {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-ink-muted);
  }

  .name {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.25;
    color: var(--color-ink);
  }

  .description {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-ink-soft);
  }

  .facts {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 4px 0 0;
    padding-top: 12px;
    border-top: var(--ink-border);
  }

  .facts dt {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-ink-muted);
  }

  .facts dd {
    margin: 2px 0 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-ink);
  }

  .location {
    overflow-wrap: anywhere;
  }

  .stars {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stars svg {
    width: 15px;
    height: 15px;
    fill: url(#halftone);
    stroke: var(--color-ink);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .open-link {
    align-self: flex-start;
    margin-top: 4px;
    padding: 8px 14px;
    border: var(--ink-border);
    border-radius: 10px;
    background-color: var(--color-accent);
    box-shadow: 3px 3px 0 var(--color-ink);
    color: var(--color-ink);
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .open-link:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 var(--color-ink);
  }

  .open-link:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--color-ink);
  }

  /* narrow desktop windows stack the panel under the picture too */
  @container (max-width: 560px) {
    .viewer:not(.mobile) {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: minmax(160px, 1fr) auto;
    }

    .viewer:not(.mobile) .details {
      border-left: none;
      border-top: var(--ink-border);
    }
  }
</style>
