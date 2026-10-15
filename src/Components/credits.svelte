<script>
  import { xylophone } from "../lib/xylophone.js";
  import { credits } from "../lib/siteContent.js";

  // Icon for each inspiration pill, by its id in siteContent.js
  const ICONS = {
    website: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>`,
  };
</script>

<div class="credits-container">
  <h2 class="credits-title">{credits.heading}</h2>

  <div class="credits-grid">
    <section class="credit-card">
      <h3 class="credit-heading">Inspiration</h3>
      <p class="credit-text">
        {credits.inspiration.lead} <strong>{credits.inspiration.name}</strong>
        <span class="credit-aside">({credits.inspiration.aside})</span>
      </p>
      <div class="credit-links">
        {#each credits.inspiration.links as link}
          <a
            class="credit-pill"
            use:xylophone
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="credit-pill-icon">{@html ICONS[link.id]}</span>
            {link.label}
          </a>
        {/each}
      </div>
    </section>

    <section class="credit-card">
      <h3 class="credit-heading">Profile Picture &amp; Favicon</h3>
      <p class="credit-text">
        <strong>{credits.avatar.character}</strong> from
        <em>{credits.avatar.source}</em>
      </p>
      <p class="credit-text credit-note">{credits.avatar.note}</p>
    </section>

    <section class="credit-card">
      <h3 class="credit-heading">Sounds</h3>
      <ul class="credit-list">
        {#each credits.sounds as line}
          <li>
            {#each line as part, i}{#if i > 0}{" "}{/if}{#if typeof part === "string"}{part}{:else}<a
                  class="credit-link"
                  href={part.url}
                  target="_blank"
                  rel="noopener noreferrer">{part.text}</a
                >{/if}{/each}
          </li>
        {/each}
      </ul>
    </section>
  </div>
</div>

<style>
  .credits-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: calc(100% + 16px);
    margin-left: -8px;
    margin-right: -8px;
    box-sizing: border-box;
    padding: 16px;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .credits-container {
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .credits-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: var(--ink-border);
  }

  .credits-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 24px;
    padding: 0 8px 8px 0;
    isolation: isolate;
  }

  .credit-card {
    position: relative;
    background-color: var(--color-paper);
    border-radius: 12px;
    padding: 16px;
    border: var(--ink-border);
    top: 0;
    left: 0;
    /* Offsets, not transform: a transform would lift the halftone shadow above the card */
    transition:
      top 0.15s ease,
      left 0.15s ease;
  }

  /* Halftone drop shadow; the grid isolates it so it stays behind the card */
  .credit-card::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background-image: var(--halftone);
    background-size: var(--halftone-shadow-size);
    transform: translate(6px, 6px);
    transition: transform 0.15s ease;
    z-index: -1;
  }

  .credit-card:hover {
    top: -2px;
    left: -2px;
  }

  .credit-card:hover::after {
    transform: translate(8px, 8px);
    background-image: var(--halftone-sparkle, var(--halftone));
    background-size: var(--halftone-sparkle-size, var(--halftone-shadow-size));
  }

  .credit-heading {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0 0 10px 0;
  }

  .credit-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-ink-soft);
  }

  .credit-text strong {
    color: var(--color-ink);
    font-weight: 700;
  }

  .credit-note {
    margin-top: 6px;
    font-size: 14px;
    color: var(--color-ink-muted);
  }

  .credit-aside {
    color: var(--color-ink-muted);
  }

  .credit-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  /* Outlined like the skill pills; inverts on hover */
  .credit-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px 4px 10px;
    border: 1.5px solid var(--color-ink);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-ink);
    text-decoration: none;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .credit-pill:hover {
    background-color: var(--color-ink);
    color: var(--color-paper);
  }

  .credit-pill-icon {
    display: flex;
    width: 16px;
    height: 16px;
  }

  .credit-pill-icon :global(svg) {
    width: 16px;
    height: 16px;
  }

  .credit-list {
    margin: 0;
    padding-left: 20px;
    list-style: disc;
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-ink-soft);
  }

  .credit-list li + li {
    margin-top: 6px;
  }

  /* Same static underline as the other inline links */
  .credit-link {
    color: var(--color-ink);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: var(--color-accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
</style>
